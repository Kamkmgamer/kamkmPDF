"use client";

import React from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../_components/DashboardLayout";
import JobsGallery from "../../_components/JobsGallery";
import Link from "next/link";
import { ArrowRight, FilePlus, BookOpen } from "lucide-react";

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isSignedIn) {
    router.push("/sign-in?redirect_url=/dashboard");
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Ready to create something amazing?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
            Start Creating
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ActionCard
              href="/dashboard/new"
              icon={<FilePlus className="h-8 w-8 text-blue-500" />}
              title="New from Prompt"
              description="Convert text into a polished PDF document."
            />
            <ActionCard
              href="/dashboard/templates"
              icon={<BookOpen className="h-8 w-8 text-sky-500" />}
              title="Browse Templates"
              description="Use a pre-designed template to get started quickly."
            />
          </div>
        </div>

        {/* Recent Documents */}
        <section aria-labelledby="recent-documents">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="recent-documents"
              className="text-xl font-semibold text-gray-800 dark:text-gray-200"
            >
              Your Recent Documents
            </h2>
            <Link
              href="/dashboard/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              Create New PDF
            </Link>
          </div>
          <JobsGallery />
        </section>
      </div>
    </DashboardLayout>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <ArrowRight className="ml-auto h-5 w-5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-500" />
      </div>
    </Link>
  );
}
