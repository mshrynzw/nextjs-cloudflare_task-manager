import { auth } from "@/auth";
import { getDb } from "@/lib/db/server";
import { getUserWorkspaces } from "@/lib/services/user-service";

export default async function SettingsWorkspacePage() {
  const session = await auth();
  const workspaces = await getUserWorkspaces(getDb(), session!.user!.id!);

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-50">Workspace</h2>
      <p className="mt-1 mb-5 text-sm text-zinc-500">
        Workspaces you belong to. Member and role management comes later.
      </p>
      {workspaces.length === 0 ? (
        <p className="text-sm text-zinc-500">No workspace memberships found.</p>
      ) : (
        <ul className="space-y-3">
          {workspaces.map((workspace) => (
            <li
              key={workspace.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-zinc-100">
                  {workspace.name}
                </p>
                <p className="text-xs text-zinc-500">{workspace.slug}</p>
              </div>
              <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-300">
                {workspace.role}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
