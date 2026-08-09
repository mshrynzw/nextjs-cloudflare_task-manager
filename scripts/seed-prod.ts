/**
 * Seed production D1 with portfolio demo data.
 *
 * Requires:
 *   - Cloudflare auth (`wrangler login` or CLOUDFLARE_API_TOKEN)
 *   - Migrations already applied (`pnpm db:migrate:prod`)
 *   - CONFIRM_PROD_SEED=yes
 *
 * Usage (bash):
 *   CONFIRM_PROD_SEED=yes pnpm db:seed:prod
 *
 * Usage (PowerShell):
 *   $env:CONFIRM_PROD_SEED="yes"; pnpm db:seed:prod
 */
import { createD1Database } from "../lib/db/client";
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from "../lib/db/demo-credentials";
import { seedPortfolioData } from "../lib/db/seed-portfolio";
import { createHttpD1Database, resolveCloudflareApiToken } from "./http-d1";

/** Matches wrangler.jsonc env.production d1 database_id */
const PROD_D1_DATABASE_ID = "69660894-ce1e-4095-87fb-e1e065f95d1d";
const DEFAULT_ACCOUNT_ID = "c632c87c9894bb706fffa68716010ab5";

async function main() {
  if (process.env.CONFIRM_PROD_SEED !== "yes") {
    console.error(
      "Refusing to seed production. Re-run with CONFIRM_PROD_SEED=yes",
    );
    process.exit(1);
  }

  const accountId =
    process.env.CLOUDFLARE_ACCOUNT_ID?.trim() || DEFAULT_ACCOUNT_ID;
  const databaseId =
    process.env.CLOUDFLARE_D1_DATABASE_ID?.trim() || PROD_D1_DATABASE_ID;
  const apiToken = resolveCloudflareApiToken();

  const binding = createHttpD1Database({
    accountId,
    databaseId,
    apiToken,
  });

  const probe = await binding
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'",
    )
    .first<{ name: string }>();
  if (!probe?.name) {
    throw new Error(
      "Remote D1 has no `users` table. Run `pnpm db:migrate:prod` first.",
    );
  }

  const db = createD1Database(binding);
  const result = await seedPortfolioData(db);
  console.log("Production portfolio seed completed:", result);
  console.log(`Demo login: ${DEMO_USER_EMAIL} / ${DEMO_USER_PASSWORD}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
