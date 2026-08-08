import { forbidden, notFound } from "@/lib/api/errors";
import type { AppDatabase } from "@/lib/db/client";
import {
  findUserById,
  updateUserProfile,
} from "@/lib/repositories/user-repository";
import {
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/repositories/support-repository";
import {
  findUserSettings,
  updateUserSettings,
} from "@/lib/repositories/settings-repository";

export async function getUserPublicProfile(
  db: AppDatabase,
  actorUserId: string,
  userId: string,
) {
  const user = await findUserById(db, userId);
  if (!user) {
    throw notFound("User not found");
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    image: user.image,
    jobTitle: user.jobTitle,
    bio: user.bio,
    website: user.website,
    role: user.role,
    email: actorUserId === userId ? user.email : undefined,
  };
}

export async function updateCurrentUserProfile(
  db: AppDatabase,
  userId: string,
  targetUserId: string,
  input: {
    name?: string | null;
    username?: string | null;
    jobTitle?: string | null;
    bio?: string | null;
    website?: string | null;
    image?: string | null;
  },
) {
  if (userId !== targetUserId) {
    throw forbidden("You can only update your own profile");
  }

  const updated = await updateUserProfile(db, targetUserId, input);
  if (!updated) {
    throw notFound("User not found");
  }

  return {
    id: updated.id,
    name: updated.name,
    jobTitle: updated.jobTitle,
    bio: updated.bio,
    website: updated.website,
    username: updated.username,
    image: updated.image,
  };
}

export async function getNotifications(db: AppDatabase, userId: string) {
  const rows = await listNotificationsForUser(db, userId);
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    entityType: row.entityType,
    entityId: row.entityId,
    readAt: row.readAt,
    createdAt: row.createdAt,
  }));
}

export async function readNotification(
  db: AppDatabase,
  userId: string,
  notificationId: string,
) {
  const updated = await markNotificationRead(db, notificationId, userId);
  if (!updated) {
    throw notFound("Notification not found");
  }
  return { id: updated.id, readAt: updated.readAt };
}

export async function readAllNotifications(db: AppDatabase, userId: string) {
  await markAllNotificationsRead(db, userId);
  return { updated: true };
}

export async function getSettings(db: AppDatabase, userId: string) {
  const settings = await findUserSettings(db, userId);
  if (!settings) {
    throw notFound("Settings not found");
  }
  return settings;
}

export async function patchSettings(
  db: AppDatabase,
  userId: string,
  input: Partial<{
    theme: string;
    accentColor: string;
    density: string;
    animations: boolean;
    emailNotifications: boolean;
    inAppNotifications: boolean;
    taskNotifications: boolean;
    mentionNotifications: boolean;
    dueSoonNotifications: boolean;
  }>,
) {
  const updated = await updateUserSettings(db, userId, {
    theme: input.theme,
    accentColor: input.accentColor,
    density: input.density,
    animations:
      input.animations === undefined ? undefined : input.animations ? 1 : 0,
    emailNotifications:
      input.emailNotifications === undefined
        ? undefined
        : input.emailNotifications
          ? 1
          : 0,
    inAppNotifications:
      input.inAppNotifications === undefined
        ? undefined
        : input.inAppNotifications
          ? 1
          : 0,
    taskNotifications:
      input.taskNotifications === undefined
        ? undefined
        : input.taskNotifications
          ? 1
          : 0,
    mentionNotifications:
      input.mentionNotifications === undefined
        ? undefined
        : input.mentionNotifications
          ? 1
          : 0,
    dueSoonNotifications:
      input.dueSoonNotifications === undefined
        ? undefined
        : input.dueSoonNotifications
          ? 1
          : 0,
  });

  if (!updated) {
    throw notFound("Settings not found");
  }

  return updated;
}
