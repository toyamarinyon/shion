import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import OpenAI from "openai";
import { match } from "ts-pattern";
import { object, parse, string } from "valibot";
import * as schema from "../../db/schema";
import { sessions } from "../../db/schema";
import { Env } from "../env";

const requestSchema = object({
	sessionId: string(),
});
const openAiJsonSchema = object({
	title: string(),
});
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
	const openai = new OpenAI({
		apiKey: env.OPENAI_API_KEY,
	});
	const body = await request.json();
	const { sessionId } = parse(requestSchema, body);
	const db = drizzle(env.DB, { schema });
	const messages = await db.query.messages.findMany({
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
	const results = await db
		.update(sessions)
		.set({ summary: title })
		.where(eq(sessions.id, sessionId))
		.returning({ updatedId: sessions.id });
	return new Response(JSON.stringify(results), {
		headers: { "Content-Type": "application/json" },
	});
};
