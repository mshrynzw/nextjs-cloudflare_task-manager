import { afterEach, describe, expect, it } from "vitest";
import {
  checkRateLimit,
  resetRateLimitStore,
} from "@/lib/security/rate-limit";

describe("checkRateLimit", () => {
  afterEach(() => {
    resetRateLimitStore();
  });

  it("allows requests under the limit", () => {
    const first = checkRateLimit("key", 2, 60_000, 1_000);
    const second = checkRateLimit("key", 2, 60_000, 1_001);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
  });

  it("blocks requests over the limit until the window resets", () => {
    checkRateLimit("key", 1, 60_000, 1_000);
    const blocked = checkRateLimit("key", 1, 60_000, 1_001);

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    const afterReset = checkRateLimit("key", 1, 60_000, 61_001);
    expect(afterReset.allowed).toBe(true);
  });
});
