import { and, asc, desc, eq, gte, inArray, isNull, lt, lte, ne, sql } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import {
  activities,
  projectMembers,
  projects,
  tasks,
  users,
} from "@/lib/db/schema";

/** Lean task rows for analytics / insights (no description). */
export async function listAccessibleTasksForUser(
  db: AppDatabase,
  userId: string,
) {
  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      projectId: tasks.projectId,
      projectName: projects.name,
      assigneeId: tasks.assigneeId,
      dueDate: tasks.dueDate,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      completedAt: tasks.completedAt,
    })
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .innerJoin(
      projectMembers,
      and(
        eq(projectMembers.projectId, projects.id),
        eq(projectMembers.userId, userId),
      ),
    )
    .where(and(isNull(tasks.archivedAt), isNull(projects.archivedAt)))
    .orderBy(desc(tasks.updatedAt))
    .all();
}

export async function getAccessibleTaskKpis(
  db: AppDatabase,
  userId: string,
  todayStart: number,
  todayEnd: number,
) {
  const row = await db
    .select({
      total: sql<number>`count(*)`,
      completed: sql<number>`sum(case when ${tasks.status} = 'done' then 1 else 0 end)`,
      open: sql<number>`sum(case when ${tasks.status} != 'done' then 1 else 0 end)`,
      overdue: sql<number>`sum(case when ${tasks.status} != 'done' and ${tasks.dueDate} is not null and ${tasks.dueDate} < ${todayStart} then 1 else 0 end)`,
      todayDue: sql<number>`sum(case when ${tasks.status} != 'done' and ${tasks.dueDate} is not null and ${tasks.dueDate} >= ${todayStart} and ${tasks.dueDate} <= ${todayEnd} then 1 else 0 end)`,
      completedToday: sql<number>`sum(case when ${tasks.completedAt} is not null and ${tasks.completedAt} >= ${todayStart} and ${tasks.completedAt} <= ${todayEnd} then 1 else 0 end)`,
    })
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .innerJoin(
      projectMembers,
      and(
        eq(projectMembers.projectId, projects.id),
        eq(projectMembers.userId, userId),
      ),
    )
    .where(and(isNull(tasks.archivedAt), isNull(projects.archivedAt)))
    .get();

  return {
    total: Number(row?.total ?? 0),
    completed: Number(row?.completed ?? 0),
    open: Number(row?.open ?? 0),
    overdue: Number(row?.overdue ?? 0),
    todayDue: Number(row?.todayDue ?? 0),
    completedToday: Number(row?.completedToday ?? 0),
  };
}

const taskSummarySelect = {
  id: tasks.id,
  title: tasks.title,
  status: tasks.status,
  priority: tasks.priority,
  projectId: tasks.projectId,
  projectName: projects.name,
  dueDate: tasks.dueDate,
};

export async function listAccessibleOpenTasksDueBetween(
  db: AppDatabase,
  userId: string,
  startUnix: number,
  endUnix: number,
  limit = 8,
) {
  return db
    .select(taskSummarySelect)
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .innerJoin(
      projectMembers,
      and(
        eq(projectMembers.projectId, projects.id),
        eq(projectMembers.userId, userId),
      ),
    )
    .where(
      and(
        isNull(tasks.archivedAt),
        isNull(projects.archivedAt),
        ne(tasks.status, "done"),
        gte(tasks.dueDate, startUnix),
        lte(tasks.dueDate, endUnix),
      ),
    )
    .orderBy(asc(tasks.dueDate))
    .limit(limit)
    .all();
}

export async function listAccessibleOverdueTasks(
  db: AppDatabase,
  userId: string,
  beforeUnix: number,
  limit = 8,
) {
  return db
    .select(taskSummarySelect)
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .innerJoin(
      projectMembers,
      and(
        eq(projectMembers.projectId, projects.id),
        eq(projectMembers.userId, userId),
      ),
    )
    .where(
      and(
        isNull(tasks.archivedAt),
        isNull(projects.archivedAt),
        ne(tasks.status, "done"),
        lt(tasks.dueDate, beforeUnix),
      ),
    )
    .orderBy(asc(tasks.dueDate))
    .limit(limit)
    .all();
}

