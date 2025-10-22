"use client";

import { useState } from "react";
import { X, Rocket, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function ProPlusBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-4 shadow-lg dark:border-amber-900/30 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30"
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-amber-400/30 to-orange-400/30 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-yellow-400/30 to-amber-400/30 blur-2xl [animation-delay:1s]" />
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-3 rounded-full p-1 text-amber-600 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-75" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 shadow-lg">
                <Rocket className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 pr-8">
            <div className="mb-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4 animate-pulse text-amber-600 dark:text-amber-400" />
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">
                Pro+ Now Available!
              </h3>
            </div>
            <p className="mb-3 text-sm text-amber-800 dark:text-amber-200">
              Unlock <strong>double limits</strong>, <strong>AI watermark removal</strong>, and{" "}
              <strong>early access</strong> to beta tools and templates.
            </p>

            {/* Features */}
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm dark:bg-amber-900/50 dark:text-amber-100">
                <Zap className="h-3 w-3" />
                10,000 PDFs/month
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm dark:bg-amber-900/50 dark:text-amber-100">
                <Sparkles className="h-3 w-3" />
                No watermarks
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm dark:bg-amber-900/50 dark:text-amber-100">
                <Rocket className="h-3 w-3" />
                Priority processing
              </span>
            </div>

            {/* CTA */}
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              <span>Upgrade to Pro+</span>
              <Rocket className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
