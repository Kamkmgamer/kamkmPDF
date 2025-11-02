/**
 * Test Concurrent PDF Generation on Live Server
 *
 * This test works with your running dev server:
 * 1. Creates 15 jobs
 * 2. Triggers the worker via /api/worker/drain
 * 3. Monitors progress and times completion
 *
 * Prerequisites: Server must be running (pnpm dev)
 * Run with: pnpm tsx scripts/test-live-server.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { inArray } from "drizzle-orm";
import * as schema from "../src/server/db/schema.js";
import {
  createHeader,
  createSeparator,
  createProgressBar,
  formatMetric,
  formatStatus,
  styles,
} from "./benchmark-styles.js";

// Load environment
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const WORKER_SECRET = process.env.PDFPROMPT_WORKER_SECRET;

if (!DATABASE_URL) {
  console.error(styles.error("❌ DATABASE_URL not found"));
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 5 });
const db = drizzle(sql, { schema });
const { jobs } = schema;

function randomUUID() {
  return crypto.randomUUID();
}

const NUM_PDFS = 15;
const TEST_PROMPTS = [
  "Invoice #1001 for consulting services",
  "Meeting notes from Q4 planning",
  "Product roadmap 2025",
  "Customer feedback summary",
  "Sales report October",
  "Marketing campaign brief",
  "Technical documentation v2",
  "User onboarding guide",
  "Privacy policy update",
  "Terms of service revision",
  "Employee handbook section 3",
  "Budget proposal FY2025",
  "Project status update",
  "Quarterly business review",
  "Training materials module 1",
];

async function testLiveServer() {
  console.log(createHeader("🌐 LIVE SERVER BENCHMARK", `Testing ${NUM_PDFS} PDFs on Running Server`));

  console.log(`\n${styles.title("📊 Configuration")}\n`);
  console.log(formatMetric("Server URL", APP_URL));
  console.log(formatMetric("Number of PDFs", NUM_PDFS));
  console.log(
    formatMetric(
      "Worker Secret",
      WORKER_SECRET ? styles.success("✅ Set") : styles.warning("⚠️  Not set"),
    ),
  );
  console.log(`\n${createSeparator()}\n`);

  const jobIds: string[] = [];
  const overallStart = Date.now();

  try {
    // Step 1: Create jobs directly in database
    console.log(`${styles.info("⏱️  Step 1: Creating jobs...")}\n`);
    const createStart = Date.now();

    for (let i = 0; i < NUM_PDFS; i++) {
      const jobId = randomUUID();
      jobIds.push(jobId);

      await db.insert(jobs).values({
        id: jobId,
        userId: "test-concurrent",
        prompt: TEST_PROMPTS[i],
        status: "queued",
        attempts: 0,
        progress: 0,
      });
    }

    const createDuration = Date.now() - createStart;
    console.log(
      `${styles.success(`✅ Created ${NUM_PDFS} jobs in ${(createDuration / 1000).toFixed(2)}s`)}\n`,
    );

    // Step 2: Trigger worker and monitor
    console.log(`${styles.info("⏱️  Step 2: Processing jobs...")}\n`);
    const processStart = Date.now();

    // Trigger drain endpoint
    const drainUrl = `${APP_URL}/api/worker/drain?maxJobs=${NUM_PDFS}`;
    const headers: Record<string, string> = {};
    if (WORKER_SECRET) {
      headers["x-worker-secret"] = WORKER_SECRET;
    }

    console.log(`${styles.info(`🔄 Triggering worker:`)} ${styles.dim(drainUrl)}\n`);

    // Start drain (don't await - it will process in background)
    fetch(drainUrl, { headers }).catch(() => undefined);

    // Monitor progress
    const maxWaitTime = 180_000; // 3 minutes (enough time for 15 PDFs)
    const pollInterval = 3000; // 3 seconds
    let elapsed = 0;
    let lastStatus = { completed: 0, processing: 0, queued: 0, failed: 0 };

    // Give worker time to start processing
    console.log(`${styles.dim("   Waiting for worker to pick up jobs...")}\n`);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    while (elapsed < maxWaitTime) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      elapsed += pollInterval;

      const allJobs = await db
        .select()
        .from(jobs)
        .where(inArray(jobs.id, jobIds));

      const status = {
        completed: allJobs.filter((j) => j.status === "completed").length,
        processing: allJobs.filter((j) => j.status === "processing").length,
        queued: allJobs.filter((j) => j.status === "queued").length,
        failed: allJobs.filter((j) => j.status === "failed").length,
      };

      if (
        status.completed !== lastStatus.completed ||
        status.processing !== lastStatus.processing ||
        status.queued !== lastStatus.queued ||
        status.failed !== lastStatus.failed
      ) {
        const progress = Math.round((status.completed / NUM_PDFS) * 100);
        const bar = createProgressBar(progress, 40);
        const timeStr = `${Math.floor(elapsed / 1000)}s`.padStart(4);

        console.log(
          `   ${styles.dim(`[${timeStr}]`)} ${bar} ${styles.metric(`${progress}%`)} | ${formatStatus(status)}`,
        );
        lastStatus = status;
      }

      if (status.completed + status.failed === NUM_PDFS) {
        break;
      }
    }

    const processDuration = Date.now() - processStart;
    const totalDuration = Date.now() - overallStart;

    // Step 3: Final results
    const finalJobs = await db
      .select()
      .from(jobs)
      .where(inArray(jobs.id, jobIds));

    const finalStatus = {
      completed: finalJobs.filter((j) => j.status === "completed").length,
      failed: finalJobs.filter((j) => j.status === "failed").length,
      queued: finalJobs.filter((j) => j.status === "queued").length,
      processing: finalJobs.filter((j) => j.status === "processing").length,
    };

    console.log(`\n\n${createSeparator("═")}\n`);
    console.log(`${styles.title("📊 FINAL RESULTS")}\n`);
    console.log(formatMetric("Total Time", `${(totalDuration / 1000).toFixed(2)}s`));
    console.log(formatMetric("Processing Time", `${(processDuration / 1000).toFixed(2)}s`));
    console.log(`\n${formatStatus(finalStatus)}`);

    if (finalStatus.completed > 0) {
      const throughput = (finalStatus.completed / totalDuration) * 1000 * 60;
      console.log(`\n${styles.title("⚡ Performance Metrics")}\n`);
      console.log(formatMetric("Throughput", `${throughput.toFixed(1)} PDFs/minute`));
      console.log(
        formatMetric(
          "Average Time per PDF",
          `${(totalDuration / finalStatus.completed / 1000).toFixed(2)}s`,
        ),
      );
    }

    // Performance verdict
    console.log(`\n${createSeparator("═")}\n`);
    if (totalDuration < 60_000 && finalStatus.completed === NUM_PDFS) {
      console.log(`${styles.success("🎉 SUCCESS!")} All ${NUM_PDFS} PDFs completed in under 1 minute!\n`);
      console.log(formatMetric("Target", "60s"));
      console.log(formatMetric("Actual", `${(totalDuration / 1000).toFixed(2)}s`));
      const improvement = ((60 - totalDuration / 1000) / 60) * 100;
      console.log(formatMetric("Improvement", `${improvement.toFixed(1)}% faster than target`));
    } else if (finalStatus.completed === NUM_PDFS) {
      console.log(`${styles.success("✅ All PDFs completed!")}\n`);
      console.log(formatMetric("Time", `${(totalDuration / 1000).toFixed(2)}s`));
      if (totalDuration > 60_000) {
        console.log(formatMetric("Target", "60s"));
        console.log(`\n${styles.info("💡 To improve speed:")}`);
        console.log(`   1. Add to .env: PDFPROMPT_WORKER_CONCURRENCY=10`);
        console.log(`   2. Add to .env: MAX_PDF_CONCURRENCY=15`);
        console.log(`   3. Restart server`);
      }
    } else {
      console.log(
        `${styles.warning("⚠️  Incomplete")} Only ${finalStatus.completed}/${NUM_PDFS} PDFs completed\n`,
      );
      if (finalStatus.queued > 0) {
        console.log(`${styles.warning(`${finalStatus.queued} still queued - worker may not be running`)}`);
        console.log(`\n${styles.info("💡 Try:")} pnpm worker (in separate terminal)`);
      }
      if (finalStatus.failed > 0) {
        console.log(`\n${styles.error("Failed jobs:")}`);
        const failed = finalJobs.filter((j) => j.status === "failed");
        for (const job of failed.slice(0, 3)) {
          console.log(`   ${styles.dim(`- ${job.errorMessage || "Unknown error"}`)}`);
        }
      }
    }

    console.log(`\n${createSeparator()}\n`);
  } catch (error) {
    console.error(`\n${styles.error("❌ Error:")}`, error);
    throw error;
  } finally {
    await sql.end();
  }
}

testLiveServer()
  .then(() => {
    console.log(`\n${styles.success("✨ Test completed!")}\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n${styles.error("💥 Test failed:")}`, error);
    process.exit(1);
  });
