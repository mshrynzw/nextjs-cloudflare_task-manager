import { conflict, forbidden, notFound } from "@/lib/api/errors";
import { findWorkspaceMembership } from "@/lib/auth/membership";
import { hasMinimumRole, type MembershipRole } from "@/lib/auth/roles";
import type { AppDatabase } from "@/lib/db/client";
import { listWorkspaceMembers } from "@/lib/repositories/project-repository";
import { findUserByEmail } from "@/lib/repositories/user-repository";
import {
  addWorkspaceMember,
  countWorkspaceMembersWithRole,
  listProjectIdsInWorkspace,
  removeProjectMembershipsForUserInProjects,
  removeWorkspaceMember,
  unassignTasksForUserInProjects,
  updateWorkspaceMemberRole,
} from "@/lib/repositories/workspace-repository";

function asRole(role: string): MembershipRole {
  return role as MembershipRole;
}

async function requireWorkspaceMembership(
  db: AppDatabase,
  userId: string,
  workspaceId: string,
) {
  const membership = await findWorkspaceMembership(db, userId, workspaceId);
  if (!membership) {
    throw forbidden("Workspace access denied");
  }
  return membership;
}

async function requireWorkspaceOwner(
  db: AppDatabase,
  userId: string,
  workspaceId: string,
) {
  const membership = await requireWorkspaceMembership(db, userId, workspaceId);
  if (!hasMinimumRole(asRole(membership.role), "owner")) {
    throw forbidden("Only workspace owners can manage members");
  }
  return membership;
}

async function assertNotLastOwner(
  db: AppDatabase,
  workspaceId: string,
  currentRole: string,
  message: string,
) {
  if (currentRole !== "owner") {
    return;
  }

  const ownerCount = await countWorkspaceMembersWithRole(
    db,
    workspaceId,
    "owner",
  );
  if (ownerCount <= 1) {
    throw forbidden(message);
  }
}

export async function getWorkspaceMembersForUser(
  db: AppDatabase,
  userId: string,
  workspaceId: string,
) {
  await requireWorkspaceMembership(db, userId, workspaceId);
  return listWorkspaceMembers(db, workspaceId);
}

export async function addWorkspaceMemberForUser(
  db: AppDatabase,
  actorUserId: string,
  workspaceId: string,
  input: { email: string; role: string },
) {
  await requireWorkspaceOwner(db, actorUserId, workspaceId);

  const user = await findUserByEmail(db, input.email);
  if (!user) {
    throw notFound("User not found");
  }

  const existing = await findWorkspaceMembership(db, user.id, workspaceId);
  if (existing) {
    throw conflict("User is already a workspace member");
  }

  await addWorkspaceMember(db, {
    workspaceId,
    userId: user.id,
    role: input.role,
  });

  return {
    id: user.id,
    name: user.name,
    image: user.image,
    role: input.role,
  };
}

export async function updateWorkspaceMemberRoleForUser(
  db: AppDatabase,
  actorUserId: string,
  workspaceId: string,
  targetUserId: string,
  role: string,
) {
  await requireWorkspaceOwner(db, actorUserId, workspaceId);

  const target = await findWorkspaceMembership(db, targetUserId, workspaceId);
  if (!target) {
    throw notFound("Member not found");
  }

  if (target.role === "owner" && role !== "owner") {
    await assertNotLastOwner(
      db,
      workspaceId,
      target.role,
      "Cannot change the last owner",
    );
  }

  const updated = await updateWorkspaceMemberRole(
    db,
    workspaceId,
    targetUserId,
    role,
  );
  if (!updated) {
    throw notFound("Member not found");
  }

  return { id: targetUserId, role: updated.role };
}

export async function removeWorkspaceMemberForUser(
  db: AppDatabase,
  actorUserId: string,
  workspaceId: string,
  targetUserId: string,
) {
  await requireWorkspaceOwner(db, actorUserId, workspaceId);

  const target = await findWorkspaceMembership(db, targetUserId, workspaceId);
  if (!target) {
    throw notFound("Member not found");
  }

  await assertNotLastOwner(
    db,
    workspaceId,
    target.role,
    "Cannot remove the last owner",
  );

  const projectIds = await listProjectIdsInWorkspace(db, workspaceId);
  await unassignTasksForUserInProjects(db, targetUserId, projectIds);
  await removeProjectMembershipsForUserInProjects(db, targetUserId, projectIds);
  await removeWorkspaceMember(db, workspaceId, targetUserId);

  return { deleted: true };
}
