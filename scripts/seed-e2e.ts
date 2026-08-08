import fs from "node:fs";
import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createSqliteDatabase } from "../lib/db/client";
import { seedDemoData } from "../lib/db/seed";

async function main() {
  const databasePath =
    process.env.SQLITE_DB_PATH ?? path.join(".data", "e2e.sqlite");

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  if (fs.existsSync(databasePath)) {
    fs.rmSync(databasePath);
  }

  const db = createSqliteDatabase(databasePath);
  migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle", "migrations"),
  });

  const result = await seedDemoData(db);
  console.log("E2E seed completed:", result);
  console.log("Database:", databasePath);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
