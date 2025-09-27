"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../_components/DashboardLayout";
import JobsGallery from "../../_components/JobsGallery";
import Link from "next/link";

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Show loading state while auth is being determined
  if (!isLoaded) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[--color-primary]"></div>
            <p className="mt-2 text-[--color-text-muted]">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    router.push("/sign-in?redirect_url=/dashboard");
    return null;
  }

  return (
    <DashboardLayout>
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-[--color-border] bg-gradient-to-br from-[--color-surface] to-[--color-base] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Your Documents
            </h1>
            <p className="mt-1 text-sm text-[--color-text-muted]">
              Browse, download and share your generated PDFs. Create a new one
              in seconds.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/new"
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-on-primary)] shadow-sm transition hover:opacity-95"
            >
              New PDF
            </Link>
            <Link
              href="/dashboard/new#templates"
              className="rounded-lg border border-[--color-border] px-4 py-2 text-sm hover:bg-[--color-surface]"
            >
              Use a Template
            </Link>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <section aria-labelledby="quick-actions" className="mt-6">
        <h2 id="quick-actions" className="sr-only">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/new"
            className="group rounded-xl border border-[--color-border] bg-[--color-surface] p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                ＋
              </div>
              <div>
                <div className="font-medium">New from Prompt</div>
                <div className="text-sm text-[--color-text-muted]">
                  Convert text into a polished PDF
                </div>
              </div>
              <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                →
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/new"
            className="group rounded-xl border border-[--color-border] bg-[--color-surface] p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                🖼️
              </div>
              <div>
                <div className="font-medium">Add Image</div>
                <div className="text-sm text-[--color-text-muted]">
                  Include a cover or inline image
                </div>
              </div>
              <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                →
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/new#templates"
            className="group rounded-xl border border-[--color-border] bg-[--color-surface] p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                🧩
              </div>
              <div>
                <div className="font-medium">Browse Templates</div>
                <div className="text-sm text-[--color-text-muted]">
                  Use a curated starting point
                </div>
              </div>
              <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Gallery */}
      <section aria-labelledby="your-files" className="mt-8">
        <h2 id="your-files" className="sr-only">
          Your Files
        </h2>
        <JobsGallery />
      </section>
    </DashboardLayout>
  );
}
