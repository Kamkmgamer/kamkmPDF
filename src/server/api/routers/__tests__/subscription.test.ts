/**
 * Unit Tests - subscriptionRouter
 *
 * Tests for subscription management:
 * - getCurrent - Getting current user subscription
 * - Creating default subscriptions
 * - Tier information and usage
 */

import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { createCaller } from "~/server/api/root";
import { db } from "~/server/db";
import { userSubscriptions } from "~/server/db/schema";
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
    await db.select().from(userSubscriptions).limit(1);
    return true;
  } catch (_error) {
    console.warn(
      "⚠️ Database not available for integration tests. Skipping...",
    );
    return false;
  }
}

describe("subscriptionRouter - Unit Tests", () => {
  let dbAvailable = false;
  const testUserId = "test_sub_user_" + randomUUID();

  beforeAll(async () => {
    dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      console.log("💡 To run integration tests, start a PostgreSQL database.");
    }
  });

  // Clean up test data after each test
  afterEach(async () => {
    if (dbAvailable) {
      await db
        .delete(userSubscriptions)
        .where(eq(userSubscriptions.userId, testUserId));
    }
  });

  describe("getCurrent", () => {
    it.skipIf(!dbAvailable)(
      "should create a default starter subscription for new users",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);

        // Act
        const result = await caller.subscription.getCurrent();

        // Assert
        expect(result).toBeDefined();
        expect(result.userId).toBe(testUserId);
        expect(result.tier).toBe("starter");
        expect(result.status).toBe("active");
        expect(result.pdfsUsedThisMonth).toBe(0);
        expect(result.storageUsedBytes).toBe(0);
        expect(result.referralCode).toBeDefined();
        expect(result.referralCode).toMatch(/^REF/);

        // Check tier config is included
        expect(result.tierConfig).toBeDefined();
        expect(result.tierConfig.id).toBe("starter");
        expect(result.tierConfig.name).toBe("Free");

        // Check usage information
        expect(result.usage).toBeDefined();
        expect(result.usage.pdfs).toBeDefined();
        expect(result.usage.pdfs.used).toBe(0);
        expect(result.usage.pdfs.limit).toBe(3);
        expect(result.usage.storage).toBeDefined();
      },
    );

    it.skipIf(!dbAvailable)(
      "should return existing subscription if already created",
      async () => {
        // Arrange - First call creates subscription
        const caller = createTestCaller(testUserId);
        const firstCall = await caller.subscription.getCurrent();

        // Act - Second call should return same subscription
        const secondCall = await caller.subscription.getCurrent();

        // Assert
        expect(firstCall.id).toBe(secondCall.id);
        expect(firstCall.userId).toBe(testUserId);
        expect(secondCall.userId).toBe(testUserId);
        expect(firstCall.referralCode).toBe(secondCall.referralCode);
      },
    );

    it.skipIf(!dbAvailable)(
      "should calculate usage percentages correctly",
      async () => {
        // Arrange - Create subscription with some usage
        const subId = randomUUID();
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await db.insert(userSubscriptions).values({
          id: subId,
          userId: testUserId,
          tier: "starter",
          status: "active",
          pdfsUsedThisMonth: 2, // 2 out of 3
          storageUsedBytes: 0,
          referralCode: "TESTREF123",
          periodStart: now,
          periodEnd,
        });

        const caller = createTestCaller(testUserId);

        // Act
        const result = await caller.subscription.getCurrent();

        // Assert
        expect(result.usage.pdfs.used).toBe(2);
        expect(result.usage.pdfs.limit).toBe(3);
        expect(result.usage.pdfs.percentage).toBeCloseTo(66.67, 1);
      },
    );

    it.skipIf(!dbAvailable)(
      "should provide upgrade suggestions when quota is high",
      async () => {
        // Arrange - Create subscription near quota
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
          referralCode: "TESTREF456",
          periodStart: now,
          periodEnd,
        });

        const caller = createTestCaller(testUserId);

        // Act
        const result = await caller.subscription.getCurrent();

        // Assert
        expect(result.upgradeSuggestion).toBeDefined();
        // Should suggest upgrading when at/over quota
      },
    );

    it.skipIf(!dbAvailable)("should require authentication", async () => {
      // Arrange
      const guestCaller = createTestCaller(null);

      // Act & Assert - Should fail for unauthenticated users
      await expect(async () => {
        await guestCaller.subscription.getCurrent();
      }).rejects.toThrow(/sign in/i);
    });
  });

  describe("canGeneratePdf", () => {
    it.skipIf(!dbAvailable)(
      "should allow generation when under quota",
      async () => {
        // Arrange - Create subscription with usage below limit
        const subId = randomUUID();
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await db.insert(userSubscriptions).values({
          id: subId,
          userId: testUserId,
          tier: "starter",
          status: "active",
          pdfsUsedThisMonth: 1, // 1 out of 3
          storageUsedBytes: 0,
          referralCode: "TESTCAN123",
          periodStart: now,
          periodEnd,
        });

        const caller = createTestCaller(testUserId);

        // Act
        const result = await caller.subscription.canGeneratePdf();

        // Assert
        expect(result.canGenerate).toBe(true);
        expect(result.pdfsRemaining).toBe(2);
        expect(result.reason).toBe("");
      },
    );

    it.skipIf(!dbAvailable)(
      "should deny generation when quota exceeded",
      async () => {
        // Arrange - Create subscription at quota limit
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
          referralCode: "TESTCAN456",
          periodStart: now,
          periodEnd,
        });

        const caller = createTestCaller(testUserId);

        // Act
        const result = await caller.subscription.canGeneratePdf();

        // Assert
        expect(result.canGenerate).toBe(false);
        expect(result.pdfsRemaining).toBe(0);
        expect(result.reason).toMatch(/limit/i);
      },
    );

    it.skipIf(!dbAvailable)(
      "should allow generation for new users without subscription",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);

        // Act
        const result = await caller.subscription.canGeneratePdf();

        // Assert
        expect(result.canGenerate).toBe(true);
        expect(result.pdfsRemaining).toBeGreaterThan(0);
      },
    );
  });

  describe("getAllTiers", () => {
    it.skipIf(!dbAvailable)(
      "should return all tier configurations",
      async () => {
        // Arrange
        const caller = createTestCaller(testUserId);

        // Act
        const result = await caller.subscription.getAllTiers();

        // Assert
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(6); // starter, classic, professional, pro_plus, business, enterprise

        // Check that all expected tiers are present
        const tierIds = result.map((t) => t.id);
        expect(tierIds).toContain("starter");
        expect(tierIds).toContain("professional");
        expect(tierIds).toContain("business");
        expect(tierIds).toContain("enterprise");
      },
    );

    it.skipIf(!dbAvailable)("should require authentication", async () => {
      // Arrange
      const guestCaller = createTestCaller(null);

      // Act & Assert
      await expect(async () => {
        await guestCaller.subscription.getAllTiers();
      }).rejects.toThrow(/sign in/i);
    });
  });
});
