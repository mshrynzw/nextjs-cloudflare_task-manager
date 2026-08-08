"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAV_ITEMS } from "@/components/layout/nav-items";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)]/70 px-3 py-5 backdrop-blur md:flex">
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <span
          aria-hidden
          className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[color:var(--accent-1)] to-[color:var(--accent-2)] text-xs font-bold text-white"
        >
          V
        </span>
        <span className="text-sm font-semibold tracking-tight text-[color:var(--text-primary)]">
          Vantage
        </span>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
        {APP_NAV_ITEMS.filter((item) => item.href !== "/profile").map(
          (item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-[color:var(--accent-soft)] text-[color:var(--text-primary)]"
                    : "text-[color:var(--text-secondary)] hover:bg-white/5 hover:text-[color:var(--text-primary)]",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive ? (
                  <span
                    aria-hidden
                    className="absolute -left-3 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-[color:var(--accent-1)] to-[color:var(--accent-2)]"
                  />
                ) : null}
                <Icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          },
        )}
      </nav>
    </aside>
  );
}
