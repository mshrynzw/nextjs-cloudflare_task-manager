import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { CalendarView } from "@/features/calendar/components/calendar-view";
import { getDb } from "@/lib/db/server";
import { getCalendarEvents } from "@/lib/services/calendar-service";

interface CalendarPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const session = await auth();
  const raw = await searchParams;
  const monthParam = firstValue(raw.month);
  const anchor = monthParam ? new Date(`${monthParam}-01`) : new Date();
  const rangeStart = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
  const rangeEnd = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });

  const events = await getCalendarEvents(getDb(), session!.user!.id!, {
    start: format(rangeStart, "yyyy-MM-dd"),
    end: format(rangeEnd, "yyyy-MM-dd"),
  });

  return (
    <>
      <AppHeader
        title="Calendar"
        description="Due dates across your projects."
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      />
      <main className="flex-1 px-4 py-6 sm:px-6">
        <CalendarView
          key={format(anchor, "yyyy-MM")}
          events={events}
          initialDate={format(anchor, "yyyy-MM-dd")}
        />
      </main>
    </>
  );
}
