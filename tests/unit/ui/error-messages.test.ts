import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { getUserFacingError } from "@/lib/ui/error-messages";

describe("getUserFacingError", () => {
  it("maps API permission errors", () => {
    const result = getUserFacingError(
      new ApiError("FORBIDDEN", "Project access denied", 403),
      "en",
    );
    expect(result.variant).toBe("permission");
    expect(result.code).toBe("FORBIDDEN");
    expect(result.description).toContain("Project access denied");
  });

  it("maps network TypeErrors", () => {
    const result = getUserFacingError(new TypeError("Failed to fetch"), "en");
    expect(result.variant).toBe("network");
    expect(result.code).toBe("NETWORK_ERROR");
  });

  it("falls back for unknown errors", () => {
    const result = getUserFacingError(new Error("boom"), "en");
    expect(result.variant).toBe("generic");
  });
});
