import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SubscriptionSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        {/* Success Card with Modern Design */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white/80 p-10 text-center shadow-2xl shadow-gray-900/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
          {/* Decorative gradients */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-400/20 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl"></div>

          <div className="relative z-10">
            <div className="mb-8">
              {/* Animated success icon */}
              <div className="mx-auto mb-6 flex h-20 w-20 animate-bounce items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="mb-3 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-3xl font-bold text-transparent">
                Welcome to your new plan! 🎉
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Your subscription is now active and you have access to all the
                premium features.
              </p>
            </div>

            <div className="mb-8 space-y-4">
              <div className="rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-left dark:border-blue-800/50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <h3 className="mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-lg font-bold text-transparent">
                  What&apos;s next?
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"></span>
                    Your new quotas are now active
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"></span>
                    Access premium AI models immediately
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"></span>
                    Upload larger files with increased limits
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"></span>
                    Use all premium templates
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="group relative block w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95"
              >
                <span className="relative z-10">Go to Dashboard</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
              </Link>
              <Link
                href="/"
                className="block w-full rounded-2xl border border-gray-200 bg-white/80 px-6 py-3.5 font-semibold text-gray-700 shadow-lg shadow-gray-900/5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/50 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300"
              >
                Create Your First PDF
              </Link>
            </div>

            <div className="mt-8 border-t border-gray-200/50 pt-6 dark:border-gray-700/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Need help? Check out our{" "}
                <Link
                  href="/help"
                  className="font-semibold text-blue-600 transition-colors hover:text-indigo-600 dark:text-blue-400 dark:hover:text-indigo-400"
                >
                  documentation
                </Link>{" "}
                or{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-blue-600 transition-colors hover:text-indigo-600 dark:text-blue-400 dark:hover:text-indigo-400"
                >
                  contact support
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
