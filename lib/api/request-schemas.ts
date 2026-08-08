import { z } from "zod";
import {
  membershipRoleSchema,
  paginationSchema,
  projectPrioritySchema,
  projectStatusSchema,
  taskPrioritySchema,
  taskStatusSchema,
} from "@/lib/api/schemas";

export const listProjectsQuerySchema = paginationSchema.extend({
  search: z.string().max(200).optional(),
  status: projectStatusSchema.optional(),
  priority: projectPrioritySchema.optional(),
  sort: z.enum(["updatedAt", "deadline", "name"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const createProjectBodySchema = z.object({
  workspaceId: z.string().min(1).optional(),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).nullable().optional(),
  status: projectStatusSchema.default("planning"),
  priority: projectPrioritySchema.default("medium"),
  color: z.string().min(1).max(32).default("#4f7cff"),
  deadline: z.string().optional().nullable(),
});

export const updateProjectBodySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  status: projectStatusSchema.optional(),
  priority: projectPrioritySchema.optional(),
  color: z.string().min(1).max(32).optional(),
  deadline: z.string().nullable().optional(),
});

export const addMemberBodySchema = z.object({
  userId: z.string().min(1),
  role: membershipRoleSchema.default("member"),
});

export const listTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: z.string().optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(["updatedAt", "dueDate", "position", "title"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const createTaskBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

export const updateTaskBodySchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

export const updateTaskStatusBodySchema = z.object({
  status: taskStatusSchema,
});

export const updateTaskPositionBodySchema = z.object({
  status: taskStatusSchema,
  position: z.number(),
});

export const createCommentBodySchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

export const updateCommentBodySchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

export const createChecklistBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export const updateChecklistBodySchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  completed: z.boolean().optional(),
  position: z.number().optional(),
});

export const updateUserBodySchema = z.object({
  name: z.string().trim().max(100).nullable().optional(),
  username: z.string().trim().max(50).nullable().optional(),
  jobTitle: z.string().trim().max(100).nullable().optional(),
  bio: z.string().trim().max(1000).nullable().optional(),
  website: z.string().url().nullable().optional(),
  image: z.string().url().nullable().optional(),
});

export const updateSettingsBodySchema = z.object({
  theme: z.string().optional(),
  accentColor: z.string().optional(),
  density: z.string().optional(),
  animations: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  taskNotifications: z.boolean().optional(),
  mentionNotifications: z.boolean().optional(),
  dueSoonNotifications: z.boolean().optional(),
});
