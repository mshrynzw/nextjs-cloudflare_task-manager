import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./schema";

export type AppSchema = typeof schema;

/**
 * Application DB handle.
 *
 * Typed as better-sqlite3 (sync query helpers `.get` / `.all` / `.run`) so
 * repositories keep a single inference path. Cloudflare D1 is created via
 * `createD1Database` and cast at the boundary — callers must `await` those
 * helpers (already the project convention) so both runtimes work.
 */
export type AppDatabase = BetterSQLite3Database<AppSchema>;

/**
 * Create a Drizzle client for Cloudflare D1 (Workers / OpenNext runtime).
 */
export function createD1Database(d1: D1Database): AppDatabase {
  return drizzleD1(d1, { schema }) as unknown as AppDatabase;
}

export { schema };
