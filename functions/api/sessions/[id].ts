import { json } from "react-router-dom";
import { parse, string } from "valibot";
import { Context } from "../../_middleware";
import { Env } from "../../env";

export const onRequestGet: PagesFunction<Env, string, Context> = async ({
  params,
  data,
}) => {
  const sessionId = parse(string(), params.id);
  const session = await data.db.query.sessions.findFirst({
    where: (sessions, { eq }) => eq(sessions.id, sessionId),
    with: {
      messages: true,
    },
  });
  return json({ session });
};
