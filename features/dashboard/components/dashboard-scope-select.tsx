"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/components/providers/locale-provider";
import type { DashboardListScope } from "@/lib/services/dashboard-service";

interface DashboardScopeSelectProps {
  param: "progressScope" | "activityScope";
  value: DashboardListScope;
}

export function DashboardScopeSelect({
  param,
  value,
}: DashboardScopeSelectProps) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      aria-label={
        param === "progressScope"
          ? t.dashboard.progressScopeLabel
          : t.dashboard.activityScopeLabel
      }
      value={value}
      disabled={isPending}
      className="h-8 w-auto min-w-[7.5rem] shrink-0 px-2.5 text-xs"
      onChange={(event) => {
        const next = event.target.value === "all" ? "all" : "mine";
        const params = new URLSearchParams(searchParams.toString());
        if (next === "mine") {
          params.delete(param);
        } else {
          params.set(param, next);
        }
        const query = params.toString();
        startTransition(() => {
          router.push(query ? `${pathname}?${query}` : pathname);
        });
      }}
    >
      <option value="mine">{t.dashboard.scopeMine}</option>
      <option value="all">{t.dashboard.scopeAll}</option>
    </Select>
  );
}
