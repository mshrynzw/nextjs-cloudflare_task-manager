import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/errors";
import {
  addProjectMemberForUser,
  createProjectForUser,
  getProject,
  getProjects,
  removeProjectMemberForUser,
  updateProjectForUser,
} from "@/lib/services/project-service";
import {
  addComment,
  createTaskForProject,
  getTasksForProject,
  updateTaskPositionForUser,
} from "@/lib/services/task-service";
import { getDashboardOverview } from "@/lib/services/dashboard-service";
import {
  seedWorkspaceOwner,
  seedWorkspaceOwnerAndMember,
} from "../../helpers/db";

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

    await expect(
      getProject(db, outsiderId, project.id!),
    ).rejects.toBeInstanceOf(ApiError);

    try {
      await getProject(db, outsiderId, project.id!);
    } catch (error) {
      expect(error).toMatchObject({ code: "FORBIDDEN", status: 403 });
    }
  });

  it("lets workspace members view public projects without membership", async () => {
    const { db, userId, memberId, workspaceId } =
      await seedWorkspaceOwnerAndMember();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Public",
      status: "active",
      priority: "medium",
      color: "#111111",
    });

    const listed = await getProjects(db, memberId, { page: 1, limit: 20 });
    expect(listed.data).toHaveLength(1);
    expect(listed.data[0]?.visibility).toBe("workspace");
    expect(listed.data[0]?.canEdit).toBe(false);

    const detail = await getProject(db, memberId, project.id!);
    expect(detail.name).toBe("Public");
    expect(detail.canEdit).toBe(false);

    const tasks = await getTasksForProject(db, memberId, project.id!, {});
    expect(tasks).toEqual([]);
  });

  it("hides members-only projects from workspace non-members", async () => {
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

    const listed = await getProjects(db, memberId, { page: 1, limit: 20 });
    expect(listed.data).toHaveLength(0);

    await expect(getProject(db, memberId, project.id!)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("lets owners switch a public project to members-only", async () => {
    const { db, userId, memberId, workspaceId } =
      await seedWorkspaceOwnerAndMember();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Switchable",
      status: "active",
      priority: "medium",
      color: "#111111",
    });

    await updateProjectForUser(db, userId, project.id!, {
      visibility: "members",
    });

    await expect(getProject(db, memberId, project.id!)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejects visibility changes from non-owners", async () => {
    const { db, userId, memberId, workspaceId } =
      await seedWorkspaceOwnerAndMember();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Owned",
      status: "active",
      priority: "medium",
      color: "#111111",
    });
    await addProjectMemberForUser(db, userId, project.id!, {
      userId: memberId,
      role: "member",
    });

    await expect(
      updateProjectForUser(db, memberId, project.id!, {
        visibility: "members",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("includes public project tasks in dashboard insights for workspace members", async () => {
    const { db, userId, memberId, workspaceId } =
      await seedWorkspaceOwnerAndMember();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Insights",
      status: "active",
      priority: "medium",
      color: "#111111",
    });
    await createTaskForProject(db, userId, project.id!, {
      title: "Visible task",
    });

    const overview = await getDashboardOverview(db, memberId);
    expect(overview.projects.some((item) => item.id === project.id)).toBe(true);
    expect(overview.kpis.totalProjects).toBe(1);
    expect(overview.kpis.openTasks).toBe(1);
  });
});

describe("project members", () => {
  it("adds workspace members when creating a project", async () => {
    const { db, userId, memberId, workspaceId } =
      await seedWorkspaceOwnerAndMember();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "With members",
      status: "active",
      priority: "medium",
      color: "#111111",
      memberIds: [memberId, userId],
    });

    const detail = await getProject(db, memberId, project.id!);
    expect(detail.canEdit).toBe(true);
    expect(detail.members.map((member) => member.id).sort()).toEqual(
      [userId, memberId].sort(),
    );
  });

  it("rejects memberIds outside the workspace", async () => {
    const { db, userId, outsiderId, workspaceId } = await seedWorkspaceOwner();
    await expect(
      createProjectForUser(db, userId, {
        workspaceId,
        name: "Invalid members",
        status: "active",
        priority: "medium",
        color: "#111111",
        memberIds: [outsiderId],
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("rejects duplicate member additions and last-owner removal", async () => {
    const { db, userId, memberId, workspaceId } =
      await seedWorkspaceOwnerAndMember();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Managed",
      status: "active",
      priority: "medium",
      color: "#111111",
    });

    await addProjectMemberForUser(db, userId, project.id!, {
      userId: memberId,
      role: "member",
    });
    await expect(
      addProjectMemberForUser(db, userId, project.id!, {
        userId: memberId,
        role: "member",
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });

    await expect(
      removeProjectMemberForUser(db, userId, project.id!, userId),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    await removeProjectMemberForUser(db, userId, project.id!, memberId);
    const after = await getProject(db, userId, project.id!);
    expect(after.members).toHaveLength(1);
    expect(after.members[0]?.id).toBe(userId);
  });

  it("rejects member management from non-owners", async () => {
    const { db, userId, memberId, workspaceId } =
      await seedWorkspaceOwnerAndMember();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Owned",
      status: "active",
      priority: "medium",
      color: "#111111",
      memberIds: [memberId],
    });

    await expect(
      addProjectMemberForUser(db, memberId, project.id!, {
        userId: userId,
        role: "member",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
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

  it("rejects workspace non-members from creating tasks on a public project", async () => {
    const { db, userId, memberId, workspaceId } =
      await seedWorkspaceOwnerAndMember();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Locked public",
      status: "active",
      priority: "low",
      color: "#333333",
    });

    await expect(
      createTaskForProject(db, memberId, project.id!, {
        title: "Intrusion",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
