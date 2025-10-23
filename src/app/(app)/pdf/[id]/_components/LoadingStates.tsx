"use client";

import type { GenerationStage } from "~/types/pdf";

interface LoadingStatesProps {
  type: "loading" | "processing" | "error" | "skeleton";
  message?: string;
  progress?: number; // 0-100 for progress indication
  stage?: GenerationStage | null;
}

export function LoadingStates({
  type,
  message,
  progress = 0,
  stage,
}: LoadingStatesProps) {
  if (type === "loading") {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900"
        role="status"
        aria-live="polite"
      >
        <div className="w-full max-w-md text-center">
          <div
            className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 sm:mb-5 sm:h-14 sm:w-14"
            aria-hidden="true"
          ></div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-100">
            Loading PDF
          </h2>
          <p className="px-4 text-sm text-gray-600 sm:text-base dark:text-gray-400" id="loading-status">
            Please wait while we load your document...
          </p>
        </div>
      </div>
    );
  }

  if (type === "skeleton") {
    return (
      <div
        className="flex h-screen bg-gray-50 dark:bg-gray-900"
        role="status"
        aria-live="polite"
        aria-label="Loading PDF interface"
      >
        {/* Skeleton Toolbar */}
        <div
          className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          aria-label="PDF viewer toolbar"
        >
          <div className="flex items-center space-x-4">
            <div
              className="h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              aria-hidden="true"
            ></div>
            <div
              className="h-6 w-px bg-gray-300 dark:bg-gray-600"
              aria-hidden="true"
            ></div>
            <div
              className="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              aria-hidden="true"
            ></div>
          </div>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                aria-hidden="true"
              ></div>
            ))}
          </div>
        </div>

        {/* Skeleton PDF Viewer Area */}
        <div className="flex flex-1">
          {/* Skeleton Sidebar */}
          <div
            className="w-64 border-r border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            aria-label="Page thumbnails sidebar"
          >
            <div className="space-y-3">
              <div
                className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                aria-hidden="true"
              ></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-3 p-2">
                  <div
                    className="h-16 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                    aria-hidden="true"
                  ></div>
                  <div className="flex-1">
                    <div
                      className="mb-1 h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                      aria-hidden="true"
                    ></div>
                    <div
                      className="h-2 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                      aria-hidden="true"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton PDF Content */}
          <div className="flex-1 p-8" aria-label="PDF content area">
            <div className="mx-auto max-w-4xl">
              {/* Skeleton PDF Pages */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    aria-label={`PDF page ${i} placeholder`}
                  >
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5, 6].map((line) => {
                        // Deterministic width between 60% and 100% based on indices
                        const widthPercent = ((i * 37 + line * 53) % 41) + 60;
                        return (
                          <div
                            key={line}
                            className="h-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                            style={{ width: `${widthPercent}%` }}
                            aria-hidden="true"
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Loading indicator */}
              <div
                className="fixed right-8 bottom-8 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"
                    aria-hidden="true"
                  ></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Loading PDF...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "processing") {
    const stepOrder: GenerationStage[] = [
      "Processing PDF",
      "Analyzing your request",
      "Generating content",
      "Formatting PDF",
      "Finalizing document",
    ];
    const activeIndex = stage ? stepOrder.indexOf(stage) : 0;
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900"
        role="status"
        aria-live="polite"
      >
        <div className="w-full max-w-md text-center">
          <div className="relative mb-6 sm:mb-8" aria-hidden="true">
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 sm:h-16 sm:w-16 dark:border-gray-700"></div>
            <div className="absolute inset-0 mx-auto h-14 w-14 animate-ping rounded-full border-4 border-transparent border-r-blue-400 sm:h-16 sm:w-16"></div>
          </div>
          <h2 className="mb-2 px-4 text-lg font-semibold text-gray-900 sm:mb-3 sm:text-xl dark:text-gray-100">
            {stage ?? "Processing PDF"}
          </h2>
          <p
            className="mb-6 px-4 text-sm leading-relaxed text-gray-600 sm:mb-8 sm:text-base dark:text-gray-400"
            id="processing-status"
          >
            {message ??
              "Your PDF is being generated. This may take a few moments..."}
          </p>

          {/* Enhanced Progress Bar */}
          <div
            className="space-y-2 px-4"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-describedby="processing-status"
          >
            <div className="flex justify-between text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 sm:h-3 dark:bg-gray-700">
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div
                  className="absolute inset-0 animate-pulse bg-white opacity-30"
                  aria-hidden="true"
                ></div>
              </div>
            </div>
          </div>

          {/* Processing Steps */}
          <div
            className="mt-6 space-y-2.5 px-4 text-left sm:mt-8 sm:space-y-3"
            aria-label="Processing steps"
          >
            {stepOrder.map((s, idx) => {
              const isActive = idx === activeIndex;
              const isDone =
                idx < activeIndex ||
                progress >= ((idx + 1) / stepOrder.length) * 100 - 1;
              return (
                <div key={s} className="flex items-center gap-2.5 text-xs sm:gap-3 sm:text-sm">
                  <div
                    className={`h-2 w-2 flex-shrink-0 rounded-full sm:h-2.5 sm:w-2.5 ${isDone ? "bg-green-500" : isActive ? "animate-pulse bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
                    aria-hidden="true"
                  ></div>
                  <span
                    className={`text-gray-600 dark:text-gray-400 ${isDone || isActive ? "font-medium" : "opacity-50"}`}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900"
        role="alert"
        aria-live="assertive"
      >
        <div className="w-full max-w-lg text-center">
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 sm:mb-6 sm:h-20 sm:w-20 dark:bg-red-900"
            aria-hidden="true"
          >
            <svg
              className="h-8 w-8 text-red-600 sm:h-10 sm:w-10 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mb-3 px-4 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-gray-100">
            Something went wrong
          </h2>
          <p className="mb-6 px-4 text-sm leading-relaxed text-gray-600 sm:mb-8 sm:text-base dark:text-gray-400">
            {message ??
              "We encountered an error while loading your PDF. This could be due to a network issue or temporary server problem."}
          </p>

          {/* Error Actions */}
          <div className="flex flex-col justify-center gap-3 px-4 sm:flex-row">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-6 sm:py-3"
              aria-label="Try loading the PDF again"
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Try Again</span>
            </button>
            <button
              onClick={() => window.history.back()}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:px-6 sm:py-3 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Go back to previous page"
            >
              Go Back
            </button>
          </div>

          {/* Help Text */}
          <div
            className="mx-4 mt-6 rounded-lg border border-blue-200 bg-blue-50 p-3 sm:mt-8 sm:p-4 dark:border-blue-800 dark:bg-blue-900/20"
            role="complementary"
            aria-labelledby="help-heading"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0" aria-hidden="true">
                <svg
                  className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1 text-left">
                <h4
                  id="help-heading"
                  className="mb-1 text-xs font-medium text-blue-800 sm:text-sm dark:text-blue-200"
                >
                  Need help?
                </h4>
                <p className="text-xs leading-relaxed text-blue-700 sm:text-sm dark:text-blue-300">
                  If this problem persists, try refreshing the page or contact
                  support if the issue continues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
