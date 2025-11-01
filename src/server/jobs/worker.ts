import { db, pg } from "~/server/db";
import {
  jobs,
  files,
  userSubscriptions,
  usageHistory,
} from "~/server/db/schema";
import { randomUUID } from "~/lib/crypto-edge";
import { eq, lt, asc, and, inArray } from "drizzle-orm";
import { generatePdfBuffer } from "~/server/jobs/pdf";
import type { GenerationStage } from "~/types/pdf";
import {
  readJobTempImage,
  readJobTempMeta,
  cleanupJobTemp,
} from "~/server/jobs/temp";
import type { InferSelectModel } from "drizzle-orm";
import { UTFile } from "uploadthing/server";
import { utapi } from "~/server/uploadthing";
import { sendJobUpdate } from "~/lib/sse";
import { preWarmBrowserPool } from "~/lib/pdf-generator";
import {
  getTierConfig,
  type SubscriptionTier,
} from "~/server/subscription/tiers";

type Job = InferSelectModel<typeof jobs>;

const POLL_INTERVAL_MS = Number(process.env.PDFPROMPT_POLL_MS ?? 2000);
const MAX_ATTEMPTS = 3;
const UPLOAD_MAX_RETRIES = 3; // Retry uploads up to 3 times

async function pickNextJob() {
  const res = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.status, "queued"), lt(jobs.attempts, MAX_ATTEMPTS)))
    .orderBy(asc(jobs.createdAt))
    .limit(1);
  return res[0] ?? null;
}

/**
 * Checks if an error message indicates a transient failure that should be retried.
 */
function isTransientError(message: string): boolean {
  const transientPatterns = [
    "connection limit exceeded",
    "ResourceExhausted",
    "transaction pool connection limit exceeded",
    "ECONNRESET",
    "ETIMEDOUT",
    "ENOTFOUND",
    "timeout",
    "socket hang up",
    "network error",
  ];

  const lowerMessage = message.toLowerCase();
  return transientPatterns.some((pattern) =>
    lowerMessage.includes(pattern.toLowerCase()),
  );
}

/**
 * Uploads a file to UploadThing with automatic retry logic for transient errors.
 * Uses exponential backoff: 1s, 2s, 4s delays between retries.
 */
