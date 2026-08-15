import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { workspaces } from "./workspaces";
import { tags } from "./tags";

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").notNull(),
    status: text("status").notNull(),
    priority: text("priority").notNull(),
    startDate: integer("start_date"),
    deadline: integer("deadline"),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    visibility: text("visibility").notNull().default("workspace"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    archivedAt: integer("archived_at"),
  },
  (table) => [
    index("projects_workspace_id_idx").on(table.workspaceId),
    index("projects_status_idx").on(table.status),
    index("projects_deadline_idx").on(table.deadline),
    index("projects_updated_at_idx").on(table.updatedAt),
  ],
);

export const projectMembers = sqliteTable(
  "project_members",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    role: text("role").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("project_members_project_user_unique").on(
      table.projectId,
      table.userId,
    ),
    index("project_members_project_id_idx").on(table.projectId),
    index("project_members_user_id_idx").on(table.userId),
  ],
);

export const projectTags = sqliteTable(
  "project_tags",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.tagId] })],
);
