"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PdfThumbnail from "./PdfThumbnail";
import { api } from "~/trpc/react";
import { toastPrompt } from "~/_components/ToastPrompt";

type Status = "all" | "completed" | "processing" | "failed";

export default function JobsGallery() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [displayCount, setDisplayCount] = useState(8); // Start with 8 items
  const [loadedCount, setLoadedCount] = useState(8); // Actually rendered items
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce the text input so we don't spam queries
  useEffect(() => {
    const id = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const params = useMemo(
    () => ({ limit: 100, status, search }), // Fetch more but display limited
    [status, search],
  );

  const { data, isLoading, refetch, isRefetching } =
    api.files.listMine.useQuery(params, { refetchOnWindowFocus: false });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      // Check if user scrolled near bottom (within 500px)
      const scrolledToBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 500;

      if (
        scrolledToBottom &&
        data &&
        displayCount < data.length &&
        !loadingMore
      ) {
        setLoadingMore(true);
        setDisplayCount((prev) => Math.min(prev + 8, data.length)); // Queue 8 more
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [data, displayCount, loadingMore]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(8);
    setLoadedCount(8);
    setLoadingMore(false);
  }, [status, search]);

  // Preload thumbnails for next batch
  useEffect(() => {
    if (!data || displayCount <= loadedCount) return;

    const itemsToPreload = data.slice(loadedCount, displayCount);
    let loadedImages = 0;
    const totalToLoad = itemsToPreload.length;

    if (totalToLoad === 0) {
      setLoadingMore(false);
      return;
    }

    // Preload images in background
    itemsToPreload.forEach((item) => {
      if (item.mimeType?.includes("pdf")) {
        // For PDFs, we'll use a timeout to simulate thumbnail generation
        setTimeout(() => {
          loadedImages++;
          if (loadedImages === totalToLoad) {
            setLoadedCount(displayCount);
            setLoadingMore(false);
          }
        }, 300); // Small delay to simulate loading
      } else {
        loadedImages++;
        if (loadedImages === totalToLoad) {
          setLoadedCount(displayCount);
          setLoadingMore(false);
        }
      }
    });
  }, [data, displayCount, loadedCount]);

  const previewQuery = api.files.getDownloadUrl.useQuery(
    { fileId: previewId ?? "" },
    { enabled: !!previewId },
  );

  async function handleDownload(fileId: string, baseName?: string) {
    try {
      setDownloadingId(fileId);
      // Smooth toast prompt for filename
      const suggestedBase = (baseName?.trim() ?? "document").slice(0, 50);
      const suggested = suggestedBase || "document";
      const input = await toastPrompt({
        title: "Name your PDF",
        message: "Enter a filename for your download.",
        defaultValue: suggested,
        placeholder: "e.g. Resume v2",
        confirmText: "Download",
        validate: (v) => {
          const val = v.trim();
          if (!val) return "Please enter a name";
          if (val.length > 100) return "Name is too long (max 100)";
          return null;
        },
      });
      if (input === null) return; // cancelled
      const name = input.trim();
      const filename = name.toLowerCase().endsWith(".pdf")
        ? name
        : `${name}.pdf`;

      const url = `/api/files/${fileId}/download?filename=${encodeURIComponent(
        filename,
      )}`;
      window.open(url, "_blank");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Enhanced Search Bar - Optimized */}
        <div className="relative flex w-full max-w-xl items-center gap-2">
          <div className="relative flex w-full items-center gap-2 rounded-2xl border border-gray-200/80 bg-white/80 px-4 py-3 shadow-lg shadow-gray-900/5 backdrop-blur-xl transition-all duration-200 focus-within:border-blue-500/50 focus-within:shadow-xl focus-within:shadow-blue-500/10 dark:border-gray-700/50 dark:bg-gray-900/80">
            {/* Search icon */}
            <svg
              className="h-5 w-5 text-gray-400 transition-colors duration-200 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your documents by prompt..."
              className="flex-1 bg-transparent text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
            />

            {!!query && (
              <button
                aria-label="Clear search"
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                onClick={() => setQuery("")}
              >
                Clear
              </button>
            )}

            <button
              onClick={() => refetch()}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 will-change-transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/40 active:scale-95"
            >
              {isRefetching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Enhanced Status Filter */}
        <div className="flex items-center justify-between gap-2">
          <div className="hidden items-center gap-1.5 rounded-2xl border border-gray-200/80 bg-white/80 p-1.5 shadow-lg shadow-gray-900/5 backdrop-blur-xl sm:flex dark:border-gray-700/50 dark:bg-gray-900/80">
            {(["all", "completed", "processing", "failed"] as Status[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 will-change-transform ${
                    status === s
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                  aria-pressed={status === s}
                >
                  {s[0]?.toUpperCase()}
                  {s.slice(1)}
                </button>
              ),
            )}
          </div>
          <div className="sm:hidden">
            <label className="mr-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="rounded-xl border border-gray-200/80 bg-white/80 px-3 py-2 text-sm font-medium shadow-lg shadow-gray-900/5 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80 dark:[color-scheme:dark]"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <GallerySkeleton />
      ) : !data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.slice(0, loadedCount).map((item) => (
              <li
                key={item.fileId}
                className="group/card relative flex h-full flex-col will-change-transform"
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white/80 shadow-xl shadow-gray-900/5 backdrop-blur-xl transition-all duration-300 group-hover/card:-translate-y-1 group-hover/card:border-blue-500/30 group-hover/card:shadow-2xl group-hover/card:shadow-blue-500/10 dark:border-gray-700/50 dark:bg-gray-900/80">
                  {/* Isolated hover state */}
                  {/* Visual header with real thumbnail when possible */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    {item.jobId ? (
                      <Link
                        href={`/pdf/${item.jobId}`}
                        className="group/link relative block h-full w-full overflow-hidden transition-all duration-300 ease-out"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/0 opacity-0 transition-opacity duration-300 group-hover/link:opacity-100" />
                        <div className="absolute top-3 right-3 opacity-0 transition-all duration-300 group-hover/link:scale-110 group-hover/link:opacity-100">
                          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2 shadow-lg shadow-blue-500/50 backdrop-blur-sm">
                            <svg
                              className="h-4 w-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </div>
                        </div>
                        {item.mimeType?.includes("pdf") ? (
                          <div className="h-full w-full origin-center transition-transform duration-300 group-hover/link:scale-[1.02]">
                            <PdfThumbnail fileId={item.fileId} />
                          </div>
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[--color-primary]/15 text-[--color-primary] transition-transform duration-300 group-hover/link:scale-110">
                              📄
                            </div>
                            <div className="line-clamp-3 text-sm text-[--color-text-muted]">
                              {item.prompt}
                            </div>
                          </div>
                        )}
                      </Link>
                    ) : (
                      <>
                        {item.mimeType?.includes("pdf") ? (
                          <div className="h-full w-full origin-center">
                            <PdfThumbnail fileId={item.fileId} />
                          </div>
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[--color-primary]/15 text-[--color-primary]">
                              📄
                            </div>
                            <div className="line-clamp-3 text-sm text-[--color-text-muted]">
                              {item.prompt}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {/* Top info chips */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 text-[10px] font-semibold">
                      <span className="rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 px-3 py-1.5 text-white shadow-lg backdrop-blur-md">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                      <span className="rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 px-3 py-1.5 text-white shadow-lg backdrop-blur-md">
                        {formatSize(item.size)}
                      </span>
                    </div>
                  </div>

                  {/* Title and status */}
                  <div className="relative flex min-h-0 flex-col gap-3 p-4">
                    <div
                      className="line-clamp-2 text-base leading-snug font-bold text-gray-900 transition-colors dark:text-gray-50"
                      title={item.prompt}
                    >
                      {item.prompt}
                    </div>
                    <div className="flex-shrink-0">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="relative mt-auto flex items-center justify-between gap-2 border-t border-gray-200/50 p-4 dark:border-gray-700/30">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewId(item.fileId)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:scale-105 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownload(item.fileId, item.prompt)}
                        disabled={downloadingId === item.fileId}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:scale-105 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        {downloadingId === item.fileId ? (
                          <>
                            <svg
                              className="h-3 w-3 animate-spin"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              />
                            </svg>
                            Downloading
                          </>
                        ) : (
                          "Download"
                        )}
                      </button>
                    </div>
                    <div className="flex-shrink-0">
                      {item.jobId ? (
                        <Link
                          href={`/pdf/${item.jobId}`}
                          className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-200 will-change-transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95"
                        >
                          View
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="cursor-not-allowed rounded-lg bg-gray-400 px-4 py-1.5 text-sm font-semibold text-white opacity-60"
                          title="Job metadata is missing for this file"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Load More Indicator */}
          {(loadingMore || loadedCount < data.length) && (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  {loadingMore ? "Preparing PDFs..." : "Scroll for more"}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {previewId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-[--color-border] bg-[--color-surface] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[--color-border] px-4 py-2">
              <div className="text-sm font-medium">PDF Preview</div>
              <button
                className="rounded-md border border-[--color-border] px-2 py-1 text-xs hover:bg-[--color-base]"
                onClick={() => setPreviewId(null)}
                aria-label="Close preview"
              >
                Close
              </button>
            </div>
            <div className="h-[80vh] w-full bg-[var(--color-base)]">
              {previewQuery.isLoading ? (
                <div className="flex h-full items-center justify-center text-[--color-text-muted]">
                  Loading preview…
                </div>
              ) : previewQuery.data?.url ? (
                <iframe
                  src={`${previewQuery.data.url}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="h-full w-full"
                  title="PDF preview"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-rose-600">
                  Failed to load preview
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GallerySkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <li
          key={i}
          className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white/80 shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80"
        >
          {/* Shimmer animation */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          <div className="animate-pulse">
            <div className="aspect-[3/4] w-full rounded-t-3xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="h-6 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white p-16 text-center dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/5 to-indigo-500/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/5 to-pink-500/5 blur-3xl"></div>

      <div className="relative z-10">
        <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-3xl shadow-xl shadow-blue-500/20">
          📄
        </div>
        <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          No documents yet
        </h3>
        <p className="mx-auto mb-6 max-w-md text-gray-600 dark:text-gray-400">
          Generate your first PDF by creating a new prompt. Your generated PDFs
          will show up here for quick access, downloading, and sharing.
        </p>
        <Link
          href="/dashboard/new"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95"
        >
          <span className="relative z-10">Create Your First PDF</span>
          <svg
            className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { bg: string; text: string; icon: string }
  > = {
    completed: {
      bg: "bg-gradient-to-r from-emerald-500 to-green-500",
      text: "text-white",
      icon: "✓",
    },
    processing: {
      bg: "bg-gradient-to-r from-amber-500 to-orange-500",
      text: "text-white",
      icon: "⟳",
    },
    failed: {
      bg: "bg-gradient-to-r from-rose-500 to-red-500",
      text: "text-white",
      icon: "✕",
    },
  };
  const config = statusConfig[status] ?? {
    bg: "bg-gradient-to-r from-gray-500 to-slate-500",
    text: "text-white",
    icon: "•",
  };
  const label = status[0]?.toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg ${config.bg} ${config.text} px-3 py-1.5 text-xs font-semibold whitespace-nowrap shadow-md`}
    >
      <span className="text-sm">{config.icon}</span>
      <span>{label}</span>
    </span>
  );
}

function formatSize(bytes: number) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size.toFixed(1)} ${units[unit]}`;
}
