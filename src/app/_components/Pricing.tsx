"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Crown,
  Rocket,
  ChevronDown,
  Clock,
} from "lucide-react";
import { tiers } from "../_data/tiers";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const auth = useAuth();
  const isSignedIn = auth?.isSignedIn ?? false;

  const handleUpgrade = async (tierId: string) => {
    // Starter is free, redirect to sign up or dashboard
    if (tierId === "starter") {
      window.location.href = isSignedIn ? "/dashboard" : "/sign-up";
      return;
    }

    // Enterprise requires contact
    if (tierId === "enterprise") {
      window.location.href = "/contact";
      return;
    }

    // For paid tiers, redirect to Polar checkout
    setLoadingTier(tierId);

    try {
      // Fetch product ID from database
      const response = await fetch(`/api/products/${tierId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }

      const data = (await response.json()) as { productId?: string };

      if (!data.productId) {
        throw new Error("Product ID not found");
      }

      // Redirect to Polar checkout
      window.location.href = `/api/polar/create-checkout?products=${data.productId}`;
    } catch (error) {
      console.error("Failed to start checkout:", error);
      alert("Failed to start checkout. Please try again.");
      setLoadingTier(null);
    }
  };

  const faqs = [
    {
      q: "Can I change plans anytime?",
      a: "Yes! Upgrade or downgrade instantly. You'll be charged pro-rata for the remainder of your billing period.",
    },
    {
      q: "What happens if I exceed my quota?",
      a: "We'll notify you at 80% usage. You can upgrade anytime or purchase additional credits without losing your current plan benefits.",
    },
    {
      q: "Do you offer refunds?",
      a: "Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards and wire transfers for Enterprise plans. Payments are securely processed through Polar.sh.",
    },
  ];

  return (
    <section
      id="pricing"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white py-24 lg:py-32 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
      suppressHydrationWarning={true}
    >
      {/* Animated Mesh Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20" />
        <motion.div
          className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-purple-500/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 25, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 30, ease: "linear" }}
        />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-16 text-center lg:mb-24">
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2.5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">
              Transparent Pricing
            </span>
          </motion.div>

          <motion.h2
            className="mb-6 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-5xl font-black tracking-tight text-transparent lg:text-7xl dark:from-white dark:via-blue-100 dark:to-cyan-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Choose Your Power Level
          </motion.h2>

          <motion.p
            className="mx-auto mb-12 max-w-2xl text-lg text-slate-600 lg:text-xl dark:text-slate-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            From hobbyists to enterprises, we&apos;ve got a plan that scales
            with your ambitions.
            <span className="mt-2 block text-sm text-emerald-600 dark:text-emerald-400">
              Every tier starts with a 15-day free trial
            </span>
            <span className="mt-2 block text-sm text-cyan-600 dark:text-cyan-400">
              ✨ 30-day money-back guarantee on all plans
            </span>
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            className="mx-auto inline-flex items-center justify-center gap-4 rounded-full border border-slate-300 bg-white/80 p-2 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`relative rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                billingCycle === "monthly"
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              {billingCycle === "monthly" && (
                <motion.div
                  layoutId="billing-toggle"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Monthly</span>
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`relative rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                billingCycle === "yearly"
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              {billingCycle === "yearly" && (
                <motion.div
                  layoutId="billing-toggle"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                Yearly
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                  Save 17%
                </span>
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards - Responsive Grid Layout */}
        <motion.div
          className="mx-auto mb-24 grid max-w-7xl grid-cols-1 gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
        >
          {tiers.map((plan) => {
            const Icon = plan.icon;
            const price =
              billingCycle === "yearly" ? plan.priceYearly : plan.price;
            const displayPrice =
              billingCycle === "yearly" ? (price / 12).toFixed(2) : price;
            const isLoading = loadingTier === plan.id;

            // Responsive grid layout classes
            const layoutClasses =
              plan.id === "enterprise" ? "sm:col-span-2 lg:col-span-1" : "";

            return (
              <motion.div
                key={plan.id}
                className={`group relative ${layoutClasses} ${plan.popular ? "pt-6" : ""}`}
                variants={{
                  hidden: { opacity: 0, y: 50, rotateX: -15 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    transition: { type: "spring", bounce: 0.4 },
                  },
                }}
                onMouseEnter={() => setHoveredCard(plan.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Animated Glow Effect */}
                <motion.div
                  className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${plan.color} blur-2xl will-change-[opacity]`}
                  style={{ top: plan.popular ? "-1.5rem" : "-0.25rem" }}
                  animate={{
                    opacity:
                      hoveredCard === plan.id ? 0.6 : plan.popular ? 0.3 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />

                {/* Card Content */}
                <motion.div
                  className={`relative flex h-full flex-col rounded-2xl border p-6 backdrop-blur-xl will-change-transform ${
                    plan.popular
                      ? "border-blue-500/30 bg-gradient-to-br from-blue-50/90 via-white/80 to-cyan-50/30 shadow-2xl shadow-blue-500/20 dark:border-blue-500/50 dark:from-slate-800/90 dark:via-slate-800/80 dark:to-blue-900/30"
                      : "border-slate-300/50 bg-white/80 hover:border-slate-400/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:border-slate-600/50"
                  }`}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 0.5,
                  }}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <motion.div
                      className="absolute -top-4 left-1/2 z-20 -translate-x-1/2"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 px-4 py-1.5 whitespace-nowrap shadow-xl shadow-blue-500/50">
                        <Crown className="h-3.5 w-3.5 flex-shrink-0 text-yellow-300" />
                        <span className="text-[10px] font-bold tracking-wide text-white uppercase">
                          Most Popular
                        </span>
                        <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-yellow-300" />
                      </div>
                    </motion.div>
                  )}

                  {/* Icon */}
                  <motion.div
                    className={`mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${plan.color} p-2.5 shadow-lg will-change-transform`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </motion.div>

                  {/* Plan Name & Description */}
                  <h3 className="mb-2 text-xl font-black text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mb-4 text-xs text-slate-600 dark:text-slate-400">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-4xl leading-none font-black text-transparent dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400">
                        ${displayPrice}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        /month
                      </span>
                    </div>
                    {billingCycle === "yearly" && price > 0 && (
                      <motion.p
                        className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-green-500/10 px-2 py-1 text-[10px] font-semibold text-green-600 dark:text-green-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                      >
                        <TrendingUp className="h-3 w-3" />
                        Save ${(plan.price * 12 - plan.priceYearly).toFixed(0)}
                        /year
                      </motion.p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mb-4 flex-grow space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: featureIndex * 0.05 }}
                      >
                        {feature.included ? (
                          <div className="mt-0.5 flex-shrink-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 p-0.5 shadow-sm shadow-green-500/30">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        ) : (
                          <div className="mt-0.5 flex-shrink-0 rounded-full bg-slate-300 p-0.5 dark:bg-slate-700">
                            <X className="h-2.5 w-2.5 text-slate-500 dark:text-slate-500" />
                          </div>
                        )}
                        <span
                          className={`text-[11px] leading-relaxed ${
                            feature.included
                              ? "font-medium text-slate-700 dark:text-slate-200"
                              : "text-slate-400 line-through dark:text-slate-500"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isLoading}
                      className={`group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg px-4 py-2.5 text-xs font-bold transition-all duration-200 will-change-[box-shadow] disabled:cursor-not-allowed disabled:opacity-50 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/70"
                          : "border border-slate-300 bg-slate-100/50 text-slate-900 hover:border-slate-400 hover:bg-slate-200/50 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:hover:border-slate-500 dark:hover:bg-slate-700"
                      }`}
                    >
                      {!isLoading && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10">
                        {isLoading ? "Loading..." : plan.cta}
                      </span>
                      {!isLoading && (
                        <ArrowRight className="relative z-10 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                      )}
                    </button>
                  </motion.div>

                  {/* Trust Badge for Popular Plan */}
                  {plan.popular && (
                    <motion.div
                      className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-600 dark:text-slate-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Shield className="h-3 w-3 text-green-600 dark:text-green-400" />
                      <span>30-day guarantee</span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="mx-auto mb-24 max-w-5xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              {
                icon: Shield,
                label: "Bank-level Security",
                desc: "256-bit SSL",
              },
              { icon: Clock, label: "99.9% Uptime", desc: "SLA Guaranteed" },
              { icon: Users, label: "50K+ Users", desc: "Trusted Worldwide" },
              { icon: Zap, label: "Lightning Fast", desc: "<2s Processing" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-3 rounded-2xl border border-slate-300/50 bg-white/30 p-6 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/30"
                whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.5)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <item.icon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-3xl font-black text-slate-900 lg:text-4xl dark:text-white">
              Frequently Asked Questions
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-300/50 bg-white/30 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/30"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-slate-200/30 dark:hover:bg-slate-700/30"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="border-t border-slate-300/50 px-6 py-4 text-sm text-slate-600 dark:border-slate-700/50 dark:text-slate-400">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-2xl rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-100/50 via-white/50 to-cyan-100/50 p-12 backdrop-blur-xl dark:border-blue-500/30 dark:from-blue-900/30 dark:via-slate-800/50 dark:to-purple-900/30">
            <Rocket className="mx-auto mb-6 h-16 w-16 text-blue-500 dark:text-blue-400" />
            <h3 className="mb-4 text-3xl font-black text-slate-900 dark:text-white">
              Still have questions?
            </h3>
            <p className="mb-8 text-slate-700 dark:text-slate-300">
              Our team is here to help. Get in touch and we&apos;ll respond
              within 24 hours.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 font-bold text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/50"
              >
                Contact Sales
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100/50 px-8 py-4 font-bold text-slate-900 transition-all hover:bg-slate-200/50 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:hover:bg-slate-700"
              >
                Start Free Trial
                <Sparkles className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
