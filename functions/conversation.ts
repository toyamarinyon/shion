import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import { Env } from "./env";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	const openai = new OpenAI({
		apiKey: env.OPENAI_API_KEY,
	});
	const { messages } = (await request.json()) as {
		messages: OpenAI.ChatCompletionUserMessageParam[];
	};
	const response = await openai.chat.completions.create({
		model: "gpt-3.5-turbo",
		stream: true,
		messages,
	});
	const stream = OpenAIStream(response);

	return new StreamingTextResponse(stream);
};
