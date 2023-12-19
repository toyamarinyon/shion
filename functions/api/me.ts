import { json } from "react-router-dom";
import { omit, parse, picklist } from "valibot";
import { insertUsersSchema, users } from "../../db/schema";
import { Context } from "../_middleware";
import { Env } from "../env";
import { getErrorMessage } from "../helper";
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

const createUserError = {
  userNameAlreadyExists: "user/username-already-exists",
} as const;

picklist(Object.values(createUserError));
export const onRequestPost: PagesFunction<Env, string, Context> = async ({
  data,
  request,
}) => {
  const unsafeJson = await request.json();
  const { username } = parse(omit(insertUsersSchema, ["email"]), unsafeJson);
  try {
    const results = await data.db
      .insert(users)
      .values({ username, email: data.email })
      .returning({ insertedId: users.id });
    return new Response(JSON.stringify(results), {
      headers: {
        contentType: "application/json",
      },
    });
  } catch (e) {
    if (new RegExp("UNIQUE constraint failed").test(getErrorMessage(e))) {
      return json(
        { errors: [{ code: createUserError.userNameAlreadyExists }] },
        400,
      );
    }
    return json({ errors: [{ code: "unexpected error" }] }, 500);
  }
};
