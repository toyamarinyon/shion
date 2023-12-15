import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AccessProvider } from "./contexts/AccessProvider.tsx";
import { AuthProvider } from "./contexts/AuthProvider.tsx";
import "./index.css";
import "./markdown.css";
import { router } from "./router.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AccessProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </AccessProvider>
  </React.StrictMode>,
);
