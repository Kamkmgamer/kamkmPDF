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

  // Debounce the text input so we don't spam queries
  useEffect(() => {
    const id = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const params = useMemo(
    () => ({ limit: 24, status, search }),
    [status, search],
  );

  const { data, isLoading, refetch, isRefetching } =
    api.files.listMine.useQuery(params, { refetchOnWindowFocus: false });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-[--color-border] bg-[--color-surface] px-3 py-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your documents by prompt..."
            className="w-full bg-transparent outline-none placeholder:text-[--color-text-muted]"
          />
          {!!query && (
            <button
              aria-label="Clear search"
              className="rounded-md border border-[--color-border] px-2 py-1 text-xs hover:bg-[--color-base]"
              onClick={() => setQuery("")}
            >
              Clear
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm text-white hover:opacity-90"
          >
            {isRefetching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Status filter: tabs on larger screens, select on mobile */}
        <div className="flex items-center justify-between gap-2">
          <div className="hidden items-center gap-1 rounded-md border border-[--color-border] bg-[--color-surface] p-1 sm:flex">
            {(["all", "completed", "processing", "failed"] as Status[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`rounded px-3 py-1.5 text-sm transition-colors ${
                    status === s
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[--color-text-muted] hover:bg-[--color-base]"
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
            <label className="mr-2 text-sm text-[--color-text-muted]">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="rounded-md border border-[--color-border] bg-[--color-surface] px-2 py-1 text-sm dark:border-white/10 dark:bg-neutral-900 dark:text-white dark:[color-scheme:dark]"
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
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((item) => (
            <li
              key={item.fileId}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[--color-border] bg-[--color-surface] transition-colors hover:border-[var(--color-primary)]/50 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:-translate-y-0.5"
            >
              {/* Visual header with real thumbnail when possible */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--color-base)]">
                {item.mimeType?.includes("pdf") ? (
                  <div className="h-full w-full origin-center group-hover:scale-[1.02] motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out">
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
                {/* Top info chips (no shadow, high contrast) */}
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2 text-[10px] font-medium">
                  <span className="rounded-full bg-black/70 px-2 py-0.5 text-white/95 backdrop-blur-sm">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                  <span className="rounded-full bg-black/70 px-2 py-0.5 text-white/95 backdrop-blur-sm">
                    {formatSize(item.size)}
                  </span>
                </div>
              </div>

              {/* Title and status */}
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div
                  className="line-clamp-2 text-sm leading-snug font-semibold text-gray-900 transition-colors dark:text-gray-50"
                  title={item.prompt}
                >
                  {item.prompt}
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-[--color-border] p-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewId(item.fileId)}
                    className="rounded-md border border-[--color-border] px-2 py-1 text-xs transition-colors hover:bg-[--color-base] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleDownload(item.fileId, item.prompt)}
                    disabled={downloadingId === item.fileId}
                    className="inline-flex items-center gap-1 rounded-md border border-[--color-border] px-2 py-1 text-xs transition-colors hover:bg-[--color-base] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
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
                      className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    >
                      View
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="cursor-not-allowed rounded-md bg-gray-400 px-3 py-1.5 text-sm text-white opacity-60"
                      title="Job metadata is missing for this file"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>

              {/* Removed top and bottom overlays */}
            </li>
          ))}
        </ul>
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
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <li
          key={i}
          className="animate-pulse rounded-xl border border-[--color-border] bg-[--color-surface] p-4"
        >
          <div className="mb-4 h-48 rounded-md bg-[var(--color-base)]" />
          <div className="h-4 w-3/4 rounded bg-[var(--color-base)]" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[--color-border] p-10 text-center">
      <div className="text-[--color-primary)] mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
        📄
      </div>
      <h3 className="text-lg font-medium">No documents yet</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-[--color-text-muted]">
        Generate your first PDF by creating a new prompt. Your generated PDFs
        will show up here for quick access, downloading, and sharing.
      </p>
      <Link
        href="/dashboard/new"
        className="mt-4 inline-flex rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:opacity-90"
      >
        Create New
      </Link>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700",
    processing: "bg-amber-100 text-amber-700",
    failed: "bg-rose-100 text-rose-700",
  };
  const cls = map[status] ?? "bg-neutral-200 text-neutral-700";
  const label = status[0]?.toUpperCase() + status.slice(1);
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
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
