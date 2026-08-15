import { auth } from "@/auth";
import { getDb } from "@/lib/db/server";
import { getI18n } from "@/lib/i18n/get-i18n";
import { getUserPublicProfile } from "@/lib/services/user-service";

export default async function SettingsAccountPage() {
  const session = await auth();
  const { t } = await getI18n();
  const userId = session!.user!.id!;
  const profile = await getUserPublicProfile(getDb(), userId, userId);

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-50">
        {t.settings.accountTitle}
      </h2>
      <p className="mt-1 mb-5 text-sm text-zinc-500">
        {t.settings.accountDescription}
      </p>
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-zinc-500">{t.settings.email}</dt>
          <dd className="mt-1 text-zinc-100">{profile.email ?? t.common.dash}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t.settings.userId}</dt>
          <dd className="mt-1 font-mono text-xs text-zinc-400">{profile.id}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t.settings.signInMethod}</dt>
          <dd className="mt-1 text-zinc-100">
            {profile.hasPassword
              ? t.settings.emailPassword
              : t.settings.oauthProvider}
          </dd>
        </div>
      </dl>
      <p className="mt-6 text-xs text-zinc-600">{t.settings.accountLater}</p>
    </section>
  );
}
