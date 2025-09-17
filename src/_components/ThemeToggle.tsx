"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "~/providers/ThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-md border px-3 py-1"
      aria-pressed={theme === "dark"}
    >
      {theme === "dark" ? "Switch to light" : "Switch to dark"}
    </button>
  );
}
