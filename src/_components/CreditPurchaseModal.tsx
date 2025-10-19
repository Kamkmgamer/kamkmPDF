"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { creditPackages } from "~/app/_data/creditPackages";

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits?: number;
}

export default function CreditPurchaseModal({
  isOpen,
  onClose,
  currentCredits = 0,
}: CreditPurchaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    setLoading(true);
    setSelectedPackage(packageId);

    try {
      // Fetch product ID from database
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
      setSelectedPackage(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-sky-600 p-8 text-white">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Purchase Credits</h2>
                    <p className="mt-1 text-sm text-white/90">
                      Get more credits to continue generating PDFs
                    </p>
                  </div>
                </div>

                {/* Current Credits */}
                <div className="mt-6 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/80">
                      Current Balance
                    </span>
                    <span className="text-2xl font-bold">{currentCredits} credits</span>
                  </div>
                </div>
              </div>

              {/* Credit Packages */}
              <div className="p-8">
                <div className="grid gap-4 sm:grid-cols-3">
                  {creditPackages.map((pkg) => (
                    <motion.div
                      key={pkg.id}
                      whileHover={{ y: -4 }}
                      className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                        pkg.popular
                          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30"
                          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                      }`}
                    >
                      {/* Popular Badge */}
                      {pkg.popular && (
                        <div className="absolute top-0 right-0">
                          <div className="flex items-center gap-1 rounded-bl-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-1 text-xs font-bold text-white">
                            <Sparkles className="h-3 w-3" />
                            <span>Best Value</span>
                          </div>
                        </div>
                      )}

                      <div className="p-6">
                        {/* Package Name */}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {pkg.name}
                        </h3>

                        {/* Credits */}
                        <div className="mt-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-blue-600 dark:text-blue-400">
                              {pkg.credits}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              credits
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mt-2">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              ${pkg.price}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              one-time
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            ${pkg.pricePerCredit.toFixed(3)} per credit
                          </p>
                        </div>

                        {/* Savings Badge */}
                        {pkg.savings && (
                          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <Check className="h-3 w-3" />
                            {pkg.savings}
                          </div>
                        )}

                        {/* Purchase Button */}
                        <button
                          onClick={() => handlePurchase(pkg.id)}
                          disabled={loading}
                          className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                            pkg.popular
                              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                              : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                          } ${
                            loading && selectedPackage === pkg.id
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                        >
                          {loading && selectedPackage === pkg.id
                            ? "Processing..."
                            : "Purchase Now"}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Info */}
                <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Note:</strong> Credits never expire and can be used anytime.
                    They&apos;re perfect for occasional extra usage beyond your subscription limits.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
