import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const updateScriptHash = createHash("sha256").update(readFileSync(new URL("./app/public/release-update.js", import.meta.url))).digest("hex").slice(0, 12);

// base: "./" (relative) so the built app works no matter where it's hosted —
// domain root or a GitHub Pages project subpath.
export default defineConfig({
  root: "app",
  build: { outDir: "../dist", emptyOutDir: true },
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon-32.png", "apple-touch-icon.png", "icon.svg"],
      manifest: {
        name: "Gotham Unbound",
        short_name: "Gotham Unbound",
        description: "Discipline builds freedom — a Batman-themed strength & physique tracker.",
        start_url: ".",
        scope: ".",
        display: "standalone",
        background_color: "#0a0b0e",
        theme_color: "#0a0b0e",
        orientation: "portrait",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        importScripts: [`./release-update.js?v=${updateScriptHash}`],
        // Fetch the current HTML on launch; keep the precached index as an
        // offline fallback. Avoid serving an old index for every navigation.
        directoryIndex: null,
        ignoreURLParametersMatching: [],
        navigateFallback: null,
        // Never cache ExerciseDB API/media responses in the service worker — always hit the network for those.
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "gotham-pages",
              networkTimeoutSeconds: 4,
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 4 },
              precacheFallback: { fallbackURL: "index.html" },
            },
          },
          {
            urlPattern: /^https:\/\/(oss\.exercisedb\.dev|static\.exercisedb\.dev)\//,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
});
