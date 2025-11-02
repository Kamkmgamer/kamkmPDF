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
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║    CONCURRENT PDF GENERATION TEST (WITH WORKER)           ║
║    Testing ${NUM_PDFS} PDFs simultaneously                        ║
╚═══════════════════════════════════════════════════════════╝
`);

  console.log("📊 Configuration:");
  console.log(`   - Number of PDFs: ${NUM_PDFS}`);
  console.log(
    `   - Worker Concurrency: ${process.env.PDFPROMPT_WORKER_CONCURRENCY ?? 3}`,
  );
  console.log(
    `   - Max PDF Concurrency: ${process.env.MAX_PDF_CONCURRENCY ?? 8}`,
  );
  console.log(`   - Browser Pool Size: ${process.env.BROWSER_POOL_SIZE ?? 3}`);
  console.log(`   - Batch Size: ${process.env.PDFPROMPT_BATCH_SIZE ?? 5}`);
  console.log(`\n${"=".repeat(60)}\n`);

  const jobIds: string[] = [];
  const overallStart = Date.now();

  try {
    // Step 1: Create jobs
    console.log(`⏱️  Creating ${NUM_PDFS} jobs...`);
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
      `✅ Created ${NUM_PDFS} jobs in ${(createDuration / 1000).toFixed(2)}s\n`,
    );

    // Step 2: Process with drain()
    console.log("⏱️  Processing jobs with worker drain function...\n");
    const processStart = Date.now();

    // Keep draining until all jobs are done
    let rounds = 0;
    let totalProcessed = 0;

    while (totalProcessed < NUM_PDFS && rounds < 20) {
      rounds++;
      console.log(`   🔄 Drain round ${rounds}...`);

      const result = await drain({
        maxJobs: NUM_PDFS,
        maxMs: 120_000, // 2 minutes per drain
      });

      totalProcessed += result.processed;
      console.log(
        `      Processed: ${result.processed} jobs in ${(result.tookMs / 1000).toFixed(2)}s`,
      );

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

      console.log(
        `      Status: ✅ ${completed} | ⚙️  ${processing} | ⏳ ${queued} | ❌ ${failed}\n`,
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

    console.log(`\n${"=".repeat(60)}\n`);
    console.log("📊 FINAL RESULTS\n");
    console.log(`⏱️  Total Time: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`⏱️  Processing Time: ${(processDuration / 1000).toFixed(2)}s`);
    console.log(`🔄 Drain Rounds: ${rounds}`);
    console.log(`\n✅ Completed: ${finalStatus.completed}/${NUM_PDFS}`);
    console.log(`❌ Failed: ${finalStatus.failed}/${NUM_PDFS}`);
    console.log(`⏳ Still Queued: ${finalStatus.queued}/${NUM_PDFS}`);

    if (finalStatus.completed > 0) {
      const throughput = (finalStatus.completed / totalDuration) * 1000 * 60;
      console.log(`\n🚀 Throughput: ${throughput.toFixed(1)} PDFs/minute`);
      console.log(
        `⚡ Average: ${(totalDuration / finalStatus.completed / 1000).toFixed(2)}s per PDF`,
      );
    }

    // Success check
    console.log(`\n${"=".repeat(60)}\n`);
    if (totalDuration < 60_000 && finalStatus.completed === NUM_PDFS) {
      console.log("🎉 SUCCESS! All 15 PDFs completed in under 1 minute!");
      console.log(
        `   Target: 60s | Actual: ${(totalDuration / 1000).toFixed(2)}s`,
      );
      const improvement = ((60 - totalDuration / 1000) / 60) * 100;
      console.log(`   🚀 ${improvement.toFixed(1)}% faster than target!`);
    } else if (finalStatus.completed === NUM_PDFS) {
      console.log(
        `⚠️  All PDFs completed but took ${(totalDuration / 1000).toFixed(2)}s (target: 60s)`,
      );
      console.log(`\n💡 To improve:`);
      console.log(`   - Increase PDFPROMPT_WORKER_CONCURRENCY`);
      console.log(`   - Increase MAX_PDF_CONCURRENCY`);
      console.log(`   - Check AI provider rate limits`);
    } else {
      console.log(
        `❌ Only ${finalStatus.completed}/${NUM_PDFS} PDFs completed`,
      );
      if (finalStatus.failed > 0) {
        console.log(`\n❌ Failed jobs:`);
        const failed = finalJobs.filter((j) => j.status === "failed");
        for (const job of failed) {
          console.log(`   - ${job.id}: ${job.errorMessage}`);
        }
      }
    }

    console.log(`\n${"=".repeat(60)}\n`);

    // Cleanup
    console.log("🧹 Cleanup: Delete test jobs? (y/n)");
    console.log(`   pnpm tsx scripts/cleanup-test-jobs.ts ${jobIds.join(",")}`);
  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

testWithWorker()
  .then(() => {
    console.log("\n✨ Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Test failed:", error);
    process.exit(1);
  });
