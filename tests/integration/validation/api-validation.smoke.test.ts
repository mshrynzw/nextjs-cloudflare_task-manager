import { describe, expect, it } from "vitest";
import { z } from "zod";

/**
 * Integration-style smoke test for the validation boundary used by APIs.
 * Phase 4 will expand this directory with Route Handler / service tests.
 */
const createProjectInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
});

describe("API validation boundary smoke", () => {
  it("accepts a valid project payload shape", () => {
    const result = createProjectInputSchema.parse({
      name: "Website Redesign",
      description: "Portfolio landing page refresh",
    });

    expect(result.name).toBe("Website Redesign");
  });

  it("rejects an empty project name", () => {
    expect(() =>
      createProjectInputSchema.parse({
        name: "   ",
      }),
    ).toThrow();
  });
});
