"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ApiError } from "@/lib/api/errors";
import { createProjectBodySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import {
  createProjectForUser,
  deleteProjectForUser,
  resolveDefaultWorkspaceId,
  updateProjectForUser,
} from "@/lib/services/project-service";

export type ProjectActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

function unauthorizedState(): ProjectActionState {
  return { status: "error", message: "Authentication required." };
}

export async function createProjectAction(
  _prev: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorizedState();
  }

  const parsed = createProjectBodySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    status: formData.get("status") || "planning",
    priority: formData.get("priority") || "medium",
    color: formData.get("color") || "#4f7cff",
    deadline: formData.get("deadline") || null,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter a valid project name (1–100 characters).",
    };
  }

  try {
    const workspaceId = await resolveDefaultWorkspaceId(getDb(), userId);
    if (!workspaceId) {
      return {
        status: "error",
        message: "No workspace is available for this account.",
      };
    }

    const created = await createProjectForUser(getDb(), userId, {
      ...parsed.data,
      workspaceId,
    });

    revalidatePath("/projects");
    if (created.id) {
      redirect(`/projects/${created.id}`);
    }
    return { status: "success", message: "Project created." };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function archiveProjectAction(
  projectId: string,
): Promise<ProjectActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorizedState();
  }

  try {
    await deleteProjectForUser(getDb(), userId, projectId);
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    redirect("/projects");
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function updateProjectAction(
  projectId: string,
  _prev: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorizedState();
  }

  const parsed = createProjectBodySchema
    .pick({
      name: true,
      description: true,
      status: true,
      priority: true,
      color: true,
      deadline: true,
    })
    .safeParse({
      name: formData.get("name"),
      description: formData.get("description") || null,
      status: formData.get("status") || undefined,
      priority: formData.get("priority") || undefined,
      color: formData.get("color") || undefined,
      deadline: formData.get("deadline") || null,
    });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the project fields and try again.",
    };
  }

  try {
    await updateProjectForUser(getDb(), userId, projectId, parsed.data);
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    return { status: "success", message: "Project updated." };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}
