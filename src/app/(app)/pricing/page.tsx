"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { Check, X, Sparkles, ArrowRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UpgradeButton } from "~/_components/UpgradeButton";
import { api } from "~/trpc/react";
import { tiers } from "~/app/_data/tiers";
import { useState } from "react";

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const { data: currentSub } = api.subscription.getCurrent.useQuery(undefined, {
    enabled: isSignedIn,
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/10 to-teal-400/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative mx-auto max-w-7xl overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Sparkles className="h-4 w-4" />
            <span>Pricing Plans</span>
          </motion.div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl dark:text-white">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>

          {currentSub && (
            <motion.div
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
              <span>
                Current plan:{" "}
                <span className="capitalize">{currentSub.tier}</span>
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="mx-auto mt-12 grid gap-4 sm:mt-16 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-[90rem]">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            const isCurrentTier = currentSub?.tier === tier.id;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`group relative ${tier.popular ? "md:-mt-2 lg:-mt-4 lg:scale-105" : ""}`}
                whileHover={{ y: -4, scale: tier.popular ? 1.03 : 1.01 }}
              >
                {/* Badges positioned outside the card */}
                {tier.popular && !isCurrentTier && (
                  <div className="absolute -top-5 left-1/2 z-10 -translate-x-1/2">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 px-4 py-1.5 text-xs font-bold text-white shadow-xl">
                      <Sparkles className="h-3 w-3" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                {isCurrentTier && (
                  <div className="absolute -top-5 left-1/2 z-10 -translate-x-1/2">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-1.5 text-xs font-bold text-white shadow-xl">
                      <Check className="h-3 w-3" />
                      <span>Current Plan</span>
                    </div>
                  </div>
                )}

                {/* Glow effect */}
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${tier.color} pointer-events-none rounded-3xl opacity-0 blur-xl transition duration-500 group-hover:opacity-60`}
                />

                <div
                  className={`relative flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl border bg-white p-4 sm:p-6 lg:p-8 shadow-xl sm:shadow-2xl transition-all duration-300 dark:bg-slate-800 ${
                    tier.popular
                      ? "border-blue-500/50 dark:border-blue-400/50"
                      : isCurrentTier
                        ? "border-green-500/50 dark:border-green-400/50"
                        : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {/* Icon */}
                  <motion.div
                    className={`mb-4 sm:mb-6 inline-flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${tier.color} shadow-lg sm:shadow-xl`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                  </motion.div>

                  {/* Tier Name */}
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {tier.name}
                  </h3>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="mt-4 mb-4 sm:mt-6 sm:mb-6">
                    <div className="flex items-baseline flex-wrap gap-x-1 sm:gap-x-2">
                      <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-3xl sm:text-4xl lg:text-5xl font-black text-transparent dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400">
                        ${tier.price}
                      </span>
                      <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        /month
                      </span>
                    </div>
                    {tier.priceYearly > 0 && (
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        or ${tier.priceYearly}/year{" "}
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          (save 17%)
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mb-6 sm:mb-8 flex-1 space-y-2 sm:space-y-3">
                    {tier.features.slice(0, 6).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-3">
                        {feature.included ? (
                          <div className="mt-0.5 flex-shrink-0 rounded-full bg-green-100 p-0.5 sm:p-1 dark:bg-green-900/30">
                            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="mt-0.5 flex-shrink-0 rounded-full bg-slate-100 p-0.5 sm:p-1 dark:bg-slate-800">
                            <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400 dark:text-slate-600" />
                          </div>
                        )}
                        <span
                          className={`text-xs sm:text-sm ${feature.included ? "text-slate-700 dark:text-slate-300" : "text-slate-400 line-through dark:text-slate-600"}`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isCurrentTier ? (
                      <Link
                        href="/dashboard"
                        className="flex w-full items-center justify-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl lg:rounded-2xl bg-slate-100 px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base font-bold text-slate-900 transition-all duration-300 hover:bg-slate-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                      >
                        <span className="whitespace-nowrap">Manage Plan</span>
                        <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    ) : tier.id === "starter" ? (
                      <Link
                        href={isSignedIn ? "/dashboard" : "/sign-up"}
                        className={`flex w-full items-center justify-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl lg:rounded-2xl px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base font-bold transition-all duration-300 ${
                          tier.popular
                            ? "bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 text-white shadow-lg sm:shadow-xl shadow-blue-500/30 hover:shadow-xl sm:hover:shadow-2xl hover:shadow-blue-500/40"
                            : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                        }`}
                      >
                        <span className="whitespace-nowrap">{tier.cta}</span>
                        <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    ) : tier.id === "enterprise" ? (
                      <Link
                        href="/contact"
                        className={`flex w-full items-center justify-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl lg:rounded-2xl px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base font-bold transition-all duration-300 ${
                          tier.popular
                            ? "bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 text-white shadow-lg sm:shadow-xl shadow-blue-500/30 hover:shadow-xl sm:hover:shadow-2xl hover:shadow-blue-500/40"
                            : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                        }`}
                      >
                        <span className="whitespace-nowrap">Contact Sales</span>
                        <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    ) : (
                      <div className="w-full">
                        <UpgradeButton
                          tier={
                            tier.id as
                              | "professional"
                              | "business"
                              | "enterprise"
                          }
                        >
                          Upgrade
                        </UpgradeButton>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 sm:mt-24 lg:mt-32"
        >
          <div className="mb-8 sm:mb-12 text-center">
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <HelpCircle className="h-4 w-4" />
              <span>FAQ</span>
            </motion.div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mx-auto mt-8 sm:mt-12 max-w-3xl space-y-3 sm:space-y-4 overflow-hidden">
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.",
              },
              {
                q: "What happens if I exceed my quota?",
                a: "You'll receive notifications at 80% usage. If you hit your limit, you can upgrade instantly or wait until next month's reset.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 14-day money-back guarantee on all paid plans. No questions asked.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              >
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 opacity-0 blur transition duration-300 group-hover:opacity-20" />
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="relative w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 text-left transition-all duration-300 hover:border-blue-500/50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-400/50"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="pr-4 sm:pr-8 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {faq.q}
                    </h3>
                    <motion.div
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {openFaq === index ? "−" : "+"}
                      </div>
                    </motion.div>
                  </div>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaq === index ? "auto" : 0,
                      opacity: openFaq === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                      {faq.a}
                    </p>
                  </motion.div>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="relative mt-16 mb-12 sm:mt-24 sm:mb-16 lg:mt-32 lg:mb-20 overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-sky-600 p-6 sm:p-10 lg:p-12 text-center"
        >
          {/* Animated background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
              Still have questions?
            </h2>
            <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base lg:text-lg text-white/90">
              Our team is here to help. Contact us for a personalized demo or to
              discuss custom Enterprise solutions.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col justify-center gap-3 sm:gap-4 sm:flex-row">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl bg-white px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-blue-600 shadow-lg sm:shadow-xl transition-all hover:bg-blue-50"
                >
                  <span>Contact Sales</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl border-2 border-white/30 bg-white/10 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-white backdrop-blur-xl transition-all hover:bg-white/20"
                >
                  <span>View Documentation</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
