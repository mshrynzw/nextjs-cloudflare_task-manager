import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { NotificationsList } from "@/features/notification/components/notifications-list";
import { getDb } from "@/lib/db/server";
import { getI18n } from "@/lib/i18n/get-i18n";
import { getNotifications } from "@/lib/services/user-service";

export default async function NotificationsPage() {
  const session = await auth();
  const { t } = await getI18n();
  const notifications = await getNotifications(getDb(), session!.user!.id!);

  return (
    <>
      <AppHeader
        title={t.notifications.title}
        description={t.notifications.description}
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      />
      <main className="flex-1 px-4 py-6 sm:px-6">
        <NotificationsList notifications={notifications} />
      </main>
    </>
  );
}
