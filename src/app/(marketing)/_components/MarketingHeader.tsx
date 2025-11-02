"use client";

import Link from "next/link";
import React from "react";
import { File, Menu as MenuIcon, X, Sun, Moon } from "lucide-react";
import { useTheme } from "~/providers/ThemeProvider";

export default function MarketingHeader() {
  const [open, setOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 dark:border-white/10 dark:bg-slate-900/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"
          >
            <File className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
              KamkmPDF
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/pricing"
            className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            About
          </Link>
          <Link
            href="/help"
            className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Help
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
          >
            Get Started
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95"
            aria-label="Toggle theme"
          >
            <Sun
              className={`absolute h-5 w-5 text-white transition-all duration-500 ${mounted && theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
            />
            <Moon
              className={`absolute h-5 w-5 text-white transition-all duration-500 ${mounted && theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`}
            />
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </button>

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
            <nav className="flex flex-col space-y-4">
              <Link
                href="/pricing"
                className="text-lg font-medium text-gray-800 dark:text-gray-200"
                onClick={() => setOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-lg font-medium text-gray-800 dark:text-gray-200"
                onClick={() => setOpen(false)}
              >
                About
              </Link>
              <Link
                href="/help"
                className="text-lg font-medium text-gray-800 dark:text-gray-200"
                onClick={() => setOpen(false)}
              >
                Help
              </Link>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/sign-in"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-lg font-medium text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  onClick={() => setOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-lg font-medium text-white"
                  onClick={() => setOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
