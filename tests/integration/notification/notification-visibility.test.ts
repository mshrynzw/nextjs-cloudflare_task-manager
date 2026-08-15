import { describe, expect, it } from "vitest";
import { createId, nowUnix } from "@/lib/db/id";
import { notifications } from "@/lib/db/schema";
import { createProjectForUser } from "@/lib/services/project-service";
import { createTaskForProject } from "@/lib/services/task-service";
import { getNotifications } from "@/lib/services/user-service";
import {
  seedWorkspaceOwnerAndMember,
  type TestDatabase,
} from "../../helpers/db";

async function insertTaskNotification(
  db: TestDatabase,
  input: { userId: string; taskId: string; title: string },
) {
  await db.insert(notifications).values({
    id: createId("notification"),
    userId: input.userId,
    type: "task_assigned",
    title: input.title,
    body: input.title,
    entityType: "task",
    entityId: input.taskId,
    createdAt: nowUnix(),
  });
}

describe("notification visibility", () => {
  it("hides members-only project notifications from workspace non-members", async () => {
    const { db, userId, memberId, workspaceId } =
      await seedWorkspaceOwnerAndMember();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Secret",
      status: "active",
      priority: "medium",
      color: "#111111",
      visibility: "members",
    });
    const task = await createTaskForProject(db, userId, project.id!, {
      title: "Hidden assignment",
    });
    expect(task).not.toBeNull();
    if (!task) {
      throw new Error("Expected task to be created");
    }

    await insertTaskNotification(db, {
      userId: memberId,
      taskId: task.id,
      title: "Hidden assignment",
    });

    const listed = await getNotifications(db, memberId);
    expect(listed.map((item) => item.title)).not.toContain("Hidden assignment");
  });

  it("returns members-only project notifications to project members", async () => {
    const { db, userId, workspaceId } = await seedWorkspaceOwnerAndMember();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Secret",
      status: "active",
      priority: "medium",
      color: "#111111",
      visibility: "members",
    });
    const task = await createTaskForProject(db, userId, project.id!, {
      title: "Owner assignment",
    });
    expect(task).not.toBeNull();
    if (!task) {
      throw new Error("Expected task to be created");
    }

    await insertTaskNotification(db, {
      userId,
      taskId: task.id,
      title: "Owner assignment",
    });

    const listed = await getNotifications(db, userId);
    expect(listed.map((item) => item.title)).toContain("Owner assignment");
  });

  it("returns workspace-visible project notifications to workspace members", async () => {
    const { db, userId, memberId, workspaceId } =
      await seedWorkspaceOwnerAndMember();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Public",
      status: "active",
      priority: "medium",
      color: "#111111",
    });
    const task = await createTaskForProject(db, userId, project.id!, {
      title: "Visible assignment",
    });
    expect(task).not.toBeNull();
    if (!task) {
      throw new Error("Expected task to be created");
    }

    await insertTaskNotification(db, {
      userId: memberId,
      taskId: task.id,
      title: "Visible assignment",
    });

    const listed = await getNotifications(db, memberId);
    expect(listed.map((item) => item.title)).toContain("Visible assignment");
  });
});
