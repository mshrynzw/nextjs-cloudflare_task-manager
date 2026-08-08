import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import { createSqliteDatabase } from "@/lib/db/client";
import type { AppSchema } from "@/lib/db/client";

export function createTestDatabase(): BetterSQLite3Database<AppSchema> {
  const db = createSqliteDatabase(":memory:");
  migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle", "migrations"),
  });
  return db;
}
