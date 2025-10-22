"use client";

import { Users, Gift, Copy, Check, TrendingUp, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { useState } from "react";
import { motion } from "framer-motion";

// StatCard Component
function StatCard({
  icon,
  title,
  value,
  gradient,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative"
    >
      <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${gradient} opacity-0 blur transition duration-300 group-hover:opacity-20`} />
      <div className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 group-hover:border-blue-300 sm:rounded-2xl dark:border-slate-700 dark:bg-slate-800 dark:group-hover:border-blue-700">
        <div className="mb-3 flex items-center gap-2">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
            {icon}
          </div>
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {title}
          </h3>
        </div>
        <p className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-3xl font-black text-transparent sm:text-4xl dark:from-blue-400 dark:to-cyan-400">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// HowItWorksStep Component
function HowItWorksStep({
  icon,
  step,
  title,
  description,
  gradient,
  delay,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative text-center"
    >
      <div className="relative mx-auto mb-4 inline-block">
        <div className={`absolute -inset-2 rounded-2xl bg-gradient-to-br ${gradient} opacity-20 blur-xl`} />
        <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-xl`}>
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-900 shadow-lg dark:bg-slate-800 dark:text-white">
          {step}
        </div>
      </div>
      <h4 className="mb-2 font-bold text-slate-900 dark:text-white">
        {title}
      </h4>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </motion.div>
  );
}

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const { data: referralInfo, isLoading } = api.referrals.getMyReferralInfo.useQuery();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
        <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center">
              <div className="relative mx-auto h-16 w-16">
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-500"></div>
                <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-t-sky-500 border-r-cyan-500 [animation-direction:reverse] [animation-duration:1.5s]"></div>
              </div>
              <p className="mt-6 animate-pulse bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-medium text-transparent">
                Loading your referral dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/10 to-teal-400/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center sm:mb-12"
        >
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Gift className="h-4 w-4" />
            <span>Referral Program</span>
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-white">
            Invite & Earn Credits
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-400">
            Share your unique referral link and earn <span className="font-bold text-blue-600 dark:text-blue-400">50 credits</span> for each friend who subscribes to a paid plan!
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mb-8 grid max-w-6xl gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
        >
          <StatCard
            icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
            title="Total Referrals"
            value={referralInfo?.stats.totalReferrals ?? 0}
            gradient="from-blue-500 to-cyan-500"
            delay={0.3}
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />}
            title="Successful"
            value={referralInfo?.stats.completedReferrals ?? 0}
            gradient="from-green-500 to-emerald-500"
            delay={0.4}
          />
          <StatCard
            icon={<Clock className="h-5 w-5 sm:h-6 sm:w-6" />}
            title="Pending"
            value={referralInfo?.stats.pendingReferrals ?? 0}
            gradient="from-amber-500 to-orange-500"
            delay={0.5}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />}
            title="Credits Earned"
            value={referralInfo?.stats.totalCreditsEarned ?? 0}
            gradient="from-indigo-500 to-purple-500"
            delay={0.6}
          />
        </motion.div>

        {/* Referral Link Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mx-auto mb-8 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:rounded-3xl dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  Your Referral Link
                </h2>
                <p className="text-sm text-white/90">
                  Share and earn 50 credits per referral
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">

            {/* Referral Code */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Referral Code
              </label>
              <div className="flex gap-2">
                <div className="flex-1 rounded-xl border-2 border-blue-200 bg-blue-50/50 px-4 py-3 font-mono text-lg font-bold text-blue-600 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
                  {referralInfo?.referralCode ?? "Loading..."}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => copyToClipboard(referralInfo?.referralCode ?? "")}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      Copy
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Referral Link */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Referral Link
              </label>
              <div className="flex gap-2">
                <div className="flex-1 overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                  <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                    {referralInfo?.referralLink ?? "Loading..."}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => copyToClipboard(referralInfo?.referralLink ?? "")}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      Copy
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mx-auto mb-8 max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:rounded-3xl sm:p-8 dark:border-slate-700 dark:bg-slate-800"
        >
          <h3 className="mb-8 text-center text-2xl font-bold text-slate-900 dark:text-white">
            How It Works
          </h3>
          <div className="grid gap-8 sm:grid-cols-3">
            <HowItWorksStep
              icon={<Users className="h-7 w-7" />}
              step="1"
              title="Share Your Link"
              description="Send your unique referral link to friends, colleagues, or on social media"
              gradient="from-blue-500 to-cyan-500"
              delay={0.9}
            />
            <HowItWorksStep
              icon={<CheckCircle2 className="h-7 w-7" />}
              step="2"
              title="They Subscribe"
              description="When they sign up and subscribe to any paid tier, the referral is tracked"
              gradient="from-green-500 to-emerald-500"
              delay={1.0}
            />
            <HowItWorksStep
              icon={<Gift className="h-7 w-7" />}
              step="3"
              title="Earn Credits"
              description="You automatically receive 50 credits added to your account!"
              gradient="from-indigo-500 to-purple-500"
              delay={1.1}
            />
          </div>
        </motion.div>

        {/* Recent Referrals */}
        {referralInfo?.recentReferrals && referralInfo.recentReferrals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:rounded-3xl sm:p-8 dark:border-slate-700 dark:bg-slate-800"
          >
            <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
              Recent Referrals
            </h3>
            <div className="space-y-3">
              {referralInfo.recentReferrals.map((referral, index) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.3 + index * 0.1 }}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        referral.status === "rewarded"
                          ? "bg-green-500 shadow-lg shadow-green-500/50"
                          : "bg-amber-500 shadow-lg shadow-amber-500/50"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Referral {referral.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        referral.status === "rewarded"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {referral.status === "rewarded" ? "Completed" : "Pending"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="mx-auto mt-8 max-w-4xl rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 sm:rounded-3xl sm:p-8 dark:border-blue-900/30 dark:from-blue-950/30 dark:to-cyan-950/30"
        >
          <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
            Terms & Conditions
          </h3>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 rounded-full bg-blue-100 p-1 dark:bg-blue-900/30">
                <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span>You earn <strong className="text-blue-600 dark:text-blue-400">50 credits</strong> for each friend who subscribes to a paid plan</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 rounded-full bg-blue-100 p-1 dark:bg-blue-900/30">
                <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Credits are awarded automatically when the subscription is confirmed</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 rounded-full bg-blue-100 p-1 dark:bg-blue-900/30">
                <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Referral credits never expire and can be used anytime</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 rounded-full bg-blue-100 p-1 dark:bg-blue-900/30">
                <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Only new users who haven&apos;t previously subscribed are eligible</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 rounded-full bg-blue-100 p-1 dark:bg-blue-900/30">
                <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Self-referrals are not permitted</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
