import { Context } from "../_middleware";
import { Env } from "../env";

export const onRequestGet: PagesFunction<Env, string, Context> = async ({
  data,
}) => {
  return new Response(JSON.stringify({ email: data.email }), {
    headers: {
      "content-type": "application/json",
    },
  });
};
