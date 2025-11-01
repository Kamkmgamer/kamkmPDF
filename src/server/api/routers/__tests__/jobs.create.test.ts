/**
 * Integration Tests - Job Creation Flow
 *
 * Tests for the jobs.create mutation covering:
 * - Authenticated user job creation
 * - Unauthenticated user job creation
 * - Job queuing
 * - Job deduplication
 * - Quota enforcement
 */

import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { createCaller } from "~/server/api/root";
import { db } from "~/server/db";
import { jobs, userSubscriptions } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "~/lib/crypto-edge";

// Helper to create test caller with proper context
function createTestCaller(clerkUserId: string | null) {
  return createCaller({
    db,
    clerkUserId,
    headers: new Headers(),
  });
}

// Check if database is available
async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await db.select().from(jobs).limit(1);
    return true;
  } catch (_error) {
    console.warn(
      "⚠️ Database not available for integration tests. Skipping...",
    );
    return false;
  }
}

describe("jobs.create - Integration Tests", () => {
  let dbAvailable = false;

  beforeAll(async () => {
    dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      console.log("💡 To run integration tests, start a PostgreSQL database.");
    }
  });
  // Test user IDs
  const testUserId = "test_user_" + randomUUID();
  const testUserId2 = "test_user_2_" + randomUUID();

  // Clean up test data after each test
  afterEach(async () => {
    // Clean up jobs
    await db.delete(jobs).where(eq(jobs.userId, testUserId));
    await db.delete(jobs).where(eq(jobs.userId, testUserId2));

    // Clean up subscriptions
    await db
      .delete(userSubscriptions)
      .where(eq(userSubscriptions.userId, testUserId));
    await db
      .delete(userSubscriptions)
      .where(eq(userSubscriptions.userId, testUserId2));
  });

  describe("Authenticated User Job Creation", () => {
    it.skipIf(!dbAvailable)(
      "should create a job for an authenticated user",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);
        const prompt = "Create a PDF about testing";

        // Act
        const result = await caller.jobs.create({ prompt });

        // Assert
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.userId).toBe(testUserId);
        expect(result.prompt).toBe(prompt);
        expect(result.status).toBe("queued");
        expect(result.promptHash).toBeDefined();
        expect(result.attempts).toBe(0);
        expect(result.progress).toBe(0);

        // Verify job exists in database
        const dbJob = await db
          .select()
          .from(jobs)
          .where(eq(jobs.id, result.id))
          .limit(1);

        expect(dbJob[0]).toBeDefined();
        expect(dbJob[0]?.userId).toBe(testUserId);
      },
    );

    it.skipIf(!dbAvailable)(
      "should create a subscription for new users",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);
        const prompt = "Create a PDF about subscriptions";

        // Act
        await caller.jobs.create({ prompt });

        // Assert - subscription should be created
        const subscription = await db
          .select()
          .from(userSubscriptions)
          .where(eq(userSubscriptions.userId, testUserId))
          .limit(1);

        expect(subscription[0]).toBeDefined();
        expect(subscription[0]?.tier).toBe("starter");
        expect(subscription[0]?.status).toBe("active");
        expect(subscription[0]?.pdfsUsedThisMonth).toBe(0);
        expect(subscription[0]?.referralCode).toBeDefined();
        expect(subscription[0]?.referralCode).toMatch(/^REF/);
      },
    );
  });

  describe("Unauthenticated User Job Creation", () => {
    it.skipIf(!dbAvailable)(
      "should create a job for an unauthenticated user",
      async () => {
        // Arrange
        const caller = createTestCaller(null);
        const prompt = "Create a PDF without authentication";

        // Act
        const result = await caller.jobs.create({ prompt });

        // Assert
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.userId).toBeNull();
        expect(result.prompt).toBe(prompt);
        expect(result.status).toBe("queued");
        expect(result.promptHash).toBeDefined();

        // Verify job exists in database
        const dbJob = await db
          .select()
          .from(jobs)
          .where(eq(jobs.id, result.id))
          .limit(1);

        expect(dbJob[0]).toBeDefined();
        expect(dbJob[0]?.userId).toBeNull();
      },
    );

    it.skipIf(!dbAvailable)(
      "should not create a subscription for unauthenticated users",
      async () => {
        // Arrange
        const caller = createTestCaller(null);
        const prompt = "Create a PDF as guest";

        // Act
        await caller.jobs.create({ prompt });

        // Assert - no subscription should be created
        const subscriptionCount = await db
          .select()
          .from(userSubscriptions)
          .where(eq(userSubscriptions.userId, "guest"));

        expect(subscriptionCount).toHaveLength(0);
      },
    );
  });

  describe("Job Queuing", () => {
    it.skipIf(!dbAvailable)(
      "should queue jobs with correct initial status",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);
        const prompt = "Test job queuing";

        // Act
        const result = await caller.jobs.create({ prompt });

        // Assert
        expect(result.status).toBe("queued");
        expect(result.progress).toBe(0);
        expect(result.attempts).toBe(0);
        expect(result.stage).toBeUndefined();
      },
    );

    it.skipIf(!dbAvailable)(
      "should create multiple jobs in sequence",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);

        // Act
        const job1 = await caller.jobs.create({ prompt: "First job" });
        const job2 = await caller.jobs.create({ prompt: "Second job" });
        const job3 = await caller.jobs.create({ prompt: "Third job" });

        // Assert
        expect(job1.id).not.toBe(job2.id);
        expect(job2.id).not.toBe(job3.id);
        expect(job1.id).not.toBe(job3.id);

        // All should be queued
        expect(job1.status).toBe("queued");
        expect(job2.status).toBe("queued");
        expect(job3.status).toBe("queued");
      },
    );
  });

  describe("Job Deduplication", () => {
    it.skipIf(!dbAvailable)(
      "should return existing job for duplicate prompts",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);
        const prompt = "Duplicate test prompt";

        // Act
        const job1 = await caller.jobs.create({ prompt });
        const job2 = await caller.jobs.create({ prompt }); // Same prompt

        // Assert - should return the same job ID
        expect(job1.id).toBe(job2.id);
        expect(job1.promptHash).toBe(job2.promptHash);

        // Verify only one job exists
        const allJobs = await db
          .select()
          .from(jobs)
          .where(eq(jobs.userId, testUserId));

        // Should have only one job (not two)
        expect(allJobs.length).toBeGreaterThanOrEqual(1);

        // Count jobs with this specific prompt hash
        const duplicateJobs = allJobs.filter(
          (j) => j.promptHash === job1.promptHash,
        );
        expect(duplicateJobs).toHaveLength(1);
      },
    );

    it.skipIf(!dbAvailable)(
      "should create separate jobs for different users with same prompt",
      async () => {
        // Arrange
        const caller1 = createTestCaller(testUserId);
        const caller2 = createTestCaller(testUserId2);
        const prompt = "Same prompt different users";

        // Act
        const job1 = await caller1.jobs.create({ prompt });
        const job2 = await caller2.jobs.create({ prompt });

        // Assert - different jobs for different users
        expect(job1.id).not.toBe(job2.id);
        expect(job1.userId).toBe(testUserId);
        expect(job2.userId).toBe(testUserId2);
      },
    );
  });

  describe("Quota Enforcement", () => {
    it.skipIf(!dbAvailable)(
      "should enforce quota limits for starter tier",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);

        // Create a subscription with quota already exceeded
        const subId = randomUUID();
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await db.insert(userSubscriptions).values({
          id: subId,
          userId: testUserId,
          tier: "starter",
          status: "active",
          pdfsUsedThisMonth: 10, // Starter tier limit is 10
          storageUsedBytes: 0,
          referralCode: "TEST123",
          periodStart: now,
          periodEnd,
        });

        // Act & Assert
        await expect(async () => {
          await caller.jobs.create({ prompt: "Quota exceeded test" });
        }).rejects.toThrow(/monthly limit/i);
      },
    );

    it.skipIf(!dbAvailable)(
      "should allow job creation within quota limits",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);

        // Create a subscription with usage below quota
        const subId = randomUUID();
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await db.insert(userSubscriptions).values({
          id: subId,
          userId: testUserId,
          tier: "starter",
          status: "active",
          pdfsUsedThisMonth: 5, // Below starter tier limit of 10
          storageUsedBytes: 0,
          referralCode: "TEST456",
          periodStart: now,
          periodEnd,
        });

        // Act
        const result = await caller.jobs.create({
          prompt: "Within quota test",
        });

        // Assert
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.status).toBe("queued");
      },
    );
  });

  describe("Input Validation", () => {
    it.skipIf(!dbAvailable)("should reject empty prompts", async () => {
      // Arrange
      const caller = createTestCaller(testUserId);

      // Act & Assert
      await expect(async () => {
        await caller.jobs.create({ prompt: "" });
      }).rejects.toThrow();
    });

    it.skipIf(!dbAvailable)(
      "should accept prompts up to max length",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);
        const longPrompt = "A".repeat(10000); // Well within 32000 limit

        // Act
        const result = await caller.jobs.create({ prompt: longPrompt });

        // Assert
        expect(result).toBeDefined();
        expect(result.prompt).toBe(longPrompt);
      },
    );
  });
});
