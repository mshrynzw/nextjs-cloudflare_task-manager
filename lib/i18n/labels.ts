import type { Dictionary } from "@/lib/i18n/ja";

export function projectStatusLabel(t: Dictionary, status: string): string {
  if (status in t.status) {
    return t.status[status as keyof Dictionary["status"]];
  }
  return status;
}

export function projectPriorityLabel(t: Dictionary, priority: string): string {
  if (priority in t.priority) {
    return t.priority[priority as keyof Dictionary["priority"]];
  }
  return priority;
}

export function taskStatusLabel(t: Dictionary, status: string): string {
  if (status in t.taskStatus) {
    return t.taskStatus[status as keyof Dictionary["taskStatus"]];
  }
  return status;
}

export function taskPriorityLabel(t: Dictionary, priority: string): string {
  if (priority in t.priority) {
    return t.priority[priority as keyof Dictionary["priority"]];
  }
  return priority;
}

export function roleLabel(t: Dictionary, role: string): string {
  if (role in t.role) {
    return t.role[role as keyof Dictionary["role"]];
  }
  return role;
}

export function activityLabel(t: Dictionary, action: string): string {
  if (action in t.activity) {
    return t.activity[action as keyof Dictionary["activity"]];
  }
  return action;
}
