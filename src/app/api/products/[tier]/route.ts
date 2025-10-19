/**
 * Get Product ID by Tier
 * Returns the Polar product ID for a given tier
 */

import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { polarProducts } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tier: string }> }
) {
  try {
    const { tier } = await params;

    // Validate tier
    const validTiers = ["starter", "classic", "professional", "business", "enterprise"];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier" },
        { status: 400 }
      );
    }

    // Starter is free, no product ID needed
    if (tier === "starter") {
      return NextResponse.json({
        tier,
        productId: null,
        name: "Starter Plan",
        description: "Free tier for testing",
        isFree: true,
      });
    }

    // Fetch product from database
    const product = await db.query.polarProducts.findFirst({
      where: eq(polarProducts.tier, tier),
    });

    if (!product?.isActive) {
      return NextResponse.json(
        { error: "Product not found or inactive" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tier: product.tier,
      productId: product.productId,
      name: product.name,
      description: product.description,
      isFree: false,
    });
  } catch (error) {
    console.error("[Products API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
