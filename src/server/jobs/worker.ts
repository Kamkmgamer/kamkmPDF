import { pathToFileURL } from "url";
import { db, pg } from "~/server/db";
import { jobs, files } from "~/server/db/schema";
import { randomUUID } from "crypto";
import { eq, lt, asc, and, inArray } from "drizzle-orm";
import { generatePdfBuffer } from "~/server/jobs/pdf";
import type { InferSelectModel } from "drizzle-orm";
import { UTFile } from "uploadthing/server";
import { utapi } from "~/server/uploadthing";

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
    }

    const fileId = randomUUID();
    const filename = `${fileId}.pdf`;
    const inlineKey = `inline:${fileId}`;

    // Generate PDF in-memory
    const pdfBuffer = await generatePdfBuffer({
      jobId: job.id,
      prompt: job.prompt ?? "",
    });

    const nodeBuffer = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from(pdfBuffer);

    const inlineBase64 = nodeBuffer.toString("base64");

    // Make the PDF immediately available by inserting an inline record
    await db.insert(files).values({
      id: fileId,
      jobId: job.id,
      userId: job.userId ?? null,
      fileKey: inlineKey,
      fileUrl: inlineBase64,
      mimeType: "application/pdf",
      size: nodeBuffer.length,
    });

    await db
      .update(jobs)
      .set({ status: "completed", resultFileId: fileId, errorMessage: null })
      .where(eq(jobs.id, job.id));
    console.log(
      `[worker] job ${job.id} completed (inline ready), file ${fileId}`,
    );

    try {
      // Upload to UploadThing: construct BlobPart as a plain ArrayBuffer to satisfy TS
      const ab = new ArrayBuffer(nodeBuffer.length);
      new Uint8Array(ab).set(nodeBuffer);
      const utFile = new UTFile([ab], filename, {
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

      const { key, url, size } = uploadRes.data;

      await db
        .update(files)
        .set({
          fileKey: key,
          fileUrl: url,
          size: size ?? nodeBuffer.length,
        })
        .where(eq(files.id, fileId));

      await db
        .update(jobs)
        .set({ errorMessage: null })
        .where(eq(jobs.id, job.id));
      console.log(
        `[worker] job ${job.id} storage upload completed, file ${fileId}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[worker] job ${job.id} storage upload failed (inline available):`,
        message,
      );
      await db
        .update(jobs)
        .set({ errorMessage: message })
        .where(eq(jobs.id, job.id));
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[worker] job ${job.id} failed:`, errorMessage);
    await db
      .update(jobs)
      .set({ status: "failed", errorMessage })
      .where(eq(jobs.id, job.id));
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
