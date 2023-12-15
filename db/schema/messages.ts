import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import { Input } from "valibot";
import { sessions } from "./sessions";

export const messages = sqliteTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type SelectMessage = typeof messages.$inferSelect;
export const insertMessagesSchema = createInsertSchema(messages);
export const selectMessagesSchema = createSelectSchema(messages);
export type InsertMessages = Input<typeof insertMessagesSchema>;

export const messageRelations = relations(messages, ({ one }) => ({
  author: one(sessions, {
    fields: [messages.sessionId],
    references: [sessions.id],
  }),
}));
