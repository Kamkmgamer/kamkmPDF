import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "~/lib/crypto-edge";
import { eq, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { fileVersions, files, userSubscriptions } from "~/server/db/schema";
import {
  getTierConfig,
  type SubscriptionTier,
} from "~/server/subscription/tiers";

export const versionsRouter = createTRPCRouter({
  /**
   * Get version history for a file
   */
  getFileVersions: protectedProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if user owns the file
      const file = await db
        .select()
        .from(files)
        .where(eq(files.id, input.fileId))
        .limit(1);

      if (file[0]?.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this file",
        });
      }

      // Get user's subscription to check version history limit
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;
      const tierConfig = getTierConfig(tier);

      if (tierConfig.features.versionHistory === 0) {
        return []; // No version history for this tier
      }

      // Get versions, limited by tier
      const versions = await db
        .select()
        .from(fileVersions)
        .where(eq(fileVersions.fileId, input.fileId))
        .orderBy(desc(fileVersions.versionNumber))
        .limit(
          tierConfig.features.versionHistory === -1
            ? 100
            : tierConfig.features.versionHistory,
        );

      return versions;
    }),

  /**
   * Create a new version when a file is regenerated
   */
  createVersion: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
        jobId: z.string(),
        prompt: z.string(),
        fileKey: z.string(),
        fileUrl: z.string(),
        fileSize: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Get current version count
      const existingVersions = await db
        .select()
        .from(fileVersions)
        .where(eq(fileVersions.fileId, input.fileId))
        .orderBy(desc(fileVersions.versionNumber));

      const nextVersion = (existingVersions[0]?.versionNumber ?? 0) + 1;

      // Get user's tier to check version history limit
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;
      const tierConfig = getTierConfig(tier);

      // Check if version history is allowed
      if (tierConfig.features.versionHistory === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Version history is not available on your plan. Upgrade to access this feature.",
        });
      }

      // Create new version
      const id = randomUUID();
      await db.insert(fileVersions).values({
        id,
        fileId: input.fileId,
        userId,
        versionNumber: nextVersion,
        jobId: input.jobId,
        prompt: input.prompt,
        fileKey: input.fileKey,
        fileUrl: input.fileUrl,
        fileSize: input.fileSize,
      });

      // Cleanup old versions if limit exceeded
      if (tierConfig.features.versionHistory !== -1) {
        const toDelete = existingVersions.slice(
          tierConfig.features.versionHistory - 1,
        );
        for (const version of toDelete) {
          await db.delete(fileVersions).where(eq(fileVersions.id, version.id));
          // TODO: Delete from storage as well
        }
      }

      return { success: true, versionNumber: nextVersion };
    }),

  /**
   * Restore a previous version
   */
  restoreVersion: protectedProcedure
    .input(z.object({ versionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const version = await db
        .select()
        .from(fileVersions)
        .where(eq(fileVersions.id, input.versionId))
        .limit(1);

      if (version[0]?.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to restore this version",
        });
      }

      // Update the main file to point to this version
      await db
        .update(files)
        .set({
          fileKey: version[0].fileKey,
          fileUrl: version[0].fileUrl,
        })
        .where(eq(files.id, version[0].fileId));

      return { success: true };
    }),
});
