"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { APP_NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

const ACTIONS = [
  ...APP_NAV_ITEMS.map((item) => ({
    href: item.href,
    label: `Go to ${item.label}`,
  })),
  { href: "/projects", label: "Create project" },
  { href: "/settings/appearance", label: "Appearance settings" },
] as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const titleId = useId();

  function close() {
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isMod = event.metaKey || event.ctrlKey;
      if (isMod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        setQuery("");
      }
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return ACTIONS;
    }
    return ACTIONS.filter((action) => action.label.toLowerCase().includes(q));
  }, [query]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close command palette"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-in-fade absolute left-1/2 top-[18%] w-[min(100%-2rem,28rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)] shadow-[var(--shadow-pop)]"
      >
        <h2 id={titleId} className="sr-only">
          Command palette
        </h2>
        <div className="flex items-center gap-2 border-b border-[color:var(--border-subtle)] px-3">
          <Search className="size-4 text-zinc-500" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jump to…"
            className="h-11 w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
            aria-label="Search commands"
          />
          <kbd className="hidden rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-500 sm:inline">
            Esc
          </kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-zinc-500">
              No matches
            </li>
          ) : (
            filtered.map((action) => (
              <li key={`${action.href}-${action.label}`}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent-1)]",
                  )}
                  onClick={() => {
                    close();
                    router.push(action.href);
                  }}
                >
                  {action.label}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
