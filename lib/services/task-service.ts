import { forbidden, notFound } from "@/lib/api/errors";
import { fromUnixDate, toUnixDate } from "@/lib/api/schemas";
import { findProjectMembership } from "@/lib/auth/membership";
import { hasMinimumRole, type MembershipRole } from "@/lib/auth/roles";
import type { AppDatabase } from "@/lib/db/client";
import { findProjectById } from "@/lib/repositories/project-repository";
import {
  archiveTask,
  createActivity,
  createTask,
  findTaskById,
  getNextTaskPosition,
  listTasksForProject,
  updateTask,
  type ListTasksQuery,
} from "@/lib/repositories/task-repository";
import {
  createChecklistItem,
  createComment,
  deleteChecklistItem,
  findChecklistItemById,
  findCommentById,
  listChecklistForTask,
  listCommentsForTask,
  softDeleteComment,
  updateChecklistItem,
  updateComment,
} from "@/lib/repositories/support-repository";

function asRole(role: string): MembershipRole {
  return role as MembershipRole;
}

async function requireProjectAccess(
  db: AppDatabase,
  userId: string,
  projectId: string,
  minimumRole: MembershipRole = "viewer",
) {
  const membership = await findProjectMembership(db, userId, projectId);
  if (!membership || !hasMinimumRole(asRole(membership.role), minimumRole)) {
    throw forbidden("Project access denied");
  }
  return membership;
}

async function requireTaskAccess(
  db: AppDatabase,
  userId: string,
  taskId: string,
  minimumRole: MembershipRole = "viewer",
) {
  const task = await findTaskById(db, taskId);
  if (!task || task.archivedAt) {
    throw notFound("Task not found");
  }
  await requireProjectAccess(db, userId, task.projectId, minimumRole);
  return task;
}

function serializeTask(
  task: NonNullable<Awaited<ReturnType<typeof findTaskById>>>,
) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    projectId: task.projectId,
    assigneeId: task.assigneeId,
    reporterId: task.reporterId,
    dueDate: fromUnixDate(task.dueDate),
    position: task.position,
    completedAt: task.completedAt,
    updatedAt: task.updatedAt,
  };
}

export async function getTasksForProject(
  db: AppDatabase,
  userId: string,
  projectId: string,
  query: ListTasksQuery,
) {
  await requireProjectAccess(db, userId, projectId);
  const rows = await listTasksForProject(db, projectId, query);
  return rows.map(serializeTask);
}

export async function createTaskForProject(
  db: AppDatabase,
  userId: string,
  projectId: string,
  input: {
    title: string;
    description?: string | null;
    status?: string;
    priority?: string;
    assigneeId?: string | null;
    dueDate?: string | null;
  },
) {
  await requireProjectAccess(db, userId, projectId, "member");
  const project = await findProjectById(db, projectId);
  if (!project) {
    throw notFound("Project not found");
  }

  const status = input.status ?? "todo";
  const position = await getNextTaskPosition(db, projectId, status);
  const task = await createTask(db, {
    projectId,
    title: input.title,
    description: input.description,
    status,
    priority: input.priority ?? "medium",
    assigneeId: input.assigneeId,
    reporterId: userId,
    dueDate: toUnixDate(input.dueDate ?? undefined),
    position,
  });

  await createActivity(db, {
    workspaceId: project.workspaceId,
    projectId,
    taskId: task?.id,
    userId,
    action: "task_created",
    metadata: { title: input.title },
  });

  return task ? serializeTask(task) : null;
}

export async function getTaskDetail(
  db: AppDatabase,
  userId: string,
  taskId: string,
) {
  const task = await requireTaskAccess(db, userId, taskId);
  const [checklist, comments] = await Promise.all([
    listChecklistForTask(db, taskId),
    listCommentsForTask(db, taskId),
  ]);

  return {
    ...serializeTask(task),
    checklist: checklist.map((item) => ({
      id: item.id,
      title: item.title,
      completed: Boolean(item.completed),
      position: item.position,
    })),
    comments: comments.map((item) => ({
      id: item.id,
      content: item.content,
      authorId: item.authorId,
      authorName: item.authorName,
      authorImage: item.authorImage,
      createdAt: item.createdAt,
    })),
  };
}

export async function updateTaskForUser(
  db: AppDatabase,
  userId: string,
  taskId: string,
  input: Partial<{
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assigneeId: string | null;
    dueDate: string | null;
  }>,
) {
  const existing = await requireTaskAccess(db, userId, taskId, "member");
  const project = await findProjectById(db, existing.projectId);
  if (!project) {
    throw notFound("Project not found");
  }

  const updated = await updateTask(db, taskId, {
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    assigneeId: input.assigneeId,
    dueDate:
      input.dueDate === undefined
        ? undefined
        : toUnixDate(input.dueDate ?? undefined),
    completedAt:
      input.status === undefined
        ? undefined
        : input.status === "done"
          ? (existing.completedAt ?? Math.floor(Date.now() / 1000))
          : null,
  });

  if (!updated) {
    throw notFound("Task not found");
  }

  if (input.status && input.status !== existing.status) {
    await createActivity(db, {
      workspaceId: project.workspaceId,
      projectId: existing.projectId,
      taskId,
      userId,
      action: "task_status_changed",
      metadata: { from: existing.status, to: input.status },
    });
  }

  if (
    input.assigneeId !== undefined &&
    input.assigneeId !== existing.assigneeId
  ) {
    await createActivity(db, {
      workspaceId: project.workspaceId,
      projectId: existing.projectId,
      taskId,
      userId,
      action: "task_assignee_changed",
      metadata: { assigneeId: input.assigneeId },
    });
  }

  return serializeTask(updated);
}

