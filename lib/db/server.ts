import type { AppDatabase } from "./client";
import { createSqliteDatabase } from "./client";
import path from "node:path";
import fs from "node:fs";

let cachedDb: AppDatabase | undefined;

/**
 * Server-side database client for Next.js (local SQLite).
 * Cloudflare D1 binding will replace this path when OpenNext is wired.
 */
export function getDb(): AppDatabase {
  if (cachedDb) {
    return cachedDb;
  }

  const databasePath =
    process.env.SQLITE_DB_PATH ??
    path.join(process.cwd(), ".data", "local.sqlite");

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  cachedDb = createSqliteDatabase(databasePath);
  return cachedDb;
}

/** Test-only helper to reset the cached connection. */
export function resetDbCache(): void {
  cachedDb = undefined;
}
