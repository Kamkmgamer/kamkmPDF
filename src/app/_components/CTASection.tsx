"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function CTASection() {
  const { isSignedIn } = useAuth();

  return (
    <section
      id="cta"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-r from-sky-500 to-cyan-600 py-20 text-white"
    >
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-10 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent_60%)] blur-2xl" />
        <div className="absolute right-16 -bottom-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_60%)] blur-2xl" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <motion.h2
          className="mb-6 text-4xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          Ready to transform your workflow?
        </motion.h2>
        <motion.p
          className="mx-auto mb-8 max-w-2xl text-xl opacity-90"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
        >
          Join thousands of professionals who are already saving hours with
          AI-powered PDF generation.
        </motion.p>

        <motion.div
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
        >
          <Link
            href="/dashboard"
            className="group flex items-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:from-sky-600 hover:to-cyan-700"
          >
            {isSignedIn ? "Go to Dashboard" : "Start Free Trial"}
            <span className="ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <Link
            href="/dashboard/new"
            className="group flex items-center rounded-xl border-2 border-[--color-border] bg-blue-500/80 px-8 py-4 text-lg font-semibold text-[--color-text-primary] shadow-sm transition-all duration-200 hover:bg-blue-400 hover:shadow-lg dark:border-white/30 dark:bg-transparent dark:hover:bg-blue-100/20 dark:hover:shadow-xl"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            Try Demo
            <span className="ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>

        <p className="mt-6 text-sm opacity-75">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}
