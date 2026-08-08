"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ApiError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/server";
import {
  readAllNotifications,
  readNotification,
} from "@/lib/services/user-service";

export type NotificationActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { status: "error", message: "Authentication required." };
  }

  try {
    await readNotification(getDb(), userId, notificationId);
    revalidatePath("/notifications");
    revalidatePath("/dashboard");
    return { status: "success" };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { status: "error", message: "Authentication required." };
  }

  try {
    await readAllNotifications(getDb(), userId);
    revalidatePath("/notifications");
    revalidatePath("/dashboard");
    return { status: "success" };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}
