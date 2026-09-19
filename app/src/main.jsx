import "./storage-shim.js";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./GothamUnbound.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
