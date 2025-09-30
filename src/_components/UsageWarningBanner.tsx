"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { AlertCircle, X, TrendingUp } from "lucide-react";
import { api } from "~/trpc/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsageWarningBanner() {
  const { isSignedIn } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: subscription } = api.subscription.getCurrent.useQuery(
    undefined,
    { enabled: isSignedIn },
  );

  if (!isSignedIn || !subscription || isDismissed) {
    return null;
  }

  const pdfUsage = subscription.usage.pdfs;
  const storageUsage = subscription.usage.storage;
  const upgradeSuggestion = subscription.upgradeSuggestion;

  // Show warning if user is at 50% or above
  const showPdfWarning = pdfUsage.percentage >= 50;
  const showStorageWarning = storageUsage.percentage >= 50;
  const showUpgradeSuggestion = upgradeSuggestion.shouldUpgrade;

  if (!showPdfWarning && !showStorageWarning && !showUpgradeSuggestion) {
    return null;
  }

  // Determine severity
  const isUrgent = pdfUsage.percentage >= 80 || storageUsage.percentage >= 80;
  const bgColor = isUrgent
    ? "bg-gradient-to-r from-orange-500 to-red-500"
    : "bg-gradient-to-r from-yellow-400 to-orange-500";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative ${bgColor} px-4 py-3 text-white shadow-lg`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">
                {isUrgent ? "Quota Almost Exceeded!" : "Usage Alert"}
              </p>
              <p className="text-sm text-white/90">
                {showPdfWarning && (
                  <span>
                    You&apos;ve used {pdfUsage.used} of {pdfUsage.limit} PDFs (
                    {pdfUsage.percentage.toFixed(0)}%).
                  </span>
                )}
                {showPdfWarning && showStorageWarning && " • "}
                {showStorageWarning && (
                  <span>
                    Storage: {storageUsage.usedGB.toFixed(2)} GB of{" "}
                    {storageUsage.limitGB} GB (
                    {storageUsage.percentage.toFixed(0)}%).
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/usage"
              className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white/30"
            >
              <TrendingUp className="h-4 w-4" />
              View Usage
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition-all hover:bg-white/90"
            >
              Upgrade Now
            </Link>
            <button
              onClick={() => setIsDismissed(true)}
              className="rounded-lg p-2 transition-colors hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
