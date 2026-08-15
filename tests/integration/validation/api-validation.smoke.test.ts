import { describe, expect, it } from "vitest";
import {
  createProjectBodySchema,
  createTaskBodySchema,
  listProjectsQuerySchema,
} from "@/lib/api/request-schemas";

/**
 * Smoke coverage for the shared API validation boundary.
 */
describe("API validation boundary", () => {
  it("accepts a valid project payload", () => {
    const result = createProjectBodySchema.parse({
      name: "Website Redesign",
      description: "Portfolio landing page refresh",
    });
    expect(result.name).toBe("Website Redesign");
    expect(result.visibility).toBe("workspace");
  });

  it("rejects an empty project name", () => {
    expect(() => createProjectBodySchema.parse({ name: "   " })).toThrow();
  });

  it("accepts task creation payloads used by the board", () => {
    const result = createTaskBodySchema.parse({
      title: "Design login",
      status: "todo",
      priority: "high",
    });
    expect(result.title).toBe("Design login");
  });

  it("clamps project list pagination through schema defaults", () => {
    const result = listProjectsQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });
});
