"use client";

import {
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type TaskStatus,
} from "@/features/task/types";
import { cn } from "@/lib/utils";

interface BoardColumnTabsProps {
  activeStatus: TaskStatus;
  counts: Record<TaskStatus, number>;
  onSelect: (status: TaskStatus) => void;
}

export function BoardColumnTabs({
  activeStatus,
  counts,
  onSelect,
}: BoardColumnTabsProps) {
  return (
    <div
      className="mb-3 flex gap-2 overflow-x-auto pb-1 md:hidden"
      role="tablist"
      aria-label="Board columns"
    >
      {TASK_STATUSES.map((status) => {
        const isActive = status === activeStatus;
        return (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(status)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "border-[color:var(--accent-ring)] bg-[color:var(--accent-soft)] text-[color:var(--accent-1)]"
                : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200",
            )}
          >
            {TASK_STATUS_LABELS[status]}
            <span className="ml-1.5 tabular-nums text-zinc-500">
              {counts[status]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
