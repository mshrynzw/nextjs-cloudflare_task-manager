import { describe, expect, it } from "vitest";
import { hasMinimumRole } from "@/lib/auth/roles";

describe("hasMinimumRole", () => {
  it("allows owner for any minimum role", () => {
    expect(hasMinimumRole("owner", "viewer")).toBe(true);
    expect(hasMinimumRole("owner", "member")).toBe(true);
    expect(hasMinimumRole("owner", "owner")).toBe(true);
  });

  it("rejects viewer when member is required", () => {
    expect(hasMinimumRole("viewer", "member")).toBe(false);
  });
});
