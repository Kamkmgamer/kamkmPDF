/**
 * Credit Purchase Checkout API
 * Creates a Polar checkout session for credit purchases
 * Uses the same pattern as subscription checkout
 */

import { Checkout } from "@polar-sh/nextjs";
import { db } from "~/server/db";
import { creditProducts } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "~/env";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get package ID from query params
    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get("package");

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID required" },
        { status: 400 }
      );
    }

    // Validate package ID
    const validPackages = ["credits_50", "credits_500", "credits_1000"];
    if (!validPackages.includes(packageId)) {
      return NextResponse.json(
        { error: "Invalid package ID" },
        { status: 400 }
      );
    }

    // Fetch product from database
    const productData = await db.query.creditProducts.findFirst({
      where: eq(creditProducts.id, packageId),
    });

    if (!productData?.isActive) {
      return NextResponse.json(
        { error: "Product not found or inactive" },
        { status: 404 }
      );
    }

    // Redirect to Polar checkout using the same pattern as subscriptions
    const checkoutUrl = `/api/polar/create-checkout?products=${productData.productId}`;
    
    return NextResponse.json({
      checkoutUrl,
      credits: productData.credits,
      price: productData.price,
    });
  } catch (error) {
    console.error("[Credits Checkout API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
