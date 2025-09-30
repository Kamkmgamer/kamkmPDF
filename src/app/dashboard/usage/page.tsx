"use client";

import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  HardDrive,
  TrendingUp,
  AlertCircle,
  Crown,
  ArrowUpRight,
} from "lucide-react";
import { api } from "~/trpc/react";

export default function UsagePage() {
  const { isSignedIn } = useAuth();
  const { data: subscription, isLoading } =
    api.subscription.getCurrent.useQuery(undefined, { enabled: isSignedIn });

  const { data: usageHistory } = api.subscription.getUsageHistory.useQuery(
    { limit: 10 },
    { enabled: isSignedIn },
  );

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Please sign in to view usage
          </h2>
          <Link
            href="/sign-in"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !subscription) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const tierConfig = subscription.tierConfig;
  const pdfUsage = subscription.usage.pdfs;
  const storageUsage = subscription.usage.storage;
  const upgradeSuggestion = subscription.upgradeSuggestion;

  const tierColors = {
    starter: "from-gray-400 to-gray-600",
    professional: "from-blue-400 to-blue-600",
    business: "from-purple-400 to-purple-600",
    enterprise: "from-orange-400 to-orange-600",
  };

  const tierColor =
    tierColors[subscription.tier as keyof typeof tierColors] ||
    tierColors.starter;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Usage & Billing
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Monitor your usage and manage your subscription
          </p>
        </motion.div>

        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-8 overflow-hidden rounded-2xl bg-gradient-to-r ${tierColor} p-8 text-white shadow-lg`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6" />
                <h2 className="text-2xl font-bold capitalize">
                  {subscription.tier} Plan
                </h2>
              </div>
              <p className="mt-2 text-white/90">{tierConfig.description}</p>
              <div className="mt-4 flex items-center gap-4">
                <div>
                  <p className="text-3xl font-bold">
                    ${tierConfig.price.monthly}
                  </p>
                  <p className="text-sm text-white/80">per month</p>
                </div>
                {tierConfig.price.yearly > 0 && (
                  <div className="rounded-lg bg-white/20 px-3 py-1 text-sm">
                    Save 17% yearly
                  </div>
                )}
              </div>
            </div>
            <Link
              href="/pricing"
              className="rounded-lg bg-white/20 px-4 py-2 font-semibold backdrop-blur-sm transition-all hover:bg-white/30"
            >
              Change Plan
            </Link>
          </div>
        </motion.div>

        {/* Upgrade Suggestion */}
        {upgradeSuggestion.shouldUpgrade && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 rounded-xl border-2 border-orange-200 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-900/20"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 flex-shrink-0 text-orange-600 dark:text-orange-400" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 dark:text-orange-200">
                  Consider Upgrading
                </h3>
                <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                  {upgradeSuggestion.reason}
                </p>
                {upgradeSuggestion.suggestedTier && (
                  <Link
                    href={`/pricing`}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                  >
                    Upgrade to{" "}
                    <span className="capitalize">
                      {upgradeSuggestion.suggestedTier}
                    </span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Usage Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* PDF Usage Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    PDF Generation
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This billing period
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {pdfUsage.used}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  of {pdfUsage.limit === -1 ? "∞" : pdfUsage.limit} PDFs
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full transition-all ${
                    pdfUsage.percentage >= 80
                      ? "bg-gradient-to-r from-orange-500 to-red-500"
                      : pdfUsage.percentage >= 50
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                        : "bg-gradient-to-r from-blue-400 to-blue-600"
                  }`}
                  style={{
                    width: `${Math.min(100, pdfUsage.percentage)}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {pdfUsage.percentage.toFixed(1)}% used
              </p>
            </div>
          </motion.div>

          {/* Storage Usage Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                  <HardDrive className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Storage Used
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total storage
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {storageUsage.usedGB.toFixed(2)}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  of {storageUsage.limitGB === -1 ? "∞" : storageUsage.limitGB}{" "}
                  GB
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full transition-all ${
                    storageUsage.percentage >= 80
                      ? "bg-gradient-to-r from-orange-500 to-red-500"
                      : storageUsage.percentage >= 50
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                        : "bg-gradient-to-r from-purple-400 to-purple-600"
                  }`}
                  style={{
                    width: `${Math.min(100, storageUsage.percentage)}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {storageUsage.percentage.toFixed(1)}% used
              </p>
            </div>
          </motion.div>
        </div>

        {/* Plan Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Plan Features
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Processing Speed
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tierConfig.features.processingSpeed}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Templates
                </p>
                <p className="text-sm text-gray-600 capitalize dark:text-gray-400">
                  {tierConfig.quotas.templatesAccess} access
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Support
                </p>
                <p className="text-sm text-gray-600 capitalize dark:text-gray-400">
                  {tierConfig.features.support}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        {usageHistory && usageHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <div className="mt-4 space-y-3">
              {usageHistory.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 dark:border-gray-700"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.action
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    +{item.amount}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
