"use client";

import React from "react";
import { useAuthGuard } from "./hooks/useAuthGuard";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  fallback,
  redirectTo = "/sign-in",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthGuard({
    redirectTo,
    requireAuth: true,
  });

  // Show loading state
  if (isLoading) {
    return (
      fallback ?? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[--color-primary]"></div>
            <p className="mt-2 text-[--color-text-muted]">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Don't render children if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
