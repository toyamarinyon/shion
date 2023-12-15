import { omit, parse } from "valibot";
import { insertUsersSchema, users } from "../../db/schema";
import { Context } from "../_middleware";
import { Env } from "../env";
export const onRequestGet: PagesFunction<Env, string, Context> = async ({
  data,
}) => {
  const user = await data.db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, data.email),
  });
  if (user == null) {
    return new Response("no user found", { status: 404 });
  }
  return new Response(JSON.stringify({ user }), {
    headers: {
      "content-type": "application/json",
    },
  });
};

export const onRequestPost: PagesFunction<Env, string, Context> = async ({
  data,
  request,
}) => {
  const json = await request.json();
  const { username } = parse(omit(insertUsersSchema, ["email"]), json);
  const results = await data.db
    .insert(users)
    .values({ username, email: data.email })
    .returning({ insertedId: users.id });
  return new Response(JSON.stringify(results), {
    headers: {
      contentType: "application/json",
    },
  });
};
