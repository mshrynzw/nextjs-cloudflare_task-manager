import { auth } from "@/auth";
import { AppearanceForm } from "@/features/settings/components/appearance-form";
import { getDb } from "@/lib/db/server";
import { getI18n } from "@/lib/i18n/get-i18n";
import { getSettings } from "@/lib/services/user-service";

export default async function SettingsAppearancePage() {
  const session = await auth();
  const [{ locale, t }, settings] = await Promise.all([
    getI18n(),
    getSettings(getDb(), session!.user!.id!),
  ]);

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-50">
        {t.settings.appearanceTitle}
      </h2>
      <p className="mt-1 mb-5 text-sm text-zinc-500">
        {t.settings.appearanceDescription}
      </p>
      <AppearanceForm settings={{ ...settings, language: locale }} />
    </section>
  );
}
