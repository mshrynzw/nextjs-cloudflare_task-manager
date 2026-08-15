"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { href: "/settings/profile", key: "profile" },
  { href: "/settings/appearance", key: "appearance" },
  { href: "/settings/notifications", key: "notifications" },
  { href: "/settings/security", key: "security" },
  { href: "/settings/account", key: "account" },
  { href: "/settings/workspace", key: "workspace" },
  { href: "/settings/about", key: "about" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav
      aria-label={t.settings.title}
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
            {t.settings.nav[section.key]}
          </Link>
        );
      })}
    </nav>
  );
}
