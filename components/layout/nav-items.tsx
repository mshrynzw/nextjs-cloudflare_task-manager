import {
  BarChart3,
  Bell,
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  Settings,
  UserRound,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n/ja";

export const APP_NAV_ITEMS = [
  { href: "/dashboard", labelKey: "overview", icon: LayoutDashboard },
  { href: "/projects", labelKey: "projects", icon: FolderKanban },
  { href: "/calendar", labelKey: "calendar", icon: CalendarDays },
  { href: "/analytics", labelKey: "analytics", icon: BarChart3 },
  { href: "/notifications", labelKey: "notifications", icon: Bell },
  { href: "/settings", labelKey: "settings", icon: Settings },
  { href: "/profile", labelKey: "profile", icon: UserRound },
] as const;

export type NavLabelKey = (typeof APP_NAV_ITEMS)[number]["labelKey"];

export function navLabel(t: Dictionary, key: NavLabelKey): string {
  return t.nav[key];
}
