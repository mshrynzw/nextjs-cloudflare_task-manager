import { and, count, eq, inArray } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import { createId, nowUnix } from "@/lib/db/id";
import {
  projectMembers,
  projects,
  tasks,
  workspaceMembers,
} from "@/lib/db/schema";

export async function addWorkspaceMember(
  db: AppDatabase,
  input: { workspaceId: string; userId: string; role: string },
) {
  const timestamp = nowUnix();
  return db
    .insert(workspaceMembers)
    .values({
      id: createId("wsmem"),
      workspaceId: input.workspaceId,
      userId: input.userId,
      role: input.role,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning()
    .get();
}

export async function updateWorkspaceMemberRole(
  db: AppDatabase,
  workspaceId: string,
  userId: string,
  role: string,
) {
  return db
    .update(workspaceMembers)
    .set({
      role,
      updatedAt: nowUnix(),
    })
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    )
    .returning()
    .get();
}

export async function countWorkspaceMembersWithRole(
  db: AppDatabase,
  workspaceId: string,
  role: string,
) {
  const row = await db
    .select({ value: count() })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.role, role),
      ),
    )
    .get();
  return row?.value ?? 0;
}

export async function removeWorkspaceMember(
  db: AppDatabase,
  workspaceId: string,
  userId: string,
) {
  return db
    .delete(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    )
    .run();
}

export async function listProjectIdsInWorkspace(
  db: AppDatabase,
  workspaceId: string,
) {
  const rows = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .all();
  return rows.map((row) => row.id);
}

export async function removeProjectMembershipsForUserInProjects(
  db: AppDatabase,
  userId: string,
  projectIds: string[],
) {
  if (projectIds.length === 0) {
    return;
  }

  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.userId, userId),
        inArray(projectMembers.projectId, projectIds),
      ),
    )
    .run();
}

export async function unassignTasksForUserInProjects(
  db: AppDatabase,
  userId: string,
  projectIds: string[],
) {
  if (projectIds.length === 0) {
    return;
  }

  await db
    .update(tasks)
    .set({
      assigneeId: null,
      updatedAt: nowUnix(),
    })
    .where(
      and(eq(tasks.assigneeId, userId), inArray(tasks.projectId, projectIds)),
    )
    .run();
}
