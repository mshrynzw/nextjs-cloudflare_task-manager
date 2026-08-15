import { hash } from "bcryptjs";
import { and, eq, inArray } from "drizzle-orm";
import type { AppDatabase } from "./client";
import { createId, nowUnix } from "./id";
import {
  DEMO_PROJECT_NAME,
  DEMO_TASK_TITLE,
  DEMO_USER_EMAIL,
  DEMO_USER_NAME,
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

export {
  DEMO_PROJECT_NAME,
  DEMO_TASK_TITLE,
  DEMO_USER_EMAIL,
  DEMO_USER_NAME,
  DEMO_USER_PASSWORD,
} from "./demo-credentials";

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
  const chunkSize = Math.max(
    1,
    Math.floor(D1_SAFE_BOUND_PARAMS / paramsPerRow),
  );
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
    jobTitle: "プロダクトデザイナー",
  },
  {
    email: "leo@demo.taskmanager.app",
    name: "Leo Okada",
    username: "leo",
    jobTitle: "フロントエンドエンジニア",
  },
  {
    email: "sofia@demo.taskmanager.app",
    name: "Sofia Rahman",
    username: "sofia",
    jobTitle: "バックエンドエンジニア",
  },
  {
    email: "noah@demo.taskmanager.app",
    name: "Noah Berg",
    username: "noah",
    jobTitle: "エンジニアリングマネージャー",
  },
  {
    email: "ava@demo.taskmanager.app",
    name: "Ava Rossi",
    username: "ava",
    jobTitle: "QA リード",
  },
  {
    email: "kai@demo.taskmanager.app",
    name: "Kai Nakamura",
    username: "kai",
    jobTitle: "フルスタックエンジニア",
  },
] as const;

