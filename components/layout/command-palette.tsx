"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { APP_NAV_ITEMS, navLabel } from "@/components/layout/nav-items";
import { useI18n } from "@/components/providers/locale-provider";
import { interpolate } from "@/lib/i18n/interpolate";
import { trapTabKey } from "@/lib/ui/focus-trap";
import { cn, focusRingClass } from "@/lib/utils";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const titleId = useId();
  const listId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { t } = useI18n();

  const actions = useMemo(
    () => [
      ...APP_NAV_ITEMS.map((item) => ({
        href: item.href,
        label: interpolate(t.command.goTo, { label: navLabel(t, item.labelKey) }),
      })),
      { href: "/projects", label: t.command.createProject },
      { href: "/settings/appearance", label: t.command.appearanceSettings },
    ],
    [t],
  );

  function close() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isMod = event.metaKey || event.ctrlKey;
      if (isMod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => {
          if (!value) {
            previousFocusRef.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }
          return !value;
        });
        setQuery("");
        setActiveIndex(0);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return actions;
    }
    return actions.filter((action) => action.label.toLowerCase().includes(q));
  }, [query, actions]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const dialog = dialogRef.current;
    inputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (dialog) {
        trapTabKey(event, dialog);
      }

      if (filtered.length === 0) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % filtered.length);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex(
          (index) => (index - 1 + filtered.length) % filtered.length,
        );
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const action = filtered[activeIndex];
        if (action) {
          close();
          router.push(action.href);
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, filtered, activeIndex, router]);

  useEffect(() => {
    if (open) {
      return;
    }
    previousFocusRef.current?.focus();
  }, [open]);

  if (!open) {
    return null;
  }

  const activeId =
    filtered[activeIndex] !== undefined
      ? `${listId}-option-${activeIndex}`
      : undefined;

  return (
    <div className="fixed inset-0 z-[70]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label={t.command.close}
        onClick={close}
        tabIndex={-1}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-in-fade absolute left-1/2 top-[18%] w-[min(100%-2rem,28rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)] shadow-[var(--shadow-pop)]"
      >
        <h2 id={titleId} className="sr-only">
          {t.command.title}
        </h2>
        <div className="flex items-center gap-2 border-b border-[color:var(--border-subtle)] px-3">
          <Search className="size-4 text-zinc-500" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder={t.command.placeholder}
            className={cn(
              "h-11 w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500",
              focusRingClass,
            )}
            aria-label={t.command.search}
            aria-controls={listId}
            aria-activedescendant={activeId}
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
          />
          <kbd className="hidden rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-500 sm:inline">
            Esc
          </kbd>
        </div>
        <ul
          id={listId}
          role="listbox"
          className="max-h-72 overflow-y-auto p-2"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-zinc-500">
              {t.command.noMatches}
            </li>
          ) : (
            filtered.map((action, index) => (
              <li
                key={`${action.href}-${action.label}`}
                id={`${listId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    focusRingClass,
                    index === activeIndex
                      ? "bg-[color:var(--accent-soft)] text-[color:var(--accent-1)]"
                      : "text-zinc-200 hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent-1)]",
                  )}
                  onClick={() => {
                    close();
                    router.push(action.href);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
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
