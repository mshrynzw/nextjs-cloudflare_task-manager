import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

export type AppSchema = typeof schema;

export type AppDatabase =
  DrizzleD1Database<AppSchema> | BetterSQLite3Database<AppSchema>;

/**
 * Create a Drizzle client for Cloudflare D1 (Workers / OpenNext runtime).
 */
export function createD1Database(d1: D1Database): DrizzleD1Database<AppSchema> {
  return drizzleD1(d1, { schema });
}

/**
 * Create a Drizzle client backed by local SQLite.
 * Used for tests and local scripts before OpenNext/D1 binding is wired into Next.js.
 */
export function createSqliteDatabase(
  filename: string | ":memory:" = ":memory:",
): BetterSQLite3Database<AppSchema> {
  const sqlite = new Database(filename);
  sqlite.pragma("foreign_keys = ON");
  return drizzleSqlite(sqlite, { schema });
}

export { schema };
