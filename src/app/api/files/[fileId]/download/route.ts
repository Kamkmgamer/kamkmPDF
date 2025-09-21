// Ensure Node.js runtime on Vercel (required for puppeteer-core + chromium)
export const runtime = "nodejs";
// Avoid static optimization; this route depends on dynamic DB/filesystem
export const dynamic = "force-dynamic";
// Allow longer execution for on-demand PDF generation (subject to plan limits)
export const maxDuration = 60;
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { files as filesTable, jobs } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { verifySignedUrl } from "~/server/utils/signed-urls";
import fs from "fs";
import path from "path";
import generatePdfToPath from "~/server/jobs/pdf";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const expires = searchParams.get("expires");
    const { fileId } = await params;

    if (!token || !expires) {
      return NextResponse.json(
        { error: "Missing token or expires" },
        { status: 400 },
      );
    }

    if (!verifySignedUrl(fileId, token, expires)) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const res = await db
      .select()
      .from(filesTable)
      .where(eq(filesTable.id, fileId))
      .limit(1);
    const file = res[0];
    if (!file?.path) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const TMP_DIR =
      process.env.PDFPROMPT_TMP_DIR ??
      (process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "tmp"));
    const filePath = path.join(TMP_DIR, file.path);

    try {
      const stat = await fs.promises.stat(filePath);
      const data = await fs.promises.readFile(filePath);
      return new NextResponse(new Uint8Array(data), {
        status: 200,
        headers: new Headers({
          "Content-Type": file.mimeType ?? "application/pdf",
          "Content-Length": String(stat.size),
          "Content-Disposition": `inline; filename="${file.path}"`,
          "Cache-Control": "private, max-age=0, must-revalidate",
        }),
      });
    } catch {
      // On Vercel or first access, the file might not exist locally. Generate on-demand.
      try {
        // Fetch the job to get the prompt
        const jobId = file.jobId;
        let prompt = "";
        if (jobId) {
          const jobRows = await db
            .select()
            .from(jobs)
            .where(eq(jobs.id, jobId))
            .limit(1);
          prompt = jobRows[0]?.prompt ?? "";
        }

        await fs.promises.mkdir(TMP_DIR, { recursive: true });
        await generatePdfToPath(filePath, {
          jobId: jobId ?? "unknown",
          prompt,
        });

        const stat2 = await fs.promises.stat(filePath);
        const data2 = await fs.promises.readFile(filePath);
        return new NextResponse(new Uint8Array(data2), {
          status: 200,
          headers: new Headers({
            "Content-Type": "application/pdf",
            "Content-Length": String(stat2.size),
            "Content-Disposition": `inline; filename="${file.path}"`,
            "Cache-Control": "private, max-age=0, must-revalidate",
          }),
        });
      } catch (genErr) {
        console.error("[download] on-demand generation failed", genErr);
        return NextResponse.json(
          { error: "File missing and regeneration failed" },
          { status: 500 },
        );
      }
    }
  } catch (err) {
    console.error("[download] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
