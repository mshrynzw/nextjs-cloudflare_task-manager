"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/locale-provider";
import { projectPriorityLabel, projectStatusLabel } from "@/lib/i18n/labels";
import type {
  ProjectPriority,
  ProjectStatus,
} from "@/features/project/utils/labels";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  planning: "bg-sky-500/15 text-sky-300",
  active: "bg-emerald-500/15 text-emerald-300",
  on_hold: "bg-amber-500/15 text-amber-300",
  completed: "bg-violet-500/15 text-violet-300",
  archived: "bg-zinc-500/15 text-zinc-400",
};

const PRIORITY_STYLES: Record<ProjectPriority, string> = {
  low: "bg-zinc-500/15 text-zinc-300",
  medium: "bg-blue-500/15 text-blue-300",
  high: "bg-rose-500/15 text-rose-300",
};

export function ProjectStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const key = (status in STATUS_STYLES ? status : "planning") as ProjectStatus;
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium",
        STATUS_STYLES[key],
      )}
    >
      {projectStatusLabel(t, key)}
    </span>
  );
}

export function ProjectPriorityBadge({ priority }: { priority: string }) {
  const { t } = useI18n();
  const key = (
    priority in PRIORITY_STYLES ? priority : "medium"
  ) as ProjectPriority;
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium",
        PRIORITY_STYLES[key],
      )}
    >
      {projectPriorityLabel(t, key)}
    </span>
  );
}

export function ProjectVisibilityBadge({ visibility }: { visibility: string }) {
  const { t } = useI18n();
  if (visibility !== "members") {
    return null;
  }
  return (
    <span className="inline-flex rounded-md bg-zinc-500/15 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
      {t.projects.visibilityPrivate}
    </span>
  );
}
