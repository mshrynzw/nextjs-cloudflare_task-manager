import { hash } from "bcryptjs";
import { and, eq, inArray } from "drizzle-orm";
import type { AppDatabase } from "./client";
import { createId, nowUnix } from "./id";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
} from "./demo-credentials";
import {
  activities,
  checklistItems,
  comments,
  notifications,
  projectMembers,
  projectTags,
  projects,
  tags,
  taskTags,
  tasks,
  userSettings,
  users,
  workspaceMembers,
  workspaces,
} from "./schema";

export { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from "./demo-credentials";

export const PORTFOLIO_WORKSPACE_SLUG = "portfolio-demo";

export interface PortfolioSeedResult {
  demoUserId: string;
  workspaceId: string;
  projectCount: number;
  taskCount: number;
  memberCount: number;
  commentCount: number;
  activityCount: number;
}

const DAY = 24 * 60 * 60;

/** D1 allows ~100 bound parameters per query; stay under that. */
const D1_SAFE_BOUND_PARAMS = 90;

async function insertRowsInChunks<T extends Record<string, unknown>>(
  insert: (chunk: T[]) => Promise<unknown>,
  rows: T[],
  paramsPerRow: number,
): Promise<void> {
  const chunkSize = Math.max(1, Math.floor(D1_SAFE_BOUND_PARAMS / paramsPerRow));
  for (let index = 0; index < rows.length; index += chunkSize) {
    await insert(rows.slice(index, index + chunkSize));
  }
}

async function deleteByIdsInChunks(
  ids: string[],
  remove: (chunk: string[]) => Promise<unknown>,
): Promise<void> {
  const chunkSize = D1_SAFE_BOUND_PARAMS;
  for (let index = 0; index < ids.length; index += chunkSize) {
    await remove(ids.slice(index, index + chunkSize));
  }
}

const MEMBER_SPECS = [
  {
    email: "maya@demo.taskmanager.app",
    name: "Maya Chen",
    username: "maya",
    jobTitle: "Product Designer",
  },
  {
    email: "leo@demo.taskmanager.app",
    name: "Leo Okada",
    username: "leo",
    jobTitle: "Frontend Engineer",
  },
  {
    email: "sofia@demo.taskmanager.app",
    name: "Sofia Rahman",
    username: "sofia",
    jobTitle: "Backend Engineer",
  },
  {
    email: "noah@demo.taskmanager.app",
    name: "Noah Berg",
    username: "noah",
    jobTitle: "Engineering Manager",
  },
  {
    email: "ava@demo.taskmanager.app",
    name: "Ava Rossi",
    username: "ava",
    jobTitle: "QA Lead",
  },
  {
    email: "kai@demo.taskmanager.app",
    name: "Kai Nakamura",
    username: "kai",
    jobTitle: "Full-stack Engineer",
  },
] as const;

const PROJECT_SPECS = [
  {
    name: "Website Redesign",
    description: "Portfolio landing page refresh",
    color: "#8B5CF6",
    status: "active",
    priority: "high",
  },
  {
    name: "Mobile App Launch",
    description: "iOS / Android MVP for field teams",
    color: "#0EA5E9",
    status: "active",
    priority: "high",
  },
  {
    name: "API Platform",
    description: "Public REST API and developer portal",
    color: "#22C55E",
    status: "active",
    priority: "medium",
  },
  {
    name: "Analytics Revamp",
    description: "Dashboard charts and export pipeline",
    color: "#F59E0B",
    status: "active",
    priority: "medium",
  },
  {
    name: "Customer Onboarding",
    description: "Guided setup and checklist for new workspaces",
    color: "#EC4899",
    status: "active",
    priority: "low",
  },
  {
    name: "Billing Integration",
    description: "Stripe subscriptions and invoices",
    color: "#14B8A6",
    status: "on_hold",
    priority: "medium",
  },
  {
    name: "Security Hardening",
    description: "CSP, rate limits, and audit trail",
    color: "#EF4444",
    status: "active",
    priority: "high",
  },
  {
    name: "Docs Site",
    description: "Public product and API documentation",
    color: "#6366F1",
    status: "active",
    priority: "low",
  },
  {
    name: "Notification Center",
    description: "In-app and email notification preferences",
    color: "#A855F7",
    status: "completed",
    priority: "medium",
  },
  {
    name: "Calendar Sync",
    description: "Due dates and external calendar export",
    color: "#06B6D4",
    status: "active",
    priority: "low",
  },
] as const;

const STATUSES = ["backlog", "todo", "in_progress", "review", "done"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;
const ACTIONS = [
  "task_created",
  "task_status_changed",
  "task_assignee_changed",
  "comment_created",
  "project_updated",
] as const;

const TASK_TITLES = [
  "Design login page",
  "Wireframe dashboard overview",
  "Implement project list filters",
  "Kanban drag-and-drop polish",
  "Task detail comments API",
  "Add due date reminders",
  "Calendar month view",
  "Analytics completion trend",
  "Member workload chart",
  "Settings appearance tokens",
  "Profile public page",
  "Notification read-all endpoint",
  "Authorize project membership",
  "Seed portfolio demo data",
  "Write E2E auth journey",
  "OpenNext Workers deploy",
  "D1 production migrations",
  "Rate-limit login attempts",
  "Empty state illustrations",
  "Mobile nav accessibility",
];

async function ensureUser(
  db: AppDatabase,
  input: {
    email: string;
    name: string;
    username: string;
    jobTitle?: string;
    password: string;
    now: number;
  },
): Promise<string> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .get();

  const passwordHash = await hash(input.password, 12);

  if (existing) {
    await db
      .update(users)
      .set({
        name: input.name,
        username: input.username,
        jobTitle: input.jobTitle ?? null,
        passwordHash,
        updatedAt: input.now,
      })
      .where(eq(users.id, existing.id));
    return existing.id;
  }

  const userId = createId("user");
  await db.insert(users).values({
    id: userId,
    email: input.email.toLowerCase(),
    name: input.name,
    username: input.username,
    jobTitle: input.jobTitle ?? null,
    passwordHash,
    role: "user",
    timezone: "UTC",
    language: "en",
    createdAt: input.now,
    updatedAt: input.now,
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
    createdAt: input.now,
    updatedAt: input.now,
  });

  return userId;
}

async function wipePortfolioWorkspace(
  db: AppDatabase,
  workspaceId: string,
): Promise<void> {
  const projectRows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .all();
  const projectIds = projectRows.map((row) => row.id);

  if (projectIds.length > 0) {
    const taskRows = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(inArray(tasks.projectId, projectIds))
      .all();
    const taskIds = taskRows.map((row) => row.id);

    // Activities reference tasks/projects — delete before those rows.
    await db.delete(activities).where(eq(activities.workspaceId, workspaceId));

    if (taskIds.length > 0) {
      await deleteByIdsInChunks(taskIds, (chunk) =>
        db.delete(comments).where(inArray(comments.taskId, chunk)),
      );
      await deleteByIdsInChunks(taskIds, (chunk) =>
        db.delete(checklistItems).where(inArray(checklistItems.taskId, chunk)),
      );
      await deleteByIdsInChunks(taskIds, (chunk) =>
        db.delete(taskTags).where(inArray(taskTags.taskId, chunk)),
      );
      await deleteByIdsInChunks(taskIds, (chunk) =>
        db.delete(tasks).where(inArray(tasks.id, chunk)),
      );
    }

    await deleteByIdsInChunks(projectIds, (chunk) =>
      db.delete(projectMembers).where(inArray(projectMembers.projectId, chunk)),
    );
    await deleteByIdsInChunks(projectIds, (chunk) =>
      db.delete(projectTags).where(inArray(projectTags.projectId, chunk)),
    );
    await deleteByIdsInChunks(projectIds, (chunk) =>
      db.delete(projects).where(inArray(projects.id, chunk)),
    );
  } else {
    await db.delete(activities).where(eq(activities.workspaceId, workspaceId));
  }

  await db.delete(tags).where(eq(tags.workspaceId, workspaceId));
  await db
    .delete(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspaceId));
  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
}

