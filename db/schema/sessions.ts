import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export enum Role {
	System = "system",
	User = "user",
}
type Message = {
	role: Role;
	content: string;
};
export const sessions = sqliteTable("sessions", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	summary: text("summary").notNull(),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	memory: text("memory", { mode: "json" })
		.notNull()
		.$type<{ messages: Message[] }>(),
});
