"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import React from "react";
import { usePathname } from "next/navigation";
import { File, Menu as MenuIcon, X, Plus } from "lucide-react";

export default function Header() {
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const isDashboard = !!(
    pathname &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/pdf/"))
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 dark:border-white/10 dark:bg-slate-900/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href={isSignedIn ? "/" : "/"}
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"
          >
            <File className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
              Prompt‑to‑PDF
            </span>
          </Link>
        </div>

        {isLoaded && isSignedIn && (
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link
              href="/dashboard"
              className={`relative text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white ${isDashboard ? "text-slate-900 dark:text-white" : ""}`}
            >
              My Documents
            </Link>
            <Link
              href="/dashboard/templates"
              className={`relative text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white ${pathname?.startsWith("/dashboard/templates") ? "text-slate-900 dark:text-white" : ""}`}
            >
              Templates
            </Link>
            <Link
              href="/dashboard/usage"
              className={`relative text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white ${pathname?.startsWith("/dashboard/usage") ? "text-slate-900 dark:text-white" : ""}`}
            >
              Usage
            </Link>
            <Link
              href="/pricing"
              className={`relative text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white ${pathname?.startsWith("/pricing") ? "text-slate-900 dark:text-white" : ""}`}
            >
              Pricing
            </Link>
            <Link
              href="/dashboard/new"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 px-5 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              <span>New PDF</span>
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {isLoaded && (
            <>
              {isSignedIn ? (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9",
                    },
                  }}
                />
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  <Link
                    href="/pricing"
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Pricing
                  </Link>
                  <SignInButton
                    mode="modal"
                    forceRedirectUrl="/dashboard"
                    fallbackRedirectUrl="/dashboard"
                  >
                    <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton
                    mode="modal"
                    forceRedirectUrl="/dashboard"
                    fallbackRedirectUrl="/dashboard"
                  >
                    <button className="rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg">
                      Get Started
                    </button>
                  </SignUpButton>
                </div>
              )}
            </>
          )}
          <button
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100 md:hidden dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/20 bg-white/80 backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-slate-900/80">
          <div className="mx-auto max-w-7xl space-y-4 px-4 py-5">
            {isLoaded && isSignedIn ? (
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/dashboard"
                  className="text-lg font-medium text-gray-800 dark:text-gray-200"
                  onClick={() => setOpen(false)}
                >
                  My Documents
                </Link>
                <Link
                  href="/dashboard/templates"
                  className="text-lg font-medium text-gray-800 dark:text-gray-200"
                  onClick={() => setOpen(false)}
                >
                  Templates
                </Link>
                <Link
                  href="/dashboard/usage"
                  className="text-lg font-medium text-gray-800 dark:text-gray-200"
                  onClick={() => setOpen(false)}
                >
                  Usage
                </Link>
                <Link
                  href="/pricing"
                  className="text-lg font-medium text-gray-800 dark:text-gray-200"
                  onClick={() => setOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/dashboard/new"
                  className="rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 px-4 py-3 text-center text-lg font-semibold text-white shadow-md"
                  onClick={() => setOpen(false)}
                >
                  New PDF
                </Link>
              </nav>
            ) : (
              <div className="flex flex-col space-y-4">
                <Link
                  href="/pricing"
                  className="text-lg font-medium text-gray-800 dark:text-gray-200"
                  onClick={() => setOpen(false)}
                >
                  Pricing
                </Link>
                <div className="grid grid-cols-2 gap-4">
                  <SignInButton
                    mode="modal"
                    forceRedirectUrl="/dashboard"
                    fallbackRedirectUrl="/dashboard"
                  >
                    <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-lg font-medium text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton
                    mode="modal"
                    forceRedirectUrl="/dashboard"
                    fallbackRedirectUrl="/dashboard"
                  >
                    <button className="w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-lg font-medium text-white">
                      Get Started
                    </button>
                  </SignUpButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
