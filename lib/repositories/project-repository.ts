import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNull,
  like,
  sql,
} from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import {
  canReadProjectSql,
  projectMembershipJoin,
  workspaceMembershipJoin,
} from "@/lib/db/access";
import { createId, nowUnix } from "@/lib/db/id";
import {
  projectMembers,
  projects,
  tasks,
  users,
  workspaceMembers,
} from "@/lib/db/schema";

export interface ListProjectsQuery {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  priority?: string;
  sort?: "updatedAt" | "deadline" | "name";
  order?: "asc" | "desc";
}

export async function listProjectsForUser(
  db: AppDatabase,
  userId: string,
  query: ListProjectsQuery,
) {
  const offset = (query.page - 1) * query.limit;
  const conditions = [canReadProjectSql()];

  if (query.status === "archived") {
    conditions.push(eq(projects.status, "archived"));
  } else if (query.status) {
    conditions.push(eq(projects.status, query.status));
    conditions.push(isNull(projects.archivedAt));
  } else {
    // Default list hides soft-archived projects.
    conditions.push(isNull(projects.archivedAt));
  }
  if (query.priority) {
    conditions.push(eq(projects.priority, query.priority));
  }
  if (query.search) {
    conditions.push(like(projects.name, `%${query.search}%`));
  }

  const whereClause = and(...conditions);
  const orderColumn =
    query.sort === "deadline"
      ? projects.deadline
      : query.sort === "name"
        ? projects.name
        : projects.updatedAt;
  const orderBy = query.order === "asc" ? asc(orderColumn) : desc(orderColumn);

  const rows = await db
    .select({
      project: projects,
      role: projectMembers.role,
    })
    .from(projects)
    .innerJoin(workspaceMembers, workspaceMembershipJoin(userId))
    .leftJoin(projectMembers, projectMembershipJoin(userId))
    .where(whereClause)
    .orderBy(orderBy)
    .limit(query.limit)
    .offset(offset)
    .all();

  const totalRow = await db
    .select({ value: count() })
    .from(projects)
    .innerJoin(workspaceMembers, workspaceMembershipJoin(userId))
    .leftJoin(projectMembers, projectMembershipJoin(userId))
    .where(whereClause)
    .get();

  return {
    rows,
    total: totalRow?.value ?? 0,
  };
}

export async function findProjectById(db: AppDatabase, projectId: string) {
  return db.select().from(projects).where(eq(projects.id, projectId)).get();
}

export async function createProject(
  db: AppDatabase,
  input: {
    workspaceId: string;
    name: string;
    description?: string | null;
    color: string;
    status: string;
    priority: string;
    deadline?: number | null;
    createdBy: string;
    visibility?: string;
  },
) {
  const timestamp = nowUnix();
  const projectId = createId("project");

  const project = await db
    .insert(projects)
    .values({
      id: projectId,
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description ?? null,
      color: input.color,
      status: input.status,
      priority: input.priority,
      deadline: input.deadline ?? null,
      createdBy: input.createdBy,
      visibility: input.visibility ?? "workspace",
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning()
    .get();

  await db.insert(projectMembers).values({
    id: createId("prjmem"),
    projectId,
    userId: input.createdBy,
    role: "owner",
    createdAt: timestamp,
  });

  return project;
}

export async function updateProject(
  db: AppDatabase,
  projectId: string,
  input: Partial<{
    name: string;
    description: string | null;
    color: string;
    status: string;
    priority: string;
    deadline: number | null;
    archivedAt: number | null;
    visibility: string;
  }>,
) {
  return db
    .update(projects)
    .set({
      ...input,
      updatedAt: nowUnix(),
    })
    .where(eq(projects.id, projectId))
    .returning()
    .get();
}

export async function archiveProject(db: AppDatabase, projectId: string) {
  return updateProject(db, projectId, {
    status: "archived",
    archivedAt: nowUnix(),
  });
}

export async function listProjectMembers(db: AppDatabase, projectId: string) {
  return db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      role: projectMembers.role,
    })
    .from(projectMembers)
    .innerJoin(users, eq(users.id, projectMembers.userId))
    .where(eq(projectMembers.projectId, projectId))
    .all();
}

export async function listMembersForProjects(
  db: AppDatabase,
  projectIds: string[],
) {
  if (projectIds.length === 0) {
    return [];
  }

  return db
    .select({
      projectId: projectMembers.projectId,
      id: users.id,
      name: users.name,
      image: users.image,
      role: projectMembers.role,
    })
    .from(projectMembers)
    .innerJoin(users, eq(users.id, projectMembers.userId))
    .where(inArray(projectMembers.projectId, projectIds))
    .all();
}

export async function addProjectMember(
  db: AppDatabase,
  input: { projectId: string; userId: string; role: string },
) {
  return db
    .insert(projectMembers)
    .values({
      id: createId("prjmem"),
      projectId: input.projectId,
      userId: input.userId,
      role: input.role,
      createdAt: nowUnix(),
    })
    .returning()
    .get();
}

export async function removeProjectMember(
  db: AppDatabase,
  projectId: string,
  userId: string,
) {
  return db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId),
      ),
    )
    .run();
}

export async function listWorkspaceMembers(
  db: AppDatabase,
  workspaceId: string,
) {
  return db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(eq(workspaceMembers.workspaceId, workspaceId))
    .all();
}

export async function listWorkspaceMemberIds(
  db: AppDatabase,
  workspaceId: string,
  userIds: string[],
) {
  if (userIds.length === 0) {
    return [];
  }

  return db
    .select({ userId: workspaceMembers.userId })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        inArray(workspaceMembers.userId, userIds),
      ),
    )
    .all();
}

export async function countProjectMembersWithRole(
  db: AppDatabase,
  projectId: string,
  role: string,
) {
  const row = await db
    .select({ value: count() })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.role, role),
      ),
    )
    .get();
  return row?.value ?? 0;
}

export async function getTaskCountsByProject(
  db: AppDatabase,
  projectIds: string[],
) {
  if (projectIds.length === 0) {
    return [] as Array<{
      projectId: string;
      total: number;
      completed: number;
    }>;
  }

  return db
    .select({
      projectId: tasks.projectId,
      total: count(),
      completed: sql<number>`sum(case when ${tasks.status} = 'done' then 1 else 0 end)`,
    })
    .from(tasks)
    .where(
      and(
        inArray(tasks.projectId, projectIds),
        sql`${tasks.archivedAt} is null`,
      ),
    )
    .groupBy(tasks.projectId)
    .all();
}
