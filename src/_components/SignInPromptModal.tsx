"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

interface SignInPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInPromptModal({
  isOpen,
  onClose,
}: SignInPromptModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm dark:bg-black/80"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-800"
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-3xl"></div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="p-8">
                {/* Icon */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>

                {/* Title */}
                <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
                  Your PDF is Ready!
                </h2>

                {/* Description */}
                <p className="mt-3 text-center text-gray-600 dark:text-gray-300">
                  Sign in or create an account to save and download your
                  generated PDF.
                </p>

                {/* Benefits */}
                <div className="mt-6 space-y-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Save and access your PDFs anytime
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Generate unlimited PDFs with AI
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Access premium templates and features
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-3">
                  <Link
                    href="/sign-up"
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40"
                  >
                    Create Free Account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/sign-in"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Sign In
                  </Link>
                </div>

                {/* Footer Note */}
                <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                  Free to start • No credit card required
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
