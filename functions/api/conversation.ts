import { OpenAIStream, StreamingTextResponse } from "ai";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import OpenAI from "openai";
import { match } from "ts-pattern";
import {
  array,
  intersect,
  literal,
  object,
  parse,
  picklist,
  string,
  union,
} from "valibot";
import * as schema from "../../db/schema";
import { Context } from "../_middleware";
import { Env } from "../env";

const openAiJsonSchema = object({
  title: string(),
});

const messagesSchema = array(
  object({
    role: picklist(["user", "assistant"]),
    content: string(),
  }),
);
const bodySchema = union([
  object({
    isNew: literal(true),
    sessionId: string(),
  }),
  object({
    isNew: literal(false),
    sessionId: string(),
  }),
]);

const requestSchema = intersect([
  bodySchema,
  object({ messages: messagesSchema }),
]);

export const createSession = async (
  env: Env,
  sessionId: string,
  userEmail: string,
) => {
  const db = drizzle(env.DB, { schema });
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, userEmail),
  });
  if (user == null) {
    throw new Error(`User not found: ${userEmail}`);
  }
  const results = await db
    .insert(schema.sessions)
    .values({
      id: sessionId,
      userId: user.id,
      title: "",
    })
    .returning({ insertedId: schema.sessions.id });
  return results;
};

type CreateMessageArguments = {
  env: Env;
  messages: schema.InsertMessages;
};
export const createMessages = async ({
  env,
  messages: insertMessages,
}: CreateMessageArguments) => {
  const db = drizzle(env.DB);
  return await db
    .insert(schema.messages)
    .values(parse(schema.insertMessagesSchema, insertMessages))
    .returning({ insertedId: schema.messages.id });
};

export const onRequestPost: PagesFunction<Env, string, Context> = async ({
  request,
  env,
  data,
}) => {
  const resource = env.AZURE_OPENAI_RESOURCE;
  const model = "gpt-35-turbo-16k";
  const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: `https://${resource}.openai.azure.com/openai/deployments/${model}`,
    defaultQuery: { "api-version": "2023-06-01-preview" },
    defaultHeaders: { "api-key": env.OPENAI_API_KEY },
  });
  const body = await request.json();
  const { messages, isNew, sessionId } = parse(requestSchema, body);
  const currentUser = await data.db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, data.email),
  });

  if (currentUser == null) {
    throw new Error(`User not found: ${data.email}`);
  }
  if (isNew) {
    await data.db.insert(schema.sessions).values({
      id: sessionId,
      userId: currentUser.id,
      title: "",
    });
  } else {
    const session = await data.db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.id, sessionId),
    });
    if (session == null) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    if (session.userId !== currentUser.id) {
      throw new Error(`Session not found: ${sessionId}`);
    }
  }
  await createMessages({
    env,
    messages: {
      sessionId,
      role: schema.Role.User,
      content: messages[messages.length - 1].content,
    },
  });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages,
  });
  const stream = OpenAIStream(response, {
    onFinal: async (completion) => {
      await createMessages({
        env,
        messages: {
          sessionId,
          role: schema.Role.Assistant,
          content: completion,
        },
      });
      if (isNew) {
        const messages = await data.db.query.messages.findMany({
          where: (messages, { eq }) => eq(messages.sessionId, sessionId),
        });
        const conversations = messages.map((message) =>
          match(message)
            .with({ role: "assistant" }, () => `AI: ${message.content}\n`)
            .with({ role: "user" }, () => `User: ${message.content}\n`)
            .otherwise(() => ""),
        );
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-1106",
          response_format: { type: "json_object" },

          messages: [
            {
              role: "system",
              content:
                "あなたはコピーライターです。ユーザーが入力した会話に20文字程度の見出しを日本語でつけてJSON形式で出力してください。JSONのkeyは'title'としてください。",
            },
            {
              role: "user",
              content: `これが会話です。
"""
${conversations}
"""
`,
            },
          ],
        });
        const { title } = parse(
          openAiJsonSchema,
          JSON.parse(response.choices[0].message.content ?? "{}"),
        );
        await data.db
          .update(schema.sessions)
          .set({ title })
          .where(eq(schema.sessions.id, sessionId))
          .returning({ updatedId: schema.sessions.id });
      }
    },
  });

  return new StreamingTextResponse(stream);
};
