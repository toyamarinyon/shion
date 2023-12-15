import cloudflareAccessPlugin from "@cloudflare/pages-plugin-cloudflare-access";
import { Env } from "./env";

export const onRequest: PagesFunction<Env> = (context) => {
  const url = new URL(context.request.url);
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    context.data.cloudflareAccess = {
      JWT: {
        payload: {
          email: "toyamarinyon@gmail.com",
        },
      },
    };
    return context.next();
  }
  return cloudflareAccessPlugin({
    domain: context.env.ACCESS_DOMAIN,
    aud: context.env.ACCESS_AUD,
  })(context);
};
