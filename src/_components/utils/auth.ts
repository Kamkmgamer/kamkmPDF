import { TRPCError } from "@trpc/server";

export function isAuthError(error: unknown): boolean {
  if (error instanceof TRPCError) {
    return error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN";
  }

  if (error instanceof Error) {
    return (
      error.message.includes("UNAUTHORIZED") ||
      error.message.includes("FORBIDDEN") ||
      error.message.includes("not authenticated")
    );
  }

  return false;
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof TRPCError) {
    switch (error.code) {
      case "UNAUTHORIZED":
        return "Please sign in to access this feature.";
      case "FORBIDDEN":
        return "You don't have permission to access this resource.";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("UNAUTHORIZED")) {
      return "Please sign in to access this feature.";
    }
    if (error.message.includes("FORBIDDEN")) {
      return "You don't have permission to access this resource.";
    }
    return error.message;
  }

  return "An authentication error occurred. Please try signing in again.";
}

export function handleAuthError(error: unknown): {
  shouldSignOut: boolean;
  message: string;
  redirectTo?: string;
} {
  const isAuthErr = isAuthError(error);

  return {
    shouldSignOut: isAuthErr,
    message: getAuthErrorMessage(error),
    redirectTo: isAuthErr ? "/sign-in" : undefined,
  };
}
