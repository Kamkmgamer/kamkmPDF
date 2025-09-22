import { pathToFileURL } from "url";
import { db } from "~/server/db";
import { jobs, files } from "~/server/db/schema";
import { randomUUID } from "crypto";
import { eq, lt, asc, and } from "drizzle-orm";
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

async function processJob(job: Job) {
  console.log(`[worker] processing job ${job.id}`);
  try {
    // mark processing
    await db
      .update(jobs)
      .set({ status: "processing", attempts: job.attempts + 1 })
      .where(eq(jobs.id, job.id));

    const fileId = randomUUID();
    const filename = `${fileId}.pdf`;

    // Generate PDF in-memory
    const pdfBuffer = await generatePdfBuffer({
      jobId: job.id,
      prompt: job.prompt ?? "",
    });

    // Upload to UploadThing
    const utFile = new UTFile([new Uint8Array(pdfBuffer)], filename, {
      type: "application/pdf",
      customId: fileId,
    });
    const uploadResArr = await utapi.uploadFiles([utFile]);

    const uploadRes = uploadResArr[0];
    if (!uploadRes || uploadRes.error || !uploadRes.data) {
      const message = uploadRes?.error?.message ?? "UploadThing upload failed";
      throw new Error(message);
    }

    const { key, url, size } = uploadRes.data;

    // insert file record only after successful upload
    await db.insert(files).values({
      id: fileId,
      jobId: job.id,
      userId: job.userId ?? null,
      fileKey: key,
      fileUrl: url,
      mimeType: "application/pdf",
      size: size ?? pdfBuffer.length,
    });

    // update job
    await db
      .update(jobs)
      .set({ status: "completed", resultFileId: fileId })
      .where(eq(jobs.id, job.id));
    console.log(`[worker] job ${job.id} completed, file ${fileId}`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[worker] job ${job.id} failed:`, errorMessage);
    await db
      .update(jobs)
      .set({ status: "failed", errorMessage })
      .where(eq(jobs.id, job.id));
  }
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
try {
  const isEntry = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
  if (isEntry) {
    runLoop().catch((e) => {
      console.error(e);
      process.exit(1);
    });
  }
} catch {
  // Fallback: always run
  runLoop().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export { runLoop, processJob };
