"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

type Status = "all" | "completed" | "processing" | "failed";

export default function JobsGallery() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("all");

  const params = useMemo(
    () => ({ limit: 24, status, search }),
    [status, search],
  );

  const { data, isLoading, refetch, isRefetching } =
    api.files.listMine.useQuery(params, { refetchOnWindowFocus: false });

  const utils = api.useUtils();
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const shareMutation = api.files.createShareLink.useMutation();

  async function handleDownload(fileId: string) {
    try {
      setDownloadingId(fileId);
      const res = await utils.files.getDownloadUrl.fetch({ fileId });
      if (res?.url) {
        window.open(res.url, "_blank");
      }
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleShare(fileId: string) {
    try {
      setCopyingId(fileId);
      const out = (await shareMutation.mutateAsync({ fileId })) as {
        url: string;
        expiresAt: string;
      };
      await navigator.clipboard.writeText(out.url);
    } finally {
      setCopyingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-[--color-border] bg-[--color-surface] px-3 py-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your documents by prompt..."
            className="w-full bg-transparent outline-none placeholder:text-[--color-text-muted]"
          />
          <button
            onClick={() => refetch()}
            className="rounded-md bg-[--color-primary] px-3 py-1.5 text-sm text-white hover:opacity-90"
          >
            {isRefetching ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-[--color-text-muted]">Status</label>
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

      {isLoading ? (
        <GallerySkeleton />
      ) : !data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((item) => (
            <li
              key={item.fileId}
              className="group relative overflow-hidden rounded-xl border border-[--color-border] bg-[--color-surface] shadow-sm transition-all hover:shadow-md"
            >
              <div className="aspect-[3/4] w-full bg-neutral-950/2">
                {/* Lightweight preview: show an inline PDF icon & first lines of prompt; consider adding real thumbnails later */}
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[--color-primary]/10 text-[--color-primary]">
                    📄
                  </div>
                  <div className="line-clamp-3 text-sm text-[--color-text-muted]">
                    {item.prompt}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-[--color-border] p-3">
                <StatusBadge status={item.status} />
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(item.fileId)}
                    disabled={downloadingId === item.fileId}
                    className="rounded-md border border-[--color-border] px-2 py-1 text-xs hover:bg-[--color-base]"
                  >
                    {downloadingId === item.fileId
                      ? "Downloading..."
                      : "Download"}
                  </button>
                  <button
                    onClick={() => handleShare(item.fileId)}
                    disabled={copyingId === item.fileId}
                    className="rounded-md border border-[--color-border] px-2 py-1 text-xs hover:bg-[--color-base]"
                  >
                    {copyingId === item.fileId ? "Copied!" : "Copy Link"}
                  </button>
                  <Link
                    href={`/pdf/${item.fileId}`}
                    className="rounded-md bg-[--color-primary] px-2 py-1 text-xs text-white hover:opacity-90"
                  >
                    View
                  </Link>
                </div>
              </div>

              <div className="absolute inset-x-0 top-0 hidden items-center justify-between bg-gradient-to-b from-black/30 to-transparent p-2 text-xs text-white group-hover:flex">
                <span>{new Date(item.createdAt).toLocaleString()}</span>
                <span>{formatSize(item.size)}</span>
              </div>
            </li>
          ))}
        </ul>
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
          <div className="mb-4 h-48 rounded-md bg-[--color-base]" />
          <div className="h-4 w-3/4 rounded bg-[--color-base]" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[--color-border] p-10 text-center">
      <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[--color-primary]/10 text-[--color-primary]">
        📄
      </div>
      <h3 className="text-lg font-medium">No documents yet</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-[--color-text-muted]">
        Generate your first PDF by creating a new prompt. Your generated PDFs
        will show up here for quick access, downloading, and sharing.
      </p>
      <Link
        href="/dashboard/new"
        className="mt-4 inline-flex rounded-md bg-[--color-primary] px-4 py-2 text-sm text-white hover:opacity-90"
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
