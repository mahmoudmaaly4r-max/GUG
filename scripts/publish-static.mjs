import { cp, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, "dist");
const entries = await readdir(output, { withFileTypes: true });
if (!entries.some(entry => entry.name === "index.html")) {
  throw new Error("Production build is missing dist/index.html");
}

// This folder contains only generated Vite bundles. Source lives in app/.
await rm(join(root, "assets"), { recursive: true, force: true });
for (const entry of entries) {
  await cp(join(output, entry.name), join(root, entry.name), { recursive: true });
}
console.log("Published production files to the repository root for GitHub Pages.");
