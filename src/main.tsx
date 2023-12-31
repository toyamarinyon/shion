import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AccessProvider } from "./contexts/AccessProvider.tsx";
import { AuthProvider } from "./contexts/AuthProvider.tsx";
import "./index.css";
import "./markdown.css";
import { routes } from "./routes/Routes.tsx";

const router = createBrowserRouter(routes);
// biome-ignore lint/style/noNonNullAssertion: ignore
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AccessProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </AccessProvider>
    <Toaster />
  </React.StrictMode>,
);
