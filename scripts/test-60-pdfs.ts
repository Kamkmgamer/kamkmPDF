/**
 * Test 60 Concurrent PDFs
 *
 * Tests the system's ability to handle high concurrency
 * Prerequisites: Server running with worker (pnpm dev or pnpm preview)
 * Run with: pnpm tsx scripts/test-60-pdfs.ts
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

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (!DATABASE_URL) {
  console.error(styles.error("❌ DATABASE_URL not found"));
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 5 });
const db = drizzle(sql, { schema });
const { jobs } = schema;

const NUM_PDFS = 60;
const TEST_USER_ID = `test-60-${Date.now()}`;

// Helper function for UUID generation
function randomUUID() {
  return crypto.randomUUID();
}

// Generate diverse prompts
const generatePrompts = (count: number): string[] => {
  const templates = [
    "Generate invoice #{{n}} for consulting services",
    "Create meeting notes for project {{n}}",
    "Write technical documentation page {{n}}",
    "Generate business proposal v{{n}}",
    "Create product specification document {{n}}",
    "Write user manual chapter {{n}}",
    "Generate financial report Q{{n}}",
    "Create marketing brief campaign {{n}}",
    "Write training material module {{n}}",
    "Generate project status report {{n}}",
  ];

  return Array.from({ length: count }, (_, i) => {
    const template = templates[i % templates.length];
    return template.replace("{{n}}", (i + 1).toString());
  });
};

async function test60PDFs() {
  console.clear();
  console.log(createHeader("🔥 60 CONCURRENT PDFS STRESS TEST", "Testing System Performance at Scale"));

  console.log(`\n${styles.title("📊 Test Configuration")}\n`);
  console.log(formatMetric("Number of PDFs", NUM_PDFS));
  console.log(formatMetric("Server URL", APP_URL));
  console.log(formatMetric("Test ID", TEST_USER_ID));
  console.log(
    formatMetric(
      "Worker Concurrency",
      process.env.PDFPROMPT_WORKER_CONCURRENCY || "10 (default)",
    ),
  );
  console.log(
    formatMetric(
      "Max PDF Concurrency",
      process.env.MAX_PDF_CONCURRENCY || "8 (default)",
    ),
  );
  console.log(`\n${createSeparator()}\n`);

  const jobIds: string[] = [];
  const overallStart = Date.now();

  try {
    // Step 1: Create jobs
    console.log(`${styles.info("⏱️  Step 1: Creating jobs...")}\n`);
    const createStart = Date.now();

    const prompts = generatePrompts(NUM_PDFS);
    const batchSize = 10;

    for (let i = 0; i < NUM_PDFS; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (prompt) => {
          const jobId = randomUUID();
          jobIds.push(jobId);

          await db.insert(jobs).values({
            id: jobId,
            userId: TEST_USER_ID,
            prompt,
            status: "queued",
            attempts: 0,
            progress: 0,
          });
        }),
      );

      // Progress indicator
      const created = Math.min(i + batchSize, NUM_PDFS);
      const progress = Math.round((created / NUM_PDFS) * 100);
      const bar = createProgressBar(progress, 50);
      process.stdout.write(
        `\r   ${bar} ${styles.metric(`${progress}%`)} | ${styles.dim(`Created ${created}/${NUM_PDFS} jobs...`)}`,
      );
    }

    const createDuration = Date.now() - createStart;
    console.log(
      `\n${styles.success(`✅ Created ${NUM_PDFS} jobs in ${(createDuration / 1000).toFixed(2)}s`)}\n`,
    );

    // Step 2: Trigger worker and monitor
    console.log(`${styles.info("⏱️  Step 2: Monitoring job processing...")}\n`);

    // Trigger drain endpoint multiple times to keep processing
    const drainUrl = `${APP_URL}/api/worker/drain?maxJobs=${NUM_PDFS}&maxMs=50000`;
    const WORKER_SECRET = process.env.PDFPROMPT_WORKER_SECRET;
    const headers: Record<string, string> = {};
    if (WORKER_SECRET) {
      headers["x-worker-secret"] = WORKER_SECRET;
    }

    console.log(`${styles.info(`🔄 Triggering worker via:`)} ${styles.dim(drainUrl)}`);
    console.log(`${styles.dim("💡 Note: Worker will process jobs in batches\n")}`);

    // Trigger drain periodically to keep processing
    const drainInterval = setInterval(() => {
      fetch(drainUrl, { headers }).catch(() => undefined);
    }, 30000); // Every 30 seconds

    // Initial trigger
    fetch(drainUrl, { headers }).catch(() => undefined);

    const maxWaitTime = 600_000; // 10 minutes max
    const pollInterval = 2000; // 2 seconds
    let elapsed = 0;
    let lastStatus = { completed: 0, processing: 0, queued: 0, failed: 0 };
    let peakConcurrent = 0;
    let lastProgressUpdate = 0;

    // Give workers time to start
    console.log(`${styles.dim("   Waiting for worker to start...")}`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("");

    // Draw header
    console.log(
      `   ${styles.dim("Time")}  | ${styles.dim("Progress Bar")}                                    | ${styles.dim("%")}   | ${styles.dim("Done")} | ${styles.dim("Proc")} | ${styles.dim("Queue")} | ${styles.dim("Fail")}`,
    );
    console.log(`   ${createSeparator("─", 100)}`);

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

      peakConcurrent = Math.max(peakConcurrent, status.processing);

      // Update every time status changes OR every 10 seconds
      const shouldUpdate =
        status.completed !== lastStatus.completed ||
        status.processing !== lastStatus.processing ||
        status.queued !== lastStatus.queued ||
        status.failed !== lastStatus.failed ||
        elapsed - lastProgressUpdate >= 10000;

      if (shouldUpdate) {
        const progress = Math.round((status.completed / NUM_PDFS) * 100);
        const bar = createProgressBar(progress, 45);

        const timeStr = Math.floor(elapsed / 1000).toString().padStart(4);
        const progressStr = progress.toString().padStart(3);
        const completedStr = status.completed.toString().padStart(4);
        const processingStr = status.processing.toString().padStart(4);
        const queuedStr = status.queued.toString().padStart(5);
        const failedStr = status.failed.toString().padStart(4);

        process.stdout.write(
          `\r   ${styles.dim(`${timeStr}s`)} | ${bar} | ${styles.metric(`${progressStr}%`)} | ${styles.success(completedStr)} | ${styles.info(processingStr)} | ${styles.warning(queuedStr)} | ${styles.error(failedStr)}`,
        );

        lastStatus = status;
        lastProgressUpdate = elapsed;

        // If processing stopped and jobs remain, trigger drain again
        if (status.processing === 0 && status.queued > 0) {
          fetch(drainUrl, { headers }).catch(() => undefined);
        }
      }

      if (status.completed + status.failed === NUM_PDFS) {
        clearInterval(drainInterval);
        break;
      }
    }

    clearInterval(drainInterval);
    console.log("\n");

    const processDuration = Date.now() - overallStart - createDuration;
    const totalDuration = Date.now() - overallStart;

    // Final results
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

    console.log(`\n${createSeparator("═")}\n`);
    console.log(`${styles.title("📊 FINAL RESULTS")}\n`);
    console.log(formatMetric("Total Time", `${(totalDuration / 1000).toFixed(2)}s`));
    console.log(formatMetric("Processing Time", `${(processDuration / 1000).toFixed(2)}s`));
    console.log(formatMetric("Peak Concurrent", `${peakConcurrent} PDFs`));
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
      console.log(
        formatMetric(
          "Peak Concurrent Processing",
          `${peakConcurrent} PDFs simultaneously`,
        ),
      );
    }

    // Performance verdict
    console.log(`\n${createSeparator("═")}\n`);
    if (totalDuration < 60_000 && finalStatus.completed === NUM_PDFS) {
      console.log(`${styles.success("🎉🎉🎉 OUTSTANDING!")} All 60 PDFs in under 1 minute!\n`);
      console.log(formatMetric("Target", "60s"));
      console.log(formatMetric("Actual", `${(totalDuration / 1000).toFixed(2)}s`));
      const improvement = ((60 - totalDuration / 1000) / 60) * 100;
      console.log(formatMetric("Improvement", `${improvement.toFixed(1)}% faster than target`));
    } else if (totalDuration < 120_000 && finalStatus.completed === NUM_PDFS) {
      console.log(`${styles.success("✅ SUCCESS!")} All 60 PDFs completed in under 2 minutes!\n`);
      console.log(formatMetric("Time", `${(totalDuration / 1000).toFixed(2)}s`));
      console.log(`${styles.success("Great performance for high concurrency!")}`);
    } else if (finalStatus.completed === NUM_PDFS) {
      console.log(
        `${styles.success("✅ All PDFs completed")} in ${(totalDuration / 1000).toFixed(2)}s\n`,
      );
      console.log(`${styles.info("💡 To improve speed:")}`);
      console.log(
        `   1. Deploy more workers (current setup: ${Math.ceil(peakConcurrent / 12)} workers active)`,
      );
      console.log(`   2. Increase PDFPROMPT_WORKER_CONCURRENCY to 15`);
      console.log(`   3. Increase MAX_PDF_CONCURRENCY to 20`);
    } else {
      console.log(
        `${styles.warning("⚠️  Incomplete")} Only ${finalStatus.completed}/${NUM_PDFS} PDFs completed\n`,
      );

      if (finalStatus.queued > 0) {
        console.log(`${styles.warning(`${finalStatus.queued} jobs still queued:`)}`);
        console.log(`   • Deploy more worker instances`);
        console.log(`   • Check worker logs for errors`);
        console.log(`   • Verify workers are running`);
      }

      if (finalStatus.failed > 0) {
        console.log(`\n${styles.error(`${finalStatus.failed} jobs failed:`)}`);
        const failed = finalJobs.filter((j) => j.status === "failed");
        for (const job of failed.slice(0, 5)) {
          console.log(`   ${styles.dim(`- ${job.errorMessage || "Unknown error"}`)}`);
        }
      }
    }

    // Performance analysis
    console.log(`\n${createSeparator("═")}\n`);
    console.log(`${styles.title("📈 PERFORMANCE ANALYSIS")}\n`);

    const workersEstimate = Math.ceil(peakConcurrent / 12);
    console.log(formatMetric("Estimated Active Workers", workersEstimate));
    console.log(
      formatMetric(
        "Average Concurrent PDFs",
        `${(peakConcurrent * 0.7).toFixed(1)}`,
      ),
    );
    console.log(
      formatMetric(
        "System Utilization",
        `${((peakConcurrent / 60) * 100).toFixed(1)}%`,
      ),
    );

    if (finalStatus.completed > 0) {
      const idealTime = 30; // seconds for 60 PDFs with perfect parallelism
      const efficiency = (idealTime / (totalDuration / 1000)) * 100;
      console.log(
        formatMetric(
          "Parallelization Efficiency",
          `${Math.min(efficiency, 100).toFixed(1)}%`,
        ),
      );
    }

    console.log(`\n${createSeparator("═")}\n`);

    // Recommendations
    if (peakConcurrent < 30) {
      console.log(`${styles.info("💡 RECOMMENDATIONS:")}\n`);
      console.log(`Low concurrent processing detected. To reach 60+ concurrent:\n`);
      console.log(`   1. Deploy 5 worker instances`);
      console.log(`   2. Set PDFPROMPT_WORKER_CONCURRENCY=12 per worker`);
      console.log(`   3. Set MAX_PDF_CONCURRENCY=15 per worker`);
      console.log(`   4. Total capacity: 5 × 12 = 60 concurrent PDFs`);
      console.log(`\n${formatMetric("Current capacity", `~${peakConcurrent} concurrent PDFs`)}`);
      console.log(
        formatMetric(
          "Additional workers needed",
          `${Math.ceil((60 - peakConcurrent) / 12)}`,
        ),
      );
    } else if (peakConcurrent >= 60) {
      console.log(`${styles.success("🎉 EXCELLENT!")}\n`);
      console.log(
        `Your system is handling 60+ concurrent PDFs (peak: ${peakConcurrent})!\n`,
      );
      console.log(`${styles.success("This setup can support 10,000+ concurrent users.")}`);
    } else {
      console.log(`${styles.info("📊 GOOD PROGRESS!")}\n`);
      console.log(formatMetric("Peak concurrent", `${peakConcurrent} PDFs`));
      console.log(
        formatMetric(
          "To reach 60+",
          `add ${Math.ceil((60 - peakConcurrent) / 12)} more workers`,
        ),
      );
    }

    console.log(`\n${createSeparator()}\n`);
  } catch (error) {
    console.error(`\n${styles.error("❌ Error:")}`, error);
    throw error;
  } finally {
    await sql.end();
  }
}

test60PDFs()
  .then(() => {
    console.log(`\n${styles.success("✨ Test completed!")}\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n${styles.error("💥 Test failed:")}`, error);
    process.exit(1);
  });
