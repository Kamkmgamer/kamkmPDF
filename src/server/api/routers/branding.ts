import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "~/lib/crypto-edge";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { brandingSettings, userSubscriptions } from "~/server/db/schema";
import {
  getTierConfig,
  type SubscriptionTier,
} from "~/server/subscription/tiers";

export const brandingRouter = createTRPCRouter({
  /**
   * Get branding settings for the user
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    // Check if user has custom branding
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;
    const tierConfig = getTierConfig(tier);

    if (!tierConfig.features.customBranding) {
      return null; // No custom branding for this tier
    }

    const settings = await db
      .select()
      .from(brandingSettings)
      .where(eq(brandingSettings.userId, userId))
      .limit(1);

    return settings[0] ?? null;
  }),

  /**
   * Update branding settings
   */
  update: protectedProcedure
    .input(
      z.object({
        logoUrl: z.string().url().optional(),
        companyName: z.string().min(1).max(256).optional(),
        primaryColor: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .optional(),
        secondaryColor: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .optional(),
        customDomain: z.string().optional(),
        hidePlatformBranding: z.boolean().optional(),
        footerText: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if user has custom branding
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;
      const tierConfig = getTierConfig(tier);

      if (!tierConfig.features.customBranding) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Custom branding is not available on your plan. Upgrade to Business or Enterprise.",
        });
      }

      // Check if settings exist
      const existing = await db
        .select()
        .from(brandingSettings)
        .where(eq(brandingSettings.userId, userId))
        .limit(1);

      if (existing[0]) {
        // Update existing settings
        await db
          .update(brandingSettings)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(brandingSettings.userId, userId));
      } else {
        // Create new settings
        const id = randomUUID();
        await db.insert(brandingSettings).values({
          id,
          userId,
          ...input,
        });
      }

      return { success: true };
    }),

  /**
   * Reset branding settings to defaults
   */
  reset: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.userId;

    await db
      .delete(brandingSettings)
      .where(eq(brandingSettings.userId, userId));

    return { success: true };
  }),

  /**
   * Get branding settings by custom domain (public access)
   */
  getByDomain: protectedProcedure
    .input(z.object({ domain: z.string() }))
    .query(async ({ input }) => {
      const settings = await db
        .select()
        .from(brandingSettings)
        .where(eq(brandingSettings.customDomain, input.domain))
        .limit(1);

      return settings[0] ?? null;
    }),
});
