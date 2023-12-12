import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { array, parse } from "valibot";
import { selectMessagesSchema } from "../db/schema";
import App from "./App.tsx";
import "./index.css";
import "./markdown.css";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
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
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
);
