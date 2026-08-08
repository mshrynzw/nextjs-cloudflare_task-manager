import { eq } from "drizzle-orm";
import { forbidden, notFound } from "@/lib/api/errors";
import { fromUnixDate, toUnixDate } from "@/lib/api/schemas";
import {
  findProjectMembership,
  findWorkspaceMembership,
} from "@/lib/auth/membership";
import { hasMinimumRole, type MembershipRole } from "@/lib/auth/roles";
import type { AppDatabase } from "@/lib/db/client";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import {
  addProjectMember,
  archiveProject,
  createProject,
  findProjectById,
  getTaskCountsByProject,
  listProjectMembers,
  listProjectsForUser,
  removeProjectMember,
  updateProject,
  type ListProjectsQuery,
} from "@/lib/repositories/project-repository";

function asRole(role: string): MembershipRole {
  return role as MembershipRole;
}

function calcProgress(total: number, completed: number): number {
  if (total === 0) {
    return 0;
  }
  return Math.round((completed / total) * 100);
}

export async function getProjects(
  db: AppDatabase,
  userId: string,
  query: ListProjectsQuery,
) {
  const { rows, total } = await listProjectsForUser(db, userId, query);
  const counts = await getTaskCountsByProject(
    db,
    rows.map((row) => row.project.id),
  );
  const countMap = new Map(
    counts.map((item) => [
      item.projectId,
      {
        total: Number(item.total),
        completed: Number(item.completed),
      },
    ]),
  );

  return {
    data: rows.map(({ project }) => {
      const stats = countMap.get(project.id) ?? { total: 0, completed: 0 };
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        color: project.color,
        progress: calcProgress(stats.total, stats.completed),
        deadline: fromUnixDate(project.deadline),
        taskCount: stats.total,
        completedTaskCount: stats.completed,
        workspaceId: project.workspaceId,
        updatedAt: project.updatedAt,
      };
    }),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
    },
  };
}

export async function getProject(
  db: AppDatabase,
  userId: string,
  projectId: string,
) {
  const membership = await findProjectMembership(db, userId, projectId);
  if (!membership) {
    throw forbidden("Project access denied");
  }

  const project = await findProjectById(db, projectId);
  if (!project || project.archivedAt) {
    throw notFound("Project not found");
  }

  const [counts] = await getTaskCountsByProject(db, [projectId]);
  const members = await listProjectMembers(db, projectId);
  const total = Number(counts?.total ?? 0);
  const completed = Number(counts?.completed ?? 0);

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority,
    color: project.color,
    progress: calcProgress(total, completed),
    deadline: fromUnixDate(project.deadline),
    workspaceId: project.workspaceId,
    members,
    taskSummary: {
      total,
      completed,
    },
  };
}

export async function createProjectForUser(
  db: AppDatabase,
  userId: string,
  input: {
    workspaceId: string;
    name: string;
    description?: string | null;
    status: string;
    priority: string;
    color: string;
    deadline?: string | null;
  },
) {
  const membership = await findWorkspaceMembership(
    db,
    userId,
    input.workspaceId,
  );
  if (!membership || !hasMinimumRole(asRole(membership.role), "member")) {
    throw forbidden("Workspace access denied");
  }

  const project = await createProject(db, {
    workspaceId: input.workspaceId,
    name: input.name,
    description: input.description,
    color: input.color,
    status: input.status,
    priority: input.priority,
    deadline: toUnixDate(input.deadline ?? undefined),
    createdBy: userId,
  });

  return {
    id: project?.id,
    name: project?.name,
    status: project?.status,
    priority: project?.priority,
  };
}

export async function updateProjectForUser(
  db: AppDatabase,
  userId: string,
  projectId: string,
  input: Partial<{
    name: string;
    description: string | null;
    status: string;
    priority: string;
    color: string;
    deadline: string | null;
  }>,
) {
  const membership = await findProjectMembership(db, userId, projectId);
  if (!membership || !hasMinimumRole(asRole(membership.role), "member")) {
    throw forbidden("Insufficient project permissions");
  }

  const updated = await updateProject(db, projectId, {
    name: input.name,
    description: input.description,
    status: input.status,
    priority: input.priority,
    color: input.color,
    deadline:
      input.deadline === undefined
        ? undefined
        : toUnixDate(input.deadline ?? undefined),
  });

  if (!updated) {
    throw notFound("Project not found");
  }

  return updated;
}

export async function deleteProjectForUser(
  db: AppDatabase,
  userId: string,
  projectId: string,
) {
  const membership = await findProjectMembership(db, userId, projectId);
  if (!membership || !hasMinimumRole(asRole(membership.role), "owner")) {
    throw forbidden("Only owners can archive projects");
  }

  const archived = await archiveProject(db, projectId);
  if (!archived) {
    throw notFound("Project not found");
  }

  return { deleted: true };
}

export async function getProjectMembersForUser(
  db: AppDatabase,
  userId: string,
  projectId: string,
) {
  const membership = await findProjectMembership(db, userId, projectId);
  if (!membership) {
    throw forbidden("Project access denied");
  }
  return listProjectMembers(db, projectId);
}

export async function addProjectMemberForUser(
  db: AppDatabase,
  actorUserId: string,
  projectId: string,
  input: { userId: string; role: string },
) {
  const membership = await findProjectMembership(db, actorUserId, projectId);
  if (!membership || !hasMinimumRole(asRole(membership.role), "owner")) {
    throw forbidden("Only owners can manage members");
  }

  const project = await findProjectById(db, projectId);
  if (!project) {
    throw notFound("Project not found");
  }

  const workspaceMembership = await findWorkspaceMembership(
    db,
    input.userId,
    project.workspaceId,
  );
  if (!workspaceMembership) {
    throw forbidden("User must belong to the workspace");
  }

  return addProjectMember(db, {
    projectId,
    userId: input.userId,
    role: input.role,
  });
}

export async function removeProjectMemberForUser(
  db: AppDatabase,
  actorUserId: string,
  projectId: string,
  targetUserId: string,
) {
  const membership = await findProjectMembership(db, actorUserId, projectId);
  if (!membership || !hasMinimumRole(asRole(membership.role), "owner")) {
    throw forbidden("Only owners can manage members");
  }

  await removeProjectMember(db, projectId, targetUserId);
  return { deleted: true };
}

export async function resolveDefaultWorkspaceId(
  db: AppDatabase,
  userId: string,
): Promise<string | null> {
  const membership = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, userId))
    .get();

  return membership?.workspaceId ?? null;
}
