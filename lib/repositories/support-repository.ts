import { and, asc, eq, isNull } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import { createId, nowUnix } from "@/lib/db/id";
import { checklistItems, comments, notifications } from "@/lib/db/schema";

export async function listCommentsForTask(db: AppDatabase, taskId: string) {
  return db
    .select()
    .from(comments)
    .where(and(eq(comments.taskId, taskId), isNull(comments.deletedAt)))
    .orderBy(asc(comments.createdAt))
    .all();
}

export async function findCommentById(db: AppDatabase, commentId: string) {
  return db.select().from(comments).where(eq(comments.id, commentId)).get();
}

export async function createComment(
  db: AppDatabase,
  input: { taskId: string; authorId: string; content: string },
) {
  const timestamp = nowUnix();
  return db
    .insert(comments)
    .values({
      id: createId("comment"),
      taskId: input.taskId,
      authorId: input.authorId,
      content: input.content,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning()
    .get();
}

export async function updateComment(
  db: AppDatabase,
  commentId: string,
  content: string,
) {
  return db
    .update(comments)
    .set({ content, updatedAt: nowUnix() })
    .where(eq(comments.id, commentId))
    .returning()
    .get();
}

export async function softDeleteComment(db: AppDatabase, commentId: string) {
  return db
    .update(comments)
    .set({ deletedAt: nowUnix(), updatedAt: nowUnix() })
    .where(eq(comments.id, commentId))
    .returning()
    .get();
}

export async function listChecklistForTask(db: AppDatabase, taskId: string) {
  return db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.taskId, taskId))
    .orderBy(asc(checklistItems.position))
    .all();
}

export async function findChecklistItemById(
  db: AppDatabase,
  checklistId: string,
) {
  return db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.id, checklistId))
    .get();
}

export async function createChecklistItem(
  db: AppDatabase,
  input: { taskId: string; title: string; position: number },
) {
  const timestamp = nowUnix();
  return db
    .insert(checklistItems)
    .values({
      id: createId("checklist"),
      taskId: input.taskId,
      title: input.title,
      completed: 0,
      position: input.position,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning()
    .get();
}

export async function updateChecklistItem(
  db: AppDatabase,
  checklistId: string,
  input: Partial<{ title: string; completed: number; position: number }>,
) {
  return db
    .update(checklistItems)
    .set({ ...input, updatedAt: nowUnix() })
    .where(eq(checklistItems.id, checklistId))
    .returning()
    .get();
}

export async function deleteChecklistItem(
  db: AppDatabase,
  checklistId: string,
) {
  return db
    .delete(checklistItems)
    .where(eq(checklistItems.id, checklistId))
    .run();
}

export async function listNotificationsForUser(
  db: AppDatabase,
  userId: string,
) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(asc(notifications.createdAt))
    .all();
}

export async function markNotificationRead(
  db: AppDatabase,
  notificationId: string,
  userId: string,
) {
  return db
    .update(notifications)
    .set({ readAt: nowUnix() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
      ),
    )
    .returning()
    .get();
}

export async function markAllNotificationsRead(
  db: AppDatabase,
  userId: string,
) {
  return db
    .update(notifications)
    .set({ readAt: nowUnix() })
    .where(eq(notifications.userId, userId))
    .run();
}
