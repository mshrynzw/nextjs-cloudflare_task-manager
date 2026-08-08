import {
  assertMinimumRole,
  hasMinimumRole,
  type MembershipRole,
} from "@/lib/auth/roles";
import {
  findProjectMembership,
  findWorkspaceMembership,
} from "@/lib/auth/membership";
import { getDb } from "@/lib/db/server";

export type { MembershipRole };
export { hasMinimumRole, assertMinimumRole };

export class AuthError extends Error {
  constructor(
    message: string,
    readonly code: "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" = "FORBIDDEN",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireSessionUser() {
  const { auth } = await import("@/auth");
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new AuthError("Authentication required", "UNAUTHENTICATED");
  }

  return {
    userId,
    email: session.user?.email ?? null,
    name: session.user?.name ?? null,
  };
}

export async function getWorkspaceMembership(
  userId: string,
  workspaceId: string,
) {
  return findWorkspaceMembership(getDb(), userId, workspaceId);
}

export async function requireWorkspaceMembership(
  workspaceId: string,
  minimumRole: MembershipRole = "viewer",
) {
  const { userId } = await requireSessionUser();
  const membership = await getWorkspaceMembership(userId, workspaceId);

  if (!membership) {
    throw new AuthError("Workspace access denied", "FORBIDDEN");
  }

  const role = membership.role as MembershipRole;
  if (!hasMinimumRole(role, minimumRole)) {
    throw new AuthError("Insufficient workspace permissions", "FORBIDDEN");
  }

  return { userId, membership, role };
}

export async function getProjectMembership(userId: string, projectId: string) {
  return findProjectMembership(getDb(), userId, projectId);
}

export async function requireProjectMembership(
  projectId: string,
  minimumRole: MembershipRole = "viewer",
) {
  const { userId } = await requireSessionUser();
  const membership = await getProjectMembership(userId, projectId);

  if (!membership) {
    throw new AuthError("Project access denied", "FORBIDDEN");
  }

  const role = membership.role as MembershipRole;
  if (!hasMinimumRole(role, minimumRole)) {
    throw new AuthError("Insufficient project permissions", "FORBIDDEN");
  }

  return { userId, membership, role };
}
