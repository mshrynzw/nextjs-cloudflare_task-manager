"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";
import { Search } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "planning", label: "Planning" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
] as const;

const PRIORITY_OPTIONS = [
  { value: "", label: "All priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

const SORT_OPTIONS = [
  { value: "updatedAt", label: "Recently updated" },
  { value: "deadline", label: "Deadline" },
  { value: "name", label: "Name" },
] as const;

const selectClassName =
  "h-9 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 text-sm text-zinc-200 outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/30";

export function ProjectToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        <span className="sr-only">Search projects</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500"
          aria-hidden
        />
        <input
          type="search"
          name="search"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Search projects…"
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
          aria-label="Filter by status"
          className={selectClassName}
          defaultValue={searchParams.get("status") ?? ""}
          onChange={(event) => updateParams({ status: event.target.value })}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by priority"
          className={selectClassName}
          defaultValue={searchParams.get("priority") ?? ""}
          onChange={(event) => updateParams({ priority: event.target.value })}
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort projects"
          className={selectClassName}
          defaultValue={searchParams.get("sort") ?? "updatedAt"}
          onChange={(event) => updateParams({ sort: event.target.value })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
