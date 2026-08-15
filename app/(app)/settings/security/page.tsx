import { auth } from "@/auth";
import { ChangePasswordForm } from "@/features/settings/components/change-password-form";
import { getDb } from "@/lib/db/server";
import { getI18n } from "@/lib/i18n/get-i18n";
import { getUserPublicProfile } from "@/lib/services/user-service";

export default async function SettingsSecurityPage() {
  const session = await auth();
  const { t } = await getI18n();
  const userId = session!.user!.id!;
  const profile = await getUserPublicProfile(getDb(), userId, userId);

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-50">
        {t.settings.securityTitle}
      </h2>
      <p className="mt-1 mb-5 text-sm text-zinc-500">
        {t.settings.securityDescription}
      </p>
      <ChangePasswordForm hasPassword={Boolean(profile.hasPassword)} />
    </section>
  );
}
