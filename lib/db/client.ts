import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

export type AppSchema = typeof schema;

/** Local / test database used by Next.js during Phase 3. */
export type AppDatabase = BetterSQLite3Database<AppSchema>;

export type D1AppDatabase = DrizzleD1Database<AppSchema>;

/**
 * Create a Drizzle client for Cloudflare D1 (Workers / OpenNext runtime).
 */
export function createD1Database(d1: D1Database): D1AppDatabase {
  return drizzleD1(d1, { schema });
}

/**
 * Create a Drizzle client backed by local SQLite.
 * Used for tests and local scripts before OpenNext/D1 binding is wired into Next.js.
 */
export function createSqliteDatabase(
  filename: string | ":memory:" = ":memory:",
): AppDatabase {
  const sqlite = new Database(filename);
  sqlite.pragma("foreign_keys = ON");
  return drizzleSqlite(sqlite, { schema });
}

export { schema };
