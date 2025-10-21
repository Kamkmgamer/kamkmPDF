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
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-r from-sky-500 to-cyan-600 py-20 text-white dark:from-sky-700 dark:to-cyan-700"
    >
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_60%)] blur-[60px]" />
        <div className="absolute right-16 -bottom-28 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_60%)] blur-[70px]" />
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
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="group flex items-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:from-sky-600 hover:to-cyan-700"
          >
            {isSignedIn ? "Go to Dashboard" : "Start Free Trial"}
            <span className="ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <Link
            href="/"
            className="group flex items-center rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-white/15 hover:shadow-lg"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            Try Demo
            <span className="ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
