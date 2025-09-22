"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: (_t: Theme) => console.warn("setTheme called without a provider"),
  toggleTheme: () => console.warn("toggleTheme called without a provider"),
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("theme") as Theme | null;
  if (saved) return saved;
  // Default to light when no preference saved
  return "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const body = document.body;
  root.setAttribute("data-theme", theme);
  // Keep Tailwind's class-based dark mode in sync as a safety net
  if (theme === "dark") {
    root.classList.add("dark");
    body.classList.add("dark");
  } else {
    root.classList.remove("dark");
    body.classList.remove("dark");
    // Also remove any stray `.dark` classes elsewhere
    try {
      document.querySelectorAll(".dark").forEach((el) => {
        if (el !== root && el !== body)
          (el as HTMLElement).classList.remove("dark");
      });
    } catch {}
  }
  // Help native form controls and UA styling match
  try {
    (root.style as React.CSSProperties & { colorScheme?: string }).colorScheme =
      theme;
  } catch {}
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Ensure DOM reflects current state on mount and whenever theme changes
  useEffect(() => {
    try {
      applyTheme(theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    // Apply immediately to avoid any intermediate mismatch
    try {
      applyTheme(t);
    } catch {}
    setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        applyTheme(next);
      } catch {}
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
