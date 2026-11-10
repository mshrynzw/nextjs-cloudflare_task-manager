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
  deleteProjectForUser,
  getProject,
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
    expect(listed.data[0]?.progressWeights.done).toBe(1);
    expect(listed.data[0]?.members).toHaveLength(1);
  });

  it("calculates project progress with default status weights", async () => {
    const { db, userId, workspaceId } = await seedActor();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Weighted Board",
      status: "active",
      priority: "medium",
      color: "#4f7cff",
    });

    const statuses = [
      "backlog",
      "todo",
      "in_progress",
      "review",
      "done",
    ] as const;
    for (const [index, status] of statuses.entries()) {
      await createTaskForProject(db, userId, project.id!, {
        title: `Task ${index}`,
        status,
        priority: "medium",
      });
    }

    const detail = await getProject(db, userId, project.id!);
    expect(detail.progress).toBe(50);
    expect(detail.taskSummary.completed).toBe(1);
    expect(detail.progressWeights).toEqual({
      backlog: 0,
      todo: 0.2,
      in_progress: 0.5,
      review: 0.8,
      done: 1,
    });
  });

  it("hides archived projects from the default list", async () => {
    const { db, userId, workspaceId } = await seedActor();
    const created = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Soon Archived",
      status: "active",
      priority: "low",
      color: "#222222",
    });

    await deleteProjectForUser(db, userId, created.id!);

    const listed = await getProjects(db, userId, {
      page: 1,
      limit: 20,
    });
    expect(listed.data).toHaveLength(0);

    const archived = await getProjects(db, userId, {
      page: 1,
      limit: 20,
      status: "archived",
    });
    expect(archived.data).toHaveLength(1);
    expect(archived.data[0]?.name).toBe("Soon Archived");
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
