export const TASK_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export type TaskPriority = "low" | "medium" | "high";

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export interface BoardTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: string;
  assigneeId: string | null;
  dueDate: string | null;
  position: number;
  updatedAt: number;
}

export interface BoardMember {
  id: string;
  name: string | null;
  image: string | null;
}

export function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(value);
}

export function groupTasksByStatus(
  tasks: BoardTask[],
): Record<TaskStatus, BoardTask[]> {
  const groups: Record<TaskStatus, BoardTask[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  };

  for (const task of tasks) {
    if (isTaskStatus(task.status)) {
      groups[task.status].push(task);
    } else {
      groups.todo.push(task);
    }
  }

  for (const status of TASK_STATUSES) {
    groups[status].sort((a, b) => a.position - b.position);
  }

  return groups;
}

export function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) {
    return null;
  }
  return dueDate.slice(0, 10);
}
