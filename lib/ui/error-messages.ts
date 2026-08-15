import type { ApiErrorCode } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/errors";
import type { ErrorStateVariant } from "@/components/feedback/error-state";
import { getDictionary } from "@/lib/i18n/dictionary";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";

export interface UserFacingError {
  variant: ErrorStateVariant;
  title: string;
  description: string;
  code?: ApiErrorCode | "NETWORK_ERROR";
}

function codeMap(locale: Locale): Record<ApiErrorCode, UserFacingError> {
  const t = getDictionary(locale);
  return {
    UNAUTHORIZED: {
      variant: "auth",
      title: t.errors.authTitle,
      description: t.errors.authDescription,
      code: "UNAUTHORIZED",
    },
    FORBIDDEN: {
      variant: "permission",
      title: t.errors.permissionTitle,
      description: t.errors.permissionDescription,
      code: "FORBIDDEN",
    },
    NOT_FOUND: {
      variant: "not-found",
      title: t.errors.notFoundTitle,
      description: t.errors.notFoundDescription,
      code: "NOT_FOUND",
    },
    VALIDATION_ERROR: {
      variant: "generic",
      title: t.errors.validationTitle,
      description: t.errors.validationDescription,
      code: "VALIDATION_ERROR",
    },
    RATE_LIMITED: {
      variant: "generic",
      title: t.errors.rateLimitedTitle,
      description: t.errors.rateLimitedDescription,
      code: "RATE_LIMITED",
    },
    CONFLICT: {
      variant: "generic",
      title: t.errors.conflictTitle,
      description: t.errors.conflictDescription,
      code: "CONFLICT",
    },
    INTERNAL_ERROR: {
      variant: "database",
      title: t.errors.serverTitle,
      description: t.errors.serverDescription,
      code: "INTERNAL_ERROR",
    },
  };
}

export function getUserFacingError(
  error: unknown,
  locale: Locale = DEFAULT_LOCALE,
): UserFacingError {
  const t = getDictionary(locale);
  const mapped = codeMap(locale);

  if (error instanceof ApiError) {
    return {
      ...mapped[error.code],
      description: error.message || mapped[error.code].description,
    };
  }

  if (error instanceof TypeError) {
    return {
      variant: "network",
      title: t.errors.networkTitle,
      description: t.errors.networkDescription,
      code: "NETWORK_ERROR",
    };
  }

  if (error instanceof Error && /fetch|network|Failed to fetch/i.test(error.message)) {
    return {
      variant: "network",
      title: t.errors.networkTitle,
      description: t.errors.networkDescription,
      code: "NETWORK_ERROR",
    };
  }

  return {
    variant: "generic",
    title: t.errors.genericTitle,
    description: t.errors.genericDescription,
  };
}
