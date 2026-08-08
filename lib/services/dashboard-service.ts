import { fromUnixDate } from "@/lib/api/schemas";
import type { AppDatabase } from "@/lib/db/client";
import {
  getTaskCountsByProjectIds,
  listAccessibleProjectsForUser,
  listAccessibleTasksForUser,
  listRecentActivitiesForUser,
} from "@/lib/repositories/insights-repository";

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

function calcProgress(total: number, completed: number): number {
  if (total === 0) {
    return 0;
  }
  return Math.round((completed / total) * 100);
}

export async function getDashboardOverview(db: AppDatabase, userId: string) {
  const [tasks, projects, activities] = await Promise.all([
    listAccessibleTasksForUser(db, userId),
    listAccessibleProjectsForUser(db, userId, 6),
    listRecentActivitiesForUser(db, userId, 8),
  ]);

  const todayStart = startOfDayUnix();
  const todayEnd = endOfDayUnix();
  const openTasks = tasks.filter((task) => task.status !== "done");

  const todayTasks = openTasks.filter(
    (task) =>
      task.dueDate !== null &&
      task.dueDate >= todayStart &&
      task.dueDate <= todayEnd,
  );

  const overdueTasks = openTasks.filter(
    (task) => task.dueDate !== null && task.dueDate < todayStart,
  );

  const upcomingTasks = openTasks
    .filter((task) => task.dueDate !== null && task.dueDate > todayEnd)
    .slice(0, 8);

  const completedTasks = tasks.filter((task) => task.status === "done");
  const completedToday = completedTasks.filter(
    (task) =>
      task.completedAt !== null &&
      task.completedAt >= todayStart &&
      task.completedAt <= todayEnd,
  );

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
      },
    ]),
  );

  return {
    kpis: {
      todayTasks: todayTasks.length,
      completedToday: completedToday.length,
      completionRate: calcProgress(tasks.length, completedTasks.length),
      overdueTasks: overdueTasks.length,
      openTasks: openTasks.length,
      totalProjects: projects.length,
    },
    todayTasks: todayTasks.slice(0, 8).map(serializeTaskSummary),
    upcomingTasks: upcomingTasks.map(serializeTaskSummary),
    overdueTasks: overdueTasks.slice(0, 8).map(serializeTaskSummary),
    projects: projects.map((project) => {
      const stats = countMap.get(project.id) ?? { total: 0, completed: 0 };
      return {
        ...project,
        progress: calcProgress(stats.total, stats.completed),
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
