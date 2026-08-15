"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { ApiError } from "@/lib/api/errors";
import {
  changePasswordBodySchema,
  updateSettingsBodySchema,
  updateUserBodySchema,
} from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import { getI18n } from "@/lib/i18n/get-i18n";
import { interpolate } from "@/lib/i18n/interpolate";
import { LOCALE_COOKIE, localeCookieOptions } from "@/lib/i18n/locale";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  changeUserPassword,
  patchSettings,
  updateCurrentUserLanguage,
  updateCurrentUserProfile,
} from "@/lib/services/user-service";

const PASSWORD_CHANGE_LIMIT = 5;
const PASSWORD_CHANGE_WINDOW_MS = 15 * 60 * 1000;

export type SettingsActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

async function unauthorized(): Promise<SettingsActionState> {
  const { t } = await getI18n();
  return { status: "error", message: t.errors.authRequired };
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

  const { t } = await getI18n();

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
      message: t.errors.profileFields,
    };
  }

  try {
    await updateCurrentUserProfile(getDb(), userId, userId, parsed.data);
    revalidatePath("/profile");
    revalidatePath(`/profile/${userId}`);
    revalidatePath("/settings");
    revalidatePath("/settings/profile");
    return { status: "success", message: t.toasts.profileUpdated };
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

  const { t } = await getI18n();

  const parsed = updateSettingsBodySchema.safeParse({
    theme: formData.get("theme") || undefined,
    accentColor: formData.get("accentColor") || undefined,
    density: formData.get("density") || undefined,
    animations: formData.get("animations") === "on",
    language: formData.get("language") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: t.errors.invalidAppearance };
  }

  const { language, ...appearance } = parsed.data;

  try {
    await patchSettings(getDb(), userId, appearance);
    if (language) {
      await updateCurrentUserLanguage(getDb(), userId, language);
      const cookieStore = await cookies();
      cookieStore.set(LOCALE_COOKIE, language, localeCookieOptions());
    }
    revalidatePath("/", "layout");
    revalidatePath("/settings/appearance");
    return { status: "success", message: t.toasts.appearanceSaved };
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

  const { t } = await getI18n();

  const parsed = updateSettingsBodySchema.safeParse({
    emailNotifications: formData.get("emailNotifications") === "on",
    inAppNotifications: formData.get("inAppNotifications") === "on",
    taskNotifications: formData.get("taskNotifications") === "on",
    mentionNotifications: formData.get("mentionNotifications") === "on",
    dueSoonNotifications: formData.get("dueSoonNotifications") === "on",
  });

  if (!parsed.success) {
    return { status: "error", message: t.errors.invalidNotifications };
  }

  try {
    await patchSettings(getDb(), userId, parsed.data);
    revalidatePath("/settings/notifications");
    return { status: "success", message: t.toasts.notificationsSaved };
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

  const { t } = await getI18n();

  const rate = checkRateLimit(
    `auth:password:${userId}`,
    PASSWORD_CHANGE_LIMIT,
    PASSWORD_CHANGE_WINDOW_MS,
  );
  if (!rate.allowed) {
    return {
      status: "error",
      message: interpolate(t.errors.tooManyAttempts, {
        seconds: rate.retryAfterSeconds,
      }),
    };
  }

  const parsed = changePasswordBodySchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: t.errors.passwordLength,
    };
  }

  try {
    await changeUserPassword(getDb(), userId, parsed.data);
    revalidatePath("/settings/security");
    return { status: "success", message: t.toasts.passwordUpdated };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}
