"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import ThemeToggle from "./ThemeToggle";
import React from "react";
import { usePathname } from "next/navigation";
import { File, Menu as MenuIcon, X } from "lucide-react";

export default function Header() {
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const isDashboard =
    pathname?.startsWith("/dashboard") ?? pathname?.startsWith("/pdf/");

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href={isSignedIn ? "/" : "/"}
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"
          >
            <File className="h-6 w-6" />
            <span>Prompt‑to‑PDF</span>
          </Link>
        </div>

        {isLoaded && isSignedIn && (
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link
              href="/dashboard"
              className={`text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white ${isDashboard ? "text-gray-900 dark:text-white" : ""}`}
            >
              My Documents
            </Link>
            <Link
              href="/dashboard/templates"
              className={`text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white ${pathname?.startsWith("/dashboard/templates") ? "text-gray-900 dark:text-white" : ""}`}
            >
              Templates
            </Link>
            <Link
              href="/dashboard/new"
              className="rounded-full bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              New PDF
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-4">
          <ThemeToggle />
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
                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
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
        <div className="border-t border-gray-200 bg-white/95 md:hidden dark:border-gray-800 dark:bg-gray-900/95">
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
                  href="/dashboard/new"
                  className="rounded-lg bg-blue-600 px-4 py-3 text-center text-lg font-medium text-white"
                >
                  New PDF
                </Link>
              </nav>
            ) : (
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
            )}
          </div>
        </div>
      )}
    </header>
  );
}
