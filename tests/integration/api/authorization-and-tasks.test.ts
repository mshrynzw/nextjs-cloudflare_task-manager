import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/errors";
import {
  createProjectForUser,
  getProject,
} from "@/lib/services/project-service";
import {
  addComment,
  createTaskForProject,
  updateTaskPositionForUser,
} from "@/lib/services/task-service";
import { seedWorkspaceOwner } from "../../helpers/db";

describe("authorization boundaries", () => {
  it("rejects outsiders from viewing a project", async () => {
    const { db, userId, outsiderId, workspaceId } = await seedWorkspaceOwner();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Private",
      status: "active",
      priority: "medium",
      color: "#111111",
    });

    await expect(getProject(db, outsiderId, project.id!)).rejects.toBeInstanceOf(
      ApiError,
    );

    try {
      await getProject(db, outsiderId, project.id!);
    } catch (error) {
      expect(error).toMatchObject({ code: "FORBIDDEN", status: 403 });
    }
  });
});

describe("task workflow", () => {
  it("moves a task between columns and adds a comment", async () => {
    const { db, userId, workspaceId } = await seedWorkspaceOwner();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Board",
      status: "active",
      priority: "high",
      color: "#222222",
    });

    const task = await createTaskForProject(db, userId, project.id!, {
      title: "Move me",
      status: "todo",
      priority: "medium",
    });

    const moved = await updateTaskPositionForUser(db, userId, task!.id, {
      status: "in_progress",
      position: 1,
    });
    expect(moved.status).toBe("in_progress");
    expect(moved.position).toBe(1);

    const completed = await updateTaskPositionForUser(db, userId, task!.id, {
      status: "done",
      position: 1,
    });
    expect(completed.status).toBe("done");
    expect(completed.position).toBe(1);

    const comment = await addComment(db, userId, task!.id, "Looks good");
    expect(comment.content).toBe("Looks good");
    expect(comment.authorId).toBe(userId);
  });

  it("rejects outsiders from creating tasks", async () => {
    const { db, userId, outsiderId, workspaceId } = await seedWorkspaceOwner();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Locked",
      status: "active",
      priority: "low",
      color: "#333333",
    });

    await expect(
      createTaskForProject(db, outsiderId, project.id!, {
        title: "Intrusion",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
