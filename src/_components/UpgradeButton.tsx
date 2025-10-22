"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface UpgradeButtonProps {
  tier: "professional" | "classic" | "pro_plus" | "business" | "enterprise";
  billingCycle?: "monthly" | "yearly";
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function UpgradeButton({
  tier,
  billingCycle = "monthly",
  children,
  variant = "primary",
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();

  const handleUpgrade = async () => {
    if (!userId) {
      window.location.href = "/sign-up";
      return;
    }

    // Enterprise requires contact
    if (tier === "enterprise") {
      window.location.href = "/contact";
      return;
    }

    setLoading(true);

    try {
      // Fetch product ID from database
      const response = await fetch(
        `/api/products/${tier}?billingCycle=${billingCycle}`,
      );

      if (!response.ok) {
        console.error("[UpgradeButton] Product API failed:", response.status);
        throw new Error("Failed to fetch product");
      }

      const data = (await response.json()) as { productId?: string };

      if (!data.productId) {
        console.error("[UpgradeButton] No product ID in response");
        throw new Error("Product ID not found");
      }

      // Redirect to Polar checkout
      const checkoutUrl = `/api/polar/create-checkout?products=${data.productId}`;
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("[UpgradeButton] Upgrade failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to start upgrade process. Please try again.",
      );
      setLoading(false);
    }
  };

  const baseClasses =
    "w-full block rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3 text-xs sm:text-sm lg:text-base text-center font-semibold transition-all";
  const variantClasses =
    variant === "primary"
      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
      : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600";

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`${baseClasses} ${variantClasses} ${loading ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {loading ? "Processing..." : children}
    </button>
  );
}
