"use client";

import { useState } from "react";

interface CreditPurchaseButtonProps {
  packageId: string;
  popular?: boolean;
}

export default function CreditPurchaseButton({
  packageId,
  popular = false,
}: CreditPurchaseButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);

    try {
      // Fetch checkout URL from API
      const response = await fetch(`/api/credits/checkout?package=${packageId}`);

      if (!response.ok) {
        throw new Error("Failed to create checkout");
      }

      const data = (await response.json()) as { checkoutUrl?: string };

      if (data.checkoutUrl) {
        // Redirect to Polar checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to start purchase. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className={`w-full rounded-xl px-6 py-3 text-sm font-bold transition-all sm:text-base ${
        popular
          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
          : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {loading ? "Processing..." : "Purchase Now"}
    </button>
  );
}
