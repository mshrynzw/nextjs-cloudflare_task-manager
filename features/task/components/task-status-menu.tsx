"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type TaskStatus,
} from "@/features/task/types";
import { cn } from "@/lib/utils";

interface TaskStatusMenuProps {
  taskId: string;
  taskTitle: string;
  status: TaskStatus;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function TaskStatusMenu({
  taskId,
  taskTitle,
  status,
  onStatusChange,
}: TaskStatusMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-7 w-full items-center justify-between gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-2 text-[11px] text-zinc-300 outline-none focus-visible:border-[color:var(--accent-ring)]",
        )}
        aria-label={`Change status for ${taskTitle}`}
      >
        <span>{TASK_STATUS_LABELS[status]}</span>
        <ChevronDown className="size-3.5 opacity-60" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44" align="start">
        <DropdownMenuLabel>Move to</DropdownMenuLabel>
        {TASK_STATUSES.map((nextStatus) => (
          <DropdownMenuItem
            key={nextStatus}
            onClick={() => onStatusChange(taskId, nextStatus)}
            className={cn(
              nextStatus === status && "text-[color:var(--accent-1)]",
            )}
          >
            {TASK_STATUS_LABELS[nextStatus]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
