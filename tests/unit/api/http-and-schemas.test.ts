import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { ApiError, forbidden, unauthorized } from "@/lib/api/errors";
import { toErrorResponse } from "@/lib/api/http";
import {
  fromUnixDate,
  parseSearchParams,
  paginationSchema,
  toUnixDate,
} from "@/lib/api/schemas";

describe("date helpers", () => {
  it("converts ISO dates to unix seconds", () => {
    expect(toUnixDate("2026-08-08")).toBe(
      Math.floor(new Date("2026-08-08").getTime() / 1000),
    );
    expect(toUnixDate(null)).toBeNull();
    expect(toUnixDate("not-a-date")).toBeNull();
  });

  it("formats unix seconds as YYYY-MM-DD", () => {
    expect(fromUnixDate(1_754_611_200)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(fromUnixDate(null)).toBeNull();
  });
});

describe("parseSearchParams", () => {
  it("parses URLSearchParams with coercion", () => {
    const params = new URLSearchParams("page=3&limit=15");
    expect(parseSearchParams(paginationSchema, params)).toEqual({
      page: 3,
      limit: 15,
    });
  });
});

describe("toErrorResponse", () => {
  it("maps ApiError to JSON error payloads", async () => {
    const response = toErrorResponse(forbidden("Nope"));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: { code: "FORBIDDEN", message: "Nope" },
    });
  });

  it("maps unauthorized errors", async () => {
    const response = toErrorResponse(unauthorized());
    expect(response.status).toBe(401);
  });

  it("maps ZodError to validation details", async () => {
    let zodError: ZodError;
    try {
      paginationSchema.parse({ page: 0, limit: 0 });
      throw new Error("expected parse failure");
    } catch (error) {
      zodError = error as ZodError;
    }
    const response = toErrorResponse(zodError!);
    expect(response.status).toBe(422);
    const body = (await response.json()) as {
      error: { code: string; details: unknown };
    };
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(Array.isArray(body.error.details)).toBe(true);
  });

  it("hides unknown errors as INTERNAL_ERROR", async () => {
    const response = toErrorResponse(new Error("secret stack"));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error.",
      },
    });
  });

  it("preserves ApiError details", async () => {
    const error = new ApiError("VALIDATION_ERROR", "Bad", 422, [
      { field: "name", message: "Required" },
    ]);
    const response = toErrorResponse(error);
    const body = (await response.json()) as {
      error: { details: Array<{ field: string; message: string }> };
    };
    expect(body.error.details).toEqual([
      { field: "name", message: "Required" },
    ]);
  });
});
