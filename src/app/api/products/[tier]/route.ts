/**
 * Get Product ID by Tier
 * Returns the Polar product ID for a given tier
 */

import { NextResponse } from "next/server";
import { db } from "~/server/db";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tier: string }> },
) {
  try {
    const { tier } = await params;
    const { searchParams } = new URL(request.url);
    const billingCycle = searchParams.get("billingCycle") ?? "monthly";

    // Validate tier
    const validTiers = [
      "starter",
      "classic",
      "professional",
      "business",
      "enterprise",
    ];
    if (!validTiers.includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Validate billing cycle
    if (!["monthly", "yearly"].includes(billingCycle)) {
      return NextResponse.json(
        { error: "Invalid billing cycle" },
        { status: 400 },
      );
    }

    // Starter is free, no product ID needed
    if (tier === "starter") {
      return NextResponse.json({
        tier,
        billingCycle,
        productId: null,
        name: "Starter Plan",
        description: "Free tier for testing",
        isFree: true,
      });
    }

    // Fetch product from database
    const product = await db.query.polarProducts.findFirst({
      where: (table, { eq, and }) =>
        and(eq(table.tier, tier), eq(table.billingCycle, billingCycle)),
    });

    if (!product?.isActive) {
      return NextResponse.json(
        { error: "Product not found or inactive" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      tier: product.tier,
      billingCycle: product.billingCycle,
      productId: product.productId,
      name: product.name,
      description: product.description,
      isFree: false,
    });
  } catch (error) {
    console.error("[Products API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
