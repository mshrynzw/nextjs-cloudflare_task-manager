"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ApiError } from "@/lib/api/errors";
import {
  addWorkspaceMemberBodySchema,
  updateWorkspaceMemberBodySchema,
} from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import { getI18n } from "@/lib/i18n/get-i18n";
import {
  addWorkspaceMemberForUser,
  removeWorkspaceMemberForUser,
  updateWorkspaceMemberRoleForUser,
} from "@/lib/services/workspace-service";
import type { SettingsActionState } from "@/features/settings/actions";

async function unauthorized(): Promise<SettingsActionState> {
  const { t } = await getI18n();
  return { status: "error", message: t.errors.authRequired };
}

function revalidateWorkspacePaths() {
  revalidatePath("/settings/workspace");
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function addWorkspaceMemberAction(
  workspaceId: string,
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  const { t } = await getI18n();
  const parsed = addWorkspaceMemberBodySchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") || "member",
  });

  if (!parsed.success) {
    return { status: "error", message: t.settings.workspaceInvalidEmail };
  }

  try {
    await addWorkspaceMemberForUser(getDb(), userId, workspaceId, parsed.data);
    revalidateWorkspacePaths();
    return { status: "success", message: t.toasts.workspaceMemberAdded };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function updateWorkspaceMemberRoleAction(
  workspaceId: string,
  targetUserId: string,
  role: string,
): Promise<SettingsActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  const { t } = await getI18n();
  const parsed = updateWorkspaceMemberBodySchema.safeParse({ role });
  if (!parsed.success) {
    return { status: "error", message: t.settings.workspaceRoleChangeFailed };
  }

  try {
    await updateWorkspaceMemberRoleForUser(
      getDb(),
      userId,
      workspaceId,
      targetUserId,
      parsed.data.role,
    );
    revalidateWorkspacePaths();
    return { status: "success", message: t.toasts.workspaceRoleUpdated };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function removeWorkspaceMemberAction(
  workspaceId: string,
  targetUserId: string,
): Promise<SettingsActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  try {
    await removeWorkspaceMemberForUser(
      getDb(),
      userId,
      workspaceId,
      targetUserId,
    );
    revalidateWorkspacePaths();
    const { t } = await getI18n();
    return { status: "success", message: t.toasts.workspaceMemberRemoved };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}
