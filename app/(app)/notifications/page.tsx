import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { NotificationsList } from "@/features/notification/components/notifications-list";
import { getDb } from "@/lib/db/server";
import { getNotifications } from "@/lib/services/user-service";

export default async function NotificationsPage() {
  const session = await auth();
  const notifications = await getNotifications(getDb(), session!.user!.id!);

  return (
    <>
      <AppHeader
        title="Notifications"
        description="Assignment and activity alerts."
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      />
      <main className="flex-1 px-4 py-6 sm:px-6">
        <NotificationsList notifications={notifications} />
      </main>
    </>
  );
}
