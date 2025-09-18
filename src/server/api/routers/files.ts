import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { db } from "~/server/db";
import { files } from "~/server/db/schema";
import path from "path";
import { eq, desc } from "drizzle-orm";

const TMP_DIR =
  process.env.PDFPROMPT_TMP_DIR ?? path.join(process.cwd(), "tmp");

export const filesRouter = createTRPCRouter({
  getDownloadUrl: publicProcedure.input(z.string()).query(async ({ input }) => {
    const rec = await db
      .select()
      .from(files)
      .where(eq(files.id, input))
      .limit(1);
    const file = rec[0];
    if (!file) return null;
    // For local dev, return a file://-style path or a relative path the frontend can fetch from a static handler.
    return {
      url: `file://${path.join(TMP_DIR, file.path ?? "")}`,
      mimeType: file.mimeType ?? "application/pdf",
      size: file.size ?? 0,
    };
  }),

  // simple listing by job id
  listByJob: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(files)
        .where(eq(files.jobId, input.jobId))
        .orderBy(desc(files.createdAt));
    }),
});
