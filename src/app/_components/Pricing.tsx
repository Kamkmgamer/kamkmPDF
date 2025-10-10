"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
      a: "We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.",
    },
  ];

  return (
    <section
      id="pricing"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-24 lg:py-32"
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
            className="mb-6 bg-gradient-to-br from-white via-blue-100 to-cyan-200 bg-clip-text text-5xl font-black tracking-tight text-transparent lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Choose Your Power Level
          </motion.h2>

          <motion.p
            className="mx-auto mb-12 max-w-2xl text-lg text-slate-400 lg:text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            From hobbyists to enterprises, we&apos;ve got a plan that scales
            with your ambitions.
            <span className="mt-2 block text-sm text-cyan-400">
              ✨ 30-day money-back guarantee on all plans
            </span>
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            className="inline-flex items-center gap-4 rounded-full border border-slate-700 bg-slate-800/50 p-2 backdrop-blur-sm"
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
                  : "text-slate-400 hover:text-slate-300"
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
                  : "text-slate-400 hover:text-slate-300"
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

        {/* Pricing Cards - Bento Grid Layout */}
        <motion.div
          className="mx-auto mb-24 grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12 lg:gap-8"
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

            // Bento grid layout classes
            const layoutClasses =
              plan.id === "professional"
                ? "lg:col-span-4 lg:row-span-2"
                : plan.id === "enterprise"
                  ? "lg:col-span-6 md:col-span-2"
                  : "lg:col-span-4";

            return (
              <motion.div
                key={plan.id}
                className={`group relative ${layoutClasses}`}
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
                style={{ perspective: 1000 }}
              >
                {/* Animated Glow Effect */}
                <motion.div
                  className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${plan.color} opacity-0 blur-2xl transition-all duration-500`}
                  animate={{
                    opacity:
                      hoveredCard === plan.id ? 0.6 : plan.popular ? 0.3 : 0,
                  }}
                />

                {/* Card Content */}
                <motion.div
                  className={`relative flex h-full flex-col overflow-hidden rounded-3xl border backdrop-blur-xl transition-all duration-500 ${
                    plan.popular
                      ? "border-blue-500/50 bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-blue-900/30 shadow-2xl shadow-blue-500/20"
                      : "border-slate-700/50 bg-slate-800/50 hover:border-slate-600/50"
                  } ${plan.id === "professional" ? "p-8 lg:p-10" : "p-6 lg:p-8"}`}
                  whileHover={{
                    y: -8,
                    rotateX: hoveredCard === plan.id ? 5 : 0,
                    rotateY: hoveredCard === plan.id ? 2 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <motion.div
                      className="absolute -top-4 left-1/2 z-10 -translate-x-1/2"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 px-5 py-2 shadow-xl shadow-blue-500/50">
                        <Crown className="h-4 w-4 text-yellow-300" />
                        <span className="text-xs font-bold text-white">
                          MOST POPULAR
                        </span>
                        <Sparkles className="h-4 w-4 text-yellow-300" />
                      </div>
                    </motion.div>
                  )}

                  {/* Icon */}
                  <motion.div
                    className={`mb-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br ${plan.color} p-3 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </motion.div>

                  {/* Plan Name & Description */}
                  <h3
                    className={`mb-3 font-black text-white ${
                      plan.id === "professional"
                        ? "text-3xl lg:text-4xl"
                        : "text-2xl lg:text-3xl"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`mb-6 text-slate-400 ${
                      plan.id === "professional" ? "text-base" : "text-sm"
                    }`}
                  >
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-6xl font-black text-transparent">
                        ${displayPrice}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-400">/month</span>
                        {billingCycle === "yearly" && price > 0 && (
                          <span className="text-xs text-green-400">
                            billed yearly
                          </span>
                        )}
                      </div>
                    </div>
                    {billingCycle === "yearly" && price > 0 && (
                      <motion.p
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-1.5 text-sm font-semibold text-green-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                      >
                        <TrendingUp className="h-4 w-4" />
                        Save ${(plan.price * 12 - plan.priceYearly).toFixed(0)}
                        /year
                      </motion.p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mb-8 flex-grow space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: featureIndex * 0.05 }}
                      >
                        {feature.included ? (
                          <div className="mt-0.5 flex-shrink-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 p-1 shadow-lg shadow-green-500/30">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="mt-0.5 flex-shrink-0 rounded-full bg-slate-700 p-1">
                            <X className="h-3 w-3 text-slate-500" />
                          </div>
                        )}
                        <span
                          className={`text-sm ${
                            feature.included
                              ? "font-medium text-slate-200"
                              : "text-slate-500 line-through"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={
                        plan.id === "enterprise" ? "/contact" : "/dashboard"
                      }
                      className={`group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-4 font-bold transition-all duration-300 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70"
                          : "border border-slate-600 bg-slate-700/50 text-white hover:border-slate-500 hover:bg-slate-700"
                      }`}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                      <span className="relative z-10">{plan.cta}</span>
                      <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </motion.div>

                  {/* Trust Badge for Popular Plan */}
                  {plan.popular && (
                    <motion.div
                      className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Shield className="h-3 w-3 text-green-400" />
                      <span>30-day money-back guarantee</span>
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
                className="flex flex-col items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm"
                whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.5)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <item.icon className="h-8 w-8 text-blue-400" />
                <div className="text-center">
                  <p className="font-bold text-white">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
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
            <h3 className="mb-4 text-3xl font-black text-white lg:text-4xl">
              Frequently Asked Questions
            </h3>
            <p className="text-slate-400">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-slate-700/30"
                >
                  <span className="font-semibold text-white">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-slate-400" />
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
                      <div className="border-t border-slate-700/50 px-6 py-4 text-sm text-slate-400">
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
          <div className="mx-auto max-w-2xl rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-900/30 via-slate-800/50 to-purple-900/30 p-12 backdrop-blur-xl">
            <Rocket className="mx-auto mb-6 h-16 w-16 text-blue-400" />
            <h3 className="mb-4 text-3xl font-black text-white">
              Still have questions?
            </h3>
            <p className="mb-8 text-slate-300">
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
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-700/50 px-8 py-4 font-bold text-white transition-all hover:bg-slate-700"
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
