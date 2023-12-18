import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import { partial, pick } from "valibot";
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

export const insertSessionSchema = createInsertSchema(sessions);
export const updateSessionSchema = partial(
  pick(insertSessionSchema, ["title", "visibility"]),
);
export const selectSessionSchema = createSelectSchema(sessions);
export type Session = typeof sessions.$inferSelect;

export const sessionsRelations = relations(sessions, ({ many, one }) => ({
  messages: many(messages),
  author: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
