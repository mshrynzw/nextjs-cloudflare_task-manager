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
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

export function BoardToolbar() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const priority = searchParams.get("priority") ?? "";

  const priorityOptions = [
    { value: "", label: t.projects.allPriorities },
    { value: "high", label: t.priority.high },
    { value: "medium", label: t.priority.medium },
    { value: "low", label: t.priority.low },
  ] as const;

  const priorityLabel =
    priorityOptions.find((option) => option.value === priority)?.label ??
    t.projects.allPriorities;

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
        <span className="sr-only">{t.board.search}</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500"
          aria-hidden
        />
        <Input
          type="search"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder={t.board.searchPlaceholder}
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
          aria-label={t.board.filterPriority}
        >
          {priorityLabel}
          <ChevronDown className="size-4 opacity-60" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {priorityOptions.map((option) => (
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
