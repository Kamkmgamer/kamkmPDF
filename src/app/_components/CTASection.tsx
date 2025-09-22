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
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-[--color-primary] shadow-sm transition-colors hover:bg-gray-100 hover:shadow-md"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-[--color-primary] shadow-sm transition-colors hover:bg-gray-100 hover:shadow-md"
            >
              Start Free Trial
            </Link>
          )}

          <Link
            href="/dashboard/new"
            className="rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold shadow-sm transition-colors hover:bg-white hover:text-[--color-primary] hover:shadow-md"
          >
            Try Demo
          </Link>
        </motion.div>

        <p className="mt-6 text-sm opacity-75">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}
