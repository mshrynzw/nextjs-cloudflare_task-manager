import { and, eq } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import { projectMembers, workspaceMembers } from "@/lib/db/schema";

export async function findWorkspaceMembership(
  db: AppDatabase,
  userId: string,
  workspaceId: string,
) {
  return db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    )
    .get();
}

export async function findProjectMembership(
  db: AppDatabase,
  userId: string,
  projectId: string,
) {
  return db
    .select()
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId),
      ),
    )
    .get();
}
