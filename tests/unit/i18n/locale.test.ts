import { describe, expect, it } from "vitest";
import { interpolate } from "@/lib/i18n/interpolate";
import { isLocale, parseLocale } from "@/lib/i18n/locale";

describe("parseLocale", () => {
  it("defaults to Japanese", () => {
    expect(parseLocale(undefined)).toBe("ja");
    expect(parseLocale(null)).toBe("ja");
    expect(parseLocale("fr")).toBe("ja");
  });

  it("accepts ja and en", () => {
    expect(parseLocale("ja")).toBe("ja");
    expect(parseLocale("en")).toBe("en");
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
  });
});

describe("interpolate", () => {
  it("replaces named placeholders", () => {
    expect(interpolate("Welcome back, {name}.", { name: "Demo" })).toBe(
      "Welcome back, Demo.",
    );
  });

  it("leaves unknown placeholders intact", () => {
    expect(interpolate("Hello {name}", {})).toBe("Hello {name}");
  });
});
