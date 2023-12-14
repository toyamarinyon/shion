import React from "react";
import ReactDOM from "react-dom/client";
import {
	Navigate,
	RouterProvider,
	createBrowserRouter,
} from "react-router-dom";
import { array, parse } from "valibot";
import { selectMessagesSchema } from "../db/schema";
import App from "./App.tsx";
import { SignedIn, SignedOut } from "./components/controlComponents.tsx";
import { AuthProvider } from "./contexts/AuthProvider.tsx";
import "./index.css";
import "./markdown.css";

const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<>
				<SignedIn>
					<App />
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
		element: <App />,
	},
	{
		path: "/onboarding",
		element: <p>onboarding</p>,
	},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<AuthProvider>
			<RouterProvider router={router} />
		</AuthProvider>
	</React.StrictMode>,
);
