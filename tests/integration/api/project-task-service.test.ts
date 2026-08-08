import { describe, expect, it } from "vitest";
import { createId, nowUnix } from "@/lib/db/id";
import {
  projectMembers,
  users,
  workspaceMembers,
  workspaces,
} from "@/lib/db/schema";
import {
  createProjectForUser,
  getProjects,
} from "@/lib/services/project-service";
import {
  createTaskForProject,
  updateTaskStatusForUser,
} from "@/lib/services/task-service";
import { createTestDatabase } from "../../helpers/db";

async function seedActor() {
  const db = createTestDatabase();
  const timestamp = nowUnix();
  const userId = createId("user");
  const workspaceId = createId("workspace");

  await db.insert(users).values({
    id: userId,
    email: "api@example.com",
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  await db.insert(workspaces).values({
    id: workspaceId,
    name: "API Workspace",
    slug: `api-${workspaceId.slice(-6)}`,
    createdBy: userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  await db.insert(workspaceMembers).values({
    id: createId("wsmem"),
    workspaceId,
    userId,
    role: "owner",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return { db, userId, workspaceId };
}

describe("project and task services", () => {
  it("creates a project and lists it for the owner", async () => {
    const { db, userId, workspaceId } = await seedActor();

    const created = await createProjectForUser(db, userId, {
      workspaceId,
      name: "API Project",
      status: "active",
      priority: "high",
      color: "#4f7cff",
    });

    expect(created.id).toBeTruthy();

    const listed = await getProjects(db, userId, {
      page: 1,
      limit: 20,
    });

    expect(listed.data).toHaveLength(1);
    expect(listed.data[0]?.name).toBe("API Project");
    expect(listed.data[0]?.progress).toBe(0);
  });

  it("creates a task and updates status with activity side effects", async () => {
    const { db, userId, workspaceId } = await seedActor();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Board",
      status: "active",
      priority: "medium",
      color: "#111111",
    });

    const task = await createTaskForProject(db, userId, project.id!, {
      title: "Ship API",
      status: "todo",
      priority: "high",
    });

    const updated = await updateTaskStatusForUser(db, userId, task!.id, "done");

    expect(updated.status).toBe("done");
    expect(updated.completedAt).toBeTruthy();

    const membership = await db.select().from(projectMembers).all();
    expect(membership).toHaveLength(1);
  });
});
