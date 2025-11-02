// app/cookies/page.tsx
"use client";

import { motion } from "framer-motion";
import { Cookie, Settings, BarChart, Shield, Mail } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const sections = [
  {
    title: "What are cookies?",
    text: "Cookies are small text files stored on your device by your browser. They help websites remember your preferences and improve your browsing experience.",
    icon: Cookie,
  },
  {
    title: "How we use cookies",
    text: "KamkmPDF uses cookies to provide core functionality, analyze usage, remember user settings, and deliver a smooth user experience.",
    icon: Settings,
  },
  {
    title: "Types of cookies we use",
    text: "We use strictly necessary cookies (for authentication and session handling), performance cookies (for analytics), and customization cookies (to remember your theme and preferences).",
    icon: BarChart,
  },
  {
    title: "Managing your cookies",
    text: "You can manage or delete cookies through your browser settings. Please note that disabling cookies may affect the functionality of KamkmPDF.",
    icon: Settings,
  },
  {
    title: "Third-party cookies",
    text: "Some third-party services integrated into KamkmPDF may use their own cookies, such as payment processors or analytics providers. These are governed by their respective privacy policies.",
    icon: Shield,
  },
];

export default function CookiesPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/10 to-teal-400/10 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative container mx-auto px-6 py-32 text-center">
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Cookie className="h-4 w-4" />
          <span>Legal</span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl font-black tracking-tight text-slate-900 lg:text-7xl dark:text-white"
        >
          Cookies Policy
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 max-w-3xl text-xl text-slate-600 dark:text-slate-400"
        >
          We value your privacy. This page explains how{" "}
          <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text font-semibold text-transparent dark:from-orange-400 dark:to-red-400">
            KamkmPDF
          </span>{" "}
          uses cookies to make our service fast, secure, and personalized.
        </motion.p>
      </section>

      {/* Policy Sections */}
      <section className="relative container mx-auto max-w-4xl px-6 py-20">
        <div className="space-y-6">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{
                delay: i * 0.05,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative"
              whileHover={{ y: -4 }}
            >
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-orange-600 to-red-600 opacity-0 blur transition duration-300 group-hover:opacity-20" />
              <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                      <s.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                      {s.title}
                    </h2>
                    <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                      {s.text}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ delay: 0, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-red-600 to-teal-600 p-16 text-center"
          >
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-4xl font-black text-white lg:text-5xl">
                Questions about cookies?
              </h2>
              <p className="mt-4 text-xl text-white/90">
                Reach out to us if you&apos;d like more information on how
                cookies are handled at KamkmPDF.
              </p>
              <div className="mt-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-orange-600 shadow-xl transition-all hover:bg-orange-50"
                  >
                    <Mail className="h-5 w-5" />
                    Contact Privacy Team
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
