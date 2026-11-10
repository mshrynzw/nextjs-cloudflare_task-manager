import { fromUnixDate } from "@/lib/api/schemas";
import type { AppDatabase } from "@/lib/db/client";
import {
  calculateProjectProgress,
  emptyTaskStatusCounts,
  resolveProgressWeights,
  type TaskStatusCounts,
} from "@/lib/project/progress";
import {
  getAccessibleTaskKpis,
  getTaskCountsByProjectIds,
  listAccessibleOpenTasksDueBetween,
  listAccessibleOverdueTasks,
  listAccessibleProjectsForUser,
  listAccessibleUpcomingTasks,
  listRecentActivitiesForUser,
  type DashboardListScope,
} from "@/lib/repositories/insights-repository";

export type { DashboardListScope };

export function parseDashboardListScope(
  value: string | string[] | undefined,
): DashboardListScope {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "all" ? "all" : "mine";
}

function startOfDayUnix(date = new Date()): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function endOfDayUnix(date = new Date()): number {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return Math.floor(d.getTime() / 1000);
}

function calcCompletionRate(total: number, completed: number): number {
  if (total === 0) {
    return 0;
  }
  return Math.round((completed / total) * 100);
}

function toStatusCounts(stats: {
  backlog?: number;
  todo?: number;
  inProgress?: number;
  review?: number;
  done?: number;
  completed?: number;
}): TaskStatusCounts {
  const counts = emptyTaskStatusCounts();
  counts.backlog = Number(stats.backlog ?? 0);
  counts.todo = Number(stats.todo ?? 0);
  counts.in_progress = Number(stats.inProgress ?? 0);
  counts.review = Number(stats.review ?? 0);
  counts.done = Number(stats.done ?? stats.completed ?? 0);
  return counts;
}

/** Personal work overview: KPIs and task lists are assignee-scoped. */
export async function getDashboardOverview(
  db: AppDatabase,
  userId: string,
  options?: {
    progressScope?: DashboardListScope;
    activityScope?: DashboardListScope;
  },
) {
  const todayStart = startOfDayUnix();
  const todayEnd = endOfDayUnix();
  const progressScope = options?.progressScope ?? "mine";
  const activityScope = options?.activityScope ?? "mine";

  const [kpis, todayTasks, overdueTasks, upcomingTasks, projects, activities] =
    await Promise.all([
      getAccessibleTaskKpis(db, userId, todayStart, todayEnd),
      listAccessibleOpenTasksDueBetween(db, userId, todayStart, todayEnd, 8),
      listAccessibleOverdueTasks(db, userId, todayStart, 8),
      listAccessibleUpcomingTasks(db, userId, todayEnd, 8),
      listAccessibleProjectsForUser(db, userId, 6, progressScope),
      listRecentActivitiesForUser(db, userId, 8, activityScope),
    ]);

  const counts = await getTaskCountsByProjectIds(
    db,
    projects.map((project) => project.id),
  );
  const countMap = new Map(
    counts.map((item) => [
      item.projectId,
      {
        total: Number(item.total),
        completed: Number(item.completed),
        statuses: toStatusCounts(item),
      },
    ]),
  );

  return {
    kpis: {
      todayTasks: kpis.todayDue,
      completedToday: kpis.completedToday,
      completionRate: calcCompletionRate(kpis.total, kpis.completed),
      overdueTasks: kpis.overdue,
      openTasks: kpis.open,
      totalProjects: projects.length,
    },
    todayTasks: todayTasks.map(serializeTaskSummary),
    upcomingTasks: upcomingTasks.map(serializeTaskSummary),
    overdueTasks: overdueTasks.map(serializeTaskSummary),
    projects: projects.map((project) => {
      const stats = countMap.get(project.id) ?? {
        total: 0,
        completed: 0,
        statuses: emptyTaskStatusCounts(),
      };
      const progressWeights = resolveProgressWeights(project.progressWeights);
      return {
        ...project,
        progress: calculateProjectProgress(stats.statuses, progressWeights),
        progressWeights,
        taskCount: stats.total,
        completedTaskCount: stats.completed,
      };
    }),
    activities: activities.map((item) => ({
      id: item.id,
      action: item.action,
      projectId: item.projectId,
      taskId: item.taskId,
      userName: item.userName,
      projectName: item.projectName,
      createdAt: item.createdAt,
    })),
  };
}

function serializeTaskSummary(task: {
  id: string;
  title: string;
  status: string;
  priority: string;
  projectId: string;
  projectName: string;
  dueDate: number | null;
}) {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    projectId: task.projectId,
    projectName: task.projectName,
    dueDate: fromUnixDate(task.dueDate),
  };
}
