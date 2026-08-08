import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { fromUnixDate } from "@/lib/api/schemas";
import { forbidden, notFound, validationError } from "@/lib/api/errors";
import type { AppDatabase } from "@/lib/db/client";
import {
  userSettings,
  workspaceMembers,
  workspaces,
} from "@/lib/db/schema";
import {
  findUserById,
  updateUserPasswordHash,
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
import {
  listAccessibleProjectsForUser,
  listAccessibleTasksForUser,
  listRecentActivitiesForUser,
} from "@/lib/repositories/insights-repository";

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
    hasPassword: Boolean(user.passwordHash),
  };
}

export async function getProfilePageData(
  db: AppDatabase,
  actorUserId: string,
  userId: string,
) {
  const profile = await getUserPublicProfile(db, actorUserId, userId);
  const [tasks, projects, activities] = await Promise.all([
    listAccessibleTasksForUser(db, actorUserId),
    listAccessibleProjectsForUser(db, actorUserId, 12),
    listRecentActivitiesForUser(db, actorUserId, 8),
  ]);

  const assignedTasks = tasks
    .filter((task) => task.assigneeId === userId)
    .slice(0, 8)
    .map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      projectName: task.projectName,
      dueDate: fromUnixDate(task.dueDate),
    }));

  const completedAssigned = tasks.filter(
    (task) => task.assigneeId === userId && task.status === "done",
  ).length;
  const totalAssigned = tasks.filter(
    (task) => task.assigneeId === userId,
  ).length;

  return {
    profile,
    isOwnProfile: actorUserId === userId,
    stats: {
      assignedTasks: totalAssigned,
      completedTasks: completedAssigned,
      projects: projects.length,
    },
    assignedTasks,
    projects: projects.slice(0, 6),
    activities: activities
      .filter((item) => item.userId === userId)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        action: item.action,
        projectId: item.projectId,
        projectName: item.projectName,
        createdAt: item.createdAt,
      })),
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

export async function changeUserPassword(
  db: AppDatabase,
  userId: string,
  input: { currentPassword: string; newPassword: string },
) {
  const user = await findUserById(db, userId);
  if (!user) {
    throw notFound("User not found");
  }
  if (!user.passwordHash) {
    throw validationError(
      "Password change is only available for email accounts.",
    );
  }

  const isValid = await compare(input.currentPassword, user.passwordHash);
  if (!isValid) {
    throw validationError("Current password is incorrect.");
  }

  const passwordHash = await hash(input.newPassword, 12);
  await updateUserPasswordHash(db, userId, passwordHash);
  return { updated: true };
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
  let settings = await findUserSettings(db, userId);
  if (!settings) {
    const timestamp = Math.floor(Date.now() / 1000);
    await db
      .insert(userSettings)
      .values({
        userId,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .onConflictDoNothing();
    settings = await findUserSettings(db, userId);
  }
  if (!settings) {
    throw notFound("Settings not found");
  }
  return serializeSettings(settings);
}

function serializeSettings(
  settings: NonNullable<Awaited<ReturnType<typeof findUserSettings>>>,
) {
  return {
    userId: settings.userId,
    theme: settings.theme,
    accentColor: settings.accentColor,
    density: settings.density,
    animations: Boolean(settings.animations),
    emailNotifications: Boolean(settings.emailNotifications),
    inAppNotifications: Boolean(settings.inAppNotifications),
    taskNotifications: Boolean(settings.taskNotifications),
    mentionNotifications: Boolean(settings.mentionNotifications),
    dueSoonNotifications: Boolean(settings.dueSoonNotifications),
    updatedAt: settings.updatedAt,
  };
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

  return serializeSettings(updated);
}

export async function getUserWorkspaces(db: AppDatabase, userId: string) {
  return db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, userId))
    .all();
}
