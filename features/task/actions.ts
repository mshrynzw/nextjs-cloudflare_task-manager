"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ApiError } from "@/lib/api/errors";
import {
  createCommentBodySchema,
  createChecklistBodySchema,
  createTaskBodySchema,
  updateChecklistBodySchema,
  updateTaskBodySchema,
  updateTaskPositionBodySchema,
} from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import {
  addChecklistItem,
  addComment,
  createTaskForProject,
  deleteTaskForUser,
  patchChecklistItem,
  removeChecklistItem,
  updateTaskForUser,
  updateTaskPositionForUser,
} from "@/lib/services/task-service";

export type TaskActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  taskId?: string;
};

function unauthorized(): TaskActionState {
  return { status: "error", message: "Authentication required." };
}

function revalidateTaskPaths(projectId: string, taskId?: string) {
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/board`);
  if (taskId) {
    revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
  }
}

export async function createTaskAction(
  projectId: string,
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  const parsed = createTaskBodySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    status: formData.get("status") || "todo",
    priority: formData.get("priority") || "medium",
    assigneeId: formData.get("assigneeId") || null,
    dueDate: formData.get("dueDate") || null,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter a valid task title (1–200 characters).",
    };
  }

  try {
    const created = await createTaskForProject(
      getDb(),
      userId,
      projectId,
      parsed.data,
    );
    revalidateTaskPaths(projectId, created?.id);
    return {
      status: "success",
      message: "Task created.",
      taskId: created?.id,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function moveTaskAction(input: {
  projectId: string;
  taskId: string;
  status: string;
  position: number;
}): Promise<TaskActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  const parsed = updateTaskPositionBodySchema.safeParse({
    status: input.status,
    position: input.position,
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid task move." };
  }

  try {
    await updateTaskPositionForUser(getDb(), userId, input.taskId, parsed.data);
    revalidateTaskPaths(input.projectId, input.taskId);
    return { status: "success", message: "Task moved." };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function updateTaskAction(
  projectId: string,
  taskId: string,
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  const assigneeRaw = formData.get("assigneeId");
  const parsed = updateTaskBodySchema.safeParse({
    title: formData.get("title") || undefined,
    description: formData.get("description") || null,
    status: formData.get("status") || undefined,
    priority: formData.get("priority") || undefined,
    assigneeId:
      assigneeRaw === null || assigneeRaw === ""
        ? null
        : String(assigneeRaw),
    dueDate: formData.get("dueDate") || null,
  });

  if (!parsed.success) {
    return { status: "error", message: "Check the task fields and try again." };
  }

  try {
    await updateTaskForUser(getDb(), userId, taskId, parsed.data);
    revalidateTaskPaths(projectId, taskId);
    return { status: "success", message: "Task updated." };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function archiveTaskAction(
  projectId: string,
  taskId: string,
): Promise<TaskActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  try {
    await deleteTaskForUser(getDb(), userId, taskId);
    revalidateTaskPaths(projectId, taskId);
    return { status: "success", message: "Task archived." };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function addCommentAction(
  projectId: string,
  taskId: string,
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  const parsed = createCommentBodySchema.safeParse({
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Enter a comment." };
  }

  try {
    await addComment(getDb(), userId, taskId, parsed.data.content);
    revalidateTaskPaths(projectId, taskId);
    return { status: "success", message: "Comment added." };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function addChecklistItemAction(
  projectId: string,
  taskId: string,
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  const parsed = createChecklistBodySchema.safeParse({
    title: formData.get("title"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Enter a checklist item." };
  }

  try {
    await addChecklistItem(getDb(), userId, taskId, parsed.data.title);
    revalidateTaskPaths(projectId, taskId);
    return { status: "success", message: "Checklist item added." };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function toggleChecklistItemAction(input: {
  projectId: string;
  taskId: string;
  checklistId: string;
  completed: boolean;
}): Promise<TaskActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  const parsed = updateChecklistBodySchema.safeParse({
    completed: input.completed,
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid checklist update." };
  }

  try {
    await patchChecklistItem(getDb(), userId, input.checklistId, parsed.data);
    revalidateTaskPaths(input.projectId, input.taskId);
    return { status: "success" };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function removeChecklistItemAction(input: {
  projectId: string;
  taskId: string;
  checklistId: string;
}): Promise<TaskActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return unauthorized();
  }

  try {
    await removeChecklistItem(getDb(), userId, input.checklistId);
    revalidateTaskPaths(input.projectId, input.taskId);
    return { status: "success" };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}
