"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import ThemeToggle from "./ThemeToggle";
import React from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const isDashboard =
    pathname?.startsWith("/dashboard") ?? pathname?.startsWith("/pdf/");

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href={isSignedIn ? "/dashboard" : "/"}
            className="font-semibold"
          >
            Prompt‑to‑PDF
          </Link>
          {/* Focused navigation: only useful links */}
          {isLoaded && isSignedIn && (
            <nav className="hidden items-center gap-4 text-sm md:flex">
              <Link
                href="/dashboard"
                className={`rounded-md px-2 py-1 transition-colors ${
                  isDashboard
                    ? "text-neutral-800 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                My Documents
              </Link>
              <Link
                href="/dashboard/new"
                className="rounded-md border border-neutral-200 px-3 py-1 text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-white/10 dark:text-white dark:hover:bg-neutral-800"
              >
                New PDF
              </Link>
            </nav>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isLoaded && (
            <>
              {isSignedIn ? (
                <>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                      },
                    }}
                  />
                </>
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  <SignInButton mode="modal">
                    <button className="rounded-md border border-[--color-border] px-3 py-1 text-sm text-[--color-text-primary] transition-colors hover:bg-[--color-surface]">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-md bg-[color:var(--color-primary,#2563eb)] px-3 py-1 text-sm text-white transition-colors hover:opacity-90">
                      Get Started
                    </button>
                  </SignUpButton>
                </div>
              )}
            </>
          )}
          {/* Mobile menu toggle */}
          <button
            className="rounded-md border border-neutral-200 bg-white/70 p-2 backdrop-blur transition-colors hover:bg-white/90 md:hidden dark:border-white/10 dark:bg-neutral-800/60 dark:hover:bg-neutral-800/80"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-neutral-200 bg-white/90 backdrop-blur md:hidden dark:border-white/10 dark:bg-neutral-900/90">
          <div className="mx-auto max-w-7xl space-y-2 px-4 py-3">
            {isLoaded && isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="block py-1 text-neutral-800 dark:text-white"
                  onClick={() => setOpen(false)}
                >
                  My Documents
                </Link>
                <Link
                  href="/dashboard/new"
                  className="block py-1 text-neutral-800 dark:text-white"
                  onClick={() => setOpen(false)}
                >
                  New PDF
                </Link>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <SignInButton mode="modal">
                  <button className="flex-1 rounded-md border border-neutral-200 bg-white/70 px-3 py-2 text-sm text-neutral-800 transition-colors hover:bg-white/90 dark:border-white/10 dark:bg-neutral-800/60 dark:text-white dark:hover:bg-neutral-800/80">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="flex-1 rounded-md bg-[color:var(--color-primary,#2563eb)] px-3 py-2 text-sm text-white hover:opacity-90">
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
