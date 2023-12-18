import { createId } from "@paralleldrive/cuid2";
import { Outlet, RouteObject } from "react-router-dom";
import { match } from "ts-pattern";
import { Input, array, merge, object, parse } from "valibot";
import {
  selectMessagesSchema,
  selectSessionSchema,
  updateSessionSchema,
} from "../../../db/schema";
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
    console.log({ json, step: "layout" });
    return parse(rootLoaderSchema, json.sessions);
  },
  element: (
    <Layout>
      <Outlet />
    </Layout>
  ),
  children: [
    {
      index: true,
      loader: () => {
        const newSession: Input<typeof sessionLoaderSchema> = {
          session: {
            id: createId(),
            title: "",
            messages: [],
            visibility: "private",
            userId: "current_user",
            createdAt: new Date().toISOString(),
          },
        };
        return newSession;
      },
      element: <Conversation />,
    },
    {
      path: "/sessions/:sessionId",
      action: async ({ request, params }) => {
        return match(request.method)
          .with("PUT", async () => {
            const formData = await request.formData();
            const jsonObject = Object.fromEntries(formData.entries());
            parse(updateSessionSchema, jsonObject);
            const json = await fetch(`/api/sessions/${params.sessionId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(parse(updateSessionSchema, jsonObject)),
            }).then((res) => res.json());
            return parse(sessionLoaderSchema, json);
          })
          .otherwise(() => null);
      },
      loader: async ({ params }) => {
        const json = await fetch(`/api/sessions/${params.sessionId}`).then(
          (res) => res.json(),
        );
        console.log({ json, step: "session" });
        return parse(sessionLoaderSchema, json);
      },
      element: <Conversation />,
    },
  ],
};
