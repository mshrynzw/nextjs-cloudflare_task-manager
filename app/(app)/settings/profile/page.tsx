import { auth } from "@/auth";
import { ProfileSettingsForm } from "@/features/settings/components/profile-settings-form";
import { getDb } from "@/lib/db/server";
import { getI18n } from "@/lib/i18n/get-i18n";
import { getUserPublicProfile } from "@/lib/services/user-service";
import Link from "next/link";

export default async function SettingsProfilePage() {
  const session = await auth();
  const { t } = await getI18n();
  const userId = session!.user!.id!;
  const profile = await getUserPublicProfile(getDb(), userId, userId);

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium text-zinc-50">
            {t.settings.profileTitle}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {t.settings.profileDescription}
          </p>
        </div>
        <Link
          href={`/profile/${userId}`}
          className="text-sm text-violet-300 hover:underline"
        >
          {t.settings.viewPublic}
        </Link>
      </div>
      <ProfileSettingsForm profile={profile} />
    </section>
  );
}
