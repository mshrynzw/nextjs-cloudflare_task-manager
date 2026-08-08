import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { workspaces } from "./workspaces";
import { projects } from "./projects";
import { tasks } from "./tasks";

export const activities = sqliteTable(
  "activities",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    projectId: text("project_id").references(() => projects.id),
    taskId: text("task_id").references(() => tasks.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    action: text("action").notNull(),
    metadata: text("metadata"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("activities_workspace_id_idx").on(table.workspaceId),
    index("activities_project_id_idx").on(table.projectId),
    index("activities_task_id_idx").on(table.taskId),
    index("activities_user_id_idx").on(table.userId),
    index("activities_created_at_idx").on(table.createdAt),
  ],
);
