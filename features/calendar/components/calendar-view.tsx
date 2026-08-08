"use client";

import Link from "next/link";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  priority: string;
  status: string;
  projectId: string;
  projectName: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  initialDate?: string;
}

type ViewMode = "month" | "week";

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-rose-400",
  medium: "bg-blue-400",
  low: "bg-zinc-400",
};

export function CalendarView({ events, initialDate }: CalendarViewProps) {
  const [cursor, setCursor] = useState(
    () => (initialDate ? new Date(initialDate) : new Date()),
  );
  const [view, setView] = useState<ViewMode>("month");
  const [selected, setSelected] = useState<Date>(
    () => (initialDate ? new Date(initialDate) : new Date()),
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = event.start.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const days = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(selected, { weekStartsOn: 1 });
      const end = endOfWeek(selected, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor, selected, view]);

  const selectedKey = format(selected, "yyyy-MM-dd");
  const agenda = eventsByDay.get(selectedKey) ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (view === "month") {
                  setCursor((value) => subMonths(value, 1));
                } else {
                  setSelected((value) => addDays(value, -7));
                }
              }}
            >
              Prev
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                setCursor(today);
                setSelected(today);
              }}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (view === "month") {
                  setCursor((value) => addMonths(value, 1));
                } else {
                  setSelected((value) => addDays(value, 7));
                }
              }}
            >
              Next
            </Button>
          </div>
          <h2 className="text-sm font-medium text-zinc-100">
            {view === "month"
              ? format(cursor, "MMMM yyyy")
              : `Week of ${format(startOfWeek(selected, { weekStartsOn: 1 }), "MMM d")}`}
          </h2>
          <div className="flex gap-1 rounded-lg border border-zinc-800 p-1">
            {(["month", "week"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs capitalize",
                  view === mode
                    ? "bg-violet-500/20 text-violet-200"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] text-zinc-500">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDay.get(key) ?? [];
            const inMonth = view === "week" || isSameMonth(day, cursor);
            const isSelected = isSameDay(day, selected);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelected(day);
                  if (view === "month") {
                    setCursor(day);
                  }
                }}
                className={cn(
                  "min-h-20 rounded-xl border p-1.5 text-left transition",
                  inMonth
                    ? "border-zinc-800/80 bg-zinc-950/40"
                    : "border-transparent bg-transparent opacity-40",
                  isSelected && "border-violet-500/50 bg-violet-500/10",
                  isToday && !isSelected && "border-zinc-600",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-full text-xs",
                    isToday
                      ? "bg-violet-500 text-white"
                      : "text-zinc-400",
                  )}
                >
                  {format(day, "d")}
                </span>
                <ul className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, view === "week" ? 4 : 2).map((event) => (
                    <li
                      key={event.id}
                      className="truncate rounded px-1 py-0.5 text-[10px] text-zinc-300"
                      title={event.title}
                    >
                      <span
                        className={cn(
                          "mr-1 inline-block size-1.5 rounded-full",
                          PRIORITY_DOT[event.priority] ?? "bg-zinc-500",
                        )}
                      />
                      {event.title}
                    </li>
                  ))}
                  {dayEvents.length > (view === "week" ? 4 : 2) ? (
                    <li className="text-[10px] text-zinc-600">
                      +{dayEvents.length - (view === "week" ? 4 : 2)} more
                    </li>
                  ) : null}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
        <h2 className="mb-1 text-sm font-medium text-zinc-200">Agenda</h2>
        <p className="mb-4 text-xs text-zinc-500">
          {format(selected, "EEEE, MMM d")}
        </p>
        {agenda.length === 0 ? (
          <p className="text-sm text-zinc-500">No tasks due this day.</p>
        ) : (
          <ul className="space-y-3">
            {agenda.map((event) => (
              <li
                key={event.id}
                className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3"
              >
                <Link
                  href={`/projects/${event.projectId}/tasks/${event.id}`}
                  className="text-sm font-medium text-zinc-100 hover:underline"
                >
                  {event.title}
                </Link>
                <p className="mt-1 text-xs text-zinc-500">{event.projectName}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-zinc-600">
                  {event.priority} · {event.status}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 border-t border-zinc-800 pt-4">
          <h3 className="mb-3 text-xs font-medium tracking-wide text-zinc-500 uppercase">
            Upcoming
          </h3>
          <UpcomingList events={events} />
        </div>
      </aside>
    </div>
  );
}

function UpcomingList({ events }: { events: CalendarEvent[] }) {
  const today = format(new Date(), "yyyy-MM-dd");
  const upcoming = events
    .filter((event) => event.start >= today)
    .slice(0, 6);

  if (upcoming.length === 0) {
    return <p className="text-sm text-zinc-500">No upcoming due dates.</p>;
  }

  return (
    <ul className="space-y-2">
      {upcoming.map((event) => (
        <li key={event.id} className="flex items-start justify-between gap-2">
          <Link
            href={`/projects/${event.projectId}/tasks/${event.id}`}
            className="truncate text-sm text-zinc-300 hover:underline"
          >
            {event.title}
          </Link>
          <span className="shrink-0 text-[11px] tabular-nums text-zinc-500">
            {event.start}
          </span>
        </li>
      ))}
    </ul>
  );
}
