import { pathToFileURL } from "url";
import { db, pg } from "~/server/db";
import {
  jobs,
  files,
  userSubscriptions,
  usageHistory,
} from "~/server/db/schema";
import { randomUUID } from "crypto";
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
import {
  getTierConfig,
  type SubscriptionTier,
} from "~/server/subscription/tiers";

type Job = InferSelectModel<typeof jobs>;

const POLL_INTERVAL_MS = Number(process.env.PDFPROMPT_POLL_MS ?? 2000);
const MAX_ATTEMPTS = 3;

async function pickNextJob() {
  const res = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.status, "queued"), lt(jobs.attempts, MAX_ATTEMPTS)))
    .orderBy(asc(jobs.createdAt))
    .limit(1);
  return res[0] ?? null;
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
        stage: "starting",
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

    // Stream PDF directly to UploadThing instead of storing inline base64
    const uploadFilename = `${fileId}.pdf`;
    let fileKey: string;
    let fileUrl: string;
    let fileSize: number;

    try {
      // Upload to UploadThing immediately
      const ab = new ArrayBuffer(nodeBuffer.length);
      new Uint8Array(ab).set(nodeBuffer);
      const utFile = new UTFile([ab], uploadFilename, {
        type: "application/pdf",
        customId: fileId,
      });
      const uploadResArr = await utapi.uploadFiles([utFile]);

      const uploadRes = uploadResArr[0];
      if (!uploadRes || uploadRes.error || !uploadRes.data) {
        const message =
          uploadRes?.error?.message ?? "UploadThing upload failed";
        throw new Error(message);
      }

      const uploadData = uploadRes.data;
      fileKey = uploadData.key;
      fileUrl = uploadData.url;
      fileSize = uploadData.size ?? nodeBuffer.length;

      console.log(
        `[worker] job ${job.id} PDF uploaded to storage, file ${fileId}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[worker] job ${job.id} storage upload failed:`,
        message,
      );
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
      })
    );

    // 2. Update job status
    dbOperations.push(
      db
        .update(jobs)
        .set({ status: "completed", resultFileId: fileId, errorMessage: null })
        .where(eq(jobs.id, job.id))
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

    console.log(
      `[worker] job ${job.id} completed, file ${fileId}`,
    );

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

// ESM-safe entrypoint check
if (
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1]
) {
  const isEntry = import.meta.url === pathToFileURL(process.argv[1]).href;
  if (isEntry) {
    runLoop().catch((e) => {
      console.error(e);
      process.exit(1);
    });
  }
}

export { runLoop, processJob };
