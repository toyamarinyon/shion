import {
	OpenAIStream,
	StreamingTextResponse,
	experimental_StreamData,
} from "ai";
import { drizzle } from "drizzle-orm/d1";
import OpenAI from "openai";
import { array, object, optional, parse, picklist, string } from "valibot";
import {
	InsertMessages,
	Role,
	insertMessagesSchema,
	messages,
	sessions,
} from "../db/schema";
import { Env } from "./env";

const requestSchema = object({
	sessionId: optional(string()),
	messages: array(
		object({
			role: picklist(["user", "assistant"]),
			content: string(),
		}),
	),
});

export const createSession = async (env: Env) => {
	const results = await drizzle(env.DB)
		.insert(sessions)
		.values({
			title: "",
		})
		.returning({ insertedId: sessions.id });
	return results[0].insertedId;
};

type CreateMessageArguments = {
	env: Env;
	messages: InsertMessages;
};
export const createMessages = async ({
	env,
	messages: insertMessages,
}: CreateMessageArguments) => {
	const db = drizzle(env.DB);
	return await db
		.insert(messages)
		.values(parse(insertMessagesSchema, insertMessages))
		.returning({ insertedId: messages.id });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	const openai = new OpenAI({
		apiKey: env.OPENAI_API_KEY,
	});
	const body = await request.json();
	const { messages, sessionId: requestSessionId } = parse(requestSchema, body);
	const sessionId = requestSessionId ?? (await createSession(env));
	await createMessages({
		env,
		messages: {
			sessionId,
			role: Role.User,
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
					role: Role.Assistant,
					content: completion,
				},
			});
			data.close();
		},
		experimental_streamData: true,
	});

	const data = new experimental_StreamData();
	data.append({ sessionId });
	return new StreamingTextResponse(stream, {}, data);
};
