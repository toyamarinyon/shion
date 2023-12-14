import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider.tsx";
import "./index.css";
import "./markdown.css";
import { router } from "./router.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<AuthProvider>
			<RouterProvider router={router} />
		</AuthProvider>
	</React.StrictMode>,
);
