"use client";

import React from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import DashboardLayout from "~/_components/DashboardLayout";
import JobsGallery from "~/_components/JobsGallery";
import Onboarding from "~/_components/Onboarding";
import { ProPlusBanner } from "~/_components/ProPlusBanner";
import Link from "next/link";
import { ArrowRight, FilePlus, BookOpen, Sparkles, Zap, Gift } from "lucide-react";

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center p-8">
          <div className="text-center">
            <div className="relative mx-auto h-16 w-16">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-500 border-r-indigo-500"></div>
              <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-t-sky-500 border-r-indigo-500 [animation-direction:reverse] [animation-duration:1.5s]"></div>
            </div>
            <p className="mt-6 animate-pulse bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text font-medium text-transparent">
              Loading your dashboard...
            </p>
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
      <Onboarding />
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Pro+ Banner */}
        <ProPlusBanner />
        {/* Welcome Header with Animated Gradient */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-100/50 bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 p-6 shadow-xl shadow-blue-500/5 sm:rounded-3xl sm:p-8 lg:p-10 dark:border-blue-900/30 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-sky-950/30">
          {/* Animated background orbs */}
          <div className="absolute -top-24 -right-24 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-sky-400/20 to-indigo-400/20 blur-3xl [animation-delay:1s]"></div>

          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2 sm:gap-3">
              <div className="relative flex-shrink-0">
                <Sparkles className="h-6 w-6 animate-pulse text-blue-600 sm:h-8 sm:w-8 dark:text-blue-400" />
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="h-6 w-6 text-blue-600 opacity-75 sm:h-8 sm:w-8 dark:text-blue-400" />
                </div>
              </div>
              <h1 className="animate-gradient truncate bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-[length:200%_auto] bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
                Welcome back, {user?.firstName}!
              </h1>
            </div>
            <p className="mt-2 flex items-center gap-2 text-base font-medium text-gray-700 sm:mt-3 sm:text-lg lg:text-xl dark:text-gray-300">
              <Zap className="h-4 w-4 flex-shrink-0 animate-bounce text-yellow-500 sm:h-5 sm:w-5" />
              Ready to create something amazing?
            </p>
          </div>
        </div>

        {/* Quick Actions with Enhanced Cards */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-50 blur-md"></div>
                <span className="relative inline-block h-8 w-1.5 rounded-full bg-gradient-to-b from-blue-600 to-indigo-600"></span>
              </div>
              Start Creating
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            <ActionCard
              href="/"
              icon={<FilePlus className="h-7 w-7" />}
              title="New from Prompt"
              description="Convert text into a polished PDF document."
              gradient="from-blue-500 via-indigo-500 to-blue-600"
              glowColor="blue"
            />
            <ActionCard
              href="/dashboard/templates"
              icon={<BookOpen className="h-7 w-7" />}
              title="Browse Templates"
              description="Use a pre-designed template to get started quickly."
              gradient="from-indigo-500 via-sky-500 to-indigo-600"
              glowColor="indigo"
            />
            <ActionCard
              href="/referrals"
              icon={<Gift className="h-7 w-7" />}
              title="Refer & Earn"
              description="Invite friends and earn 50 credits per referral."
              gradient="from-purple-500 via-pink-500 to-purple-600"
              glowColor="indigo"
            />
          </div>
        </div>

        {/* Recent Documents with Modern Header */}
        <section aria-labelledby="recent-documents" className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="recent-documents"
              className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-indigo-600 opacity-50 blur-md"></div>
                <span className="relative inline-block h-8 w-1.5 rounded-full bg-gradient-to-b from-sky-600 to-indigo-600"></span>
              </div>
              Your Recent Documents
            </h2>
            <Link
              href="/"
              className="group/btn inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 will-change-transform hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/50 active:scale-95"
            >
              <FilePlus className="h-4 w-4 transition-transform duration-200 group-hover/btn:rotate-90" />
              <span>Create New PDF</span>
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
  gradient,
  glowColor,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  glowColor: string;
}) {
  const glowColors = {
    blue: "shadow-blue-500/50",
    indigo: "shadow-indigo-500/50",
  };

  return (
    <Link
      href={href}
      className={`group/action relative block h-full will-change-transform`}
    >
      {/* Main card - optimized for performance */}
      <div
        className={`relative h-full overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-xl transition-all duration-300 group-hover/action:-translate-y-1 group-hover/action:border-blue-500/50 group-hover/action:shadow-2xl sm:rounded-3xl dark:border-gray-700/50 dark:from-gray-900 dark:to-gray-800/50 group-hover/action:${glowColors[glowColor as keyof typeof glowColors]}`}
      >
        <div className="relative flex h-full flex-col p-6 sm:p-8">
          {/* Icon container - optimized */}
          <div className="mb-4 sm:mb-6">
            <div className="relative inline-block will-change-transform">
              {/* Icon background */}
              <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br sm:h-16 sm:w-16 sm:rounded-2xl ${gradient} shadow-lg transition-transform duration-300 group-hover/action:scale-110 group-hover/action:rotate-3`}
              >
                <div className="relative text-white">{icon}</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-gray-900 transition-colors duration-200 group-hover/action:text-blue-600 sm:text-xl dark:text-white dark:group-hover/action:text-indigo-400">
                {title}
              </h3>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400 opacity-0 transition-all duration-200 will-change-transform group-hover/action:text-indigo-500 group-hover/action:opacity-100 sm:h-5 sm:w-5 dark:text-gray-500" />
            </div>
            <p className="text-xs leading-relaxed text-gray-600 sm:text-sm dark:text-gray-400">
              {description}
            </p>
          </div>

          {/* Bottom gradient bar */}
          <div className="absolute right-0 bottom-0 left-0 h-1 origin-left scale-x-0 transform bg-gradient-to-r from-blue-600 to-indigo-600 transition-transform duration-300 will-change-transform group-hover/action:scale-x-100"></div>
        </div>
      </div>
    </Link>
  );
}
