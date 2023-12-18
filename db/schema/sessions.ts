import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-valibot";
import { messages } from "./messages";
import { users } from "./users";

export enum Role {
  Assistant = "assistant",
  User = "user",
}

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  visibility: text("visibility", { enum: ["private", "public"] })
    .notNull()
    .default("private"),
});

export const selectSessionSchema = createSelectSchema(sessions);

export const sessionsRelations = relations(sessions, ({ many }) => ({
  messages: many(messages),
}));
