/**
 * Unit Tests - jobsRouter.get Query
 *
 * Tests for the jobs.get query covering:
 * - Retrieving existing jobs
 * - Access control for authenticated users
 * - Access to guest jobs
 * - Error handling for non-existent jobs
 */

import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { createCaller } from "~/server/api/root";
import { db } from "~/server/db";
import { jobs } from "~/server/db/schema";
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

describe("jobs.get - Unit Tests", () => {
  let dbAvailable = false;
  const testUserId = "test_user_" + randomUUID();
  const testUserId2 = "test_user_2_" + randomUUID();

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
      await db.delete(jobs).where(eq(jobs.userId, testUserId2));
    }
  });

  describe("Get Existing Job", () => {
    it.skipIf(!dbAvailable)(
      "should retrieve a job by ID for authenticated user",
      async () => {
        // Arrange - Create a job first
        const caller = createTestCaller(testUserId);
        const created = await caller.jobs.create({
          prompt: "Test prompt for get",
        });

        // Act
        const result = await caller.jobs.get(created.id);

        // Assert
        expect(result).toBeDefined();
        expect(result.id).toBe(created.id);
        expect(result.userId).toBe(testUserId);
        expect(result.prompt).toBe("Test prompt for get");
        expect(result.status).toBe("queued");
      },
    );

    it.skipIf(!dbAvailable)(
      "should retrieve a guest job without authentication",
      async () => {
        // Arrange - Create a guest job
        const guestCaller = createTestCaller(null);
        const created = await guestCaller.jobs.create({
          prompt: "Guest job prompt",
        });

        // Act
        const result = await guestCaller.jobs.get(created.id);

        // Assert
        expect(result).toBeDefined();
        expect(result.id).toBe(created.id);
        expect(result.userId).toBeNull();
        expect(result.prompt).toBe("Guest job prompt");
      },
    );
  });

  describe("Access Control", () => {
    it.skipIf(!dbAvailable)(
      "should allow user to access their own jobs",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);
        const created = await caller.jobs.create({
          prompt: "User's own job",
        });

        // Act
        const result = await caller.jobs.get(created.id);

        // Assert
        expect(result).toBeDefined();
        expect(result.userId).toBe(testUserId);
      },
    );

    it.skipIf(!dbAvailable)(
      "should prevent user from accessing another user's jobs",
      async () => {
        // Arrange - User 1 creates a job
        const caller1 = createTestCaller(testUserId);
        const created = await caller1.jobs.create({
          prompt: "User 1's job",
        });

        // Act & Assert - User 2 tries to access User 1's job
        const caller2 = createTestCaller(testUserId2);
        await expect(async () => {
          await caller2.jobs.get(created.id);
        }).rejects.toThrow(/permission/i);
      },
    );

    it.skipIf(!dbAvailable)(
      "should allow guest to access guest jobs",
      async () => {
        // Arrange - Create a guest job
        const guestCaller = createTestCaller(null);
        const created = await guestCaller.jobs.create({
          prompt: "Guest job",
        });

        // Act - Another guest tries to access it
        const anotherGuestCaller = createTestCaller(null);
        const result = await anotherGuestCaller.jobs.get(created.id);

        // Assert
        expect(result).toBeDefined();
        expect(result.id).toBe(created.id);
      },
    );
  });

  describe("Error Handling", () => {
    it.skipIf(!dbAvailable)(
      "should throw error for non-existent job",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);
        const nonExistentId = randomUUID();

        // Act & Assert
        await expect(async () => {
          await caller.jobs.get(nonExistentId);
        }).rejects.toThrow(/not found/i);
      },
    );

    it.skipIf(!dbAvailable)(
      "should throw error for invalid job ID format",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);

        // Act & Assert - Note: This might depend on your UUID validation
        await expect(async () => {
          await caller.jobs.get("invalid-id-format");
        }).rejects.toThrow();
      },
    );
  });

  describe("Job Data Completeness", () => {
    it.skipIf(!dbAvailable)(
      "should return all expected job fields",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);
        const created = await caller.jobs.create({
          prompt: "Complete job data test",
        });

        // Act
        const result = await caller.jobs.get(created.id);

        // Assert - Check all expected fields are present
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("userId");
        expect(result).toHaveProperty("prompt");
        expect(result).toHaveProperty("promptHash");
        expect(result).toHaveProperty("status");
        expect(result).toHaveProperty("attempts");
        expect(result).toHaveProperty("progress");
        expect(result).toHaveProperty("createdAt");
        expect(result).toHaveProperty("updatedAt");
      },
    );
  });
});
