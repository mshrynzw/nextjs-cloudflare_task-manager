"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
}> = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings, disabled: true },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950/70 px-3 py-5 backdrop-blur md:flex">
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <span
          aria-hidden
          className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-indigo-600 text-xs font-bold text-white"
        >
          V
        </span>
        <span className="text-sm font-semibold tracking-tight text-zinc-50">
          Vantage
        </span>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.disabled) {
            return (
              <span
                key={item.href}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-zinc-600"
                title="Coming soon"
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                isActive
                  ? "bg-violet-500/15 text-violet-200"
                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
