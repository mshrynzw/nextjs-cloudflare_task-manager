import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

type AppSchema = typeof schema;

export type SqliteAppDatabase = BetterSQLite3Database<AppSchema>;

/**
 * Create a Drizzle client backed by local SQLite (Node only).
 * Do not import this module from Workers / OpenNext production request paths.
 */
export function createSqliteDatabase(
  filename: string | ":memory:" = ":memory:",
): SqliteAppDatabase {
  const sqlite = new Database(filename);
  sqlite.pragma("foreign_keys = ON");
  return drizzleSqlite(sqlite, { schema });
}
