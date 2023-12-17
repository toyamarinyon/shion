import { Outlet, RouteObject } from "react-router-dom";
import { array, parse } from "valibot";
import { selectMessagesSchema, selectSessionSchema } from "../../../db/schema";
import { Conversation } from "./Conversation";
import { Layout } from "./_layout";

export const sessionRoute: RouteObject = {
  path: "/",
  loader: async () => {
    const json = await fetch("/api/sessions").then((res) => res.json());
    return parse(array(selectSessionSchema), json.sessions);
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
        const res = await fetch(`/api/messages?sessionId=${params.sessionId}`);
        const json = await res.json();
        return parse(array(selectMessagesSchema), json.messages);
      },
      element: <Conversation />,
    },
  ],
};
