import { describe, expect, it } from "vitest";
import { toDayKey } from "@/lib/services/analytics-service";
import { createId, nowUnix } from "@/lib/db/id";
import {
  projectMembers,
  projects,
  tasks,
  users,
  workspaceMembers,
  workspaces,
} from "@/lib/db/schema";
import {
  getAnalyticsOverview,
  getAnalyticsPageData,
  getTaskDistribution,
} from "@/lib/services/analytics-service";
import { getCalendarEvents } from "@/lib/services/calendar-service";
import { getDashboardOverview } from "@/lib/services/dashboard-service";
import { createTestDatabase } from "../../helpers/db";

async function seedWorkspace() {
  const db = createTestDatabase();
  const timestamp = nowUnix();
  const userId = createId("user");
  const workspaceId = createId("workspace");
  const projectId = createId("project");

  await db.insert(users).values({
    id: userId,
    email: "insights@example.com",
    name: "Insights User",
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  await db.insert(workspaces).values({
    id: workspaceId,
    name: "Insights WS",
    slug: `insights-${workspaceId.slice(-6)}`,
    createdBy: userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  await db.insert(workspaceMembers).values({
    id: createId("wsmem"),
    workspaceId,
    userId,
    role: "owner",
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  await db.insert(projects).values({
    id: projectId,
    workspaceId,
    name: "Insights Project",
    status: "active",
    priority: "medium",
    color: "#4f7cff",
    createdBy: userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  await db.insert(projectMembers).values({
    id: createId("prjmem"),
    projectId,
    userId,
    role: "owner",
    createdAt: timestamp,
  });

  const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

  await db.insert(tasks).values([
    {
      id: createId("task"),
      projectId,
      title: "Due today",
      status: "todo",
      priority: "high",
      assigneeId: userId,
      dueDate: todayStart + 3600,
      position: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: createId("task"),
      projectId,
      title: "Done task",
      status: "done",
      priority: "medium",
      assigneeId: userId,
      dueDate: todayStart,
      position: 2,
      createdAt: timestamp - 86400,
      updatedAt: timestamp,
      completedAt: timestamp,
    },
    {
      id: createId("task"),
      projectId,
      title: "Overdue task",
      status: "todo",
      priority: "low",
      dueDate: todayStart - 86400,
      position: 3,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ]);

  return { db, userId, projectId, todayStart };
}

describe("insights services", () => {
  it("builds dashboard KPIs from accessible tasks", async () => {
    const { db, userId } = await seedWorkspace();
    const dashboard = await getDashboardOverview(db, userId);

    expect(dashboard.kpis.todayTasks).toBeGreaterThanOrEqual(1);
    expect(dashboard.kpis.overdueTasks).toBeGreaterThanOrEqual(1);
    expect(dashboard.kpis.completionRate).toBeGreaterThan(0);
    expect(dashboard.projects).toHaveLength(1);
  });

  it("returns calendar events in range", async () => {
    const { db, userId, todayStart } = await seedWorkspace();
    const start = new Date(todayStart * 1000).toISOString().slice(0, 10);
    const end = start;
    const events = await getCalendarEvents(db, userId, { start, end });
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0]?.type).toBe("task");
  });

  it("computes analytics overview and distribution", async () => {
    const { db, userId } = await seedWorkspace();
    const overview = await getAnalyticsOverview(db, userId);
    const distribution = await getTaskDistribution(db, userId);
    const page = await getAnalyticsPageData(db, userId);

    expect(overview.totalTasks).toBe(3);
    expect(overview.completedTasks).toBe(1);
    expect(distribution.find((item) => item.status === "done")?.count).toBe(1);
    expect(page.overview.totalTasks).toBe(3);
    expect(page.distribution.find((item) => item.status === "done")?.count).toBe(
      1,
    );
  });
});

describe("toDayKey", () => {
  it("formats unix timestamps as YYYY-MM-DD", () => {
    expect(toDayKey(Date.UTC(2026, 7, 8) / 1000)).toBe("2026-08-08");
  });
});
