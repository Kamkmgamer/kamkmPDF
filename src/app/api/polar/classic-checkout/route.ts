/**
 * Classic Plan Checkout Endpoint
 * Hidden checkout link for Classic tier - only accessible via email campaigns
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { polarProducts } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Get offer type from query params
    const searchParams = request.nextUrl.searchParams;
    const offerType = searchParams.get("offer") ?? "default"; // exclusive, winback, final
    const billingCycle = searchParams.get("billing") ?? "monthly"; // monthly or yearly

    // Get Classic product from database
    const product = await db.query.polarProducts.findFirst({
      where: and(
        eq(polarProducts.tier, "classic"),
        eq(polarProducts.billingCycle, billingCycle as "monthly" | "yearly"),
        eq(polarProducts.isActive, true),
      ),
    });

    if (!product) {
      return NextResponse.json(
        { error: "Classic plan not available" },
        { status: 404 },
      );
    }

    // Create checkout session with Polar
    const checkoutUrl = `https://polar.sh/checkout/${product.productId}`;

    // Add success/cancel URLs
    const successUrl = new URL(
      "/dashboard/subscription?success=true",
      request.url,
    );
    const cancelUrl = new URL("/pricing", request.url);

    // Add metadata to track offer type
    const finalUrl = `${checkoutUrl}?success_url=${encodeURIComponent(successUrl.toString())}&cancel_url=${encodeURIComponent(cancelUrl.toString())}&metadata[offer_type]=${offerType}&metadata[user_id]=${userId}`;

    // Track the checkout attempt (for analytics)
    // TODO: Add analytics tracking here

    return NextResponse.redirect(finalUrl);
  } catch (error) {
    console.error("Classic checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
