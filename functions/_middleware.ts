import cloudflareAccessPlugin, {
  PluginData,
} from "@cloudflare/pages-plugin-cloudflare-access";
import { Env } from "./env";

type EmailContext = {
  email: string;
};
export type Context = PluginData & EmailContext;

export const cloudflareAccess: PagesFunction<Env> = (context) => {
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

export const cloudflareAccessEmail: PagesFunction<
  Env,
  string,
  PluginData & EmailContext
> = ({ data, next }) => {
  const email = data.cloudflareAccess?.JWT?.payload?.email;
  if (email == null) {
    throw new Error("No email found");
  }
  data.email = email;
  return next();
};

export const onRequest = [cloudflareAccess, cloudflareAccessEmail];
