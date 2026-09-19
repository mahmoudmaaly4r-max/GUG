import "./storage-shim.js";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./GothamUnbound.jsx";
import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true,
  // Offer a reload after an update without interrupting an unsaved form.
  onNeedReload: () => window.dispatchEvent(new Event("app-update-ready")),
  onRegisteredSW: (_url, registration) => {
    const check = () => { if (navigator.onLine) registration?.update().catch(() => {}); };
    check();
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") check(); });
  },
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
