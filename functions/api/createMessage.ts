import { drizzle } from "drizzle-orm/d1";
import { parse } from "valibot";
import * as schema from "../../db/schema";
import { Env } from "../env";

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
	const body = await request.json();

	const value = parse(schema.insertMessagesSchema, body);
	const db = drizzle(env.DB, { schema });
	const results = await db
		.insert(schema.messages)
		.values(value)
		.returning({ insertedId: schema.messages.id });

	return new Response(JSON.stringify(results), {
		headers: { "Content-Type": "application/json" },
	});
};
