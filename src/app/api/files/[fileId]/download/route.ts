// Ensure Node.js runtime on Vercel (required for puppeteer-core + chromium)
export const runtime = "nodejs";
// Avoid static optimization; this route depends on dynamic DB/filesystem
export const dynamic = "force-dynamic";
// Allow longer execution for on-demand PDF generation (subject to plan limits)
export const maxDuration = 60;
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { files as filesTable, jobs, shareLinks } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { utapi } from "~/server/uploadthing";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token"); // share link token (not HMAC)
    const { fileId } = await params;

    // Load file and its owning user
    const fileWithJob = await db
      .select({ file: filesTable, jobUserId: jobs.userId })
      .from(filesTable)
      .leftJoin(jobs, eq(filesTable.jobId, jobs.id))
      .where(eq(filesTable.id, fileId))
      .limit(1);
    if (!fileWithJob[0]) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const { file, jobUserId } = fileWithJob[0];
    const ownerId = jobUserId ?? file.userId;

    // If share token is present, verify it
    if (token) {
      const rows = await db
        .select()
        .from(shareLinks)
        .where(and(eq(shareLinks.fileId, fileId), eq(shareLinks.token, token)))
        .limit(1);
      const link = rows[0];
      if (!link || new Date() > link.expiresAt) {
        return NextResponse.json(
          { error: "Invalid or expired share link" },
          { status: 401 },
        );
      }
    } else {
      // Otherwise, require authenticated owner
      const auth = getAuth(req as unknown as NextRequest);
      if (!auth?.userId || (ownerId && auth.userId !== ownerId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Generate UploadThing signed URL and redirect
    const { ufsUrl } = await utapi.generateSignedURL(file.fileKey, {
      expiresIn: 60 * 60, // 1 hour
    });
    return NextResponse.redirect(ufsUrl, { status: 302 });
  } catch (err) {
    console.error("[download] error", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
