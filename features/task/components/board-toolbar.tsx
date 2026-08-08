"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";
import { Search } from "lucide-react";

const PRIORITY_OPTIONS = [
  { value: "", label: "All priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

export function BoardToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div
      className={`mb-4 flex flex-col gap-3 sm:flex-row sm:items-center ${isPending ? "opacity-70" : ""}`}
    >
      <label className="relative block min-w-0 flex-1">
        <span className="sr-only">Search tasks</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500"
          aria-hidden
        />
        <input
          type="search"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Search tasks…"
          className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 pr-3 pl-10 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/30"
          onChange={(event) => {
            const value = event.target.value;
            if (timerRef.current) {
              clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(() => {
              updateParams({ search: value.trim() });
            }, 300);
          }}
        />
      </label>
      <select
        aria-label="Filter by priority"
        className="h-10 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-200 outline-none focus-visible:border-violet-500/50"
        defaultValue={searchParams.get("priority") ?? ""}
        onChange={(event) => updateParams({ priority: event.target.value })}
      >
        {PRIORITY_OPTIONS.map((option) => (
          <option key={option.value || "all"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
