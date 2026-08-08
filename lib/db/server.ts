import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { AppDatabase } from "./client";
import { createD1Database } from "./client";

let cachedSqlite: AppDatabase | undefined;

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

function getLocalSqlite(): AppDatabase {
  if (cachedSqlite) {
    return cachedSqlite;
  }
  cachedSqlite = createLocalSqlite();
  return cachedSqlite;
}

function tryGetD1BindingSync(): D1Database | undefined {
  try {
    const { env } = getCloudflareContext();
    return (env as CloudflareEnv | undefined)?.DB;
  } catch {
    return undefined;
  }
}

async function tryGetD1BindingAsync(): Promise<D1Database | undefined> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as CloudflareEnv | undefined)?.DB;
  } catch {
    return undefined;
  }
}

/**
 * Server-side database client (sync Cloudflare context).
 *
 * Prefer `getDbAsync()` inside Auth.js Route Handlers / Workers paths where
 * OpenNext may not expose sync context.
 */
export function getDb(): AppDatabase {
  const d1 = tryGetD1BindingSync();
  if (d1) {
    return createD1Database(d1);
  }

  if (!isNodeRuntime()) {
    throw new Error(
      "D1 binding `DB` is unavailable in the Workers runtime. Check wrangler.jsonc.",
    );
  }

  return getLocalSqlite();
}

/**
 * Async DB client — use for Auth.js callbacks and other Workers request paths
 * that require `getCloudflareContext({ async: true })`.
 */
export async function getDbAsync(): Promise<AppDatabase> {
  const d1 = (await tryGetD1BindingAsync()) ?? tryGetD1BindingSync();
  if (d1) {
    return createD1Database(d1);
  }

  if (!isNodeRuntime()) {
    throw new Error(
      "D1 binding `DB` is unavailable in the Workers runtime. Check wrangler.jsonc.",
    );
  }

  return getLocalSqlite();
}

/** Test-only helper to reset the cached connection. */
export function resetDbCache(): void {
  cachedSqlite = undefined;
}
