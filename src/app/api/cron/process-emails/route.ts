/**
 * Cron Job Endpoint for Processing Scheduled Emails
 * Should be called every hour by Vercel Cron or similar service
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { processPendingEmails } from "~/server/email/campaign-service";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process all pending emails
    await processPendingEmails();

    return NextResponse.json({
      success: true,
      message: "Email processing completed",
    });
  } catch (error) {
    console.error("Email processing cron error:", error);

    return NextResponse.json(
      {
        error: "Email processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Allow GET requests only
export const dynamic = "force-dynamic";
