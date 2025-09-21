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

  const isHome = pathname === "/";
  const anchor = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <header className="sticky top-0 z-50 border-b border-[--color-border] bg-[--color-surface]/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold">
            Prompt‑to‑PDF
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href={anchor("features")}
              className="hover:text-[--color-primary]"
            >
              Features
            </Link>
            <Link
              href={anchor("pricing")}
              className="hover:text-[--color-primary]"
            >
              Pricing
            </Link>
            <Link
              href={anchor("testimonials")}
              className="hover:text-[--color-primary]"
            >
              Testimonials
            </Link>
            <Link href={anchor("cta")} className="hover:text-[--color-primary]">
              Get started
            </Link>
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isLoaded && (
            <>
              {isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="hidden rounded-md border border-[--color-border] px-3 py-1 text-sm hover:bg-[--color-surface] sm:inline-block"
                  >
                    Dashboard
                  </Link>
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
                    <button className="rounded-md border border-[--color-border] px-3 py-1 text-sm hover:bg-[--color-surface]">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-md bg-[--color-primary] px-3 py-1 text-sm text-white hover:bg-[--color-primary]/90">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </>
          )}
          {/* Mobile menu toggle */}
          <button
            className="rounded-md border border-[--color-border] p-2 md:hidden"
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
        <div className="border-t border-[--color-border] bg-[--color-surface] md:hidden">
          <div className="mx-auto max-w-7xl space-y-2 px-4 py-3">
            <Link
              href={anchor("features")}
              className="block py-1"
              onClick={() => setOpen(false)}
            >
              Features
            </Link>
            <Link
              href={anchor("pricing")}
              className="block py-1"
              onClick={() => setOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href={anchor("testimonials")}
              className="block py-1"
              onClick={() => setOpen(false)}
            >
              Testimonials
            </Link>
            <Link
              href={anchor("cta")}
              className="block py-1"
              onClick={() => setOpen(false)}
            >
              Get started
            </Link>
            {isLoaded &&
              (isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="block py-1"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex gap-2 pt-2">
                  <SignInButton mode="modal">
                    <button className="flex-1 rounded-md border border-[--color-border] px-3 py-2 text-sm">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="flex-1 rounded-md bg-[--color-primary] px-3 py-2 text-sm text-white">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
