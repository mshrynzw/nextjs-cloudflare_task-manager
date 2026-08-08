import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import { createId, nowUnix } from "@/lib/db/id";
import { activities, tasks } from "@/lib/db/schema";

export interface ListTasksQuery {
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
  sort?: "updatedAt" | "dueDate" | "position" | "title";
  order?: "asc" | "desc";
}

export async function listTasksForProject(
  db: AppDatabase,
  projectId: string,
  query: ListTasksQuery,
) {
  const conditions = [
    eq(tasks.projectId, projectId),
    sql`${tasks.archivedAt} is null`,
  ];

  if (query.status) {
    conditions.push(eq(tasks.status, query.status));
  }
  if (query.priority) {
    conditions.push(eq(tasks.priority, query.priority));
  }
  if (query.assigneeId) {
    conditions.push(eq(tasks.assigneeId, query.assigneeId));
  }
  if (query.search) {
    const pattern = `%${query.search}%`;
    conditions.push(
      or(like(tasks.title, pattern), like(tasks.description, pattern))!,
    );
  }

  const orderColumn =
    query.sort === "dueDate"
      ? tasks.dueDate
      : query.sort === "position"
        ? tasks.position
        : query.sort === "title"
          ? tasks.title
          : tasks.updatedAt;
  const orderBy = query.order === "asc" ? asc(orderColumn) : desc(orderColumn);

  return db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(orderBy)
    .all();
}

export async function findTaskById(db: AppDatabase, taskId: string) {
  return db.select().from(tasks).where(eq(tasks.id, taskId)).get();
}

export async function createTask(
  db: AppDatabase,
  input: {
    projectId: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    assigneeId?: string | null;
    reporterId?: string | null;
    dueDate?: number | null;
    position: number;
  },
) {
  const timestamp = nowUnix();
  return db
    .insert(tasks)
    .values({
      id: createId("task"),
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
      assigneeId: input.assigneeId ?? null,
      reporterId: input.reporterId ?? null,
      dueDate: input.dueDate ?? null,
      position: input.position,
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: input.status === "done" ? timestamp : null,
    })
    .returning()
    .get();
}

export async function updateTask(
  db: AppDatabase,
  taskId: string,
  input: Partial<{
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assigneeId: string | null;
    dueDate: number | null;
    position: number;
    completedAt: number | null;
    archivedAt: number | null;
  }>,
) {
  return db
    .update(tasks)
    .set({
      ...input,
      updatedAt: nowUnix(),
    })
    .where(eq(tasks.id, taskId))
    .returning()
    .get();
}

export async function archiveTask(db: AppDatabase, taskId: string) {
  return updateTask(db, taskId, { archivedAt: nowUnix() });
}

export async function getNextTaskPosition(
  db: AppDatabase,
  projectId: string,
  status: string,
) {
  const row = await db
    .select({
      maxPosition: sql<number>`coalesce(max(${tasks.position}), 0)`,
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.projectId, projectId),
        eq(tasks.status, status),
        sql`${tasks.archivedAt} is null`,
      ),
    )
    .get();

  return (row?.maxPosition ?? 0) + 1;
}

export async function createActivity(
  db: AppDatabase,
  input: {
    workspaceId: string;
    projectId?: string | null;
    taskId?: string | null;
    userId: string;
    action: string;
    metadata?: Record<string, unknown>;
  },
) {
  return db
    .insert(activities)
    .values({
      id: createId("activity"),
      workspaceId: input.workspaceId,
      projectId: input.projectId ?? null,
      taskId: input.taskId ?? null,
      userId: input.userId,
      action: input.action,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      createdAt: nowUnix(),
    })
    .returning()
    .get();
}
