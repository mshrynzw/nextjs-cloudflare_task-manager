import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    username: text("username"),
    email: text("email").notNull(),
    emailVerified: integer("email_verified"),
    image: text("image"),
    jobTitle: text("job_title"),
    bio: text("bio"),
    website: text("website"),
    role: text("role").notNull().default("user"),
    timezone: text("timezone").notNull().default("UTC"),
    language: text("language").notNull().default("en"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_username_unique").on(table.username),
  ],
);
