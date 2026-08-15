"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";
import { Search } from "lucide-react";
import { useI18n } from "@/components/providers/locale-provider";

const selectClassName =
  "h-9 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 text-sm text-zinc-200 outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/30";

export function ProjectToolbar() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const statusOptions = [
    { value: "", label: t.projects.allStatuses },
    { value: "active", label: t.status.active },
    { value: "planning", label: t.status.planning },
    { value: "on_hold", label: t.status.on_hold },
    { value: "completed", label: t.status.completed },
    { value: "archived", label: t.status.archived },
  ] as const;

  const priorityOptions = [
    { value: "", label: t.projects.allPriorities },
    { value: "high", label: t.priority.high },
    { value: "medium", label: t.priority.medium },
    { value: "low", label: t.priority.low },
  ] as const;

  const sortOptions = [
    { value: "updatedAt", label: t.projects.sortUpdated },
    { value: "deadline", label: t.projects.sortDeadline },
    { value: "name", label: t.projects.sortName },
  ] as const;

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div
      className={`flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between ${isPending ? "opacity-70" : ""}`}
    >
      <label className="relative block min-w-0 flex-1">
        <span className="sr-only">{t.projects.search}</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500"
          aria-hidden
        />
        <input
          type="search"
          name="search"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder={t.projects.searchPlaceholder}
          className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 pr-3 pl-10 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/30"
          onChange={(event) => {
            const value = event.target.value;
            if (searchTimerRef.current) {
              clearTimeout(searchTimerRef.current);
            }
            searchTimerRef.current = setTimeout(() => {
              updateParams({ search: value.trim() });
            }, 300);
          }}
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label={t.projects.filterStatus}
          className={selectClassName}
          defaultValue={searchParams.get("status") ?? ""}
          onChange={(event) => updateParams({ status: event.target.value })}
        >
          {statusOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label={t.projects.filterPriority}
          className={selectClassName}
          defaultValue={searchParams.get("priority") ?? ""}
          onChange={(event) => updateParams({ priority: event.target.value })}
        >
          {priorityOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label={t.projects.sort}
          className={selectClassName}
          defaultValue={searchParams.get("sort") ?? "updatedAt"}
          onChange={(event) => updateParams({ sort: event.target.value })}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
