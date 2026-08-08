import type { ApiErrorCode } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/errors";
import type { ErrorStateVariant } from "@/components/feedback/error-state";

export interface UserFacingError {
  variant: ErrorStateVariant;
  title: string;
  description: string;
  code?: ApiErrorCode | "NETWORK_ERROR";
}

const CODE_MAP: Record<ApiErrorCode, UserFacingError> = {
  UNAUTHORIZED: {
    variant: "auth",
    title: "Sign in required",
    description: "Please sign in to continue.",
    code: "UNAUTHORIZED",
  },
  FORBIDDEN: {
    variant: "permission",
    title: "Access denied",
    description: "You do not have permission to perform this action.",
    code: "FORBIDDEN",
  },
  NOT_FOUND: {
    variant: "not-found",
    title: "Not found",
    description: "The requested resource could not be found.",
    code: "NOT_FOUND",
  },
  VALIDATION_ERROR: {
    variant: "generic",
    title: "Invalid input",
    description: "Please check your input and try again.",
    code: "VALIDATION_ERROR",
  },
  RATE_LIMITED: {
    variant: "generic",
    title: "Too many attempts",
    description: "Please wait a moment and try again.",
    code: "RATE_LIMITED",
  },
  CONFLICT: {
    variant: "generic",
    title: "Conflict",
    description: "This change conflicts with the current state. Refresh and retry.",
    code: "CONFLICT",
  },
  INTERNAL_ERROR: {
    variant: "database",
    title: "Server error",
    description: "Something went wrong on our side. Please try again.",
    code: "INTERNAL_ERROR",
  },
};

export function getUserFacingError(error: unknown): UserFacingError {
  if (error instanceof ApiError) {
    return {
      ...CODE_MAP[error.code],
      description: error.message || CODE_MAP[error.code].description,
    };
  }

  if (error instanceof TypeError) {
    return {
      variant: "network",
      title: "Connection problem",
      description:
        "We could not reach the server. Check your network and try again.",
      code: "NETWORK_ERROR",
    };
  }

  if (error instanceof Error && /fetch|network|Failed to fetch/i.test(error.message)) {
    return {
      variant: "network",
      title: "Connection problem",
      description:
        "We could not reach the server. Check your network and try again.",
      code: "NETWORK_ERROR",
    };
  }

  return {
    variant: "generic",
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again.",
  };
}
