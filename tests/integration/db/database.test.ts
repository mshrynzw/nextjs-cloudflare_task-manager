import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createId, nowUnix } from "@/lib/db/id";
import { projects, tasks, users, workspaces } from "@/lib/db/schema";
import { seedDemoData } from "@/lib/db/seed";
import { createTestDatabase } from "../../helpers/db";

describe("database connection", () => {
  it("opens an in-memory SQLite database and applies migrations", async () => {
    const db = createTestDatabase();
    const rows = await db.select().from(users).all();
    expect(rows).toEqual([]);
  });
});

describe("migration and CRUD", () => {
  it("inserts and reads a user", async () => {
    const db = createTestDatabase();
    const timestamp = nowUnix();
    const userId = createId("user");

    await db.insert(users).values({
      id: userId,
      name: "Alice",
      email: "alice@example.com",
      role: "user",
      timezone: "UTC",
      language: "en",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();
    expect(user?.email).toBe("alice@example.com");
  });
});

describe("foreign keys", () => {
  it("rejects a project that references a missing workspace", async () => {
    const db = createTestDatabase();
    const timestamp = nowUnix();
    const userId = createId("user");

    await db.insert(users).values({
      id: userId,
      email: "owner@example.com",
      role: "user",
      timezone: "UTC",
      language: "en",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    expect(() =>
      db
        .insert(projects)
        .values({
          id: createId("project"),
          workspaceId: "workspace_missing",
          name: "Invalid Project",
          color: "#000000",
          status: "active",
          priority: "medium",
          createdBy: userId,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        .run(),
    ).toThrow();
  });
});

describe("authorization data model", () => {
  it("seeds membership-linked workspace and project resources", async () => {
    const db = createTestDatabase();
    const seeded = await seedDemoData(db);

    const workspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, seeded.workspaceId))
      .get();
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, seeded.projectId))
      .get();
    const task = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, seeded.taskId))
      .get();

    expect(workspace?.createdBy).toBe(seeded.userId);
    expect(project?.workspaceId).toBe(seeded.workspaceId);
    expect(task?.projectId).toBe(seeded.projectId);
    expect(task?.assigneeId).toBe(seeded.userId);
  });
});
