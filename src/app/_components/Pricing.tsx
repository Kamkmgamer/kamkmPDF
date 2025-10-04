"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, Sparkles, ArrowRight } from "lucide-react";
import { tiers } from "../_data/tiers";

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-white to-slate-50 py-32 dark:from-slate-900 dark:to-slate-950"
      suppressHydrationWarning={true}
    >
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/10 to-teal-400/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="mb-20 text-center">
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-4 w-4" />
            <span>Pricing Plans</span>
          </motion.div>

          <motion.h2
            className="mb-6 text-5xl font-black tracking-tight text-slate-900 lg:text-6xl dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Simple, transparent pricing
          </motion.h2>
        </div>

        <motion.div
          className="mx-auto grid max-w-7xl gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {tiers.map((plan, index) => (
            <motion.div
              key={index}
              className={`group relative ${plan.popular ? "lg:-mt-4 lg:scale-105" : ""}`}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              whileHover={{ y: -8, scale: plan.popular ? 1.05 : 1.02 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Glow effect on hover */}
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${plan.color} rounded-3xl opacity-0 blur-xl transition duration-500 group-hover:opacity-60`}
              />

              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl border bg-white p-6 sm:p-8 shadow-2xl transition-all duration-300 dark:bg-slate-800 ${
                  plan.popular
                    ? "border-blue-500/50 dark:border-blue-400/50"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-bold text-white shadow-xl whitespace-nowrap">
                      <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                {/* Icon */}
                <motion.div
                  className={`mb-4 sm:mb-6 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${plan.color} shadow-xl`}
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <plan.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </motion.div>

                {/* Plan name and description */}
                <h3 className="mb-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-baseline flex-wrap gap-1">
                    <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-4xl sm:text-5xl font-black text-transparent dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400">
                      ${plan.price}
                    </span>
                    <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                      /month
                    </span>
                  </div>
                  {plan.priceYearly > 0 && (
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      or ${plan.priceYearly}/year{" "}
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        (save 17%)
                      </span>
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-6 sm:mb-8 flex-grow space-y-2 sm:space-y-3">
                  {plan.features.slice(0, 6).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 sm:gap-3">
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
                  <Link
                    href={plan.id === "enterprise" ? "/contact" : "/dashboard"}
                    className={`group/btn relative flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-5 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-bold transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
