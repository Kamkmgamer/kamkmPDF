"use client";

import { motion } from "framer-motion";
import { Crown, Check, ArrowRight, Sparkles, Zap, Shield, Users, Globe, Rocket } from "lucide-react";
import Link from "next/link";

export function EnterpriseSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative mt-24 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl [animation-delay:1s]" />
      </div>

      {/* Main Container */}
      <div className="relative rounded-3xl border-2 border-purple-200/50 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-8 shadow-2xl dark:border-purple-900/30 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-indigo-950/30 lg:p-12">
        {/* Animated Border Glow */}
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30" />

        {/* Header Section */}
        <div className="mb-8 text-center lg:mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 inline-flex items-center justify-center"
          >
            <div className="relative">
              {/* Animated rings */}
              <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-75" />
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-50 [animation-delay:0.5s]" />
              
              {/* Icon container */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 shadow-2xl lg:h-24 lg:w-24">
                <Crown className="h-10 w-10 text-white lg:h-12 lg:w-12" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
              <Sparkles className="h-4 w-4" />
              <span>Premium Enterprise Solution</span>
            </div>
            <h2 className="mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-4xl font-black text-transparent lg:text-5xl xl:text-6xl">
              Enterprise
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-700 dark:text-gray-300 lg:text-xl">
              Custom solutions designed for large organizations with unlimited scale and dedicated support
            </p>
          </motion.div>
        </div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8 text-center lg:mb-12"
        >
          <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Starting at
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-5xl font-black text-transparent lg:text-6xl xl:text-7xl">
              $500
            </span>
            <span className="text-2xl font-semibold text-gray-600 dark:text-gray-400">/month</span>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Custom pricing available • Volume discounts • Flexible contracts
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {[
            {
              icon: Zap,
              title: "Unlimited Everything",
              description: "No limits on PDFs, storage, or team members",
              color: "from-yellow-500 to-orange-500",
            },
            {
              icon: Shield,
              title: "Enterprise Security",
              description: "SSO, SAML, advanced permissions & compliance",
              color: "from-blue-500 to-cyan-500",
            },
            {
              icon: Users,
              title: "Dedicated Support",
              description: "24/7 priority support with account manager",
              color: "from-green-500 to-emerald-500",
            },
            {
              icon: Rocket,
              title: "Custom AI Models",
              description: "Fine-tuned models trained on your data",
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: Globe,
              title: "White-Label Options",
              description: "Full branding customization & custom domain",
              color: "from-indigo-500 to-purple-500",
            },
            {
              icon: Sparkles,
              title: "Priority Processing",
              description: "<15 second generation with dedicated servers",
              color: "from-pink-500 to-rose-500",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-purple-200/50 bg-white/80 p-6 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl dark:border-purple-900/30 dark:bg-slate-800/80"
            >
              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity group-hover:opacity-10`} />
              
              <div className="relative">
                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-10 rounded-2xl border border-purple-200/50 bg-white/50 p-6 backdrop-blur-sm dark:border-purple-900/30 dark:bg-slate-800/50 lg:p-8"
        >
          <h3 className="mb-6 text-center text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">
            Everything in Business, plus:
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Unlimited PDFs & storage",
              "Unlimited team seats",
              "Custom AI model training",
              "White-label & custom domain",
              "SSO & SAML authentication",
              "Advanced role permissions",
              "Dedicated account manager",
              "24/7 priority support",
              "SLA guarantees",
              "Custom integrations",
              "API rate limit increases",
              "Compliance certifications",
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center"
        >
          <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
            Ready to scale your PDF generation to enterprise level?
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all hover:shadow-purple-500/50"
              >
                <span>Contact Sales</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/enterprise-demo"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-purple-300 bg-white/80 px-8 py-4 text-lg font-bold text-purple-600 backdrop-blur-sm transition-all hover:bg-purple-50 dark:border-purple-700 dark:bg-slate-800/80 dark:text-purple-400 dark:hover:bg-slate-700"
              >
                <span>Schedule Demo</span>
                <Sparkles className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            Trusted by Fortune 500 companies • SOC 2 Type II Certified • GDPR Compliant
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
