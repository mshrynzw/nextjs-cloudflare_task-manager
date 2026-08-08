import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const projectStatusSchema = z.enum([
  "planning",
  "active",
  "on_hold",
  "completed",
  "archived",
]);

export const projectPrioritySchema = z.enum(["low", "medium", "high"]);

export const taskStatusSchema = z.enum([
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
]);

export const taskPrioritySchema = z.enum(["low", "medium", "high"]);

export const membershipRoleSchema = z.enum(["owner", "member", "viewer"]);

export function parseSearchParams<T extends z.ZodType>(
  schema: T,
  searchParams: URLSearchParams,
): z.infer<T> {
  const raw = Object.fromEntries(searchParams.entries());
  return schema.parse(raw);
}

export function toUnixDate(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return Math.floor(date.getTime() / 1000);
}

export function fromUnixDate(value: number | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  return new Date(value * 1000).toISOString().slice(0, 10);
}
