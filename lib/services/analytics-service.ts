import type { AppDatabase } from "@/lib/db/client";
import {
  listAccessibleTasksForUser,
  listMemberWorkload,
} from "@/lib/repositories/insights-repository";

const TASK_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
] as const;

type AnalyticsTask = Awaited<
  ReturnType<typeof listAccessibleTasksForUser>
>[number];

function dayKeyFromUnix(unix: number): string {
  return new Date(unix * 1000).toISOString().slice(0, 10);
}

function calcRate(total: number, completed: number): number {
  if (total === 0) {
    return 0;
  }
  return Math.round((completed / total) * 100);
}

function scopeTasks(tasks: AnalyticsTask[], projectId?: string) {
  if (!projectId) {
    return tasks;
  }
  return tasks.filter((task) => task.projectId === projectId);
}

function buildOverview(scoped: AnalyticsTask[]) {
  const completed = scoped.filter((task) => task.status === "done");
  const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
  const overdue = scoped.filter(
    (task) =>
      task.status !== "done" &&
      task.dueDate !== null &&
      task.dueDate < todayStart,
  );

  const assigneeIds = new Set(
    scoped.map((task) => task.assigneeId).filter(Boolean),
  );

  const durations = completed
    .filter((task) => task.completedAt && task.createdAt)
    .map((task) => (task.completedAt! - task.createdAt) / 86400);

  const averageCompletionTime =
    durations.length === 0
      ? 0
      : Math.round(
          (durations.reduce((sum, value) => sum + value, 0) / durations.length) *
            10,
        ) / 10;

  return {
    totalTasks: scoped.length,
    completedTasks: completed.length,
    completionRate: calcRate(scoped.length, completed.length),
    overdueTasks: overdue.length,
    activeMembers: assigneeIds.size,
    averageCompletionTime,
  };
}

function buildCompletionTrend(scoped: AnalyticsTask[], days: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const trend: Array<{ date: string; created: number; completed: number }> = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    const key = day.toISOString().slice(0, 10);
    const start = Math.floor(day.getTime() / 1000);
    const end = start + 86400 - 1;

    trend.push({
      date: key,
      created: scoped.filter(
        (task) => task.createdAt >= start && task.createdAt <= end,
      ).length,
      completed: scoped.filter(
        (task) =>
          task.completedAt !== null &&
          task.completedAt >= start &&
          task.completedAt <= end,
      ).length,
    });
  }

  return trend;
}

function buildTaskDistribution(scoped: AnalyticsTask[]) {
  return TASK_STATUSES.map((status) => ({
    status,
    count: scoped.filter((task) => task.status === status).length,
  }));
}

function buildPriorityBreakdown(scoped: AnalyticsTask[]) {
  return (["high", "medium", "low"] as const).map((priority) => ({
    priority,
    count: scoped.filter((task) => task.priority === priority).length,
  }));
}

/**
 * Single-flight analytics load for the Analytics page.
 * Avoids repeating the full accessible-task scan four times.
 */
export async function getAnalyticsPageData(
  db: AppDatabase,
  userId: string,
  options?: { projectId?: string; days?: number },
) {
  const days = options?.days ?? 14;
  const projectId = options?.projectId;

  const [tasks, workloadRows] = await Promise.all([
    listAccessibleTasksForUser(db, userId),
    listMemberWorkload(db, userId, projectId),
  ]);

  const scoped = scopeTasks(tasks, projectId);

  return {
    overview: buildOverview(scoped),
    trend: buildCompletionTrend(scoped, days),
    distribution: buildTaskDistribution(scoped),
    priorities: buildPriorityBreakdown(scoped),
    workload: workloadRows.map((row) => ({
      userId: row.userId,
      name: row.name ?? "Member",
      assignedTasks: Number(row.assignedTasks),
      completedTasks: Number(row.completedTasks),
    })),
  };
}

export async function getAnalyticsOverview(
  db: AppDatabase,
  userId: string,
  projectId?: string,
) {
  const tasks = await listAccessibleTasksForUser(db, userId);
  return buildOverview(scopeTasks(tasks, projectId));
}

export async function getCompletionTrend(
  db: AppDatabase,
  userId: string,
  days = 14,
  projectId?: string,
) {
  const tasks = await listAccessibleTasksForUser(db, userId);
  return buildCompletionTrend(scopeTasks(tasks, projectId), days);
}

export async function getTaskDistribution(
  db: AppDatabase,
  userId: string,
  projectId?: string,
) {
  const tasks = await listAccessibleTasksForUser(db, userId);
  return buildTaskDistribution(scopeTasks(tasks, projectId));
}

export async function getMemberWorkloadAnalytics(
  db: AppDatabase,
  userId: string,
  projectId?: string,
) {
  const rows = await listMemberWorkload(db, userId, projectId);
  return rows.map((row) => ({
    userId: row.userId,
    name: row.name ?? "Member",
    assignedTasks: Number(row.assignedTasks),
    completedTasks: Number(row.completedTasks),
  }));
}

export async function getPriorityBreakdown(
  db: AppDatabase,
  userId: string,
  projectId?: string,
) {
  const tasks = await listAccessibleTasksForUser(db, userId);
  return buildPriorityBreakdown(scopeTasks(tasks, projectId));
}

/** Used by unit tests / diagnostics — keep date helper pure. */
export function toDayKey(unix: number): string {
  return dayKeyFromUnix(unix);
}
