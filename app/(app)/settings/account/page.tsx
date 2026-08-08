import { auth } from "@/auth";
import { getDb } from "@/lib/db/server";
import { getUserPublicProfile } from "@/lib/services/user-service";

export default async function SettingsAccountPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const profile = await getUserPublicProfile(getDb(), userId, userId);

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-50">Account</h2>
      <p className="mt-1 mb-5 text-sm text-zinc-500">
        Account identity details.
      </p>
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-zinc-500">Email</dt>
          <dd className="mt-1 text-zinc-100">{profile.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">User ID</dt>
          <dd className="mt-1 font-mono text-xs text-zinc-400">{profile.id}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Sign-in method</dt>
          <dd className="mt-1 text-zinc-100">
            {profile.hasPassword
              ? "Email and password"
              : "OAuth / connected provider"}
          </dd>
        </div>
      </dl>
      <p className="mt-6 text-xs text-zinc-600">
        Email changes and account deletion will be added in a later security
        pass.
      </p>
    </section>
  );
}
