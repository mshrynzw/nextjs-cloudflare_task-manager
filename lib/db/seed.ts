import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "./client";
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from "./demo-credentials";
import { createId, nowUnix } from "./id";
import {
  activities,
  comments,
  notifications,
  projectMembers,
  projects,
  tasks,
  userSettings,
  users,
  workspaceMembers,
  workspaces,
} from "./schema";

export interface SeedResult {
  userId: string;
  workspaceId: string;
  projectId: string;
  taskId: string;
}

export { DEMO_USER_EMAIL, DEMO_USER_PASSWORD };

/**
 * Insert a minimal demo dataset for local development and tests.
 * Do not run against production.
 */
export async function seedDemoData(db: AppDatabase): Promise<SeedResult> {
  const timestamp = nowUnix();
  const userId = createId("user");
  const workspaceId = createId("workspace");
  const workspaceMemberId = createId("wsmem");
  const projectId = createId("project");
  const projectMemberId = createId("prjmem");
  const taskId = createId("task");
  const commentId = createId("comment");
  const activityId = createId("activity");
  const notificationId = createId("notification");
  const passwordHash = await hash(DEMO_USER_PASSWORD, 12);

  await db.insert(users).values({
    id: userId,
    name: "Demo User",
    username: "demo",
    email: DEMO_USER_EMAIL,
    passwordHash,
    role: "user",
    timezone: "UTC",
    language: "en",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await db.insert(userSettings).values({
    userId,
    theme: "dark",
    accentColor: "violet",
    density: "comfortable",
    animations: 1,
    emailNotifications: 1,
    inAppNotifications: 1,
    taskNotifications: 1,
    mentionNotifications: 1,
    dueSoonNotifications: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await db.insert(workspaces).values({
    id: workspaceId,
    name: "Demo Workspace",
    slug: "demo",
    description: "Local development workspace",
    createdBy: userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await db.insert(workspaceMembers).values({
    id: workspaceMemberId,
    workspaceId,
    userId,
    role: "owner",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await db.insert(projects).values({
    id: projectId,
    workspaceId,
    name: "Website Redesign",
    description: "Portfolio landing page refresh",
    color: "#8B5CF6",
    status: "active",
    priority: "high",
    createdBy: userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await db.insert(projectMembers).values({
    id: projectMemberId,
    projectId,
    userId,
    role: "owner",
    createdAt: timestamp,
  });

  await db.insert(tasks).values({
    id: taskId,
    projectId,
    title: "Design login page",
    description: "Implement the Login screen from the UI reference",
    status: "todo",
    priority: "high",
    assigneeId: userId,
    reporterId: userId,
    position: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await db.insert(comments).values({
    id: commentId,
    taskId,
    authorId: userId,
    content: "Start with the gradient background and login card.",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await db.insert(activities).values({
    id: activityId,
    workspaceId,
    projectId,
    taskId,
    userId,
    action: "task_created",
    metadata: JSON.stringify({ title: "Design login page" }),
    createdAt: timestamp,
  });

  await db.insert(notifications).values({
    id: notificationId,
    userId,
    type: "task_assigned",
    title: "You were assigned a task",
    body: "Design login page",
    entityType: "task",
    entityId: taskId,
    createdAt: timestamp,
  });

  const seededUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!seededUser) {
    throw new Error("Seed failed: demo user was not inserted");
  }

  return { userId, workspaceId, projectId, taskId };
}
