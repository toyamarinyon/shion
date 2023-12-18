import { eq } from "drizzle-orm";
import { json } from "react-router-dom";
import { parse, string } from "valibot";
import { sessions, updateSessionSchema } from "../../../db/schema";
import { Context } from "../../_middleware";
import { Env } from "../../env";

export const onRequestGet: PagesFunction<Env, string, Context> = async ({
  params,
  data,
}) => {
  const currentUser = await data.db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, data.email),
  });
  if (currentUser == null) {
    throw new Error(`User not found: ${data.email}`);
  }

  const sessionId = parse(string(), params.id);
  const session = await data.db.query.sessions.findFirst({
    where: (sessions, { eq }) => eq(sessions.id, sessionId),
    with: {
      messages: true,
      author: true,
    },
  });
  return json({
    session: { ...session, myOwnSession: session?.userId === currentUser.id },
  });
};

export const onRequestPut: PagesFunction<Env, string, Context> = async ({
  params,
  data,
  request,
}) => {
  const unsafeJson = await request.json();
  const payload = parse(updateSessionSchema, unsafeJson);
  const sessionId = parse(string(), params.id);
  await data.db
    .update(sessions)
    .set(payload)
    .where(eq(sessions.id, sessionId))
    .returning({
      updatedId: sessions.id,
    });
  const session = await data.db.query.sessions.findFirst({
    where: (sessions, { eq }) => eq(sessions.id, sessionId),
    with: {
      messages: true,
      author: true,
    },
  });
  return json({ session });
};
