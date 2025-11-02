"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import React from "react";
import { usePathname } from "next/navigation";
import { File, Menu as MenuIcon, X, Plus, Sun, Moon } from "lucide-react";
import { useTheme } from "~/providers/ThemeProvider";

export default function Header() {
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const isDark = theme === "dark";

  const clerkAppearance = {
    layout: {
      socialButtonsVariant: "blockButton" as const,
    },
    variables: isDark
      ? {
          colorBackground: "#0a0a0a",
          colorInputBackground: "#1a1a1a",
          colorInputText: "#ffffff",
          colorText: "#ffffff",
          colorTextSecondary: "#a1a1aa",
          colorPrimary: "#3b82f6",
          colorDanger: "#ef4444",
          borderRadius: "0.5rem",
        }
      : {
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#0f172a",
          colorText: "#0f172a",
          colorTextSecondary: "#475569",
          colorPrimary: "#2563eb",
          colorDanger: "#dc2626",
          borderRadius: "0.5rem",
        },
    elements: isDark
      ? {
          card: "bg-[#0a0a0a] border border-zinc-800",
          headerTitle: "text-white",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton:
            "bg-[#1a1a1a] border border-zinc-800 text-white hover:bg-[#252525]",
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
          footerActionLink: "text-blue-500 hover:text-blue-400",
          identityPreviewText: "text-white",
          identityPreviewEditButton: "text-blue-500",
          formFieldLabel: "text-zinc-300",
          formFieldInput: "bg-[#1a1a1a] border-zinc-800 text-white",
          dividerLine: "bg-zinc-800",
          dividerText: "text-zinc-500",
        }
      : {
          card: "bg-white border border-gray-200",
          headerTitle: "text-gray-900",
          headerSubtitle: "text-gray-600",
          socialButtonsBlockButton:
            "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50",
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
          footerActionLink: "text-blue-600 hover:text-blue-700",
          identityPreviewText: "text-gray-900",
          identityPreviewEditButton: "text-blue-600",
          formFieldLabel: "text-gray-700",
          formFieldInput: "bg-white border-gray-300 text-gray-900",
          dividerLine: "bg-gray-300",
          dividerText: "text-gray-600",
        },
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
            <File className="h-6 w-6 text-blue-600 dark:text-cyan-400" />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent dark:from-cyan-400 dark:via-blue-400 dark:to-sky-400">
              KamkmPDF
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
              href="/"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 px-5 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              <span>New PDF</span>
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {/* Cute Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95"
            aria-label="Toggle theme"
          >
            {/* Sun icon */}
            <Sun
              className={`absolute h-5 w-5 text-white transition-all duration-500 ${mounted && theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
            />

            {/* Moon icon */}
            <Moon
              className={`absolute h-5 w-5 text-white transition-all duration-500 ${mounted && theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`}
            />

            {/* Sparkle effect on hover */}
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </button>

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
                    appearance={clerkAppearance}
                  >
                    <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton
                    mode="modal"
                    forceRedirectUrl="/dashboard"
                    fallbackRedirectUrl="/dashboard"
                    appearance={clerkAppearance}
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
                  href="/"
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
                    appearance={clerkAppearance}
                  >
                    <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-lg font-medium text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton
                    mode="modal"
                    forceRedirectUrl="/dashboard"
                    fallbackRedirectUrl="/dashboard"
                    appearance={clerkAppearance}
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
