/**
 * Concurrent PDF Generation Test WITH Worker Processing
 *
 * This script:
 * 1. Creates 15 PDF jobs
 * 2. Processes them using the drain() function
 * 3. Times the whole process
 *
 * Run with: pnpm tsx scripts/test-with-worker.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { inArray } from "drizzle-orm";
import * as schema from "../src/server/db/schema.js";
import { drain } from "../src/server/jobs/worker.js";
import {
  createHeader,
  createSeparator,
  createProgressBar,
  formatMetric,
  formatStatus,
  styles,
} from "./benchmark-styles.js";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error(styles.error("❌ ERROR: DATABASE_URL not found"));
  process.exit(1);
}

// Setup database connection
const sql = postgres(DATABASE_URL, { max: 5 });
const db = drizzle(sql, { schema });
const { jobs } = schema;

function randomUUID() {
  return crypto.randomUUID();
}

const NUM_PDFS = 15;
const TEST_PROMPTS = [
  "Create a simple invoice template",
  "Generate a basic business letter",
  "Write a short meeting notes document",
  "Create a to-do list template",
  "Generate a simple project checklist",
  "Write a basic product description",
  "Create a short user guide",
  "Generate a simple FAQ document",
  "Write a basic terms of service",
  "Create a privacy policy outline",
  "Generate a simple contact form",
  "Write a basic welcome email",
  "Create a short newsletter template",
  "Generate a simple announcement",
  "Write a basic product feature list",
];

async function testWithWorker() {
  console.log(createHeader("🚀 PDF GENERATION BENCHMARK", `Testing ${NUM_PDFS} PDFs with Worker Processing`));

  console.log(`\n${styles.title("📊 Configuration")}\n`);
  console.log(formatMetric("Number of PDFs", NUM_PDFS));
  console.log(
    formatMetric(
      "Worker Concurrency",
      process.env.PDFPROMPT_WORKER_CONCURRENCY ?? 10,
    ),
  );
  console.log(
    formatMetric(
      "Max PDF Concurrency",
      process.env.MAX_PDF_CONCURRENCY ?? 8,
    ),
  );
  console.log(
    formatMetric(
      "Browser Pool Size",
      process.env.BROWSER_POOL_SIZE ?? 3,
    ),
  );
  console.log(
    formatMetric(
      "Batch Size",
      process.env.PDFPROMPT_BATCH_SIZE ?? 5,
    ),
  );
  console.log(`\n${createSeparator()}\n`);

  const jobIds: string[] = [];
  const overallStart = Date.now();

  try {
    // Step 1: Create jobs
    console.log(`${styles.info("⏱️  Step 1: Creating jobs...")}\n`);
    const createStart = Date.now();

    for (let i = 0; i < NUM_PDFS; i++) {
      const jobId = randomUUID();
      jobIds.push(jobId);

      await db.insert(jobs).values({
        id: jobId,
        userId: "test-user",
        prompt: TEST_PROMPTS[i % TEST_PROMPTS.length],
        status: "queued",
        attempts: 0,
        progress: 0,
      });
    }

    const createDuration = Date.now() - createStart;
    console.log(
      `${styles.success(`✅ Created ${NUM_PDFS} jobs in ${(createDuration / 1000).toFixed(2)}s`)}\n`,
    );

    // Step 2: Process with drain()
    console.log(`${styles.info("⏱️  Step 2: Processing jobs...")}\n`);
    const processStart = Date.now();

    // Keep draining until all jobs are done
    let rounds = 0;
    let totalProcessed = 0;

    while (totalProcessed < NUM_PDFS && rounds < 20) {
      rounds++;
      const roundText = `   ${styles.info(`🔄 Drain round ${rounds}...`)}`;
      process.stdout.write(`\r${roundText}`);

      const result = await drain({
        maxJobs: NUM_PDFS,
        maxMs: 120_000, // 2 minutes per drain
      });

      totalProcessed += result.processed;

      // Check if all done
      const remaining = await db
        .select()
        .from(jobs)
        .where(inArray(jobs.id, jobIds));

      const queued = remaining.filter((j) => j.status === "queued").length;
      const processing = remaining.filter(
        (j) => j.status === "processing",
      ).length;
      const completed = remaining.filter(
        (j) => j.status === "completed",
      ).length;
      const failed = remaining.filter((j) => j.status === "failed").length;

      const status = { completed, processing, queued, failed };
      const progress = Math.round((completed / NUM_PDFS) * 100);
      const bar = createProgressBar(progress, 40);

      console.log(
        `\r   ${bar} ${styles.metric(`${progress}%`)} | ${formatStatus(status)} | ${styles.dim(`${(result.tookMs / 1000).toFixed(1)}s`)}`,
      );

      if (queued === 0 && processing === 0) {
        break;
      }

      // Small pause between drains
      await new Promise((r) => setTimeout(r, 1000));
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
    console.log(formatMetric("Drain Rounds", rounds));
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

    // Success check
    console.log(`\n${createSeparator("═")}\n`);
    if (totalDuration < 60_000 && finalStatus.completed === NUM_PDFS) {
      console.log(`${styles.success("🎉 SUCCESS!")} All ${NUM_PDFS} PDFs completed in under 1 minute!\n`);
      console.log(formatMetric("Target", "60s"));
      console.log(formatMetric("Actual", `${(totalDuration / 1000).toFixed(2)}s`));
      const improvement = ((60 - totalDuration / 1000) / 60) * 100;
      console.log(formatMetric("Improvement", `${improvement.toFixed(1)}% faster than target`));
    } else if (finalStatus.completed === NUM_PDFS) {
      console.log(`${styles.warning("⚠️  Completed")} All PDFs finished\n`);
      console.log(formatMetric("Time", `${(totalDuration / 1000).toFixed(2)}s`));
      console.log(formatMetric("Target", "60s"));
      console.log(`\n${styles.info("💡 Optimization Tips:")}`);
      console.log(`   • Increase PDFPROMPT_WORKER_CONCURRENCY`);
      console.log(`   • Increase MAX_PDF_CONCURRENCY`);
      console.log(`   • Check AI provider rate limits`);
    } else {
      console.log(
        `${styles.error("❌ Incomplete")} Only ${finalStatus.completed}/${NUM_PDFS} PDFs completed\n`,
      );
      if (finalStatus.failed > 0) {
        console.log(`${styles.error("Failed jobs:")}`);
        const failed = finalJobs.filter((j) => j.status === "failed");
        for (const job of failed) {
          console.log(`   ${styles.dim(`- ${job.id}: ${job.errorMessage}`)}`);
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

testWithWorker()
  .then(() => {
    console.log(`\n${styles.success("✨ Test completed!")}\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n${styles.error("💥 Test failed:")}`, error);
    process.exit(1);
  });
