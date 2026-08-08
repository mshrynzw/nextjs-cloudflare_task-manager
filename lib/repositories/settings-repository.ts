import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import { nowUnix } from "@/lib/db/id";
import { userSettings } from "@/lib/db/schema";

export async function findUserSettings(db: AppDatabase, userId: string) {
  return db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .get();
}

export async function updateUserSettings(
  db: AppDatabase,
  userId: string,
  input: Partial<{
    theme: string;
    accentColor: string;
    density: string;
    animations: number;
    emailNotifications: number;
    inAppNotifications: number;
    taskNotifications: number;
    mentionNotifications: number;
    dueSoonNotifications: number;
  }>,
) {
  return db
    .update(userSettings)
    .set({
      ...input,
      updatedAt: nowUnix(),
    })
    .where(eq(userSettings.userId, userId))
    .returning()
    .get();
}
