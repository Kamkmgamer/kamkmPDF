"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface UseAuthGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export function useAuthGuard({
  redirectTo = "/sign-in",
  requireAuth = true,
}: UseAuthGuardOptions = {}) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (requireAuth && !isSignedIn) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect_url=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    } else if (!requireAuth && isSignedIn) {
      // If auth is not required but user is signed in, redirect to dashboard
      router.push("/dashboard");
    }
  }, [isSignedIn, isLoaded, router, redirectTo, requireAuth]);

  return {
    isSignedIn: isSignedIn && isLoaded,
    isLoaded,
    isAuthenticated: isSignedIn && isLoaded,
    isLoading: !isLoaded,
  };
}
