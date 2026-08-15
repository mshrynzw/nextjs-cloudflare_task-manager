import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import { createSqliteDatabase } from "@/lib/db/sqlite";
import type { AppSchema } from "@/lib/db/client";
import { createId, nowUnix } from "@/lib/db/id";
import { users, workspaceMembers, workspaces } from "@/lib/db/schema";

export type TestDatabase = BetterSQLite3Database<AppSchema>;

export function createTestDatabase(): TestDatabase {
  const db = createSqliteDatabase(":memory:");
  migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle", "migrations"),
  });
  return db;
}

export async function seedWorkspaceOwner(
  db: TestDatabase = createTestDatabase(),
) {
  const timestamp = nowUnix();
  const userId = createId("user");
  const outsiderId = createId("user");
  const workspaceId = createId("workspace");

  await db.insert(users).values([
    {
      id: userId,
      email: "owner@example.com",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: outsiderId,
      email: "outsider@example.com",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ]);

  await db.insert(workspaces).values({
    id: workspaceId,
    name: "Test Workspace",
    slug: `ws-${workspaceId.slice(-6)}`,
    createdBy: userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await db.insert(workspaceMembers).values({
    id: createId("wsmem"),
    workspaceId,
    userId,
    role: "owner",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return { db, userId, outsiderId, workspaceId };
}

export async function seedWorkspaceOwnerAndMember(
  db: TestDatabase = createTestDatabase(),
) {
  const seeded = await seedWorkspaceOwner(db);
  const timestamp = nowUnix();
  const memberId = createId("user");

  await seeded.db.insert(users).values({
    id: memberId,
    email: "member@example.com",
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  await seeded.db.insert(workspaceMembers).values({
    id: createId("wsmem"),
    workspaceId: seeded.workspaceId,
    userId: memberId,
    role: "member",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return { ...seeded, memberId };
}
