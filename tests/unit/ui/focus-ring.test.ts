import { describe, expect, it } from "vitest";
import { focusRingClass } from "@/lib/utils";

describe("focusRingClass", () => {
  it("includes focus-visible ring utilities", () => {
    expect(focusRingClass).toContain("focus-visible:ring-2");
    expect(focusRingClass).toContain("accent-ring");
  });
});
