import { drizzle } from "drizzle-orm/d1";
import { Role, sessions } from "../db/schema/sessions.js";
import { Env } from "./env";

export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
	const db = drizzle(env.DB);
	const result = await db
		.insert(sessions)
		.values({
			summary: "",
			memory: {
				messages: [
					{
						role: Role.User,
						content: "Hello, world!",
					},
				],
			},
		})
		.returning({ insertedId: sessions.id });
	return new Response(JSON.stringify(result), {
		headers: { "content-type": "application/json" },
	});
};
