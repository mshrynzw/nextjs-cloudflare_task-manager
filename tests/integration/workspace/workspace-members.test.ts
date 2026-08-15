import { describe, expect, it } from "vitest";
import { findProjectMembership } from "@/lib/auth/membership";
import { findTaskById } from "@/lib/repositories/task-repository";
import {
  addProjectMemberForUser,
  createProjectForUser,
} from "@/lib/services/project-service";
import { createTaskForProject } from "@/lib/services/task-service";
import {
  addWorkspaceMemberForUser,
  getWorkspaceMembersForUser,
  removeWorkspaceMemberForUser,
  updateWorkspaceMemberRoleForUser,
} from "@/lib/services/workspace-service";
import {
  seedWorkspaceOwner,
  seedWorkspaceOwnerAndMember,
} from "../../helpers/db";

describe("workspace member management", () => {
  it("lets owners add an existing user by email", async () => {
    const { db, userId, outsiderId, workspaceId } = await seedWorkspaceOwner();

    const added = await addWorkspaceMemberForUser(db, userId, workspaceId, {
      email: "outsider@example.com",
      role: "member",
    });

    expect(added).toMatchObject({
      id: outsiderId,
      role: "member",
    });

    const members = await getWorkspaceMembersForUser(db, userId, workspaceId);
    expect(members.map((member) => member.id)).toContain(outsiderId);
  });

  it("rejects adding a user who is already a member", async () => {
    const { db, userId, workspaceId } = await seedWorkspaceOwner();

    await expect(
      addWorkspaceMemberForUser(db, userId, workspaceId, {
        email: "owner@example.com",
        role: "member",
      }),
    ).rejects.toMatchObject({ code: "CONFLICT", status: 409 });
  });

  it("rejects adding an unknown email", async () => {
    const { db, userId, workspaceId } = await seedWorkspaceOwner();

    await expect(
      addWorkspaceMemberForUser(db, userId, workspaceId, {
        email: "missing@example.com",
        role: "member",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
  });

  it("rejects member management from non-owners", async () => {
    const { db, memberId, workspaceId } = await seedWorkspaceOwnerAndMember();

    await expect(
      addWorkspaceMemberForUser(db, memberId, workspaceId, {
        email: "outsider@example.com",
        role: "viewer",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
  });

  it("lets owners change a member role", async () => {
    const { db, userId, memberId, workspaceId } =
      await seedWorkspaceOwnerAndMember();

    const updated = await updateWorkspaceMemberRoleForUser(
      db,
      userId,
      workspaceId,
      memberId,
      "viewer",
    );

    expect(updated).toEqual({ id: memberId, role: "viewer" });
  });

  it("rejects demoting or removing the last owner", async () => {
    const { db, userId, workspaceId } = await seedWorkspaceOwner();

    await expect(
      updateWorkspaceMemberRoleForUser(
        db,
        userId,
        workspaceId,
        userId,
        "member",
      ),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    await expect(
      removeWorkspaceMemberForUser(db, userId, workspaceId, userId),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("removes project membership and unassigns tasks when leaving the workspace", async () => {
    const { db, userId, memberId, workspaceId } =
      await seedWorkspaceOwnerAndMember();
    const project = await createProjectForUser(db, userId, {
      workspaceId,
      name: "Shared",
      status: "active",
      priority: "medium",
      color: "#111111",
    });
    await addProjectMemberForUser(db, userId, project.id!, {
      userId: memberId,
      role: "member",
    });
    const task = await createTaskForProject(db, userId, project.id!, {
      title: "Assigned work",
      assigneeId: memberId,
    });
    expect(task).not.toBeNull();
    if (!task) {
      throw new Error("Expected task to be created");
    }

    await removeWorkspaceMemberForUser(db, userId, workspaceId, memberId);

    const membership = await findProjectMembership(db, memberId, project.id!);
    expect(membership).toBeUndefined();

    const updatedTask = await findTaskById(db, task.id);
    expect(updatedTask?.assigneeId).toBeNull();

    const members = await getWorkspaceMembersForUser(db, userId, workspaceId);
    expect(members.map((member) => member.id)).not.toContain(memberId);
  });

  it("rejects outsiders from listing workspace members", async () => {
    const { db, outsiderId, workspaceId } = await seedWorkspaceOwner();

    await expect(
      getWorkspaceMembersForUser(db, outsiderId, workspaceId),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
