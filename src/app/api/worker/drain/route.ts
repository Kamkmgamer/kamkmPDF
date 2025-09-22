// Ensure Node.js runtime (required for puppeteer-core/@sparticuz/chromium)
export const runtime = "nodejs";
// This route touches DB and external services; disable static optimization
export const dynamic = "force-dynamic";
// Allow a longer execution window (subject to plan limits)
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { drain } from "~/server/jobs/worker";

export async function GET(req: Request) {
  try {
    // Optional shared-secret check to prevent public abuse
    const secret = process.env.PDFPROMPT_WORKER_SECRET;
    if (secret) {
      const hdr = req.headers.get("x-worker-secret");
      const { searchParams } = new URL(req.url);
      const qp = searchParams.get("key");
      const provided = hdr ?? qp ?? "";
      if (provided !== secret) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized" },
          { status: 401 },
        );
      }
    }

    const { searchParams } = new URL(req.url);
    const maxJobsParam = searchParams.get("maxJobs");
    const maxMsParam = searchParams.get("maxMs");

    const maxJobs = maxJobsParam ? Number(maxJobsParam) : undefined;
    const maxMs = maxMsParam ? Number(maxMsParam) : undefined;

    const result = await drain({ maxJobs, maxMs });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[worker/drain] error", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
