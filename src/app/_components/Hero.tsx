"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useTheme } from "~/providers/ThemeProvider";

export default function Hero() {
  const { isSignedIn, isLoaded } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const features = [
    {
      icon: "✨",
      title: "AI-Powered",
      description:
        "Advanced AI transforms your prompts into professional documents",
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Generate PDFs in seconds, not hours",
    },
    {
      icon: "🛡️",
      title: "Enterprise Ready",
      description: "Secure, scalable, and built for teams",
    },
  ];

  return (
    <section
      className={`relative overflow-hidden text-[--color-text-primary] ${isDark ? "bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700" : "bg-white"}`}
      suppressHydrationWarning={true}
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        {/* Subtle light overlay; stronger in dark mode via existing gradient */}
        <div
          className={`absolute inset-0 -skew-y-1 transform bg-gradient-to-r from-transparent to-transparent ${
            isDark ? "via-white/5" : "via-black/[.02]"
          }`}
        />
        {/* Radial accents for light mode */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.25),transparent_60%)] blur-2xl" />
        <div className="absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.18),transparent_60%)] blur-2xl" />
        {/* Soft grid */}
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(2,6,23,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.06)_1px,transparent_1px)] [background-size:14px_14px] opacity-40 dark:opacity-20" />
      </div>

      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full border border-[--color-border] bg-[--color-surface]/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm dark:border-white/20 dark:bg-white/10">
            <span className="mr-2">✨</span>
            AI-Powered PDF Generation
          </div>

          {/* Main headline */}
          <motion.h1
            className="mb-6 text-5xl leading-tight font-bold tracking-tight lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Turn Prompts Into
            <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-300 dark:to-blue-100">
              {" "}
              Perfect PDFs
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-[--color-text-muted] lg:text-2xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          >
            Transform natural language into professional documents instantly.
            Create reports, proposals, and presentations with AI-powered
            precision.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            {isLoaded && isSignedIn ? (
              <Link
                href="/dashboard"
                className="group flex items-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:from-sky-600 hover:to-cyan-700"
              >
                Go to Dashboard
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="group flex items-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:from-sky-600 hover:to-cyan-700"
              >
                Start Free Trial
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            )}

            <Link
              href="/dashboard/new"
              className="rounded-xl border-2 border-[--color-border] bg-white/80 px-8 py-4 text-lg font-semibold text-[--color-text-primary] transition-all duration-200 hover:bg-white hover:shadow-lg dark:border-white/30 dark:bg-transparent dark:hover:bg-white/20 dark:hover:shadow-xl"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              Try Demo
            </Link>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-surface)] shadow-sm dark:bg-white/10">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[--color-text-primary] dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-[--color-text-muted]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
