import type { PluginData } from "@cloudflare/pages-plugin-cloudflare-access";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../db/schema";
import { Env } from "../env";
export const onRequestGet: PagesFunction<Env, string, PluginData> = async ({
	env,
	data,
}) => {
	const db = drizzle(env.DB, { schema });
	const user = await db.query.users.findFirst({
		where: (users, { eq }) =>
			eq(users.email, data.cloudflareAccess.JWT.payload.email ?? "noemail"),
	});
	if (user == null) {
		return new Response("no user found", { status: 404 });
	}
	return new Response(JSON.stringify(user), {
		headers: {
			"content-type": "application/json",
		},
	});
};
