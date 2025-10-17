"use client";

import { useState, useEffect } from "react";

const ONBOARDING_KEY = "onboardingCompleted";

/**
 * Custom hook to manage onboarding state
 *
 * @returns Object with onboarding state and control functions
 *
 * @example
 * ```tsx
 * const { hasCompleted, resetOnboarding, markAsCompleted } = useOnboarding();
 *
 * // Check if user has completed onboarding
 * if (!hasCompleted) {
 *   // Show onboarding
 * }
 *
 * // Reset onboarding (e.g., in settings)
 * <button onClick={resetOnboarding}>Show Tutorial Again</button>
 *
 * // Manually mark as completed
 * <button onClick={markAsCompleted}>Skip Tutorial</button>
 * ```
 */
export function useOnboarding() {
  const [hasCompleted, setHasCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    // Check localStorage on mount
    const completed = localStorage.getItem(ONBOARDING_KEY);
    setHasCompleted(completed === "true");
  }, []);

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setHasCompleted(false);
  };

  const markAsCompleted = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setHasCompleted(true);
  };

  return {
    /** Whether the user has completed onboarding (null while loading) */
    hasCompleted,
    /** Reset onboarding to show it again */
    resetOnboarding,
    /** Mark onboarding as completed */
    markAsCompleted,
    /** Check if onboarding should be shown */
    shouldShowOnboarding: hasCompleted === false,
  };
}
