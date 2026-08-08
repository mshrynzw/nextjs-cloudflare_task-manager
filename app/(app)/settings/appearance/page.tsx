import { auth } from "@/auth";
import { AppearanceForm } from "@/features/settings/components/appearance-form";
import { getDb } from "@/lib/db/server";
import { getSettings } from "@/lib/services/user-service";

export default async function SettingsAppearancePage() {
  const session = await auth();
  const settings = await getSettings(getDb(), session!.user!.id!);

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-50">Appearance</h2>
      <p className="mt-1 mb-5 text-sm text-zinc-500">
        Theme, accent, density, and motion preferences.
      </p>
      <AppearanceForm settings={settings} />
    </section>
  );
}
