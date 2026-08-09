import fs from "node:fs";
import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createSqliteDatabase } from "../lib/db/sqlite";
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from "../lib/db/demo-credentials";
import { seedPortfolioData } from "../lib/db/seed-portfolio";

async function main() {
  const databasePath =
    process.env.SQLITE_DB_PATH ?? path.join(".data", "local.sqlite");
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const db = createSqliteDatabase(databasePath);

  migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle", "migrations"),
  });

  const result = await seedPortfolioData(db);
  console.log("Portfolio seed completed:", result);
  console.log(`Demo login: ${DEMO_USER_EMAIL} / ${DEMO_USER_PASSWORD}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
