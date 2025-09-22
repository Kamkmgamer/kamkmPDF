"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "~/providers/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-md border border-[--color-border] bg-[--color-surface] px-3 py-1 text-sm text-[--color-text-primary] shadow-sm transition-colors hover:bg-white/80 dark:hover:bg-white/10"
      aria-pressed={theme === "dark"}
      title={theme === "dark" ? "Switch to light" : "Switch to dark"}
    >
      <span aria-hidden>{theme === "dark" ? "🌞" : "🌙"}</span>
      <span className="hidden sm:inline">
        {theme === "dark" ? "Light" : "Dark"}
      </span>
    </button>
  );
}
