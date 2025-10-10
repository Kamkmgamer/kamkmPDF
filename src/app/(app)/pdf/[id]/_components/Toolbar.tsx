"use client";

import ThemeToggle from "~/_components/ThemeToggle";
import type { Job } from "~/types/pdf";

interface ToolbarProps {
  job: Job;
  onBack: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onShare: () => void;
  onRegenerate: () => void;
  onToggleThumbnails?: () => void;
  isRegenerating?: boolean;
}

export function Toolbar({
  job,
  onBack,
  onDownload,
  onPrint,
  onShare,
  onRegenerate,
  onToggleThumbnails,
  isRegenerating = false,
}: ToolbarProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-2 py-2 shadow-sm sm:px-4 dark:border-gray-700 dark:bg-gray-800">
      {/* Mobile Layout */}
      <div className="flex flex-col space-y-2 sm:hidden">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 rounded-md px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm">Back</span>
          </button>

          <div className="flex items-center space-x-1">
            {onToggleThumbnails && (
              <button
                onClick={onToggleThumbnails}
                className="rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle thumbnails sidebar"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>

        <h1 className="truncate px-2 text-base font-semibold text-gray-900 dark:text-gray-100">
          {job.prompt && job.prompt.length > 30
            ? `${job.prompt.substring(0, 30)}...`
            : (job.prompt ?? "Untitled PDF")}
        </h1>

        <div className="flex items-center justify-center space-x-2 px-2">
          <button
            onClick={onDownload}
            className="flex items-center space-x-1 rounded-md border border-gray-300 px-2 py-1 text-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Download</span>
          </button>

          <button
            onClick={onShare}
            className="flex items-center space-x-1 rounded-md border border-gray-300 px-2 py-1 text-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            <span>Share</span>
          </button>

          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className={`flex items-center space-x-1 rounded-md border px-2 py-1 text-sm transition-colors ${
              isRegenerating
                ? "cursor-not-allowed border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700"
                : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            }`}
          >
            {isRegenerating ? (
              <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-gray-600"></div>
            ) : (
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            <span>{isRegenerating ? "..." : "Regen"}</span>
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden flex-wrap items-center justify-between gap-y-2 sm:flex">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 rounded-md px-3 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Dashboard</span>
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          <h1 className="max-w-md truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
            {job.prompt && job.prompt.length > 50
              ? `${job.prompt.substring(0, 50)}...`
              : (job.prompt ?? "Untitled PDF")}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onDownload}
            className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-1 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Download</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-1 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span>Print</span>
          </button>

          <button
            onClick={onShare}
            className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-1 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            <span>Share</span>
          </button>

          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className={`flex items-center space-x-2 rounded-md border px-3 py-1 transition-colors ${
              isRegenerating
                ? "cursor-not-allowed border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700"
                : "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            }`}
          >
            {isRegenerating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-600"></div>
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            <span>{isRegenerating ? "Regenerating..." : "Regenerate"}</span>
          </button>

          {onToggleThumbnails && (
            <button
              onClick={onToggleThumbnails}
              className="rounded-md px-3 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle thumbnails sidebar"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          )}

          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
