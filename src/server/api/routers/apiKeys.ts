import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID, createHashSync } from "~/lib/crypto-edge";
import { eq, and } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { apiKeys, userSubscriptions } from "~/server/db/schema";
import {
  getTierConfig,
  type SubscriptionTier,
} from "~/server/subscription/tiers";

/**
 * Generate a random API key
 */
function generateApiKey(): { key: string; hash: string; prefix: string } {
  const randomBytes = randomUUID() + randomUUID();
  const key = `sk_live_${randomBytes.replace(/-/g, "")}`;
  const hash = createHashSync("sha256", key);
  const prefix = key.substring(0, 16); // First 16 chars for display

  return { key, hash, prefix };
}

export const apiKeysRouter = createTRPCRouter({
  /**
   * List all API keys for the user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    // Check if user has API access
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;
    const tierConfig = getTierConfig(tier);

    if (!tierConfig.features.apiAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "API access is not available on your plan. Upgrade to Business or Enterprise.",
      });
    }

    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        permissions: apiKeys.permissions,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        isActive: apiKeys.isActive,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));

    return keys;
  }),

  /**
   * Create a new API key
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(128),
        permissions: z
          .array(z.string())
          .optional()
          .default(["pdf:create", "pdf:read"]),
        expiresAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if user has API access
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;
      const tierConfig = getTierConfig(tier);

      if (!tierConfig.features.apiAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "API access is not available on your plan. Upgrade to Business or Enterprise.",
        });
      }

      // Generate API key
      const { key, hash, prefix } = generateApiKey();

      // Store in database
      const id = randomUUID();
      await db.insert(apiKeys).values({
        id,
        userId,
        name: input.name,
        keyHash: hash,
        keyPrefix: prefix,
        permissions:
          input.permissions as unknown as typeof apiKeys.$inferInsert.permissions,
        expiresAt: input.expiresAt,
        isActive: true,
      });

      // Return the full key only once (it won't be shown again)
      return {
        id,
        key, // Full key - only shown once
        name: input.name,
        keyPrefix: prefix,
        permissions: input.permissions,
      };
    }),

  /**
   * Revoke an API key
   */
  revoke: protectedProcedure
    .input(z.object({ keyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const existing = await db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.id, input.keyId), eq(apiKeys.userId, userId)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      await db
        .update(apiKeys)
        .set({ isActive: false })
        .where(eq(apiKeys.id, input.keyId));

      return { success: true };
    }),

  /**
   * Delete an API key permanently
   */
  delete: protectedProcedure
    .input(z.object({ keyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const existing = await db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.id, input.keyId), eq(apiKeys.userId, userId)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      await db.delete(apiKeys).where(eq(apiKeys.id, input.keyId));

      return { success: true };
    }),

  /**
   * Update API key settings
   */
  update: protectedProcedure
    .input(
      z.object({
        keyId: z.string(),
        name: z.string().min(1).max(128).optional(),
        permissions: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const existing = await db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.id, input.keyId), eq(apiKeys.userId, userId)))
        .limit(1);

      if (!existing[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      const updates: Partial<typeof apiKeys.$inferInsert> = {};
      if (input.name) updates.name = input.name;
      if (input.permissions)
        updates.permissions =
          input.permissions as unknown as typeof apiKeys.$inferInsert.permissions;

      await db.update(apiKeys).set(updates).where(eq(apiKeys.id, input.keyId));

      return { success: true };
    }),
});
