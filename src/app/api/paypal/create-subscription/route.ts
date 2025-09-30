/**
 * Create PayPal Subscription API Route
 * Creates a PayPal subscription and returns approval URL
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSubscriptionForTier } from "~/server/paypal/client";
import { env } from "~/env";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSubscriptionSchema = z.object({
  tier: z.enum(["professional", "business", "enterprise"]),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = (await req.json()) as { tier: string };
    const result = createSubscriptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid tier", details: result.error },
        { status: 400 },
      );
    }

    const { tier } = result.data;

    // Get user email from Clerk (you might need to fetch this)
    // For now, we'll use a placeholder
    const userEmail = `user-${userId}@example.com`; // TODO: Get real email from Clerk

    // Create PayPal subscription
    const { subscriptionId, approvalUrl } = await createSubscriptionForTier(
      tier,
      userId,
      userEmail,
      env.NEXT_PUBLIC_APP_URL,
    );

    return NextResponse.json({
      subscriptionId,
      approvalUrl,
    });
  } catch (error) {
    console.error("[Create Subscription] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create subscription",
      },
      { status: 500 },
    );
  }
}
