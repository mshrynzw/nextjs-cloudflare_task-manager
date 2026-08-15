import { auth } from "@/auth";
import { NotificationSettingsForm } from "@/features/settings/components/notification-settings-form";
import { getDb } from "@/lib/db/server";
import { getI18n } from "@/lib/i18n/get-i18n";
import { getSettings } from "@/lib/services/user-service";

export default async function SettingsNotificationsPage() {
  const session = await auth();
  const { t } = await getI18n();
  const settings = await getSettings(getDb(), session!.user!.id!);

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-50">
        {t.settings.notificationsTitle}
      </h2>
      <p className="mt-1 mb-5 text-sm text-zinc-500">
        {t.settings.notificationsDescription}
      </p>
      <NotificationSettingsForm settings={settings} />
    </section>
  );
}
