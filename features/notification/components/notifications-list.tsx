"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/locale-provider";
import { intlLocale } from "@/lib/i18n/dates";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/notification/actions";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  entityType: string | null;
  entityId: string | null;
  readAt: number | null;
  createdAt: number;
}

interface NotificationsListProps {
  notifications: NotificationItem[];
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (notifications.length === 0) {
    return (
      <EmptyState
        title={t.notifications.emptyTitle}
        description={t.notifications.emptyDescription}
        icon={<Bell className="size-6" aria-hidden />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={isPending}
          onClick={() => {
            startTransition(async () => {
              await markAllNotificationsReadAction();
              router.refresh();
            });
          }}
        >
          {t.notifications.markAll}
        </Button>
      </div>

      <ul className="divide-y divide-zinc-800/80 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
        {notifications.map((item) => {
          const unread = item.readAt === null;
          return (
            <li
              key={item.id}
              className={cn(
                "flex items-start justify-between gap-3 px-4 py-4",
                unread && "bg-[color:var(--accent-soft)]",
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-100">
                  {item.title}
                  {unread ? (
                    <>
                      <span
                        className="ml-2 inline-block size-1.5 rounded-full bg-[color:var(--accent-1)] align-middle"
                        aria-hidden
                      />
                      <span className="sr-only">{t.notifications.unread}</span>
                    </>
                  ) : null}
                </p>
                {item.body ? (
                  <p className="mt-1 text-sm text-zinc-500">{item.body}</p>
                ) : null}
                <p className="mt-2 text-[11px] tabular-nums text-zinc-600">
                  {new Date(item.createdAt * 1000).toLocaleString(
                    intlLocale(locale),
                  )}{" "}
                  · {item.type}
                </p>
              </div>
              {unread ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      await markNotificationReadAction(item.id);
                      router.refresh();
                    });
                  }}
                >
                  {t.notifications.markRead}
                </Button>
              ) : (
                <span className="shrink-0 text-xs text-zinc-600">
                  {t.notifications.read}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
