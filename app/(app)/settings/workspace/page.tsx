import { auth } from "@/auth";
import { WorkspaceMembersCard } from "@/features/settings/components/workspace-members-card";
import { hasMinimumRole, type MembershipRole } from "@/lib/auth/roles";
import { getDb } from "@/lib/db/server";
import { getI18n } from "@/lib/i18n/get-i18n";
import { roleLabel } from "@/lib/i18n/labels";
import { getUserWorkspaces } from "@/lib/services/user-service";
import { getWorkspaceMembersForUser } from "@/lib/services/workspace-service";

function asRole(role: string): MembershipRole {
  return role as MembershipRole;
}

export default async function SettingsWorkspacePage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const { t } = await getI18n();
  const db = getDb();
  const workspaces = await getUserWorkspaces(db, userId);
  const workspacesWithMembers = await Promise.all(
    workspaces.map(async (workspace) => ({
      ...workspace,
      members: await getWorkspaceMembersForUser(db, userId, workspace.id),
      canManage: hasMinimumRole(asRole(workspace.role), "owner"),
    })),
  );

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-50">
        {t.settings.workspaceTitle}
      </h2>
      <p className="mt-1 mb-5 text-sm text-zinc-500">
        {t.settings.workspaceDescription}
      </p>
      {workspacesWithMembers.length === 0 ? (
        <p className="text-sm text-zinc-500">{t.settings.noWorkspaces}</p>
      ) : (
        <ul className="space-y-4">
          {workspacesWithMembers.map((workspace) => (
            <li
              key={workspace.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-100">
                    {workspace.name}
                  </p>
                  <p className="text-xs text-zinc-500">{workspace.slug}</p>
                </div>
                <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                  {roleLabel(t, workspace.role)}
                </span>
              </div>
              <WorkspaceMembersCard
                workspaceId={workspace.id}
                currentUserId={userId}
                members={workspace.members}
                canManage={workspace.canManage}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
