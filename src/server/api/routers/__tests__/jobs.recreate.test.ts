/**
 * Unit Tests - jobsRouter.recreate Mutation
 *
 * Tests for job recreation/regeneration:
 * - Recreate with same prompt
 * - Recreate with edits
 * - Credit cost handling
 * - Access control
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
  } catch {
    console.warn(
      "⚠️ Database not available for integration tests. Skipping...",
    );
    return false;
  }
}

describe("jobs.recreate - Unit Tests", () => {
  let dbAvailable = false;
  const testUserId = "test_recreate_" + randomUUID();

  beforeAll(async () => {
    dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      console.log("💡 To run integration tests, start a PostgreSQL database.");
    }
  });

  // Clean up test data after each test
  afterEach(async () => {
    if (dbAvailable) {
      await db.delete(jobs).where(eq(jobs.userId, testUserId));
      await db
        .delete(userSubscriptions)
        .where(eq(userSubscriptions.userId, testUserId));
    }
  });

  describe("Recreate Same Prompt", () => {
    it.skipIf(!dbAvailable)(
      "should recreate job with same prompt (mode: same)",
      async () => {
        // Arrange - Create original job
        const caller = createTestCaller(testUserId);
        const originalJob = await caller.jobs.create({
          prompt: "Original prompt for recreation",
        });

        // Act - Recreate with same mode
        const recreatedJob = await caller.jobs.recreate({
          jobId: originalJob.id,
          mode: "same",
        });

        // Assert
        expect(recreatedJob).toBeDefined();
        expect(recreatedJob?.id).not.toBe(originalJob.id); // Different job
        expect(recreatedJob?.userId).toBe(testUserId);
        expect(recreatedJob?.parentJobId).toBe(originalJob.id);
        expect(recreatedJob?.regenerationCount).toBe(1);
      },
    );
  });

  describe("Recreate with Edits", () => {
    it.skipIf(!dbAvailable)(
      "should recreate job with edits (mode: edit)",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);
        const originalJob = await caller.jobs.create({
          prompt: "Original prompt",
        });

        // Act
        const recreatedJob = await caller.jobs.recreate({
          jobId: originalJob.id,
          mode: "edit",
          newPrompt: "Make it blue instead of red",
        });

        // Assert
        expect(recreatedJob).toBeDefined();
        expect(recreatedJob?.id).not.toBe(originalJob.id);
        expect(recreatedJob?.prompt).toContain("Original prompt");
        expect(recreatedJob?.prompt).toContain("EDIT INSTRUCTIONS");
        expect(recreatedJob?.prompt).toContain("Make it blue instead of red");
        expect(recreatedJob?.parentJobId).toBe(originalJob.id);
      },
    );

    it.skipIf(!dbAvailable)(
      "should handle image URLs in recreation",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);
        const originalJob = await caller.jobs.create({
          prompt: "Create PDF with image",
        });

        // Act
        const recreatedJob = await caller.jobs.recreate({
          jobId: originalJob.id,
          mode: "same",
          imageUrls: ["https://example.com/image1.jpg"],
        });

        // Assert
        expect(recreatedJob).toBeDefined();
        expect(recreatedJob?.imageUrls).toBeDefined();
        expect(Array.isArray(recreatedJob?.imageUrls)).toBe(true);
      },
    );
  });

  describe("Access Control", () => {
    it.skipIf(!dbAvailable)(
      "should prevent recreating another user's job",
      async () => {
        // Arrange
        const user1Caller = createTestCaller(testUserId);
        const user2Caller = createTestCaller("different_user_" + randomUUID());

        // User 1 creates a job
        const originalJob = await user1Caller.jobs.create({
          prompt: "User 1's job",
        });

        // Act & Assert - User 2 tries to recreate User 1's job
        await expect(async () => {
          await user2Caller.jobs.recreate({
            jobId: originalJob.id,
            mode: "same",
          });
        }).rejects.toThrow(/permission/i);

        // Clean up user 2
        await db
          .delete(userSubscriptions)
          .where(
            eq(userSubscriptions.userId, "different_user_" + randomUUID()),
          );
      },
    );

    it.skipIf(!dbAvailable)(
      "should throw error for non-existent job",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);
        const fakeJobId = randomUUID();

        // Act & Assert
        await expect(async () => {
          await caller.jobs.recreate({
            jobId: fakeJobId,
            mode: "same",
          });
        }).rejects.toThrow(/not found/i);
      },
    );
  });

  describe("Quota Enforcement", () => {
    it.skipIf(!dbAvailable)(
      "should enforce quota when recreating",
      async () => {
        // Arrange - Create subscription at limit
        const subId = randomUUID();
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await db.insert(userSubscriptions).values({
          id: subId,
          userId: testUserId,
          tier: "starter",
          status: "active",
          pdfsUsedThisMonth: 3, // At limit
          storageUsedBytes: 0,
          referralCode: "TESTQUOTA",
          periodStart: now,
          periodEnd,
        });

        const caller = createTestCaller(testUserId);
        const originalJob = await caller.jobs.create({
          prompt: "Job at quota limit",
        });

        // Act & Assert - Should fail due to quota
        await expect(async () => {
          await caller.jobs.recreate({
            jobId: originalJob.id,
            mode: "same",
          });
        }).rejects.toThrow(/limit/i);
      },
    );
  });

  describe("Regeneration Tracking", () => {
    it.skipIf(!dbAvailable)("should increment regeneration count", async () => {
      // Arrange
      const caller = createTestCaller(testUserId);
      const originalJob = await caller.jobs.create({
        prompt: "Track regenerations",
      });

      // Act - Recreate twice
      const recreate1 = await caller.jobs.recreate({
        jobId: originalJob.id,
        mode: "same",
      });

      const recreate2 = await caller.jobs.recreate({
        jobId: recreate1?.id ?? "",
        mode: "same",
      });

      // Assert
      expect(recreate1?.regenerationCount).toBe(1);
      expect(recreate2?.regenerationCount).toBe(2);
    });

    it.skipIf(!dbAvailable)(
      "should preserve parent-child relationship",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);
        const originalJob = await caller.jobs.create({
          prompt: "Parent job",
        });

        // Act
        const childJob = await caller.jobs.recreate({
          jobId: originalJob.id,
          mode: "edit",
          newPrompt: "Modified version",
        });

        // Assert
        expect(childJob?.parentJobId).toBe(originalJob.id);
        expect(originalJob.parentJobId).toBeUndefined();
      },
    );
  });

  describe("HTML Preservation", () => {
    it.skipIf(!dbAvailable)(
      "should preserve generated HTML from parent job",
      async () => {
        // Arrange - Create a job and manually set HTML (simulating completed job)
        const caller = createTestCaller(testUserId);
        const originalJob = await caller.jobs.create({
          prompt: "Job with HTML",
        });

        // Manually update job with HTML (simulating worker completion)
        await db
          .update(jobs)
          .set({
            generatedHtml: "<html><body>Test HTML</body></html>",
            status: "completed",
          })
          .where(eq(jobs.id, originalJob.id));

        // Act - Recreate
        const recreatedJob = await caller.jobs.recreate({
          jobId: originalJob.id,
          mode: "edit",
          newPrompt: "Change color to blue",
        });

        // Assert
        expect(recreatedJob?.generatedHtml).toBe(
          "<html><body>Test HTML</body></html>",
        );
      },
    );
  });
});
