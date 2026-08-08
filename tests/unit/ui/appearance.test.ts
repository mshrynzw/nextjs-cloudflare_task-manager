import { describe, expect, it } from "vitest";
import {
  appearanceDataAttributes,
  resolveThemeClass,
} from "@/lib/ui/appearance";

describe("appearance helpers", () => {
  it("resolves explicit dark and light themes", () => {
    expect(resolveThemeClass("dark")).toBe("dark");
    expect(resolveThemeClass("light")).toBe("light");
  });

  it("resolves system theme from prefers-color-scheme", () => {
    expect(resolveThemeClass("system", true)).toBe("dark");
    expect(resolveThemeClass("system", false)).toBe("light");
  });

  it("builds data attributes for the document root", () => {
    expect(
      appearanceDataAttributes({
        theme: "dark",
        accentColor: "emerald",
        density: "compact",
        animations: false,
      }),
    ).toEqual({
      "data-accent": "emerald",
      "data-density": "compact",
      "data-animations": "off",
      "data-theme": "dark",
    });
  });
});
