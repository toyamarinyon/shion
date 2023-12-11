import { useChat } from "ai/react";
import { useEffect, useMemo } from "react";
import { Link, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { P, match } from "ts-pattern";
import { array, parse } from "valibot";
import { selectMessagesSchema } from "../db/schema";
// import { useState } from "react";
// import useSWR from "swr";

// const fetcher = (...args: Parameters<typeof fetch>) =>
// 	fetch(...args).then((res) => res.json());
//
type Conversation = {
	id: string;
	request: string;
	response: string;
};
function App() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const loaderData = useLoaderData();
	const navigate = useNavigate();
	const { messages, input, handleSubmit, handleInputChange, data } = useChat({
		api: "/conversation",
		body: {
			sessionId,
		},
		initialMessages: parse(array(selectMessagesSchema), loaderData).map(
			({ id, role, content }) => ({
				id,
				role,
				content,
			}),
		),
	});
	useEffect(() => {
		if (sessionId != null) {
			return;
		}
		const metadata = data?.[0] as Record<string, string>;
		match(metadata)
			.with({ sessionId: P.string }, ({ sessionId }) => {
				navigate(`/sessions/${sessionId}`);
			})
			.otherwise(() => {
				return;
			});
	}, [data, sessionId, navigate]);
	const conversations = useMemo(() => {
		const tmp: Conversation[] = [];
		let lastRequestContent = "";
		let lastRequestId = "";

		for (const message of messages) {
			match(message)
				.with({ role: "user" }, ({ id, content }) => {
					lastRequestContent = content;
					lastRequestId = id;
				})
				.with({ role: "assistant" }, ({ id, content }) => {
					tmp.push({
						id: `${lastRequestId}-${id}`,
						request: lastRequestContent,
						response: content,
					});
				});
		}
		return tmp;
	}, [messages]);
	return (
		<div className="flex h-screen bg-[#f0fdf4] overflow-hidden">
			<aside className="w-1/4 p-4">
				<header>
					<h1 className="text-2xl text-gray-500">Shion</h1>
				</header>
				<Link to="/sessions/o96x0vun6v4vvolhne2w3ipn">Go</Link>
			</aside>
			<main className="p-4 w-full">
				<div className="bg-gray-100 flex flex-col p-4 rounded-lg h-full">
					<section className="h-full overflow-scroll">
						<article className="p-4 text-gray-700">
							<header className="text-2xl font-bold">Welcome! I'm Shion</header>
							<p>
								Your friendly AI companion. Let's chat and explore new
								possibilities together.
							</p>
						</article>

						{conversations.map(({ id, request, response }) => (
							<article className="p-4 text-gray-700 space-y-4 text-lg" key={id}>
								<p>{request}</p>
								<div className="bg-gray-50 rounded-lg p-8">{response}</div>
							</article>
						))}
					</section>
					<section className="mt-auto">
						<form onSubmit={handleSubmit}>
							<div className="flex space-x-2">
								<div className="bg-white px-8 py-4 flex items-center rounded-[30px] w-full">
									<textarea
										className="outline-none w-full resize-none text-lg text-gray-700"
										rows={input.split("\n").length}
										onChange={handleInputChange}
										value={input}
									/>
								</div>
								<div className="flex items-center">
									<button
										type="submit"
										className="bg-[#f0fdf4] px-4 py-4 flex items-center rounded-[30px] border border-gray-200"
									>
										Submit
									</button>
								</div>
							</div>
						</form>
					</section>
				</div>
			</main>
		</div>
	);
}

export default App;
