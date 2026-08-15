import { and, eq, isNotNull, isNull, or } from "drizzle-orm";
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

/** Keep unscoped rows; otherwise apply the same project read boundary. */
export function canReadLinkedProjectOrUnscopedSql() {
  return or(
    isNull(projects.id),
    isNotNull(projectMembers.id),
    and(eq(projects.visibility, "workspace"), isNotNull(workspaceMembers.id)),
  );
}
