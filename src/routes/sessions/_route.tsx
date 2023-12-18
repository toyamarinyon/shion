import { Outlet, RouteObject } from "react-router-dom";
import { array, merge, object, parse } from "valibot";
import { selectMessagesSchema, selectSessionSchema } from "../../../db/schema";
import { Conversation } from "./Conversation";
import { Layout } from "./_layout";

const rootLoaderSchema = array(selectSessionSchema);
export const sessionLoaderSchema = object({
  session: merge([
    selectSessionSchema,
    object({ messages: array(selectMessagesSchema) }),
  ]),
});

export const sessionRoute: RouteObject = {
  path: "/",
  loader: async () => {
    const json = await fetch("/api/sessions").then((res) => res.json());
    return parse(rootLoaderSchema, json.sessions);
  },
  element: (
    <Layout>
      <Outlet />
    </Layout>
  ),
  children: [
    {
      element: <Conversation />,
      index: true,
    },
    {
      path: "/sessions/:sessionId",
      loader: async ({ params }) => {
        const json = await fetch(`/api/sessions/${params.sessionId}`).then(
          (res) => res.json(),
        );
        return parse(sessionLoaderSchema, json);
      },
      element: <Conversation />,
    },
  ],
};
