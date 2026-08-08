import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import { nowUnix } from "@/lib/db/id";
import { users } from "@/lib/db/schema";

export async function findUserById(db: AppDatabase, userId: string) {
  return db.select().from(users).where(eq(users.id, userId)).get();
}

export async function updateUserProfile(
  db: AppDatabase,
  userId: string,
  input: {
    name?: string | null;
    username?: string | null;
    jobTitle?: string | null;
    bio?: string | null;
    website?: string | null;
    image?: string | null;
  },
) {
  return db
    .update(users)
    .set({
      ...input,
      updatedAt: nowUnix(),
    })
    .where(eq(users.id, userId))
    .returning()
    .get();
}

export async function updateUserPasswordHash(
  db: AppDatabase,
  userId: string,
  passwordHash: string,
) {
  return db
    .update(users)
    .set({
      passwordHash,
      updatedAt: nowUnix(),
    })
    .where(eq(users.id, userId))
    .returning()
    .get();
}