async function uploadWithRetry(
  utFile: UTFile,
  fileId: string,
  maxRetries = UPLOAD_MAX_RETRIES,
): Promise<{ fileKey: string; fileUrl: string; fileSize: number }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const uploadResArr = await utapi.uploadFiles([utFile]);
      const uploadRes = uploadResArr[0];

      if (!uploadRes) {
        throw new Error("UploadThing upload failed - no response");
      }

      const resUnknown: unknown = uploadRes;

      // Handle possible error shape
      const maybeError =
        typeof resUnknown === "object" &&
        resUnknown !== null &&
        "error" in resUnknown
          ? (resUnknown as { error?: unknown }).error
          : undefined;

      if (typeof maybeError === "object" && maybeError !== null) {
        const msg =
          "message" in (maybeError as Record<string, unknown>) &&
          typeof (maybeError as Record<string, unknown>).message === "string"
            ? ((maybeError as Record<string, unknown>).message as string)
            : "UploadThing upload failed";

        // Check if this is a transient error worth retrying
        if (isTransientError(msg) && attempt < maxRetries) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(
            `[uploadthing] Transient error on attempt ${attempt}/${maxRetries}: ${msg}`,
          );
          console.log(`[uploadthing] Retrying in ${backoffMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }

        throw new Error(msg);
      }

      // Extract data payload
      const dataUnknown =
        typeof resUnknown === "object" &&
        resUnknown !== null &&
        "data" in resUnknown
          ? (resUnknown as { data?: unknown }).data
          : undefined;

      if (typeof dataUnknown !== "object" || dataUnknown === null) {
        throw new Error("UploadThing upload failed - invalid response data");
      }

      const dataObj = dataUnknown as Record<string, unknown>;
      const keyVal = typeof dataObj.key === "string" ? dataObj.key : undefined;
      const ufsUrlVal =
        typeof dataObj.ufsUrl === "string" ? dataObj.ufsUrl : undefined;
      const sizeVal =
        typeof dataObj.size === "number" ? dataObj.size : undefined;

      if (!keyVal || !ufsUrlVal) {
        throw new Error("UploadThing upload failed - missing key or URL");
      }

      // Success!
      if (attempt > 1) {
        console.log(
          `[uploadthing] Upload succeeded on attempt ${attempt}/${maxRetries}`,
        );
      }

      return {
        fileKey: keyVal,
        fileUrl: ufsUrlVal,
        fileSize: sizeVal ?? utFile.size,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorMsg = lastError.message;

      // Check if we should retry this error
      if (isTransientError(errorMsg) && attempt < maxRetries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(
          `[uploadthing] Upload failed on attempt ${attempt}/${maxRetries}: ${errorMsg}`,
        );
        console.log(`[uploadthing] Retrying in ${backoffMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      // Not a transient error or out of retries
      if (attempt >= maxRetries) {
        console.error(
          `[uploadthing] Upload failed after ${maxRetries} attempts for file ${fileId}`,
        );
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error("Upload failed after retries");
}

// Atomically claim up to `limit` jobs using a single statement with SKIP LOCKED.
// Returns the claimed job IDs. This requires PostgreSQL and is safe to call concurrently.
async function claimNextJobsBatch(limit: number): Promise<string[]> {
  // One-statement claim using a CTE with SKIP LOCKED
  const rows = (await pg`with claimed as (
       select id
       from "pdfprompt_job"
       where status = 'queued' and attempts < ${MAX_ATTEMPTS}
       for update skip locked
       limit ${limit}
     )
     update "pdfprompt_job" as j
     set status = 'processing', attempts = j.attempts + 1
     from claimed c
     where j.id = c.id
     returning j.id`) as unknown as Array<{ id: string }>;
  return rows.map((r) => r.id);
}

async function processJob(job: Job, opts?: { alreadyClaimed?: boolean }) {
  console.log(`[worker] processing job ${job.id}`);
  try {
    if (!opts?.alreadyClaimed) {
      // Atomically claim the job: transition queued -> processing
      const claimed = await db
        .update(jobs)
        .set({ status: "processing", attempts: job.attempts + 1 })
        .where(and(eq(jobs.id, job.id), eq(jobs.status, "queued")))
        .returning({ id: jobs.id });
      if (claimed.length === 0) {
        console.log(`[worker] skipped job ${job.id} (already claimed)`);
        return;
      }

      // Send SSE update for job start
      await sendJobUpdate(job.id, {
        jobId: job.id,
        status: "processing",
        stage: "Processing PDF",
        progress: 0,
      });

      // Best-effort: initialize stage/progress
      try {
        await db
          .update(jobs)
          .set({ progress: 5, stage: "Processing PDF" })
          .where(eq(jobs.id, job.id));
      } catch {
        // ignore if columns not present yet
      }
    }

    // Get user's subscription tier
    let userTier: SubscriptionTier = "starter";
    let shouldAddWatermark = true;
    if (job.userId) {
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, job.userId))
        .limit(1);
      if (subscription[0]) {
        userTier = subscription[0].tier as SubscriptionTier;
        const tierConfig = getTierConfig(userTier);
        shouldAddWatermark = tierConfig.features.watermark;
      }
    }

    const fileId = randomUUID();
    const _filename = `${fileId}.pdf`;

    // Generate PDF in-memory with tier-specific settings
    const tempImage = await readJobTempImage(job.id);
    const meta = await readJobTempMeta(job.id);

    // Batch stage updates to reduce database round-trips
    let lastStageUpdate = 0;
    const stageUpdateThrottle = 1000; // Update at most once per second

    const pdfBuffer = await generatePdfBuffer({
      jobId: job.id,
      prompt: job.prompt ?? "",
      tier: userTier,
      addWatermark: shouldAddWatermark,
      image: tempImage
        ? {
            path: tempImage.path,
            mime: tempImage.mime,
            mode: meta?.mode ?? "inline",
          }
        : null,
      onStage: async (stage: GenerationStage, progress: number) => {
        const now = Date.now();
        if (now - lastStageUpdate >= stageUpdateThrottle) {
          try {
            await db
              .update(jobs)
              .set({ stage, progress })
              .where(eq(jobs.id, job.id));

            // Send SSE update
            await sendJobUpdate(job.id, {
              jobId: job.id,
              status: "processing",
              stage,
              progress,
            });

            lastStageUpdate = now;
          } catch (e) {
            console.warn(
              `[worker] failed to update stage/progress for ${job.id}`,
              e,
            );
          }
        }
      },
    });

    const nodeBuffer = Buffer.isBuffer(pdfBuffer)
      ? Buffer.from(pdfBuffer)
      : Buffer.from(pdfBuffer);

    // Stream PDF directly to UploadThing with automatic retry logic
    const uploadFilename = `${fileId}.pdf`;
    let fileKey: string;
    let fileUrl: string;
    let fileSize: number;

    try {
      // Upload to UploadThing with retry logic
      const ab = new ArrayBuffer(nodeBuffer.length);
      new Uint8Array(ab).set(nodeBuffer);
      const utFile = new UTFile([ab], uploadFilename, {
        type: "application/pdf",
        customId: fileId,
      });

      const uploadResult = await uploadWithRetry(utFile, fileId);
      fileKey = uploadResult.fileKey;
      fileUrl = uploadResult.fileUrl;
      fileSize = uploadResult.fileSize;

      console.log(
        `[worker] job ${job.id} PDF uploaded to storage, file ${fileId}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[worker] job ${job.id} storage upload failed:`, message);
      throw new Error(`PDF upload failed: ${message}`);
    }

    // Batch database operations for better performance
    const dbOperations = [];

    // 1. Insert file record with UploadThing URL
    dbOperations.push(
      db.insert(files).values({
        id: fileId,
        jobId: job.id,
        userId: job.userId ?? null,
        fileKey: fileKey,
        fileUrl: fileUrl,
        mimeType: "application/pdf",
        size: fileSize,
      }),
    );

    // 2. Update job status
    dbOperations.push(
      db
        .update(jobs)
        .set({ status: "completed", resultFileId: fileId, errorMessage: null })
        .where(eq(jobs.id, job.id)),
    );

    // Execute batch operations
    await Promise.all(dbOperations);

    // Send SSE completion update
    await sendJobUpdate(job.id, {
      jobId: job.id,
      status: "completed",
      stage: null,
      progress: 100,
      resultFileId: fileId,
    });

    console.log(`[worker] job ${job.id} completed, file ${fileId}`);

    // Increment user's PDF usage count (async, non-blocking)
    if (job.userId) {
      const userId = job.userId; // Capture for closure
      // Use Promise.allSettled to avoid blocking on usage updates
      Promise.allSettled([
        // Update subscription usage
        db
          .select()
          .from(userSubscriptions)
          .where(eq(userSubscriptions.userId, userId))
          .limit(1)
          .then(async (currentSub) => {
            if (currentSub[0]) {
              await db
                .update(userSubscriptions)
                .set({
                  pdfsUsedThisMonth: currentSub[0].pdfsUsedThisMonth + 1,
                  storageUsedBytes:
                    currentSub[0].storageUsedBytes + nodeBuffer.length,
                })
                .where(eq(userSubscriptions.userId, userId));
            }
          }),
        // Log usage history
        db.insert(usageHistory).values({
          id: randomUUID(),
          userId: userId,
          action: "pdf_generated",
          amount: 1,
          metadata: { jobId: job.id, fileId, fileSize: nodeBuffer.length },
        }),
      ]).catch((err) => {
        console.warn(
          `[worker] failed to update usage for user ${job.userId}:`,
          err,
        );
      });
    }

    // Update final job status
    try {
      await db
        .update(jobs)
        .set({ progress: 100, stage: null })
        .where(eq(jobs.id, job.id));
    } catch {
      // ignore if columns not present
    }
    // Cleanup temp files after processing regardless of storage outcome
    await cleanupJobTemp(job.id).catch(() => undefined);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[worker] job ${job.id} failed:`, errorMessage);
    await db
      .update(jobs)
      .set({ status: "failed", errorMessage })
      .where(eq(jobs.id, job.id));

    // Send SSE failure update
    await sendJobUpdate(job.id, {
      jobId: job.id,
      status: "failed",
      errorMessage,
    });

    // Attempt cleanup on failure as well
    await cleanupJobTemp(job.id).catch(() => undefined);
  }
}

export async function drain(
  options: { maxJobs?: number; maxMs?: number } = {},
) {
  const maxJobs =
    options.maxJobs ??
    Number(process.env.PDFPROMPT_MAX_JOBS_PER_INVOCATION ?? 5);
  const maxMs =
    options.maxMs ??
    Number(process.env.PDFPROMPT_MAX_MS_PER_INVOCATION ?? 55_000);
  const start = Date.now();
  let processed = 0;
  const defaultBatch = Number(process.env.PDFPROMPT_BATCH_SIZE ?? 5);

  // Pre-warm browser pool for faster PDF generation
  try {
    await preWarmBrowserPool();
  } catch (error) {
    console.warn("[worker] Failed to pre-warm browser pool:", error);
  }

  while (processed < maxJobs && Date.now() - start < maxMs) {
    const toClaim = Math.max(1, Math.min(defaultBatch, maxJobs - processed));
    const ids = await claimNextJobsBatch(toClaim);
    if (ids.length === 0) break;
    const rows = await db.select().from(jobs).where(inArray(jobs.id, ids));
    for (const job of rows) {
      if (processed >= maxJobs || Date.now() - start >= maxMs) break;
      await processJob(job, { alreadyClaimed: true });
      processed++;
      // short pause to yield between jobs
      await new Promise((r) => setTimeout(r, 50));
    }
  }
  const tookMs = Date.now() - start;
  return { processed, tookMs, timedOut: tookMs >= maxMs };
}

async function runLoop() {
  console.log(`[worker] starting loop (poll ${POLL_INTERVAL_MS}ms)`);
  while (true) {
    try {
      const job = await pickNextJob();
      if (job) {
        await processJob(job);
        // small pause after processing
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }
    } catch (err) {
      console.error("[worker] loop error", err);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

// ESM-safe entrypoint check (Node.js only - not available in Edge Runtime)
// Use a function to delay evaluation and avoid static analysis issues
(function checkEntryPoint() {
  try {
    const proc = typeof process !== "undefined" ? process : null;
    if (!proc?.argv || !Array.isArray(proc.argv) || !proc.argv[1]) {
      return; // Edge Runtime - skip
    }

    if (typeof proc.exit !== "function") {
      return; // No exit function available
    }

    // Bind exit to process to avoid unbound method warning
    const exit = proc.exit.bind(proc);

    const argv = proc.argv;
    const argv1 = argv[1];
    if (!argv1) {
      return; // No argv[1] available
    }

    // Use IIFE to handle async import
    (async () => {
      try {
        // Dynamic import of url module (Node.js only)
        const { pathToFileURL } = await import("url");
        const isEntry = import.meta.url === pathToFileURL(argv1).href;
        if (isEntry) {
          runLoop().catch((e) => {
            console.error(e);
            exit(1);
          });
        }
      } catch {
        // Ignore errors in Edge Runtime where url module or process.argv may not work
      }
    })().catch(() => {
      // Ignore async errors
    });
  } catch {
    // Ignore errors in Edge Runtime
  }
})();

export { runLoop, processJob };
