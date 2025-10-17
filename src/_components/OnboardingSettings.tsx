"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, CheckCircle, HelpCircle } from "lucide-react";
import { useOnboarding } from "./hooks/useOnboarding";

/**
 * Settings section for managing onboarding tutorial
 * Can be integrated into your settings/preferences page
 *
 * @example
 * ```tsx
 * // In your settings page
 * import OnboardingSettings from "~/_components/OnboardingSettings";
 *
 * export default function SettingsPage() {
 *   return (
 *     <div>
 *       <h1>Settings</h1>
 *       <OnboardingSettings />
 *     </div>
 *   );
 * }
 * ```
 */
export default function OnboardingSettings() {
  const { hasCompleted, resetOnboarding } = useOnboarding();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleReset = () => {
    resetOnboarding();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
            Welcome Tutorial
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {hasCompleted
              ? "You've completed the welcome tutorial. Need a refresher? You can view it again anytime."
              : "The welcome tutorial will show automatically on your next visit to the dashboard."}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              onClick={handleReset}
              disabled={showSuccess}
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw
                className={`h-4 w-4 transition-transform ${
                  showSuccess ? "" : "group-hover:rotate-180"
                }`}
              />
              <span>
                {showSuccess ? "Tutorial Reset!" : "Show Tutorial Again"}
              </span>
            </motion.button>

            {showSuccess && (
              <motion.div
                className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <CheckCircle className="h-4 w-4" />
                <span>Visit the dashboard to see it!</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 dark:border-slate-700" />
    </div>
  );
}
