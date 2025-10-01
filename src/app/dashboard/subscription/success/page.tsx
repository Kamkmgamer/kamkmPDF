import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SubscriptionSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-gray-800">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to your new plan! 🎉
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Your subscription is now active and you have access to all the
              premium features.
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-900/20">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                What&apos;s next?
              </h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>• Your new quotas are now active</li>
                <li>• Access premium AI models immediately</li>
                <li>• Upload larger files with increased limits</li>
                <li>• Use all premium templates</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/dashboard/new"
              className="block w-full rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Create Your First PDF
            </Link>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? Check out our{" "}
              <Link
                href="/help"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                documentation
              </Link>{" "}
              or{" "}
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                contact support
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