export async function deleteTaskForUser(
  db: AppDatabase,
  userId: string,
  taskId: string,
) {
  await requireTaskAccess(db, userId, taskId, "member");
  await archiveTask(db, taskId);
  return { deleted: true };
}

export async function updateTaskStatusForUser(
  db: AppDatabase,
  userId: string,
  taskId: string,
  status: string,
) {
  return updateTaskForUser(db, userId, taskId, { status });
}

export async function updateTaskPositionForUser(
  db: AppDatabase,
  userId: string,
  taskId: string,
  input: { status: string; position: number },
) {
  const existing = await requireTaskAccess(db, userId, taskId, "member");
  const project = await findProjectById(db, existing.projectId);
  if (!project) {
    throw notFound("Project not found");
  }

  const updated = await updateTask(db, taskId, {
    status: input.status,
    position: input.position,
    completedAt:
      input.status === "done"
        ? (existing.completedAt ?? Math.floor(Date.now() / 1000))
        : null,
  });

  if (!updated) {
    throw notFound("Task not found");
  }

  await createActivity(db, {
    workspaceId: project.workspaceId,
    projectId: existing.projectId,
    taskId,
    userId,
    action: "task_status_changed",
    metadata: {
      from: existing.status,
      to: input.status,
      position: input.position,
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    position: updated.position,
  };
}

export async function getChecklist(
  db: AppDatabase,
  userId: string,
  taskId: string,
) {
  await requireTaskAccess(db, userId, taskId);
  const items = await listChecklistForTask(db, taskId);
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    completed: Boolean(item.completed),
    position: item.position,
  }));
}

export async function addChecklistItem(
  db: AppDatabase,
  userId: string,
  taskId: string,
  title: string,
) {
  await requireTaskAccess(db, userId, taskId, "member");
  const existing = await listChecklistForTask(db, taskId);
  const position = existing.length + 1;
  const item = await createChecklistItem(db, { taskId, title, position });
  return {
    id: item?.id,
    title: item?.title,
    completed: false,
    position: item?.position,
  };
}

export async function patchChecklistItem(
  db: AppDatabase,
  userId: string,
  checklistId: string,
  input: Partial<{ title: string; completed: boolean; position: number }>,
) {
  const item = await findChecklistItemById(db, checklistId);
  if (!item) {
    throw notFound("Checklist item not found");
  }
  await requireTaskAccess(db, userId, item.taskId, "member");
  const updated = await updateChecklistItem(db, checklistId, {
    title: input.title,
    completed:
      input.completed === undefined ? undefined : input.completed ? 1 : 0,
    position: input.position,
  });
  return {
    id: updated?.id,
    title: updated?.title,
    completed: Boolean(updated?.completed),
    position: updated?.position,
  };
}

export async function removeChecklistItem(
  db: AppDatabase,
  userId: string,
  checklistId: string,
) {
  const item = await findChecklistItemById(db, checklistId);
  if (!item) {
    throw notFound("Checklist item not found");
  }
  await requireTaskAccess(db, userId, item.taskId, "member");
  await deleteChecklistItem(db, checklistId);
  return { deleted: true };
}

export async function getComments(
  db: AppDatabase,
  userId: string,
  taskId: string,
) {
  await requireTaskAccess(db, userId, taskId);
  const items = await listCommentsForTask(db, taskId);
  return items.map((item) => ({
    id: item.id,
    content: item.content,
    authorId: item.authorId,
    authorName: item.authorName,
    authorImage: item.authorImage,
    createdAt: item.createdAt,
  }));
}

export async function addComment(
  db: AppDatabase,
  userId: string,
  taskId: string,
  content: string,
) {
  const task = await requireTaskAccess(db, userId, taskId, "member");
  const project = await findProjectById(db, task.projectId);
  if (!project) {
    throw notFound("Project not found");
  }

  const comment = await createComment(db, {
    taskId,
    authorId: userId,
    content,
  });

  await createActivity(db, {
    workspaceId: project.workspaceId,
    projectId: task.projectId,
    taskId,
    userId,
    action: "comment_created",
  });

  return {
    id: comment?.id,
    content: comment?.content,
    authorId: comment?.authorId,
    createdAt: comment?.createdAt,
  };
}

export async function patchComment(
  db: AppDatabase,
  userId: string,
  commentId: string,
  content: string,
) {
  const comment = await findCommentById(db, commentId);
  if (!comment || comment.deletedAt) {
    throw notFound("Comment not found");
  }
  await requireTaskAccess(db, userId, comment.taskId, "member");
  if (comment.authorId !== userId) {
    throw forbidden("Only the author can edit this comment");
  }
  const updated = await updateComment(db, commentId, content);
  return {
    id: updated?.id,
    content: updated?.content,
    authorId: updated?.authorId,
    createdAt: updated?.createdAt,
  };
}

export async function removeComment(
  db: AppDatabase,
  userId: string,
  commentId: string,
) {
  const comment = await findCommentById(db, commentId);
  if (!comment || comment.deletedAt) {
    throw notFound("Comment not found");
  }

  const task = await findTaskById(db, comment.taskId);
  if (!task) {
    throw notFound("Task not found");
  }

  await requireTaskAccess(db, userId, comment.taskId, "member");

  if (comment.authorId !== userId) {
    const projectMembership = await findProjectMembership(
      db,
      userId,
      task.projectId,
    );
    if (
      !projectMembership ||
      !hasMinimumRole(asRole(projectMembership.role), "owner")
    ) {
      throw forbidden("Only the author or project owner can delete comments");
    }
  }

  await softDeleteComment(db, commentId);
  return { deleted: true };
}