/**
 * Rich demo dataset for local development and Live Demo (production).
 * Idempotent: reuses the demo user and replaces the `portfolio-demo` workspace.
 * Keep `seedDemoData` for fast E2E fixtures.
 */
export async function seedPortfolioData(
  db: AppDatabase,
): Promise<PortfolioSeedResult> {
  const now = nowUnix();

  const demoUserId = await ensureUser(db, {
    email: DEMO_USER_EMAIL,
    name: "Demo User",
    username: "demo",
    jobTitle: "Product Owner",
    password: DEMO_USER_PASSWORD,
    now,
  });

  const memberIds: string[] = [];
  for (const member of MEMBER_SPECS) {
    const id = await ensureUser(db, {
      email: member.email,
      name: member.name,
      username: member.username,
      jobTitle: member.jobTitle,
      password: DEMO_USER_PASSWORD,
      now,
    });
    memberIds.push(id);
  }

  const allUserIds = [demoUserId, ...memberIds];

  const existingWorkspace = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.slug, PORTFOLIO_WORKSPACE_SLUG))
    .get();

  if (existingWorkspace) {
    await wipePortfolioWorkspace(db, existingWorkspace.id);
    await db
      .delete(notifications)
      .where(
        and(
          inArray(notifications.userId, allUserIds),
          eq(notifications.entityType, "portfolio_seed"),
        ),
      );
  }

  const workspaceId = createId("workspace");
  await db.insert(workspaces).values({
    id: workspaceId,
    name: "Vantage Demo",
    slug: PORTFOLIO_WORKSPACE_SLUG,
    description: "Portfolio Live Demo workspace with sample projects and tasks",
    createdBy: demoUserId,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(workspaceMembers).values(
    allUserIds.map((userId, index) => ({
      id: createId("wsmem"),
      workspaceId,
      userId,
      role: index === 0 ? "owner" : index < 3 ? "member" : "viewer",
      createdAt: now - index * DAY,
      updatedAt: now,
    })),
  );

  const projectIds: string[] = [];
  for (const [index, spec] of PROJECT_SPECS.entries()) {
    const projectId = createId("project");
    projectIds.push(projectId);
    await db.insert(projects).values({
      id: projectId,
      workspaceId,
      name: spec.name,
      description: spec.description,
      color: spec.color,
      status: spec.status,
      priority: spec.priority,
      startDate: now - (30 - index) * DAY,
      deadline: now + (14 + index * 3) * DAY,
      createdBy: demoUserId,
      createdAt: now - (40 - index) * DAY,
      updatedAt: now - index * 3600,
    });

    await db.insert(projectMembers).values(
      allUserIds.map((userId, memberIndex) => ({
        id: createId("prjmem"),
        projectId,
        userId,
        role: memberIndex === 0 ? "owner" : "member",
        createdAt: now,
      })),
    );
  }

  let taskCount = 0;
  let commentCount = 0;
  let activityCount = 0;
  const notificationRows: (typeof notifications.$inferInsert)[] = [];

  for (const [projectIndex, projectId] of projectIds.entries()) {
    const tasksPerProject = projectIndex === 0 ? 12 : 7;
    for (let taskIndex = 0; taskIndex < tasksPerProject; taskIndex += 1) {
      const taskId = createId("task");
      const status = STATUSES[(projectIndex + taskIndex) % STATUSES.length];
      const priority =
        PRIORITIES[(projectIndex * 3 + taskIndex) % PRIORITIES.length];
      const assigneeId = allUserIds[(taskIndex + projectIndex) % allUserIds.length];
      const title =
        projectIndex === 0 && taskIndex === 0
          ? "Design login page"
          : TASK_TITLES[(projectIndex * 5 + taskIndex) % TASK_TITLES.length];
      const createdAt = now - (projectIndex * 5 + taskIndex) * DAY;
      const dueDate =
        status === "done" ? createdAt + 2 * DAY : now + (taskIndex + 1) * DAY;

      await db.insert(tasks).values({
        id: taskId,
        projectId,
        title,
        description: `${title} for ${PROJECT_SPECS[projectIndex]?.name ?? "project"}`,
        status,
        priority,
        assigneeId,
        reporterId: demoUserId,
        startDate: createdAt,
        dueDate,
        position: taskIndex + 1,
        createdAt,
        updatedAt: createdAt + 3600,
        completedAt: status === "done" ? createdAt + 2 * DAY : null,
      });
      taskCount += 1;

      const commentsForTask = taskIndex % 3 === 0 ? 2 : 1;
      for (let c = 0; c < commentsForTask; c += 1) {
        const authorId = allUserIds[(taskIndex + c) % allUserIds.length];
        await db.insert(comments).values({
          id: createId("comment"),
          taskId,
          authorId,
          content:
            c === 0
              ? `Starting work on "${title}".`
              : "Looks good — ready for review after the last polish pass.",
          createdAt: createdAt + (c + 1) * 7200,
          updatedAt: createdAt + (c + 1) * 7200,
        });
        commentCount += 1;
      }

      for (let a = 0; a < 2; a += 1) {
        await db.insert(activities).values({
          id: createId("activity"),
          workspaceId,
          projectId,
          taskId,
          userId: allUserIds[(taskIndex + a) % allUserIds.length],
          action: ACTIONS[(taskIndex + a) % ACTIONS.length],
          metadata: JSON.stringify({ title, status }),
          createdAt: createdAt + a * 1800,
        });
        activityCount += 1;
      }

      if (taskIndex % 4 === 0) {
        notificationRows.push({
          id: createId("notification"),
          userId: assigneeId,
          type: "task_assigned",
          title: "You were assigned a task",
          body: title,
          entityType: "portfolio_seed",
          entityId: taskId,
          createdAt: createdAt + 600,
        });
      }
    }

    // Extra workspace-level activity volume for the portfolio bar.
    for (let extra = 0; extra < 4; extra += 1) {
      await db.insert(activities).values({
        id: createId("activity"),
        workspaceId,
        projectId,
        taskId: null,
        userId: allUserIds[extra % allUserIds.length]!,
        action: "project_updated",
        metadata: JSON.stringify({
          name: PROJECT_SPECS[projectIndex]?.name,
        }),
        createdAt: now - (projectIndex * 4 + extra) * DAY,
      });
      activityCount += 1;
    }
  }

  if (notificationRows.length > 0) {
    await insertRowsInChunks(
      (chunk) => db.insert(notifications).values(chunk),
      notificationRows,
      8,
    );
  }

  return {
    demoUserId,
    workspaceId,
    projectCount: projectIds.length,
    taskCount,
    memberCount: allUserIds.length,
    commentCount,
    activityCount,
  };
}
