export default function SettingsAboutPage() {
  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
      <h2 className="text-lg font-medium text-zinc-50">About</h2>
      <p className="mt-1 mb-5 text-sm text-zinc-500">
        Application information.
      </p>
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-zinc-500">Product</dt>
          <dd className="mt-1 text-zinc-100">Vantage Task Manager</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Stack</dt>
          <dd className="mt-1 text-zinc-100">
            Next.js · Auth.js · Drizzle · Cloudflare D1
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Phase</dt>
          <dd className="mt-1 text-zinc-100">Settings / Profile (Phase 8)</dd>
        </div>
      </dl>
    </section>
  );
}
