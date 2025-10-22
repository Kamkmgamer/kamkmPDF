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
  Zap,
  Target,
  Star,
  BriefcaseBusiness,
  Rocket,
  Gift,
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
    professional: "from-blue-500 to-indigo-600",
    business: "from-indigo-500 to-sky-600",
    enterprise: "from-orange-400 to-orange-600",
  };

  const tierColor =
    tierColors[subscription.tier as keyof typeof tierColors] ||
    tierColors.starter;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl overflow-x-hidden px-4 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                Usage & Billing
              </h1>
              <p className="mt-2 text-base text-gray-600 sm:mt-3 sm:text-lg dark:text-gray-300">
                Flexible plans built for individuals, creators, and teams that generate high volumes of documents
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                {subscription.tier === "enterprise" ? (
                  <><Rocket className="h-4 w-4" /> Unlimited PDFs for enterprise teams and agencies</>
                ) : subscription.tier === "business" ? (
                  <><BriefcaseBusiness className="h-4 w-4" /> Generate up to 50,000 PDFs per month — perfect for teams and small businesses</>
                ) : subscription.tier === "professional" ? (
                  <><Star className="h-4 w-4" /> Generate up to 5,000 PDFs per month — ideal for professionals and freelancers</>
                ) : (
                  <><Target className="h-4 w-4" /> Perfect for quick personal use or to test our PDF generator</>
                )}
              </p>
            </div>
            <Link
              href="/credits"
              className="group relative inline-flex items-center gap-2 self-start overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl sm:self-auto sm:text-base"
            >
              <Zap className="h-4 w-4 transition-transform group-hover:scale-110 sm:h-5 sm:w-5" />
              <div className="flex flex-col items-start">
                <span>Buy Credits</span>
                <span className="text-[10px] font-normal text-blue-100">Save 10% on bundles today</span>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Current Plan Card - Ultra Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`group relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r ${tierColor} hover:shadow-3xl p-6 text-white shadow-2xl shadow-blue-500/30 transition-all duration-500 hover:shadow-blue-500/40 sm:p-8 lg:p-10`}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent_50%)]"></div>
            <div className="animate-shimmer absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%]"></div>
          </div>

          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-white/30 blur-lg"></div>
                  <div className="relative rounded-2xl bg-white/20 p-2.5 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 sm:p-3">
                    <Crown className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-black tracking-tight capitalize sm:text-3xl">
                    {subscription.tier} Plan
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm font-medium text-white/90 sm:text-base lg:text-lg">
                    {tierConfig.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-4 sm:gap-6">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                      ${tierConfig.price.monthly}
                    </span>
                    <span className="text-xl font-semibold text-white/70 sm:text-2xl">
                      /mo
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-white/70 sm:text-sm">
                    Billed monthly
                  </p>
                </div>
                {tierConfig.price.yearly > 0 && (
                  <div className="relative overflow-hidden rounded-xl border border-white/30 bg-gradient-to-r from-white/25 to-white/15 px-3 py-2 shadow-lg backdrop-blur-md sm:rounded-2xl sm:px-4 sm:py-2.5">
                    <div className="absolute inset-0 animate-pulse bg-white/10"></div>
                    <div className="relative flex items-center gap-1.5 sm:gap-2">
                      <span className="text-lg sm:text-2xl">💎</span>
                      <div>
                        <p className="text-xs font-bold whitespace-nowrap sm:text-sm">
                          Save 17%
                        </p>
                        <p className="text-[10px] whitespace-nowrap text-white/80 sm:text-xs">
                          with yearly
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/pricing"
              className="group/btn relative self-start overflow-hidden rounded-2xl border border-white/30 bg-white/20 px-5 py-2.5 text-sm font-bold whitespace-nowrap shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-xl active:scale-95 sm:px-6 sm:py-3 sm:text-base"
            >
              <span className="relative z-10">Change Plan</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full"></div>
            </Link>
          </div>
        </motion.div>

        {/* Upgrade Suggestion */}
        {upgradeSuggestion.shouldUpgrade && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 rounded-3xl border-2 border-orange-200/80 bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 shadow-xl shadow-orange-500/10 dark:border-orange-800/50 dark:from-orange-900/20 dark:to-orange-800/10"
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
          {/* PDF Usage Card - Ultra Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group hover:shadow-3xl relative overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-2xl shadow-blue-500/10 backdrop-blur-xl transition-all duration-500 hover:shadow-blue-500/20 sm:p-8 dark:border-gray-700/50 dark:from-gray-900 dark:to-blue-950/20"
          >
            {/* Animated gradient orb */}
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl transition-transform duration-700 group-hover:scale-110"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 opacity-50 blur-lg transition-opacity duration-500 group-hover:opacity-75"></div>
                  <div className="relative rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg transition-transform duration-500 group-hover:scale-110 sm:p-4">
                    <FileText className="h-5 w-5 text-white sm:h-7 sm:w-7" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-lg font-bold text-transparent sm:text-xl">
                    PDF Generation
                  </h3>
                  <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                    This billing period
                  </p>
                </div>
              </div>
              <TrendingUp className="h-5 w-5 flex-shrink-0 text-blue-500 opacity-50 transition-opacity group-hover:opacity-100 sm:h-6 sm:w-6 dark:text-blue-400" />
            </div>

            <div className="relative z-10 mt-6 sm:mt-8">
              <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-0">
                <div>
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
                    {pdfUsage.used}
                  </span>
                  <span className="ml-2 text-xl font-semibold text-gray-400 sm:text-2xl dark:text-gray-500">
                    / {pdfUsage.limit === -1 ? "∞" : pdfUsage.limit}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs font-semibold text-gray-500 sm:text-sm dark:text-gray-400">
                    PDFs Generated
                  </div>
                  <div
                    className={`text-base font-bold sm:text-lg ${
                      pdfUsage.percentage >= 80
                        ? "text-red-500"
                        : pdfUsage.percentage >= 50
                          ? "text-orange-500"
                          : "text-blue-500"
                    }`}
                  >
                    {pdfUsage.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Ultra Premium Progress Bar */}
              <div className="relative mt-6 h-4 overflow-hidden rounded-full bg-gradient-to-r from-gray-200 to-gray-300 shadow-inner dark:from-gray-700 dark:to-gray-800">
                <div
                  className={`relative h-full rounded-full transition-all duration-1000 ease-out ${
                    pdfUsage.percentage >= 80
                      ? "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"
                      : pdfUsage.percentage >= 50
                        ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-400"
                        : "bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600"
                  } shadow-lg`}
                  style={{
                    width: `${Math.min(100, pdfUsage.percentage)}%`,
                  }}
                >
                  <div className="absolute inset-0 animate-pulse bg-white/20"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Storage Usage Card - Ultra Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group hover:shadow-3xl relative overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-br from-white to-indigo-50/30 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl transition-all duration-500 hover:shadow-indigo-500/20 sm:p-8 dark:border-gray-700/50 dark:from-gray-900 dark:to-indigo-950/20"
          >
            {/* Animated gradient orb */}
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-400/20 to-violet-400/20 blur-3xl transition-transform duration-700 group-hover:scale-110"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 opacity-50 blur-lg transition-opacity duration-500 group-hover:opacity-75"></div>
                  <div className="relative rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-3 shadow-lg transition-transform duration-500 group-hover:scale-110 sm:p-4">
                    <HardDrive className="h-5 w-5 text-white sm:h-7 sm:w-7" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-lg font-bold text-transparent sm:text-xl">
                    Storage Used
                  </h3>
                  <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
                    Total storage
                  </p>
                </div>
              </div>
              <TrendingUp className="h-5 w-5 flex-shrink-0 text-indigo-500 opacity-50 transition-opacity group-hover:opacity-100 sm:h-6 sm:w-6 dark:text-indigo-400" />
            </div>

            <div className="relative z-10 mt-6 sm:mt-8">
              <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-0">
                <div>
                  <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
                    {storageUsage.usedGB.toFixed(2)}
                  </span>
                  <span className="ml-2 text-xl font-semibold text-gray-400 sm:text-2xl dark:text-gray-500">
                    / {storageUsage.limitGB === -1 ? "∞" : storageUsage.limitGB}{" "}
                    GB
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs font-semibold text-gray-500 sm:text-sm dark:text-gray-400">
                    Storage
                  </div>
                  <div
                    className={`text-base font-bold sm:text-lg ${
                      storageUsage.percentage >= 80
                        ? "text-red-500"
                        : storageUsage.percentage >= 50
                          ? "text-orange-500"
                          : "text-indigo-500"
                    }`}
                  >
                    {storageUsage.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Ultra Premium Progress Bar */}
              <div className="relative mt-6 h-4 overflow-hidden rounded-full bg-gradient-to-r from-gray-200 to-gray-300 shadow-inner dark:from-gray-700 dark:to-gray-800">
                <div
                  className={`relative h-full rounded-full transition-all duration-1000 ease-out ${
                    storageUsage.percentage >= 80
                      ? "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"
                      : storageUsage.percentage >= 50
                        ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-400"
                        : "bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600"
                  } shadow-lg`}
                  style={{
                    width: `${Math.min(100, storageUsage.percentage)}%`,
                  }}
                >
                  <div className="absolute inset-0 animate-pulse bg-white/20"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Plan Features - Ultra Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative mt-8 overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/50 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-xl dark:border-gray-700/50 dark:from-gray-900 dark:to-gray-800/50"
        >
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-violet-400/10 blur-3xl"></div>

          <h3 className="relative z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-2xl font-bold text-transparent">
            Your Plan Features
          </h3>
          <div className="relative z-10 mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              <div className="rounded-lg bg-sky-100 p-2 dark:bg-sky-900/30">
                <Crown className="h-4 w-4 text-sky-600 dark:text-sky-400" />
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

        {/* Upgrade Benefits for Lower Tiers */}
        {(subscription.tier === "starter" || subscription.tier === "professional") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 rounded-3xl border-2 border-blue-200/80 bg-gradient-to-br from-blue-50 to-indigo-100/50 p-6 shadow-xl dark:border-blue-800/50 dark:from-blue-900/20 dark:to-indigo-800/10 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-blue-500 p-3">
                <ArrowUpRight className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200">
                  {subscription.tier === "starter" ? "Unlock More with Professional" : "Unlock More with Business"}
                </h3>
                <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  {subscription.tier === "starter" 
                    ? "Upgrade to unlock watermark-free exports, priority support, and 5,000 PDFs per month."
                    : "Upgrade to unlock unlimited PDF generations, API access, and dedicated account management."}
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {subscription.tier === "starter" ? "5,000 PDFs/month" : "50,000 PDFs/month"}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    No watermarks
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Priority support
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {subscription.tier === "starter" ? "Advanced features" : "API access"}
                  </div>
                </div>
                <Link
                  href="/pricing"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg"
                >
                  Upgrade Now
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Referral & Rewards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 rounded-3xl border border-purple-200/80 bg-gradient-to-br from-purple-50 to-pink-100/50 p-6 shadow-xl dark:border-purple-800/50 dark:from-purple-900/20 dark:to-pink-800/10 sm:p-8"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200">
                    Invite Friends & Earn Rewards
                  </h3>
                  <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
                    Earn 50 credits for every friend who subscribes to a paid plan
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 text-sm font-semibold text-purple-900 backdrop-blur-sm dark:bg-purple-900/30 dark:text-purple-200">
                  <Gift className="h-4 w-4" />
                  Free credits
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 text-sm font-semibold text-purple-900 backdrop-blur-sm dark:bg-purple-900/30 dark:text-purple-200">
                  <Zap className="h-4 w-4" />
                  Unlimited referrals
                </div>
              </div>
            </div>
            <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl sm:self-auto">
              <span className="relative z-10">Get Referral Link</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
            </button>
          </div>
        </motion.div>

        {/* Why Upgrade Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 rounded-3xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/50 p-8 shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:from-gray-900 dark:to-gray-800/50"
        >
          <h3 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-2xl font-bold text-transparent">
            Why Upgrade?
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Unlock powerful features designed for professionals and teams
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="rounded-lg bg-blue-100 p-2.5 dark:bg-blue-900/30">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">No Watermark</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Professional, clean PDFs without any branding
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="rounded-lg bg-purple-100 p-2.5 dark:bg-purple-900/30">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Instant Access</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Priority generation speed and new AI features
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="rounded-lg bg-green-100 p-2.5 dark:bg-green-900/30">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Priority Speed</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Faster processing with dedicated resources
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="rounded-lg bg-orange-100 p-2.5 dark:bg-orange-900/30">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">API Access</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Integrate PDF generation into your apps
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
            transition={{ delay: 0.9 }}
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
