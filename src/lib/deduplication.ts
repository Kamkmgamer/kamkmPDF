import { createHashSync } from "~/lib/crypto-edge";
import { db } from "~/server/db";
import { jobs } from "~/server/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { logger } from "~/lib/logger";

export interface DeduplicationResult {
  isDuplicate: boolean;
  existingJobId?: string;
  promptHash: string;
}

export interface DeduplicationOptions {
  userId?: string | null;
  windowMinutes?: number; // How long to consider jobs for deduplication
  includeImage?: boolean; // Whether to include image data in hash
  imageHash?: string; // Hash of image data for deduplication
}

/**
 * Generate a hash for a prompt to detect duplicates
 */
export function generatePromptHash(
  prompt: string,
  options: {
    userId?: string | null;
    tier?: string;
    includeImage?: boolean;
    imageHash?: string;
  } = {},
): string {
  const { userId, tier = "starter", includeImage = false, imageHash } = options;

  // Normalize the prompt for consistent hashing
  const normalizedPrompt = prompt.trim().toLowerCase();

  // Create hash components
  const components = [
    normalizedPrompt,
    tier,
    includeImage ? (imageHash ?? "") : "",
  ];

  // Include userId for user-specific deduplication (optional)
  // This allows the same prompt to be deduplicated per user
  if (userId) {
    components.push(userId);
  }

  const hashInput = components.join("|");
  return createHashSync("sha256", hashInput);
}

/**
 * Check if a prompt is a duplicate of a recent job
 */
export async function checkForDuplicateJob(
  prompt: string,
  options: DeduplicationOptions = {},
): Promise<DeduplicationResult> {
  const { userId, windowMinutes = 5, includeImage = false } = options;

  try {
    // Generate hash for the prompt
    const promptHash = generatePromptHash(prompt, {
      userId,
      includeImage,
    });

    // Calculate time window for deduplication
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

    // Build query conditions
    const conditions = [
      eq(jobs.promptHash, promptHash),
      gte(jobs.createdAt, windowStart),
    ];

    // Only consider jobs from the same user if userId is provided
    if (userId) {
      conditions.push(eq(jobs.userId, userId));
    }

    // Look for recent jobs with the same prompt hash
    const recentJobs = await db
      .select({
        id: jobs.id,
        status: jobs.status,
        createdAt: jobs.createdAt,
        resultFileId: jobs.resultFileId,
      })
      .from(jobs)
      .where(and(...conditions))
      .orderBy(jobs.createdAt)
      .limit(1);

    if (recentJobs.length > 0) {
      const existingJob = recentJobs[0];

      // Only return as duplicate if the job is still processing or completed successfully
      if (
        existingJob &&
        (existingJob.status === "processing" ||
          existingJob.status === "queued" ||
          (existingJob.status === "completed" && existingJob.resultFileId))
      ) {
        logger.info(
          {
            promptHash,
            existingJobId: existingJob.id,
            status: existingJob.status,
            userId,
          },
          "Found duplicate job",
        );

        return {
          isDuplicate: true,
          existingJobId: existingJob.id,
          promptHash,
        };
      }
    }

    return {
      isDuplicate: false,
      promptHash,
    };
  } catch (error) {
    logger.warn(
      { error: String(error), prompt: prompt.slice(0, 100) },
      "Failed to check for duplicate job",
    );

    // Return no duplicate on error to avoid blocking legitimate requests
    return {
      isDuplicate: false,
      promptHash: generatePromptHash(prompt, { userId, includeImage }),
    };
  }
}

/**
 * Generate hash for image data to include in prompt deduplication
 */
export function generateImageHash(
  imageData: Buffer | string | Uint8Array,
): string {
  // Convert to string for hashing (Edge Runtime compatible)
  let dataStr: string;
  if (typeof imageData === "string") {
    dataStr = imageData;
  } else if (imageData instanceof Uint8Array) {
    // Convert Uint8Array to string
    dataStr = Array.from(imageData)
      .map((b) => String.fromCharCode(b))
      .join("");
  } else {
    // Buffer (Node.js) - convert to string
    // Type assertion needed because Buffer might not be available in Edge Runtime
    const buffer = imageData as { toString: (encoding: string) => string };
    if (buffer.toString && typeof buffer.toString === "function") {
      dataStr = buffer.toString("binary");
    } else {
      // Fallback: treat as Uint8Array-like
      const arr = imageData as unknown as Uint8Array;
      dataStr = Array.from(arr)
        .map((b) => String.fromCharCode(b))
        .join("");
    }
  }
  return createHashSync("sha256", dataStr);
}

/**
 * Enhanced deduplication check that includes image data
 */
export async function checkForDuplicateJobWithImage(
  prompt: string,
  imageData: Buffer | string,
  options: Omit<DeduplicationOptions, "includeImage"> = {},
): Promise<DeduplicationResult> {
  const imageHash = generateImageHash(imageData);

  return checkForDuplicateJob(prompt, {
    ...options,
    includeImage: true,
    imageHash,
  });
}

/**
 * Store prompt hash in job record for future deduplication
 */
export async function storePromptHash(
  jobId: string,
  promptHash: string,
): Promise<void> {
  try {
    await db.update(jobs).set({ promptHash }).where(eq(jobs.id, jobId));

    logger.debug({ jobId, promptHash }, "Stored prompt hash for job");
  } catch (error) {
    logger.warn({ error: String(error), jobId }, "Failed to store prompt hash");
  }
}

/**
 * Clean up old prompt hashes to prevent database bloat
 * This should be run periodically (e.g., daily cron job)
 */
export async function cleanupOldPromptHashes(daysToKeep = 30): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const _result = await db
      .update(jobs)
      .set({ promptHash: null })
      .where(
        and(gte(jobs.createdAt, cutoffDate), eq(jobs.status, "completed")),
      );

    // Note: Drizzle doesn't return rowCount, so we'll return 0 for now
    // In a real implementation, you'd need to track this differently
    logger.info({ cutoffDate }, "Cleaned up old prompt hashes");
    return 0;
  } catch (error) {
    logger.warn(
      { error: String(error) },
      "Failed to cleanup old prompt hashes",
    );
    return 0;
  }
}
