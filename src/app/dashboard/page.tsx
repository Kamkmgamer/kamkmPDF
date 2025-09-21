"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../_components/DashboardLayout";
import RecentJobs from "../../_components/RecentJobs";
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
      <div className="space-y-8 p-2 sm:p-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

        <section aria-labelledby="quick-actions">
          <h2 id="quick-actions" className="sr-only">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/new"
              className="group rounded-xl border border-[--color-border] bg-[--color-surface] p-5 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[--color-primary]/10 text-[--color-primary]">
                  ＋
                </div>
                <div>
                  <div className="font-medium">New Prompt</div>
                  <div className="text-sm text-[--color-text-muted]">
                    Convert a prompt into a PDF
                  </div>
                </div>
                <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                  →
                </span>
              </div>
            </Link>
          </div>
        </section>

        <section aria-labelledby="recent-jobs">
          <h2 id="recent-jobs" className="text-lg font-medium">
            Recent Jobs
          </h2>
          <RecentJobs />
        </section>
      </div>
    </DashboardLayout>
  );
}
