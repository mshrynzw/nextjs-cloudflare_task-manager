export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly status: number,
    readonly details?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function unauthorized(message = "Authentication required"): ApiError {
  return new ApiError("UNAUTHORIZED", message, 401);
}

export function forbidden(message = "Forbidden"): ApiError {
  return new ApiError("FORBIDDEN", message, 403);
}

export function notFound(message = "Resource not found"): ApiError {
  return new ApiError("NOT_FOUND", message, 404);
}

export function validationError(
  message = "Invalid request.",
  details?: Array<{ field: string; message: string }>,
): ApiError {
  return new ApiError("VALIDATION_ERROR", message, 422, details);
}

export function tooManyRequests(message: string): ApiError {
  return new ApiError("RATE_LIMITED", message, 429);
}

export function conflict(message = "Conflict."): ApiError {
  return new ApiError("CONFLICT", message, 409);
}

export function internalError(
  message = "Internal server error.",
): ApiError {
  return new ApiError("INTERNAL_ERROR", message, 500);
}

