import { getI18n } from "@/lib/i18n/get-i18n";

export default async function SettingsAboutPage() {
  const { t } = await getI18n();

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-50">{t.settings.aboutTitle}</h2>
      <p className="mt-1 mb-5 text-sm text-zinc-500">
        {t.settings.aboutDescription}
      </p>
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-zinc-500">{t.settings.product}</dt>
          <dd className="mt-1 text-zinc-100">{t.settings.productName}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t.settings.stack}</dt>
          <dd className="mt-1 text-zinc-100">
            Next.js · Auth.js · Drizzle · Cloudflare D1
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">{t.settings.phase}</dt>
          <dd className="mt-1 text-zinc-100">{t.settings.phaseValue}</dd>
        </div>
      </dl>
    </section>
  );
}
