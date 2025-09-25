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
import { generateShareToken, createShareUrl } from "~/server/utils/share-links";
import { utapi } from "~/server/uploadthing";

export const filesRouter = createTRPCRouter({
  listMine: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional().default(24),
          cursor: z.string().optional(), // for future pagination (createdAt iso string)
          status: z
            .enum(["all", "completed", "processing", "failed"])
            .optional()
            .default("all"),
          search: z.string().optional().default(""),
        })
        .optional()
        .default({ limit: 24, status: "all", search: "" }),
    )
    .query(async ({ input, ctx }) => {
      const { limit, status, search } = input;
      // Build base query: join files with jobs to get prompt/status/createdAt
      // Owner is derived from jobs.userId when present, else files.userId
      const rows = await db
        .select({
          fileId: files.id,
          fileKey: files.fileKey,
          fileUrl: files.fileUrl,
          size: files.size,
          mimeType: files.mimeType,
          createdAt: files.createdAt,
          jobId: jobs.id,
          prompt: jobs.prompt,
          jobStatus: jobs.status,
          jobCreatedAt: jobs.createdAt,
          jobUserId: jobs.userId,
          fileUserId: files.userId,
        })
        .from(files)
        .leftJoin(jobs, eq(files.jobId, jobs.id))
        .where(eq(jobs.userId, ctx.userId))
        .limit(limit)
        .orderBy(jobs.createdAt ? jobs.createdAt : files.createdAt);

      // Filter client-side for search/status to keep query simple and portable
      const filtered = rows
        .filter((r) => {
          // Ownership check redundancy (safety)
          const ownerId = r.jobUserId ?? r.fileUserId;
          if (ownerId && ownerId !== ctx.userId) return false;
          if (status && status !== "all") {
            if (!r.jobStatus || r.jobStatus !== status) return false;
          }
          if (search) {
            const hay = `${r.prompt ?? ""}`.toLowerCase();
            if (!hay.includes(search.toLowerCase())) return false;
          }
          return true;
        })
        .sort((a, b) => {
          const ad = a.jobCreatedAt ?? a.createdAt;
          const bd = b.jobCreatedAt ?? b.createdAt;
          return bd.getTime() - ad.getTime();
        });

      return filtered.map((r) => ({
        fileId: r.fileId,
        jobId: r.jobId,
        prompt: r.prompt ?? "Untitled",
        status: r.jobStatus ?? "completed",
        createdAt: (r.jobCreatedAt ?? r.createdAt).toISOString(),
        size: r.size ?? 0,
        mimeType: r.mimeType,
        // We return fileUrl (public UploadThing URL) for preview; downloads should still go through our download route.
        fileUrl: (r.fileKey?.startsWith("inline:") ?? false) ? null : r.fileUrl,
      }));
    }),
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

      // Determine owner from job or file record
      const ownerId = jobUserId ?? _file.userId;
      if (ownerId && ownerId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this file",
        });
      }

      // Generate UploadThing signed URL for secure access
      if (_file.fileKey.startsWith("inline:")) {
        const dataUrl = `data:${_file.mimeType ?? "application/pdf"};base64,${_file.fileUrl}`;
        return {
          url: dataUrl,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        };
      }

      const { ufsUrl } = await utapi.generateSignedURL(_file.fileKey, {
        expiresIn: 60 * 60, // 1 hour
      });
      return {
        url: ufsUrl,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
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

      const ownerId = jobUserId ?? _file.userId;
      if (ownerId && ownerId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to share this file",
        });
      }

      // Generate share token and create share link
      if (_file.fileKey.startsWith("inline:")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "This file is still being finalized. Please wait a few seconds before creating a share link.",
        });
      }

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

      // Generate UploadThing signed URL for the shared file
      const fileRows = await db
        .select()
        .from(files)
        .where(eq(files.id, input.fileId))
        .limit(1);
      if (!fileRows[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }
      const fileRow = fileRows[0];

      if (fileRow.fileKey.startsWith("inline:")) {
        const dataUrl = `data:${fileRow.mimeType ?? "application/pdf"};base64,${fileRow.fileUrl}`;
        return {
          url: dataUrl,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        };
      }

      const { ufsUrl } = await utapi.generateSignedURL(fileRow.fileKey, {
        expiresIn: 60 * 60,
      });
      return {
        url: ufsUrl,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
    }),
});