export async function listAccessibleUpcomingTasks(
  db: AppDatabase,
  userId: string,
  afterUnix: number,
  limit = 8,
) {
  return db
    .select(taskSummarySelect)
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .innerJoin(
      projectMembers,
      and(
        eq(projectMembers.projectId, projects.id),
        eq(projectMembers.userId, userId),
      ),
    )
    .where(
      and(
        isNull(tasks.archivedAt),
        isNull(projects.archivedAt),
        ne(tasks.status, "done"),
        gte(tasks.dueDate, afterUnix + 1),
      ),
    )
    .orderBy(asc(tasks.dueDate))
    .limit(limit)
    .all();
}

export async function listAccessibleProjectsForUser(
  db: AppDatabase,
  userId: string,
  limit = 6,
) {
  return db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      priority: projects.priority,
      color: projects.color,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .innerJoin(
      projectMembers,
      and(
        eq(projectMembers.projectId, projects.id),
        eq(projectMembers.userId, userId),
      ),
    )
    .where(isNull(projects.archivedAt))
    .orderBy(desc(projects.updatedAt))
    .limit(limit)
    .all();
}

export async function getTaskCountsByProjectIds(
  db: AppDatabase,
  projectIds: string[],
) {
  if (projectIds.length === 0) {
    return [];
  }

  return db
    .select({
      projectId: tasks.projectId,
      total: sql<number>`count(*)`,
      completed: sql<number>`sum(case when ${tasks.status} = 'done' then 1 else 0 end)`,
    })
    .from(tasks)
    .where(
      and(inArray(tasks.projectId, projectIds), isNull(tasks.archivedAt)),
    )
    .groupBy(tasks.projectId)
    .all();
}

export async function listRecentActivitiesForUser(
  db: AppDatabase,
  userId: string,
  limit = 10,
) {
  return db
    .select({
      id: activities.id,
      action: activities.action,
      projectId: activities.projectId,
      taskId: activities.taskId,
      userId: activities.userId,
      userName: users.name,
      projectName: projects.name,
      createdAt: activities.createdAt,
      metadata: activities.metadata,
    })
    .from(activities)
    .innerJoin(users, eq(users.id, activities.userId))
    .leftJoin(projects, eq(projects.id, activities.projectId))
    .innerJoin(
      projectMembers,
      and(
        eq(projectMembers.projectId, activities.projectId),
        eq(projectMembers.userId, userId),
      ),
    )
    .orderBy(desc(activities.createdAt))
    .limit(limit)
    .all();
}

export async function listTasksInDateRange(
  db: AppDatabase,
  userId: string,
  startUnix: number,
  endUnix: number,
  filters?: { projectId?: string; assigneeId?: string },
) {
  const conditions = [
    isNull(tasks.archivedAt),
    isNull(projects.archivedAt),
    eq(projectMembers.userId, userId),
    gte(tasks.dueDate, startUnix),
    lte(tasks.dueDate, endUnix),
  ];

  if (filters?.projectId) {
    conditions.push(eq(tasks.projectId, filters.projectId));
  }
  if (filters?.assigneeId) {
    conditions.push(eq(tasks.assigneeId, filters.assigneeId));
  }

  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      projectId: tasks.projectId,
      projectName: projects.name,
      assigneeId: tasks.assigneeId,
      dueDate: tasks.dueDate,
    })
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .innerJoin(
      projectMembers,
      eq(projectMembers.projectId, projects.id),
    )
    .where(and(...conditions))
    .orderBy(tasks.dueDate)
    .all();
}

export async function listMemberWorkload(
  db: AppDatabase,
  userId: string,
  projectId?: string,
) {
  const conditions = [
    isNull(tasks.archivedAt),
    isNull(projects.archivedAt),
    eq(projectMembers.userId, userId),
  ];
  if (projectId) {
    conditions.push(eq(tasks.projectId, projectId));
  }

  return db
    .select({
      userId: users.id,
      name: users.name,
      assignedTasks: sql<number>`count(*)`,
      completedTasks: sql<number>`sum(case when ${tasks.status} = 'done' then 1 else 0 end)`,
    })
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .innerJoin(
      projectMembers,
      and(
        eq(projectMembers.projectId, projects.id),
        eq(projectMembers.userId, userId),
      ),
    )
    .innerJoin(users, eq(users.id, tasks.assigneeId))
    .where(and(...conditions))
    .groupBy(users.id, users.name)
    .all();
}
