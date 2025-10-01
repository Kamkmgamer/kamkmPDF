"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface UpgradeButtonProps {
  tier: "professional" | "business" | "enterprise";
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function UpgradeButton({
  tier,
  children,
  variant = "primary",
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const { userId, getToken } = useAuth();

  const handleUpgrade = async () => {
    if (!userId) {
      window.location.href = "/sign-up";
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();

      const response = await fetch("/api/paypal/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "Failed to create subscription");
      }

      const { approvalUrl } = (await response.json()) as {
        approvalUrl?: string;
      };

      if (approvalUrl) {
        // Redirect to PayPal for payment
        window.location.href = approvalUrl;
      } else {
        throw new Error("No approval URL received");
      }
    } catch (error) {
      console.error("Upgrade failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to start upgrade process. Please try again.",
      );
      setLoading(false);
    }
  };

  const baseClasses =
    "w-full block rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-center font-semibold transition-all";
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
