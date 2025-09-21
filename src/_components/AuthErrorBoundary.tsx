"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { handleAuthError } from "./utils/auth";

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

// This is the new component that will use the hook
const AuthErrorFallback = ({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) => {
  const { signOut } = useAuth();
  const authError = handleAuthError(error);

  React.useEffect(() => {
    if (authError.shouldSignOut) {
      // Automatically sign out user if it's an auth error
      void signOut();
    }
  }, [authError.shouldSignOut, signOut]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-[--color-border] bg-[--color-surface] p-6 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-[--color-text-primary]">
          Authentication Error
        </h2>
        <p className="mb-4 text-[--color-text-muted]">{authError.message}</p>
        <div className="flex justify-center gap-2">
          <button
            onClick={retry}
            className="rounded-md bg-[--color-primary] px-4 py-2 text-white hover:bg-[--color-primary]/90"
          >
            Try Again
          </button>
          {authError.redirectTo && (
            <a
              href={authError.redirectTo}
              className="rounded-md border border-[--color-border] px-4 py-2 hover:bg-[--color-surface]"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("AuthErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            retry={this.handleRetry}
          />
        );
      }

      return (
        <AuthErrorFallback error={this.state.error} retry={this.handleRetry} />
      );
    }

    return this.props.children;
  }
}
