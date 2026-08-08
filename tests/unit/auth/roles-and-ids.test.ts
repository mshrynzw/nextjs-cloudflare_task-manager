import { describe, expect, it } from "vitest";
import { createId, nowUnix } from "@/lib/db/id";
import { assertMinimumRole, hasMinimumRole } from "@/lib/auth/roles";

describe("createId", () => {
  it("prefixes generated ids", () => {
    expect(createId("user")).toMatch(/^user_/);
    expect(createId("project")).toMatch(/^project_/);
  });
});

describe("nowUnix", () => {
  it("returns seconds close to Date.now", () => {
    const before = Math.floor(Date.now() / 1000);
    const value = nowUnix();
    const after = Math.floor(Date.now() / 1000);
    expect(value).toBeGreaterThanOrEqual(before);
    expect(value).toBeLessThanOrEqual(after);
  });
});

describe("role helpers", () => {
  it("keeps hasMinimumRole ordering consistent", () => {
    expect(hasMinimumRole("member", "viewer")).toBe(true);
    expect(hasMinimumRole("viewer", "owner")).toBe(false);
    expect(assertMinimumRole("owner", "member")).toBe(true);
    expect(assertMinimumRole("viewer", "member")).toBe(false);
  });
});
