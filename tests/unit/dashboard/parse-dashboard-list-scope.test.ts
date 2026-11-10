import { describe, expect, it } from "vitest";
import { parseDashboardListScope } from "@/lib/services/dashboard-service";

describe("parseDashboardListScope", () => {
  it("defaults to mine", () => {
    expect(parseDashboardListScope(undefined)).toBe("mine");
    expect(parseDashboardListScope("mine")).toBe("mine");
    expect(parseDashboardListScope("other")).toBe("mine");
  });

  it("accepts all", () => {
    expect(parseDashboardListScope("all")).toBe("all");
    expect(parseDashboardListScope(["all"])).toBe("all");
  });
});
