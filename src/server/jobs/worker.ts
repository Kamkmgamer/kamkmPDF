import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { db } from "~/server/db";
import { jobs, files } from "~/server/db/schema";
import { randomUUID } from "crypto";
import { eq, lt, asc, and } from "drizzle-orm";
import generatePdfToPath from "~/server/jobs/pdf";
import type { InferSelectModel } from "drizzle-orm";

type Job = InferSelectModel<typeof jobs>;

const POLL_INTERVAL_MS = Number(process.env.PDFPROMPT_POLL_MS ?? 2000);
const TMP_DIR =
  process.env.PDFPROMPT_TMP_DIR ?? path.join(process.cwd(), "tmp");
const MAX_ATTEMPTS = 3;

async function ensureTmp() {
  await fs.promises.mkdir(TMP_DIR, { recursive: true });
}

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

    // real PDF generation using PDFKit
    await ensureTmp();
    const fileId = randomUUID();
    const filename = `${fileId}.pdf`;
    const filePath = path.join(TMP_DIR, filename);

    await generatePdfToPath(filePath, {
      jobId: job.id,
      prompt: job.prompt ?? "",
    });

    const stat = await fs.promises.stat(filePath);

    // insert file record
    await db
      .insert(files)
      .values({ id: fileId, jobId: job.id, path: filename, size: stat.size });

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
