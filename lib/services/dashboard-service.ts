import { fromUnixDate } from "@/lib/api/schemas";
import type { AppDatabase } from "@/lib/db/client";
import {
  getAccessibleTaskKpis,
  getTaskCountsByProjectIds,
  listAccessibleOpenTasksDueBetween,
  listAccessibleOverdueTasks,
  listAccessibleProjectsForUser,
  listAccessibleUpcomingTasks,
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

/** Personal work overview: KPIs and task lists are assignee-scoped. */
export async function getDashboardOverview(db: AppDatabase, userId: string) {
  const todayStart = startOfDayUnix();
  const todayEnd = endOfDayUnix();

  const [kpis, todayTasks, overdueTasks, upcomingTasks, projects, activities] =
    await Promise.all([
      getAccessibleTaskKpis(db, userId, todayStart, todayEnd),
      listAccessibleOpenTasksDueBetween(db, userId, todayStart, todayEnd, 8),
      listAccessibleOverdueTasks(db, userId, todayStart, 8),
      listAccessibleUpcomingTasks(db, userId, todayEnd, 8),
      listAccessibleProjectsForUser(db, userId, 6),
      listRecentActivitiesForUser(db, userId, 8),
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
      },
    ]),
  );

  return {
    kpis: {
      todayTasks: kpis.todayDue,
      completedToday: kpis.completedToday,
      completionRate: calcProgress(kpis.total, kpis.completed),
      overdueTasks: kpis.overdue,
      openTasks: kpis.open,
      totalProjects: projects.length,
    },
    todayTasks: todayTasks.map(serializeTaskSummary),
    upcomingTasks: upcomingTasks.map(serializeTaskSummary),
    overdueTasks: overdueTasks.map(serializeTaskSummary),
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
