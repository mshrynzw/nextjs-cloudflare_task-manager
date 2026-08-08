export type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "archived";

export type ProjectPriority = "low" | "medium" | "high";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  archived: "Archived",
};

export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function formatProjectDeadline(
  deadline: string | null | undefined,
): string | null {
  if (!deadline) {
    return null;
  }
  return deadline.slice(0, 10);
}

export function isDeadlineOverdue(
  deadline: string | null | undefined,
  now = new Date(),
): boolean {
  if (!deadline) {
    return false;
  }
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) {
    return "?";
  }
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}
