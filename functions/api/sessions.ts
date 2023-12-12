import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../db/schema/index.js";
import { Env } from "../env.js";

export const onRequest: PagesFunction<Env> = async ({ env }) => {
	const db = drizzle(env.DB, { schema });
	const sessions = await db.query.sessions.findMany();
	return new Response(JSON.stringify({ sessions }), {
		headers: { "Content-Type": "application/json" },
	});
};
