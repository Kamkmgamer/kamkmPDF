import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { files, jobs, shareLinks } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { generateSignedUrl } from "~/server/utils/signed-urls";
import { generateShareToken, createShareUrl } from "~/server/utils/share-links";

export const filesRouter = createTRPCRouter({
  getDownloadUrl: protectedProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Verify user owns the file through job relationship
      const fileWithJob = await db
        .select({
          file: files,
          jobUserId: jobs.userId,
        })
        .from(files)
        .leftJoin(jobs, eq(files.jobId, jobs.id))
        .where(eq(files.id, input.fileId))
        .limit(1);

      if (!fileWithJob[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      const { file: _file, jobUserId } = fileWithJob[0];

      // Check if user owns the file (jobUserId can be null if no job is associated)
      if (jobUserId && jobUserId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this file",
        });
      }

      // Generate signed URL for secure file access
      return generateSignedUrl(input.fileId, 3600); // 1 hour expiration
    }),

  createShareLink: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
        expiresInSeconds: z.number().optional().default(86400), // 24 hours default
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user owns the file through job relationship
      const fileWithJob = await db
        .select({
          file: files,
          jobUserId: jobs.userId,
        })
        .from(files)
        .leftJoin(jobs, eq(files.jobId, jobs.id))
        .where(eq(files.id, input.fileId))
        .limit(1);

      if (!fileWithJob[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      const { file: _file, jobUserId } = fileWithJob[0];

      // Check if user owns the file (jobUserId can be null if no job is associated)
      if (jobUserId && jobUserId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to share this file",
        });
      }

      // Generate share token and create share link
      const token = generateShareToken();
      const expiresAt = new Date(Date.now() + input.expiresInSeconds * 1000);

      // Create share link in database
      await db.insert(shareLinks).values({
        id: token,
        fileId: input.fileId,
        token: token,
        expiresAt: expiresAt,
      });

      return {
        url: createShareUrl(input.fileId, token),
        expiresAt: expiresAt.toISOString(),
      };
    }),

  verifyShareLink: publicProcedure
    .input(
      z.object({
        fileId: z.string(),
        token: z.string(),
      }),
    )
    .query(async ({ input }) => {
      // Verify share link exists and hasn't expired
      const shareLink = await db
        .select()
        .from(shareLinks)
        .where(eq(shareLinks.token, input.token))
        .limit(1);

      if (!shareLink[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Share link not found",
        });
      }

      const link = shareLink[0];

      // Check if link has expired
      if (new Date() > link.expiresAt) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Share link has expired",
        });
      }

      // Check if link is for the correct file
      if (link.fileId !== input.fileId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid share link",
        });
      }

      // Generate signed URL for the shared file
      return generateSignedUrl(input.fileId, 3600); // 1 hour for shared access
    }),
});
