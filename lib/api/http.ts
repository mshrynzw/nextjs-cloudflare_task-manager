import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/authorization";
import { ApiError } from "@/lib/api/errors";

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ data }, { status: 200, ...init });
}

export function jsonCreated<T>(data: T): NextResponse {
  return NextResponse.json({ data }, { status: 201 });
}

export function jsonList<T>(
  data: T[],
  meta: { page: number; limit: number; total: number },
): NextResponse {
  return NextResponse.json({
    data,
    meta: {
      ...meta,
      totalPages: Math.max(1, Math.ceil(meta.total / meta.limit)),
    },
  });
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status },
    );
  }

  if (error instanceof AuthError) {
    const status =
      error.code === "UNAUTHENTICATED"
        ? 401
        : error.code === "NOT_FOUND"
          ? 404
          : 403;
    const code =
      error.code === "UNAUTHENTICATED"
        ? "UNAUTHORIZED"
        : error.code === "NOT_FOUND"
          ? "NOT_FOUND"
          : "FORBIDDEN";
    return NextResponse.json(
      { error: { code, message: error.message } },
      { status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request.",
          details: error.issues.map((issue) => ({
            field: issue.path.join(".") || "body",
            message: issue.message,
          })),
        },
      },
      { status: 422 },
    );
  }

  console.error(error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error.",
      },
    },
    { status: 500 },
  );
}
