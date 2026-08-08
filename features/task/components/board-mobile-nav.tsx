"use client";

import {
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type TaskStatus,
} from "@/features/task/types";
import { cn, focusRingClass } from "@/lib/utils";

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
      onKeyDown={(event) => {
        const currentIndex = TASK_STATUSES.indexOf(activeStatus);
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          const next =
            TASK_STATUSES[(currentIndex + 1) % TASK_STATUSES.length];
          if (next) {
            onSelect(next);
          }
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          const prev =
            TASK_STATUSES[
              (currentIndex - 1 + TASK_STATUSES.length) % TASK_STATUSES.length
            ];
          if (prev) {
            onSelect(prev);
          }
        }
      }}
    >
      {TASK_STATUSES.map((status) => {
        const isActive = status === activeStatus;
        const tabId = `board-tab-${status}`;
        const panelId = `board-panel-${status}`;
        return (
          <button
            key={status}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(status)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              focusRingClass,
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
