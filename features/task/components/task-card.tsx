import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  formatDueDate,
  TASK_PRIORITY_LABELS,
  type BoardMember,
  type BoardTask,
  type TaskPriority,
} from "@/features/task/types";
import { getInitials } from "@/features/project/utils/labels";

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-zinc-500/15 text-zinc-300",
  medium: "bg-blue-500/15 text-blue-300",
  high: "bg-rose-500/15 text-rose-300",
};

interface TaskCardProps {
  task: BoardTask;
  projectId: string;
  members: BoardMember[];
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  style?: React.CSSProperties;
  statusSelect?: React.ReactNode;
}

export function TaskCard({
  task,
  projectId,
  members,
  dragHandleProps,
  isDragging,
  style,
  statusSelect,
}: TaskCardProps) {
  const priority = (
    task.priority in PRIORITY_STYLES ? task.priority : "medium"
  ) as TaskPriority;
  const assignee = members.find((member) => member.id === task.assigneeId);
  const due = formatDueDate(task.dueDate);

  return (
    <article
      style={style}
      className={cn(
        "rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3 shadow-sm transition",
        isDragging && "border-violet-400/50 shadow-lg shadow-violet-950/40",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-sm font-medium text-zinc-100">
          <Link
            href={`/projects/${projectId}/tasks/${task.id}`}
            className="hover:underline focus-visible:underline"
          >
            {task.title}
          </Link>
        </h3>
        {dragHandleProps ? (
          <button
            type="button"
            className="shrink-0 rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
            aria-label={`Drag ${task.title}`}
            {...dragHandleProps}
          >
            ⋮⋮
          </button>
        ) : null}
      </div>

      {task.description ? (
        <p className="mb-2 line-clamp-2 text-xs text-zinc-500">
          {task.description}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
            PRIORITY_STYLES[priority],
          )}
        >
          {TASK_PRIORITY_LABELS[priority]}
        </span>
        {due ? (
          <span className="text-[10px] tabular-nums text-zinc-500">
            Due {due}
          </span>
        ) : null}
        {assignee ? (
          <span
            title={assignee.name ?? "Assignee"}
            className="ml-auto flex size-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-200"
          >
            {getInitials(assignee.name)}
          </span>
        ) : null}
      </div>

      {statusSelect ? <div className="mt-2">{statusSelect}</div> : null}
    </article>
  );
}
