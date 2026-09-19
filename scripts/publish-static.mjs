import { cp, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, process.argv[2] || "dist");
const entries = await readdir(output, { withFileTypes: true });
if (!entries.some(entry => entry.name === "index.html")) {
  throw new Error("Production build is missing dist/index.html");
}

// Keep older hashed bundles available while installed clients update. New HTML
// and the service worker reference only the assets from this build.
for (const entry of entries) {
  await cp(join(output, entry.name), join(root, entry.name), { recursive: true });
}
console.log("Published production files to the repository root for GitHub Pages.");
