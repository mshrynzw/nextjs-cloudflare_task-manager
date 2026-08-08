"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ApiError } from "@/lib/api/errors";
import {
  changePasswordBodySchema,
  updateSettingsBodySchema,
  updateUserBodySchema,
} from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import {
  changeUserPassword,
  patchSettings,
  updateCurrentUserProfile,
} from "@/lib/services/user-service";

export type SettingsActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

function unauthorized(): SettingsActionState {
  return { status: "error", message: "Authentication required." };
}

export async function updateProfileAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  const parsed = updateUserBodySchema.safeParse({
    name: formData.get("name") || null,
    username: formData.get("username") || null,
    jobTitle: formData.get("jobTitle") || null,
    bio: formData.get("bio") || null,
    website: formData.get("website") || null,
    image: formData.get("image") || null,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check profile fields (website/image must be valid URLs).",
    };
  }

  try {
    await updateCurrentUserProfile(getDb(), userId, userId, parsed.data);
    revalidatePath("/profile");
    revalidatePath(`/profile/${userId}`);
    revalidatePath("/settings");
    revalidatePath("/settings/profile");
    return { status: "success", message: "Profile updated." };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function updateAppearanceAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  const parsed = updateSettingsBodySchema.safeParse({
    theme: formData.get("theme") || undefined,
    accentColor: formData.get("accentColor") || undefined,
    density: formData.get("density") || undefined,
    animations: formData.get("animations") === "on",
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid appearance settings." };
  }

  try {
    await patchSettings(getDb(), userId, parsed.data);
    revalidatePath("/settings/appearance");
    return { status: "success", message: "Appearance saved." };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function updateNotificationSettingsAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  const parsed = updateSettingsBodySchema.safeParse({
    emailNotifications: formData.get("emailNotifications") === "on",
    inAppNotifications: formData.get("inAppNotifications") === "on",
    taskNotifications: formData.get("taskNotifications") === "on",
    mentionNotifications: formData.get("mentionNotifications") === "on",
    dueSoonNotifications: formData.get("dueSoonNotifications") === "on",
  });

  if (!parsed.success) {
    return { status: "error", message: "Invalid notification settings." };
  }

  try {
    await patchSettings(getDb(), userId, parsed.data);
    revalidatePath("/settings/notifications");
    return { status: "success", message: "Notification preferences saved." };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function changePasswordAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  const parsed = changePasswordBodySchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Passwords must be at least 8 characters.",
    };
  }

  try {
    await changeUserPassword(getDb(), userId, parsed.data);
    revalidatePath("/settings/security");
    return { status: "success", message: "Password updated." };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}
