"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "@/features/task/components/task-card";
import {
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type BoardMember,
  type BoardTask,
  type TaskStatus,
} from "@/features/task/types";

interface SortableTaskCardProps {
  task: BoardTask;
  projectId: string;
  members: BoardMember[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function SortableTaskCard({
  task,
  projectId,
  members,
  onStatusChange,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        projectId={projectId}
        members={members}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        statusSelect={
          <label className="block">
            <span className="sr-only">Change status for {task.title}</span>
            <select
              className="h-7 w-full rounded-md border border-zinc-800 bg-zinc-900 px-2 text-[11px] text-zinc-300 outline-none focus-visible:border-violet-500/50"
              value={task.status}
              onChange={(event) =>
                onStatusChange(task.id, event.target.value as TaskStatus)
              }
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
        }
      />
    </div>
  );
}
