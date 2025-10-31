import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { jobs, userSubscriptions } from "~/server/db/schema";
import { randomUUID } from "~/lib/crypto-edge";
import { eq } from "drizzle-orm";
import {
  verifyApiKey,
  hasPermission,
} from "~/server/api/middleware/apiKeyAuth";
import {
  getTierConfig,
  hasExceededQuota,
  type SubscriptionTier,
} from "~/server/subscription/tiers";
import { env } from "~/env";

/**
 * POST /api/v1/generate
 * Generate a PDF using API key authentication
 */
export async function POST(req: NextRequest) {
  try {
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
    if (!hasPermission(permissions, "pdf:create")) {
      return NextResponse.json(
        { error: "API key does not have pdf:create permission" },
        { status: 403 },
      );
    }

    // Parse request body
    const body = (await req.json()) as Record<string, unknown>;
    const { prompt } = body as { prompt?: string };

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt is required and must be a string" },
        { status: 400 },
      );
    }

    if (prompt.length > 32000) {
      return NextResponse.json(
        { error: "prompt must be less than 32000 characters" },
        { status: 400 },
      );
    }

    // Check subscription and quota
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    if (!subscription[0]) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    const sub = subscription[0];
    const tier = sub.tier as SubscriptionTier;
    const tierConfig = getTierConfig(tier);

    // Check quota
    const exceeded = hasExceededQuota(
      tier,
      sub.pdfsUsedThisMonth,
      "pdfsPerMonth",
    );

    if (exceeded) {
      return NextResponse.json(
        {
          error: `Monthly quota exceeded. Limit: ${tierConfig.quotas.pdfsPerMonth} PDFs`,
        },
        { status: 429 },
      );
    }

    // Create job
    const id = randomUUID();
    await db.insert(jobs).values({
      id,
      prompt,
      userId,
      status: "queued",
    });

    // Trigger worker
    try {
      const base = env.NEXT_PUBLIC_APP_URL;
      const url = new URL("/api/worker/drain", base).toString();
      const headers: Record<string, string> = {};
      if (process.env.PDFPROMPT_WORKER_SECRET) {
        headers["x-worker-secret"] = process.env.PDFPROMPT_WORKER_SECRET;
      }
      void fetch(url, { headers }).catch(() => undefined);
    } catch {
      // ignore
    }

    // Return job details
    return NextResponse.json(
      {
        id,
        status: "queued",
        message: "PDF generation job created successfully",
      },
      { status: 201 },
    );
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
