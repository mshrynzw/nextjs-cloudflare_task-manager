import { describe, expect, it } from "vitest";
import {
  changePasswordBodySchema,
  createProjectBodySchema,
  createTaskBodySchema,
  listProjectsQuerySchema,
  updateTaskPositionBodySchema,
} from "@/lib/api/request-schemas";

describe("createProjectBodySchema", () => {
  it("accepts a valid payload and applies defaults", () => {
    const parsed = createProjectBodySchema.parse({
      name: " Website ",
    });
    expect(parsed.name).toBe("Website");
    expect(parsed.status).toBe("planning");
    expect(parsed.priority).toBe("medium");
    expect(parsed.color).toBe("#4f7cff");
  });

  it("rejects an empty name", () => {
    expect(() => createProjectBodySchema.parse({ name: "   " })).toThrow();
  });
});

describe("createTaskBodySchema", () => {
  it("accepts a valid task title", () => {
    const parsed = createTaskBodySchema.parse({ title: " Ship it " });
    expect(parsed.title).toBe("Ship it");
  });

  it("rejects titles over 200 characters", () => {
    expect(() =>
      createTaskBodySchema.parse({ title: "x".repeat(201) }),
    ).toThrow();
  });
});

describe("listProjectsQuerySchema", () => {
  it("coerces pagination values", () => {
    const parsed = listProjectsQuerySchema.parse({
      page: "2",
      limit: "10",
      sort: "name",
      order: "asc",
    });
    expect(parsed.page).toBe(2);
    expect(parsed.limit).toBe(10);
  });

  it("rejects oversized page sizes", () => {
    expect(() =>
      listProjectsQuerySchema.parse({ page: "1", limit: "101" }),
    ).toThrow();
  });
});

describe("updateTaskPositionBodySchema", () => {
  it("requires status and position", () => {
    const parsed = updateTaskPositionBodySchema.parse({
      status: "in_progress",
      position: 3,
    });
    expect(parsed).toEqual({ status: "in_progress", position: 3 });
  });
});

describe("changePasswordBodySchema", () => {
  it("requires passwords of at least 8 characters", () => {
    expect(() =>
      changePasswordBodySchema.parse({
        currentPassword: "short",
        newPassword: "also",
      }),
    ).toThrow();

    const parsed = changePasswordBodySchema.parse({
      currentPassword: "OldPass12",
      newPassword: "NewPass34",
    });
    expect(parsed.newPassword).toBe("NewPass34");
  });
});
