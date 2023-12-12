import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { PaperAirplaneIcon, PlusIcon } from "@heroicons/react/24/solid";
import { createId } from "@paralleldrive/cuid2";
import { useChat } from "ai/react";
import clsx from "clsx";
import { marked } from "marked";
import { FormEvent, useCallback, useMemo } from "react";
import { Link, useLoaderData, useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { match } from "ts-pattern";
import { array, optional, parse } from "valibot";
import { selectMessagesSchema, selectSessionSchema } from "../db/schema";

const fetcher = (url: string) =>
	fetch(url)
		.then((res) => res.json())
		.then((data) => parse(array(selectSessionSchema), data.sessions));

const useSession = () => {
	const { sessionId: sessionIdInParam } = useParams<{ sessionId: string }>();
	const { sessionId, isNew } = useMemo(() => {
		return {
			sessionId: sessionIdInParam ?? createId(),
			isNew: sessionIdInParam == null,
		};
	}, [sessionIdInParam]);
	return { sessionId, isNew };
};
type Conversation = {
	id: string;
	request: string;
	response: string;
};
function App() {
	const { data: sessionData, mutate } = useSWR("/api/sessions", fetcher);
	const { sessionId, isNew } = useSession();
	const loaderData = useLoaderData();
	const navigate = useNavigate();
	const { messages, input, append, setInput, handleInputChange } = useChat({
		id: sessionId,
		api: "/api/conversation",
		body: {
			isNew,
			sessionId,
		},
		onResponse: () => {
			mutate();
		},
		onFinish: () => {
			mutate();
		},
		initialMessages: parse(
			optional(array(selectMessagesSchema)),
			loaderData,
		)?.map(({ id, role, content }) => ({
			id,
			role,
			content,
		})),
	});

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
					lastRequestId = "";
					lastRequestContent = "";
				});
		}
		if (lastRequestId != "") {
			tmp.push({
				id: `${lastRequestId}-last`,
				request: lastRequestContent,
				response: "",
			});
		}
		return tmp;
	}, [messages]);
	const handleSubmit = useCallback(
		(e: FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			if (input === "") {
				return;
			}
			append({
				role: "user",
				content: input,
			});
			setInput("");
			navigate(`/sessions/${sessionId}`);
		},
		[input, setInput, append, sessionId, navigate],
	);
	return (
		<div className="flex h-screen bg-[#F6F3EE] overflow-hidden text-[#595959]">
			<aside className="w-1/4 p-4">
				<header>
					<h1 className="text-4xl pl-2 shion">Shion</h1>
				</header>
				<nav className="mt-4 space-y-8">
					<Link
						to="/"
						className=" hover:text-gray-900 px-4 py-2 hover:bg-[#FDF8F5] rounded-[30px] flex items-center space-x-2"
						aria-current="page"
					>
						<PlusIcon className="w-4 h-4" />
						<span>New session</span>
					</Link>
					<section className="space-y-2">
						<h2 className="text-sm pl-4">Recent</h2>
						<ul className="space-y-4">
							{sessionData?.map(({ id, title }) => (
								<li key={id}>
									<Link
										to={`/sessions/${id}`}
										className={clsx(
											" pl-4 pr-6 py-2 rounded-[30px] flex items-center space-x-3 text-sm",
											id === sessionId && "bg-[#fbe6d2]",
											id !== sessionId && "hover:bg-[#FDF8F5]",
										)}
									>
										<div
											className={clsx(
												" rounded-lg p-1",
												id === sessionId && "bg-[#F6F3EE]",
												id !== sessionId && "bg-[#FDF8F5]",
											)}
										>
											<ChatBubbleLeftEllipsisIcon className="w-5 h-5 shrink-0" />
										</div>
										<span className=" truncate text-ellipsis">{title}</span>
									</Link>
								</li>
							))}
						</ul>
					</section>
				</nav>
			</aside>
			<main className="p-4 w-full">
				<div className="bg-gray-50 flex flex-col p-4 rounded-[30px] h-full">
					<section className="h-full overflow-y-scroll">
						{conversations.length === 0 && (
							<article className="p-4 ">
								<header className="text-2xl font-bold">
									Welcome! I'm Shion
								</header>
								<p>
									Your friendly AI companion. Let's chat and explore new
									possibilities together.
								</p>
							</article>
						)}

						{conversations.map(({ id, request, response }) => (
							<article className="p-4  space-y-4 text-lg" key={id}>
								<p>{request}</p>
								<div
									className="bg-white rounded-[30px] p-8 markdown"
									dangerouslySetInnerHTML={{
										__html: marked(response) as string,
									}}
								></div>
							</article>
						))}
					</section>
					<section className="mt-auto">
						<form onSubmit={handleSubmit}>
							<div className="flex space-x-2 justify-center">
								<div className="bg-white px-8 py-4 flex items-center rounded-[30px] border-[#BDBDBD] border hover:border-[#757575] w-2/3 transition-[height]">
									<textarea
										className="outline-none w-full resize-none text-lg"
										rows={input.split("\n").length}
										onChange={handleInputChange}
										value={input}
									/>
									<button
										type="submit"
										className={clsx(input.length === 0 ? "text-gray-300" : "")}
									>
										<PaperAirplaneIcon className="w-6 h-6" />
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
