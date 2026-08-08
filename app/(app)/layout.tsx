import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { AppearanceProvider } from "@/components/providers/appearance-provider";
import { ToastProvider } from "@/components/feedback/toast";
import { getDb } from "@/lib/db/server";
import { getSettings } from "@/lib/services/user-service";
import {
  DEFAULT_APPEARANCE,
  type AppearanceSettings,
} from "@/lib/ui/appearance";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let appearance: AppearanceSettings = DEFAULT_APPEARANCE;
  try {
    const settings = await getSettings(getDb(), session.user.id);
    appearance = {
      theme: settings.theme,
      accentColor: settings.accentColor,
      density: settings.density,
      animations: settings.animations,
    };
  } catch {
    appearance = DEFAULT_APPEARANCE;
  }

  return (
    <AppearanceProvider settings={appearance}>
      <ToastProvider>
        <div className="relative flex min-h-screen text-[color:var(--text-primary)]">
          <div
            aria-hidden
            className="app-ambient pointer-events-none absolute inset-0"
          />
          <div className="relative z-10 flex min-h-screen w-full">
            <AppSidebar />
            <div className="page-enter flex min-w-0 flex-1 flex-col">
              {children}
            </div>
          </div>
          <CommandPalette />
        </div>
      </ToastProvider>
    </AppearanceProvider>
  );
}
