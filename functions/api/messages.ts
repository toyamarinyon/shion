import { drizzle } from "drizzle-orm/d1";
import { parse, string } from "valibot";
import * as schema from "../../db/schema/index.js";
import { Env } from "../env";

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const sessionId = parse(string(), url.searchParams.get("sessionId"));
  const db = drizzle(env.DB, { schema });
  const messages = await db.query.messages.findMany({
    where: (messages, { eq }) => eq(messages.sessionId, sessionId),
  });
  return new Response(JSON.stringify({ messages }), {
    headers: { "Content-Type": "application/json" },
  });
};