const PROJECT_SPECS = [
  {
    name: DEMO_PROJECT_NAME,
    description: "ポートフォリオ用ランディングページの刷新",
    color: "#8B5CF6",
    status: "active",
    priority: "high",
  },
  {
    name: "モバイルアプリ公開",
    description: "現場向け iOS / Android MVP",
    color: "#0EA5E9",
    status: "active",
    priority: "high",
  },
  {
    name: "API プラットフォーム",
    description: "公開 REST API と開発者ポータル",
    color: "#22C55E",
    status: "active",
    priority: "medium",
  },
  {
    name: "分析ダッシュボード刷新",
    description: "チャートとエクスポート基盤の見直し",
    color: "#F59E0B",
    status: "active",
    priority: "medium",
  },
  {
    name: "顧客オンボーディング",
    description: "新規ワークスペース向けの案内とチェックリスト",
    color: "#EC4899",
    status: "active",
    priority: "low",
  },
  {
    name: "請求連携",
    description: "Stripe のサブスクリプションと請求書",
    color: "#14B8A6",
    status: "on_hold",
    priority: "medium",
  },
  {
    name: "セキュリティ強化",
    description: "CSP、レート制限、監査ログ",
    color: "#EF4444",
    status: "active",
    priority: "high",
  },
  {
    name: "ドキュメントサイト",
    description: "公開プロダクトと API のドキュメント",
    color: "#6366F1",
    status: "active",
    priority: "low",
  },
  {
    name: "通知センター",
    description: "アプリ内通知とメール通知の設定",
    color: "#A855F7",
    status: "completed",
    priority: "medium",
  },
  {
    name: "カレンダー同期",
    description: "期限と外部カレンダーへのエクスポート",
    color: "#06B6D4",
    status: "active",
    priority: "low",
    visibility: "members",
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
  DEMO_TASK_TITLE,
  "ダッシュボード概要のワイヤーフレーム",
  "プロジェクト一覧フィルタの実装",
  "カンバンのドラッグ＆ドロップ改善",
  "タスク詳細コメント API",
  "期限リマインダーの追加",
  "カレンダー月表示",
  "完了トレンドの分析",
  "メンバー負荷チャート",
  "表示設定トークン",
  "公開プロフィールページ",
  "通知の一括既読エンドポイント",
  "プロジェクトメンバー認可",
  "ポートフォリオデモデータの投入",
  "認証 E2E ジャーニーの作成",
  "OpenNext Workers デプロイ",
  "本番 D1 マイグレーション",
  "ログイン試行のレート制限",
  "空状態のイラスト",
  "モバイルナビのアクセシビリティ",
];

function projectVisibility(
  spec: (typeof PROJECT_SPECS)[number],
): "workspace" | "members" {
  return "visibility" in spec && spec.visibility === "members"
    ? "members"
    : "workspace";
}

function memberIdsForProject(
  allUserIds: string[],
  projectIndex: number,
  visibility: "workspace" | "members",
): string[] {
  const ownerId = allUserIds[0];
  if (!ownerId) {
    return [];
  }
  if (projectIndex === 0) {
    return [...allUserIds];
  }
  if (visibility === "members") {
    const collaborator = allUserIds[1];
    return collaborator ? [ownerId, collaborator] : [ownerId];
  }
  const extras = allUserIds.slice(1);
  if (extras.length === 0) {
    return [ownerId];
  }
  const first = extras[projectIndex % extras.length]!;
  const second = extras[(projectIndex + 3) % extras.length]!;
  return [...new Set([ownerId, first, second])];
}

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
    language: "ja",
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
    name: DEMO_USER_NAME,
    username: "demo",
    jobTitle: "プロダクトオーナー",
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
    name: "Vantage デモ",
    slug: PORTFOLIO_WORKSPACE_SLUG,
    description:
      "サンプルのプロジェクトとタスクを含む Live Demo 用ワークスペース",
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
  const projectMemberIdsByIndex: string[][] = [];
  for (const [index, spec] of PROJECT_SPECS.entries()) {
    const projectId = createId("project");
    projectIds.push(projectId);
    const visibility = projectVisibility(spec);
    const memberIds = memberIdsForProject(allUserIds, index, visibility);
    projectMemberIdsByIndex.push(memberIds);
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
      visibility,
      createdAt: now - (40 - index) * DAY,
      updatedAt: now - index * 3600,
    });

    await db.insert(projectMembers).values(
      memberIds.map((userId, memberIndex) => ({
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
    const memberIds = projectMemberIdsByIndex[projectIndex] ?? [demoUserId];
    const tasksPerProject = projectIndex === 0 ? 12 : 7;
    for (let taskIndex = 0; taskIndex < tasksPerProject; taskIndex += 1) {
      const taskId = createId("task");
      const status = STATUSES[(projectIndex + taskIndex) % STATUSES.length];
      const priority =
        PRIORITIES[(projectIndex * 3 + taskIndex) % PRIORITIES.length];
      const assigneeId =
        memberIds[(taskIndex + projectIndex) % memberIds.length] ?? demoUserId;
      const title =
        projectIndex === 0 && taskIndex === 0
          ? DEMO_TASK_TITLE
          : TASK_TITLES[(projectIndex * 5 + taskIndex) % TASK_TITLES.length];
      const createdAt = now - (projectIndex * 5 + taskIndex) * DAY;
      const dueDate =
        status === "done" ? createdAt + 2 * DAY : now + (taskIndex + 1) * DAY;

      await db.insert(tasks).values({
        id: taskId,
        projectId,
        title,
        description: `${PROJECT_SPECS[projectIndex]?.name ?? "プロジェクト"}向け: ${title}`,
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
        const authorId = memberIds[(taskIndex + c) % memberIds.length] ?? demoUserId;
        await db.insert(comments).values({
          id: createId("comment"),
          taskId,
          authorId,
          content:
            c === 0
              ? `「${title}」の作業を開始します。`
              : "問題なさそうです。最終調整のあとレビューに出せます。",
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
          userId: memberIds[(taskIndex + a) % memberIds.length]!,
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
          title: "タスクが割り当てられました",
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
        userId: memberIds[extra % memberIds.length]!,
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
