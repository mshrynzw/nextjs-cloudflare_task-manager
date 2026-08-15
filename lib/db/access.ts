import { and, eq, isNotNull, or } from "drizzle-orm";
import { projectMembers, projects, workspaceMembers } from "@/lib/db/schema";

export function workspaceMembershipJoin(userId: string) {
  return and(
    eq(workspaceMembers.workspaceId, projects.workspaceId),
    eq(workspaceMembers.userId, userId),
  );
}

export function projectMembershipJoin(userId: string) {
  return and(
    eq(projectMembers.projectId, projects.id),
    eq(projectMembers.userId, userId),
  );
}

export function canReadProjectSql() {
  return or(eq(projects.visibility, "workspace"), isNotNull(projectMembers.id));
}
