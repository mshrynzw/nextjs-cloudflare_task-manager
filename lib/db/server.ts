import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { AppDatabase } from "./client";
import { createD1Database } from "./client";

let cachedSqlite: AppDatabase | undefined;

function tryGetD1Binding(): D1Database | undefined {
  try {
    const { env } = getCloudflareContext();
    return (env as CloudflareEnv | undefined)?.DB;
  } catch {
    return undefined;
  }
}

function isNodeRuntime(): boolean {
  return typeof process !== "undefined" && Boolean(process.versions?.node);
}

function createLocalSqlite(): AppDatabase {
  // Resolve relative to this module so Next's compiled output can load the sibling.
  const nodeRequire = createRequire(import.meta.url);
  const { createSqliteDatabase } = nodeRequire(
    "./sqlite",
  ) as typeof import("./sqlite");

  const databasePath =
    process.env.SQLITE_DB_PATH ??
    path.join(process.cwd(), ".data", "local.sqlite");

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  return createSqliteDatabase(databasePath);
}

/**
 * Server-side database client.
 *
 * - Cloudflare Workers / OpenNext preview: D1 binding `DB`
 * - Local `next dev` / Vitest / scripts: SQLite file (better-sqlite3)
 */
export function getDb(): AppDatabase {
  const d1 = tryGetD1Binding();
  if (d1) {
    return createD1Database(d1);
  }

  if (!isNodeRuntime()) {
    throw new Error(
      "D1 binding `DB` is unavailable in the Workers runtime. Check wrangler.jsonc.",
    );
  }

  if (cachedSqlite) {
    return cachedSqlite;
  }

  cachedSqlite = createLocalSqlite();
  return cachedSqlite;
}

/** Test-only helper to reset the cached connection. */
export function resetDbCache(): void {
  cachedSqlite = undefined;
}
