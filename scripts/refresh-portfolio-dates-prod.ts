/**
 * Refresh deadlines for portfolio demo projects on production D1.
 * Does NOT wipe workspaces and does NOT touch personal projects.
 *
 * Dry-run (default):
 *   pnpm db:refresh-portfolio-dates:prod
 *
 * Apply:
 *   CONFIRM_PROD_PORTFOLIO_DATES=yes pnpm db:refresh-portfolio-dates:prod
 */
import { createHttpD1Database, resolveCloudflareApiToken } from "./http-d1";

const PROD_D1_DATABASE_ID = "69660894-ce1e-4095-87fb-e1e065f95d1d";
const DEFAULT_ACCOUNT_ID = "c632c87c9894bb706fffa68716010ab5";
const DAY = 24 * 60 * 60;

const PORTFOLIO_NAMES = [
  "ウェブサイト刷新",
  "モバイルアプリ公開",
  "API プラットフォーム",
  "分析ダッシュボード刷新",
  "顧客オンボーディング",
  "請求連携",
  "セキュリティ強化",
  "ドキュメントサイト",
  "通知センター",
  "カレンダー同期",
] as const;

interface ProjectRow {
  id: string;
  name: string;
  deadline: number | null;
}

interface TaskRow {
  id: string;
  project_id: string;
  status: string;
  position: number;
  created_at: number;
  due_date: number | null;
}

async function main() {
  const apply = process.env.CONFIRM_PROD_PORTFOLIO_DATES === "yes";
  const accountId =
    process.env.CLOUDFLARE_ACCOUNT_ID?.trim() || DEFAULT_ACCOUNT_ID;
  const databaseId =
    process.env.CLOUDFLARE_D1_DATABASE_ID?.trim() || PROD_D1_DATABASE_ID;
  const apiToken = resolveCloudflareApiToken();
  const db = createHttpD1Database({ accountId, databaseId, apiToken });

  const placeholders = PORTFOLIO_NAMES.map(() => "?").join(", ");

  const portfolio = await db
    .prepare(
      `SELECT id, name, deadline
       FROM projects
       WHERE name IN (${placeholders})
       ORDER BY name`,
    )
    .bind(...PORTFOLIO_NAMES)
    .all<ProjectRow>();

  const personal = await db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM projects
       WHERE name NOT IN (${placeholders})`,
    )
    .bind(...PORTFOLIO_NAMES)
    .first<{ count: number }>();

  const foundNames = new Set(portfolio.results.map((row) => row.name));
  const missing = PORTFOLIO_NAMES.filter((name) => !foundNames.has(name));

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        portfolioFound: portfolio.results.length,
        personalProjectsUntouched: Number(personal?.count ?? 0),
        missing,
        portfolioBefore: portfolio.results.map((row) => ({
          name: row.name,
          deadline: row.deadline
            ? new Date(row.deadline * 1000).toISOString()
            : null,
        })),
      },
      null,
      2,
    ),
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing portfolio projects in production: ${missing.join(", ")}`,
    );
  }

  if (portfolio.results.length !== PORTFOLIO_NAMES.length) {
    throw new Error(
      `Expected ${PORTFOLIO_NAMES.length} portfolio projects, found ${portfolio.results.length}`,
    );
  }

  if (!apply) {
    console.log(
      "Dry-run only. Re-run with CONFIRM_PROD_PORTFOLIO_DATES=yes to apply.",
    );
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  let updatedProjects = 0;
  let updatedTasks = 0;

  for (const [index, name] of PORTFOLIO_NAMES.entries()) {
    const project = portfolio.results.find((row) => row.name === name);
    if (!project) {
      continue;
    }

    const startDate = now - (30 - index) * DAY;
    const deadline = now + (14 + index * 3) * DAY;

    await db
      .prepare(
        `UPDATE projects
         SET start_date = ?, deadline = ?, updated_at = ?
         WHERE id = ?`,
      )
      .bind(startDate, deadline, now, project.id)
      .run();
    updatedProjects += 1;

    const tasks = await db
      .prepare(
        `SELECT id, project_id, status, position, created_at, due_date
         FROM tasks
         WHERE project_id = ? AND archived_at IS NULL
         ORDER BY position ASC, created_at ASC`,
      )
      .bind(project.id)
      .all<TaskRow>();

    for (const [taskIndex, task] of tasks.results.entries()) {
      const dueDate =
        task.status === "done"
          ? Number(task.created_at) + 2 * DAY
          : now + (taskIndex + 1) * DAY;
      await db
        .prepare(
          `UPDATE tasks
           SET due_date = ?, updated_at = ?
           WHERE id = ?`,
        )
        .bind(dueDate, now, task.id)
        .run();
      updatedTasks += 1;
    }
  }

  const after = await db
    .prepare(
      `SELECT id, name, deadline
       FROM projects
       WHERE name IN (${placeholders})
       ORDER BY name`,
    )
    .bind(...PORTFOLIO_NAMES)
    .all<ProjectRow>();

  const personalAfter = await db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM projects
       WHERE name NOT IN (${placeholders})`,
    )
    .bind(...PORTFOLIO_NAMES)
    .first<{ count: number }>();

  console.log(
    JSON.stringify(
      {
        updatedProjects,
        updatedTasks,
        personalProjectsAfter: Number(personalAfter?.count ?? 0),
        portfolioAfter: after.results.map((row) => ({
          name: row.name,
          deadline: row.deadline
            ? new Date(row.deadline * 1000).toISOString()
            : null,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
