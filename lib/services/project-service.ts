import { eq } from "drizzle-orm";
import {
  conflict,
  forbidden,
  notFound,
  validationError,
} from "@/lib/api/errors";
import { fromUnixDate, toUnixDate } from "@/lib/api/schemas";
import {
  findProjectMembership,
  findWorkspaceMembership,
} from "@/lib/auth/membership";
import {
  canWriteProject,
  resolveProjectAccess,
} from "@/lib/auth/project-access";
import { hasMinimumRole, type MembershipRole } from "@/lib/auth/roles";
import type { AppDatabase } from "@/lib/db/client";
import { workspaceMembers, workspaces } from "@/lib/db/schema";
import {
  addProjectMember,
  archiveProject,
  countProjectMembersWithRole,
  createProject,
  findProjectById,
  getTaskCountsByProject,
  listMembersForProjects,
  listProjectMembers,
  listProjectsForUser,
  listWorkspaceMemberIds,
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
  const projectIds = rows.map((row) => row.project.id);
  const [counts, members] = await Promise.all([
    getTaskCountsByProject(db, projectIds),
    listMembersForProjects(db, projectIds),
  ]);
  const countMap = new Map(
    counts.map((item) => [
      item.projectId,
      {
        total: Number(item.total),
        completed: Number(item.completed),
      },
    ]),
  );

  const membersByProject = new Map<
    string,
    Array<{
      id: string;
      name: string | null;
      image: string | null;
      role: string;
    }>
  >();
  for (const member of members) {
    const list = membersByProject.get(member.projectId) ?? [];
    list.push({
      id: member.id,
      name: member.name,
      image: member.image,
      role: member.role,
    });
    membersByProject.set(member.projectId, list);
  }

  return {
    data: rows.map(({ project, role }) => {
      const stats = countMap.get(project.id) ?? { total: 0, completed: 0 };
      const projectRole = role ? asRole(role) : null;
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        visibility: project.visibility,
        color: project.color,
        progress: calcProgress(stats.total, stats.completed),
        deadline: fromUnixDate(project.deadline),
        taskCount: stats.total,
        completedTaskCount: stats.completed,
        workspaceId: project.workspaceId,
        updatedAt: project.updatedAt,
        role: projectRole,
        canEdit: canWriteProject(projectRole, "member"),
        canManage: canWriteProject(projectRole, "owner"),
        members: membersByProject.get(project.id) ?? [],
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
  const access = await resolveProjectAccess(db, userId, projectId);
  const project = access.project;

  const [countsRows, members] = await Promise.all([
    getTaskCountsByProject(db, [projectId]),
    listProjectMembers(db, projectId),
  ]);
  const [counts] = countsRows;
  const total = Number(counts?.total ?? 0);
  const completed = Number(counts?.completed ?? 0);

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority,
    visibility: project.visibility,
    color: project.color,
    progress: calcProgress(total, completed),
    deadline: fromUnixDate(project.deadline),
    workspaceId: project.workspaceId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    role: access.projectRole,
    canEdit: access.canEdit,
    canManage: access.canManage,
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
    visibility?: string;
    memberIds?: string[];
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

  const uniqueMemberIds = [
    ...new Set((input.memberIds ?? []).filter((id) => id !== userId)),
  ];
  if (uniqueMemberIds.length > 0) {
    const workspaceMemberRows = await listWorkspaceMemberIds(
      db,
      input.workspaceId,
      uniqueMemberIds,
    );
    if (workspaceMemberRows.length !== uniqueMemberIds.length) {
      throw validationError("All members must belong to the workspace", [
        {
          field: "memberIds",
          message: "Each memberId must belong to the workspace.",
        },
      ]);
    }
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
    visibility: input.visibility ?? "workspace",
  });

  if (project?.id) {
    for (const memberId of uniqueMemberIds) {
      await addProjectMember(db, {
        projectId: project.id,
        userId: memberId,
        role: "member",
      });
    }
  }

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
    visibility: string;
  }>,
) {
  const membership = await findProjectMembership(db, userId, projectId);
  if (!membership || !hasMinimumRole(asRole(membership.role), "member")) {
    throw forbidden("Insufficient project permissions");
  }

  if (input.visibility !== undefined) {
    if (!hasMinimumRole(asRole(membership.role), "owner")) {
      throw forbidden("Only owners can change project visibility");
    }
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
    visibility: input.visibility,
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
  await resolveProjectAccess(db, userId, projectId);
  return listProjectMembers(db, projectId);
}

export { getWorkspaceMembersForUser } from "@/lib/services/workspace-service";

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

  const existing = await findProjectMembership(db, input.userId, projectId);
  if (existing) {
    throw conflict("User is already a project member");
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

  const target = await findProjectMembership(db, targetUserId, projectId);
  if (!target) {
    throw notFound("Member not found");
  }

  if (target.role === "owner") {
    const ownerCount = await countProjectMembersWithRole(
      db,
      projectId,
      "owner",
    );
    if (ownerCount <= 1) {
      throw forbidden("Cannot remove the last owner");
    }
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
