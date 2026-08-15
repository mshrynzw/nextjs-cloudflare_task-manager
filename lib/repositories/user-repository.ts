import { eq, sql } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import { nowUnix } from "@/lib/db/id";
import { users } from "@/lib/db/schema";

export async function findUserById(db: AppDatabase, userId: string) {
  return db.select().from(users).where(eq(users.id, userId)).get();
}

export async function findUserByEmail(db: AppDatabase, email: string) {
  const normalized = email.trim().toLowerCase();
  return db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
    })
    .from(users)
    .where(sql`lower(${users.email}) = ${normalized}`)
    .get();
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

export async function updateUserLanguage(
  db: AppDatabase,
  userId: string,
  language: string,
) {
  return db
    .update(users)
    .set({
      language,
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
