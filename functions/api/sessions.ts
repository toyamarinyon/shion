import { PluginData } from "@cloudflare/pages-plugin-cloudflare-access";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../db/schema/index.js";
import { Env } from "../env.js";

export const onRequest: PagesFunction<Env, string, PluginData> = async ({
  env,
  data,
}) => {
  const db = drizzle(env.DB, { schema });
  const user = await db.query.users.findFirst({
    where: (users, { eq }) =>
      eq(users.email, data.cloudflareAccess.JWT.payload.email ?? "noemail"),
  });
  if (user == null) {
    return new Response("No user found", { status: 500 });
  }
  const sessions = await db.query.sessions.findMany({
    where: (sessions, { eq }) => eq(sessions.userId, user?.id ?? "nouser"),
    orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
  });
  return new Response(JSON.stringify({ sessions }), {
    headers: { "Content-Type": "application/json" },
  });
};
