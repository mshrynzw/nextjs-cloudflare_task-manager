import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  theme: text("theme").notNull().default("dark"),
  accentColor: text("accent_color").notNull().default("violet"),
  density: text("density").notNull().default("comfortable"),
  animations: integer("animations").notNull().default(1),
  emailNotifications: integer("email_notifications").notNull().default(1),
  inAppNotifications: integer("in_app_notifications").notNull().default(1),
  taskNotifications: integer("task_notifications").notNull().default(1),
  mentionNotifications: integer("mention_notifications").notNull().default(1),
  dueSoonNotifications: integer("due_soon_notifications").notNull().default(1),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
