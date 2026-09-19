import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// base: "./" (relative) so the built app works no matter where it's hosted —
// domain root, a GitHub Pages project subpath, a Netlify preview URL, or opened locally.
export default defineConfig({
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
        // Never cache ExerciseDB API/media responses in the service worker — always hit the network for those.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(oss\.exercisedb\.dev|static\.exercisedb\.dev)\//,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
});
