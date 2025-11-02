/**
 * Concurrent PDF Generation Load Test
 *
 * Tests the system's ability to handle multiple PDFs at once
 * Run with: pnpm tsx scripts/test-concurrent-pdfs.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { inArray } from "drizzle-orm";
import * as schema from "../src/server/db/schema.js";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL not found");
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
  "Create a professional invoice for web development services totaling $5,000",
  "Generate a business proposal for a new marketing campaign",
  "Create a technical documentation page for API endpoints",
  "Write a project status report with milestones and deliverables",
  "Generate a meeting agenda for quarterly business review",
  "Create a product specification document for mobile app",
  "Write a user manual for software installation",
  "Generate a financial report with charts and tables",
  "Create a resume template with modern design",
  "Write a research paper abstract on machine learning",
  "Generate a press release for product launch",
  "Create a training manual for customer service",
  "Write a legal contract template for services",
  "Generate a marketing brochure with product features",
  "Create a technical whitepaper on cloud architecture",
];

async function testConcurrentPDFs() {
  console.log("🚀 Starting Concurrent PDF Generation Test\n");
  console.log(`📊 Configuration:`);
  console.log(`   - Number of PDFs: ${NUM_PDFS}`);
  console.log(
    `   - Worker Concurrency: ${process.env.PDFPROMPT_WORKER_CONCURRENCY ?? 3}`,
  );
  console.log(
    `   - Max PDF Concurrency: ${process.env.MAX_PDF_CONCURRENCY ?? 8}`,
  );
  console.log(`   - Browser Pool Size: ${process.env.BROWSER_POOL_SIZE ?? 3}`);
  console.log(`\n${"=".repeat(60)}\n`);

  const jobIds: string[] = [];
  const startTime = Date.now();

  try {
    // Step 1: Create all jobs simultaneously
    console.log(`⏱️  Step 1: Creating ${NUM_PDFS} jobs...`);
    const createStart = Date.now();

    const jobPromises = Array.from({ length: NUM_PDFS }, (_, i) => {
      const jobId = randomUUID();
      jobIds.push(jobId);

      return db.insert(jobs).values({
        id: jobId,
        userId: "test-user-concurrent",
        prompt: TEST_PROMPTS[i % TEST_PROMPTS.length],
        status: "queued",
        attempts: 0,
        progress: 0,
      });
    });

    await Promise.all(jobPromises);
    const createDuration = Date.now() - createStart;
    console.log(`   ✅ Created ${NUM_PDFS} jobs in ${createDuration}ms\n`);

    // Step 2: Wait for all jobs to complete
    console.log("⏱️  Step 2: Waiting for jobs to complete...");
    console.log("   (Jobs will be processed by the worker)\n");

    const maxWaitTime = 120_000; // 2 minutes max
    const pollInterval = 2000; // Check every 2 seconds
    let elapsed = 0;
    let lastStatus = { completed: 0, processing: 0, queued: 0, failed: 0 };

    while (elapsed < maxWaitTime) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      elapsed += pollInterval;

      // Check status of all jobs
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

      // Only log if status changed
      if (
        status.completed !== lastStatus.completed ||
        status.processing !== lastStatus.processing ||
        status.queued !== lastStatus.queued ||
        status.failed !== lastStatus.failed
      ) {
        const progress = Math.round((status.completed / NUM_PDFS) * 100);
        console.log(
          `   [${Math.floor(elapsed / 1000)}s] ` +
            `✅ ${status.completed} | ` +
            `⚙️  ${status.processing} | ` +
            `⏳ ${status.queued} | ` +
            `❌ ${status.failed} | ` +
            `Progress: ${progress}%`,
        );
        lastStatus = status;
      }

      // All done?
      if (status.completed + status.failed === NUM_PDFS) {
        break;
      }
    }

    // Step 3: Final results
    const totalDuration = Date.now() - startTime;
    const finalJobs = await db
      .select()
      .from(jobs)
      .where(inArray(jobs.id, jobIds));

    const finalStatus = {
      completed: finalJobs.filter((j) => j.status === "completed").length,
      processing: finalJobs.filter((j) => j.status === "processing").length,
      queued: finalJobs.filter((j) => j.status === "queued").length,
      failed: finalJobs.filter((j) => j.status === "failed").length,
    };

    console.log(`\n${"=".repeat(60)}\n`);
    console.log("📊 RESULTS\n");
    console.log(`⏱️  Total Time: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`✅ Completed: ${finalStatus.completed}/${NUM_PDFS}`);
    console.log(`❌ Failed: ${finalStatus.failed}/${NUM_PDFS}`);
    console.log(`⏳ Still Queued: ${finalStatus.queued}/${NUM_PDFS}`);
    console.log(`⚙️  Processing: ${finalStatus.processing}/${NUM_PDFS}`);

    if (finalStatus.completed > 0) {
      const avgTime = totalDuration / finalStatus.completed;
      console.log(`\n⚡ Average Time per PDF: ${(avgTime / 1000).toFixed(2)}s`);
      console.log(
        `🚀 Throughput: ${((finalStatus.completed / totalDuration) * 1000 * 60).toFixed(1)} PDFs/minute`,
      );
    }

    // Calculate individual job times
    const completedJobs = finalJobs.filter((j) => j.status === "completed");
    if (completedJobs.length > 0) {
      const jobTimes = completedJobs.map((j) => {
        const created = new Date(j.createdAt).getTime();
        const updated = j.updatedAt
          ? new Date(j.updatedAt).getTime()
          : Date.now();
        return updated - created;
      });

      const minTime = Math.min(...jobTimes);
      const maxTime = Math.max(...jobTimes);
      const avgJobTime = jobTimes.reduce((a, b) => a + b, 0) / jobTimes.length;

      console.log(`\n📈 Job Processing Times:`);
      console.log(`   Fastest: ${(minTime / 1000).toFixed(2)}s`);
      console.log(`   Slowest: ${(maxTime / 1000).toFixed(2)}s`);
      console.log(`   Average: ${(avgJobTime / 1000).toFixed(2)}s`);
    }

    // Performance verdict
    console.log(`\n${"=".repeat(60)}\n`);
    if (totalDuration < 60_000) {
      console.log("🎉 SUCCESS! All PDFs completed in under 1 minute!");
      console.log(
        `   Target: 60s | Actual: ${(totalDuration / 1000).toFixed(2)}s`,
      );
      console.log(
        `   🚀 ${(((60 - totalDuration / 1000) / 60) * 100).toFixed(1)}% faster than target!`,
      );
    } else {
      console.log("⚠️  WARNING: Took longer than 1 minute");
      console.log(
        `   Target: 60s | Actual: ${(totalDuration / 1000).toFixed(2)}s`,
      );
      console.log(`\n💡 Suggestions:`);
      console.log(
        `   - Increase PDFPROMPT_WORKER_CONCURRENCY (currently ${process.env.PDFPROMPT_WORKER_CONCURRENCY ?? 3})`,
      );
      console.log(
        `   - Increase MAX_PDF_CONCURRENCY (currently ${process.env.MAX_PDF_CONCURRENCY ?? 8})`,
      );
      console.log(`   - Deploy additional worker instances`);
      console.log(`   - Check if AI provider (OpenRouter) is rate limiting`);
    }

    // Show failed jobs if any
    if (finalStatus.failed > 0) {
      console.log(`\n❌ Failed Jobs:`);
      const failedJobs = finalJobs.filter((j) => j.status === "failed");
      for (const job of failedJobs) {
        console.log(`   - ${job.id}: ${job.errorMessage ?? "Unknown error"}`);
      }
    }

    console.log(`\n${"=".repeat(60)}\n`);

    // Cleanup option
    console.log("🧹 Cleanup: Run this command to delete test jobs:");
    console.log(
      `   pnpm tsx -e "import {db} from './src/server/db/index.js'; import {jobs,files} from './src/server/db/schema.js'; import {inArray,eq} from 'drizzle-orm'; const ids=${JSON.stringify(jobIds)}; await db.delete(files).where(inArray(files.jobId, ids)); await db.delete(jobs).where(inArray(jobs.id, ids)); console.log('Deleted ${NUM_PDFS} test jobs'); process.exit(0);"`,
    );
  } catch (error) {
    console.error("\n❌ Error during test:", error);
    throw error;
  }
}

// Run the test
console.log(`
╔═══════════════════════════════════════════════════════════╗
║       CONCURRENT PDF GENERATION LOAD TEST                 ║
║       Testing ${NUM_PDFS} PDFs simultaneously                        ║
╚═══════════════════════════════════════════════════════════╝
`);

testConcurrentPDFs()
  .then(() => {
    console.log("✨ Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test failed:", error);
    process.exit(1);
  });
