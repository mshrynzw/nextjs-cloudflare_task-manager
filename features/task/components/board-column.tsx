"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTaskCard } from "@/features/task/components/sortable-task-card";
import {
  TASK_STATUS_LABELS,
  type BoardMember,
  type BoardTask,
  type TaskStatus,
} from "@/features/task/types";
import { cn } from "@/lib/utils";

interface BoardColumnProps {
  status: TaskStatus;
  tasks: BoardTask[];
  projectId: string;
  members: BoardMember[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function BoardColumn({
  status,
  tasks,
  projectId,
  members,
  onStatusChange,
  onAddTask,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", status },
  });

  return (
    <section
      className={cn(
        "flex w-full flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/40 md:w-72 md:shrink-0",
        isOver && "border-[color:var(--accent-ring)] bg-[color:var(--accent-soft)]",
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b border-zinc-800/80 px-3 py-3">
        <div>
          <h2 className="text-sm font-medium text-zinc-100">
            {TASK_STATUS_LABELS[status]}
          </h2>
          <p className="text-xs text-zinc-500 tabular-nums">{tasks.length}</p>
        </div>
        <button
          type="button"
          onClick={() => onAddTask(status)}
          className="rounded-lg px-2 py-1 text-xs text-violet-300 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]"
          aria-label={`Add task to ${TASK_STATUS_LABELS[status]}`}
        >
          Add
        </button>
      </header>

      <div
        ref={setNodeRef}
        className="flex min-h-40 flex-1 flex-col gap-2 overflow-y-auto p-2"
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-800 px-3 py-6 text-center text-xs text-zinc-600">
              Drop tasks here
            </p>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                projectId={projectId}
                members={members}
                onStatusChange={onStatusChange}
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  );
}
