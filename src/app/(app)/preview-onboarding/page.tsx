"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, RefreshCw, X } from "lucide-react";
import Onboarding from "~/_components/Onboarding";
import DashboardLayout from "~/_components/DashboardLayout";

/**
 * Development preview page for testing onboarding
 * Access at: /preview-onboarding
 *
 * This page allows developers to:
 * - Preview the onboarding without clearing localStorage
 * - Test different scenarios
 * - See the onboarding in context
 */
export default function PreviewOnboardingPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handlePreview = () => {
    setShowOnboarding(true);
  };

  const handleReset = () => {
    localStorage.removeItem("onboardingCompleted");
    setShowOnboarding(false);
    alert("Onboarding reset! Visit /dashboard to see it.");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <motion.h1
              className="mb-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Onboarding Preview
            </motion.h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Test and preview the onboarding experience
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Current Status */}
            <motion.div
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <Eye className="h-5 w-5" />
                </span>
                Current Status
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    localStorage Key:
                  </span>
                  <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-blue-600 dark:bg-slate-800 dark:text-blue-400">
                    onboardingCompleted
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Value:
                  </span>
                  <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs dark:bg-slate-800">
                    {typeof window !== "undefined"
                      ? (localStorage.getItem("onboardingCompleted") ?? "null")
                      : "..."}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Will show on /dashboard:
                  </span>
                  <span
                    className={`font-semibold ${
                      typeof window !== "undefined" &&
                      !localStorage.getItem("onboardingCompleted")
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {typeof window !== "undefined" &&
                    !localStorage.getItem("onboardingCompleted")
                      ? "Yes"
                      : "No"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white">
                  <RefreshCw className="h-5 w-5" />
                </span>
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={handlePreview}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  <Eye className="mr-2 inline-block h-4 w-4" />
                  Preview Onboarding
                </button>
                <button
                  onClick={handleReset}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <RefreshCw className="mr-2 inline-block h-4 w-4" />
                  Reset & Clear localStorage
                </button>
              </div>
            </motion.div>
          </div>

          {/* Code Examples */}
          <motion.div
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
              Testing Commands
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Reset via Console:
                </h3>
                <code className="block rounded-lg bg-slate-100 p-3 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  localStorage.removeItem(&quot;onboardingCompleted&quot;);
                  <br />
                  location.reload();
                </code>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Check Status:
                </h3>
                <code className="block rounded-lg bg-slate-100 p-3 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  localStorage.getItem(&quot;onboardingCompleted&quot;);
                </code>
              </div>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-blue-900 dark:text-blue-300">
              💡 Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
              <li>
                • The onboarding automatically shows on{" "}
                <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-xs dark:bg-blue-900">
                  /dashboard
                </code>{" "}
                for first-time users
              </li>
              <li>
                • Users can skip at any step using the &quot;Skip&quot; button
                or close icon
              </li>
              <li>
                • Completion state is saved to localStorage with key{" "}
                <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-xs dark:bg-blue-900">
                  onboardingCompleted
                </code>
              </li>
              <li>
                • The onboarding is fully responsive and works on all devices
              </li>
            </ul>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-center">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Go to Dashboard
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </a>
          </div>
        </div>

        {/* Render onboarding for preview */}
        {showOnboarding && (
          <div className="relative z-50">
            <Onboarding />
            {/* Override the onboarding to show even if completed */}
            <motion.button
              onClick={() => setShowOnboarding(false)}
              className="fixed top-4 right-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-2xl transition-all duration-200 hover:bg-red-600"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
