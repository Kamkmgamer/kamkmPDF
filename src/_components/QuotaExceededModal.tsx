"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, AlertTriangle, ArrowUpRight, Zap } from "lucide-react";

interface QuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
  quotaType: "pdfs" | "storage";
  limit: number;
}

export default function QuotaExceededModal({
  isOpen,
  onClose,
  currentTier,
  quotaType,
  limit,
}: QuotaExceededModalProps) {
  const messages = {
    pdfs: {
      title: "Monthly PDF Limit Reached",
      description: `You've used all ${limit} PDFs in your ${currentTier} plan this month.`,
      suggestion:
        "Upgrade to a higher tier to continue generating PDFs or wait until next month's reset.",
    },
    storage: {
      title: "Storage Limit Reached",
      description: `You've reached your ${limit} GB storage limit on the ${currentTier} plan.`,
      suggestion:
        "Upgrade to get more storage space or delete some old files to free up space.",
    },
  };

  const message = messages[quotaType];

  const suggestedTiers = {
    starter: { name: "Professional", price: 12, pdfs: 50, storage: 2 },
    professional: { name: "Business", price: 79, pdfs: 500, storage: 50 },
    business: {
      name: "Enterprise",
      price: 500,
      pdfs: "Unlimited",
      storage: "Unlimited",
    },
  };

  const suggested =
    suggestedTiers[currentTier as keyof typeof suggestedTiers] ||
    suggestedTiers.starter;

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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm dark:bg-black/70"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="p-8">
                {/* Icon */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>

                {/* Title */}
                <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
                  {message.title}
                </h2>

                {/* Description */}
                <p className="mt-3 text-center text-gray-600 dark:text-gray-300">
                  {message.description}
                </p>
                <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                  {message.suggestion}
                </p>

                {/* Upgrade Suggestion Card */}
                <div className="mt-6 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:border-blue-800 dark:from-blue-900/30 dark:to-blue-800/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {suggested.name} Plan
                        </h3>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        ${suggested.price}
                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                          /month
                        </span>
                      </p>
                      <ul className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <li>
                          • {suggested.pdfs}{" "}
                          {typeof suggested.pdfs === "number"
                            ? "PDFs/month"
                            : "PDFs"}
                        </li>
                        <li>
                          • {suggested.storage}{" "}
                          {typeof suggested.storage === "number"
                            ? "GB storage"
                            : "storage"}
                        </li>
                        <li>• Premium AI models</li>
                        <li>• No watermarks</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <Link
                    href="/pricing"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700"
                  >
                    View Plans
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-lg border-2 border-gray-200 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Maybe Later
                  </button>
                </div>

                {/* Footer Note */}
                <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                  Your quota will reset at the start of next billing period
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
