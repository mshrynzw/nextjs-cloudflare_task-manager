"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";
import { ChevronDown, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  const priority = searchParams.get("priority") ?? "";
  const priorityLabel =
    PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ??
    "All priorities";

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
        <Input
          type="search"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Search tasks…"
          className="h-10 rounded-xl border-zinc-800 bg-zinc-950/60 pr-3 pl-10"
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
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "inline-flex h-10 items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 text-sm text-zinc-200 outline-none focus-visible:border-[color:var(--accent-ring)]",
          )}
          aria-label="Filter by priority"
        >
          {priorityLabel}
          <ChevronDown className="size-4 opacity-60" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {PRIORITY_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value || "all"}
              onClick={() => updateParams({ priority: option.value })}
              className={cn(
                option.value === priority && "text-[color:var(--accent-1)]",
              )}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
