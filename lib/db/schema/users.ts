import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

function unixNow(): number {
  return Math.floor(Date.now() / 1000);
}

export const users = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    username: text("username"),
    email: text("email").notNull(),
    emailVerified: integer("email_verified", { mode: "timestamp_ms" }),
    image: text("image"),
    passwordHash: text("password_hash"),
    jobTitle: text("job_title"),
    bio: text("bio"),
    website: text("website"),
    role: text("role").notNull().default("user"),
    timezone: text("timezone").notNull().default("UTC"),
    language: text("language").notNull().default("en"),
    createdAt: integer("created_at").notNull().$defaultFn(unixNow),
    updatedAt: integer("updated_at").notNull().$defaultFn(unixNow),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_username_unique").on(table.username),
  ],
);
