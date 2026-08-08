"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/appearance", label: "Appearance" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/account", label: "Account" },
  { href: "/settings/workspace", label: "Workspace" },
  { href: "/settings/about", label: "About" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings"
      className="flex gap-1 overflow-x-auto pb-2 lg:w-48 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0"
    >
      {SECTIONS.map((section) => {
        const isActive = pathname === section.href;
        return (
          <Link
            key={section.href}
            href={section.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors",
              isActive
                ? "bg-violet-500/15 text-violet-200"
                : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
