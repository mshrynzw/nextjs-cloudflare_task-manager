import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { SettingsNav } from "@/features/settings/components/settings-nav";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      <AppHeader
        title="Settings"
        description="Manage your account and preferences."
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      />
      <main className="flex flex-1 flex-col gap-6 px-4 py-6 lg:flex-row sm:px-6">
        <SettingsNav />
        <div className="min-w-0 flex-1">{children}</div>
      </main>
    </>
  );
}
