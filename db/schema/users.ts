import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	email: text("email").notNull(),
	username: text("username").notNull(),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
