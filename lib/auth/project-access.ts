import { forbidden, notFound } from "@/lib/api/errors";
import {
  findProjectMembership,
  findWorkspaceMembership,
} from "@/lib/auth/membership";
import { hasMinimumRole, type MembershipRole } from "@/lib/auth/roles";
import type { AppDatabase } from "@/lib/db/client";
import { findProjectById } from "@/lib/repositories/project-repository";

export type ProjectVisibility = "workspace" | "members";

export function isProjectVisibility(value: string): value is ProjectVisibility {
  return value === "workspace" || value === "members";
}

export function canReadProject(input: {
  visibility: string;
  isProjectMember: boolean;
  isWorkspaceMember: boolean;
}): boolean {
  if (!input.isWorkspaceMember && !input.isProjectMember) {
    return false;
  }
  if (input.isProjectMember) {
    return true;
  }
  return input.visibility === "workspace";
}

export function canWriteProject(
  projectRole: MembershipRole | null,
  minimumRole: MembershipRole = "member",
): boolean {
  if (!projectRole) {
    return false;
  }
  return hasMinimumRole(projectRole, minimumRole);
}

function asRole(role: string): MembershipRole {
  return role as MembershipRole;
}

export async function resolveProjectAccess(
  db: AppDatabase,
  userId: string,
  projectId: string,
) {
  const project = await findProjectById(db, projectId);
  if (!project || project.archivedAt) {
    throw notFound("Project not found");
  }

  const [membership, workspaceMembership] = await Promise.all([
    findProjectMembership(db, userId, projectId),
    findWorkspaceMembership(db, userId, project.workspaceId),
  ]);

  const projectRole = membership ? asRole(membership.role) : null;
  const readable = canReadProject({
    visibility: project.visibility,
    isProjectMember: Boolean(membership),
    isWorkspaceMember: Boolean(workspaceMembership),
  });

  if (!readable) {
    throw forbidden("Project access denied");
  }

  return {
    project,
    membership,
    workspaceMembership,
    projectRole,
    canEdit: canWriteProject(projectRole, "member"),
    canManage: canWriteProject(projectRole, "owner"),
  };
}

export async function requireProjectWriteAccess(
  db: AppDatabase,
  userId: string,
  projectId: string,
  minimumRole: MembershipRole = "member",
) {
  const access = await resolveProjectAccess(db, userId, projectId);
  if (!canWriteProject(access.projectRole, minimumRole)) {
    throw forbidden("Project access denied");
  }
  return access;
}
