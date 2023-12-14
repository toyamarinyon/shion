import { Navigate, createBrowserRouter } from "react-router-dom";
import { array, parse } from "valibot";
import { selectMessagesSchema } from "../db/schema";
import { ConversationPage } from "./components/ConversationPage";
import { SignedIn, SignedOut } from "./components/controlComponents";

export const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<>
				<SignedIn>
					<ConversationPage />
				</SignedIn>
				<SignedOut>
					<Navigate to="/onboarding" />
				</SignedOut>
			</>
		),
	},
	{
		path: "/sessions/:sessionId",
		loader: async ({ params }) => {
			const res = await fetch(`/api/messages?sessionId=${params.sessionId}`);
			const json = await res.json();
			const messages = parse(array(selectMessagesSchema), json.messages);
			return messages;
		},
		element: <ConversationPage />,
	},
	{
		path: "/onboarding",
		element: <p>onboarding</p>,
	},
]);
