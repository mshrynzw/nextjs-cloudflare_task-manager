"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "@/features/task/components/task-card";
import { TaskStatusMenu } from "@/features/task/components/task-status-menu";
import {
  type BoardMember,
  type BoardTask,
  type TaskStatus,
} from "@/features/task/types";

interface SortableTaskCardProps {
  task: BoardTask;
  projectId: string;
  members: BoardMember[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  canEdit?: boolean;
}

export function SortableTaskCard({
  task,
  projectId,
  members,
  onStatusChange,
  canEdit = true,
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
    disabled: !canEdit,
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
        dragHandleProps={canEdit ? { ...attributes, ...listeners } : undefined}
        statusSelect={
          canEdit ? (
            <TaskStatusMenu
              taskId={task.id}
              taskTitle={task.title}
              status={task.status as TaskStatus}
              onStatusChange={onStatusChange}
            />
          ) : null
        }
      />
    </div>
  );
}
