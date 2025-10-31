import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { jobs } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import {
  verifyApiKey,
  hasPermission,
} from "~/server/api/middleware/apiKeyAuth";

export const runtime = "edge";

/**
 * GET /api/v1/jobs/[id]
 * Get job status using API key authentication
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id } = await params;

    // Get API key from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const apiKey = authHeader.replace("Bearer ", "");

    // Verify API key
    const { userId, permissions } = await verifyApiKey(apiKey);

    // Check permission
    if (!hasPermission(permissions, "pdf:read")) {
      return NextResponse.json(
        { error: "API key does not have pdf:read permission" },
        { status: 403 },
      );
    }

    // Get job
    const job = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, id), eq(jobs.userId, userId)))
      .limit(1);

    if (!job[0]) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Return job details
    return NextResponse.json({
      id: job[0].id,
      status: job[0].status,
      progress: job[0].progress,
      stage: job[0].stage,
      resultFileId: job[0].resultFileId,
      errorMessage: job[0].errorMessage,
      createdAt: job[0].createdAt,
      updatedAt: job[0].updatedAt,
    });
  } catch (error) {
    console.error("API error:", error);

    if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
