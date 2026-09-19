import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

test("the update worker finishes activation without waiting for navigation", async () => {
  const source = await readFile(new URL("../app/public/release-update.js", import.meta.url), "utf8");
  let activate, lifecycle;
  const navigations = [];
  const clients = [
    { url: "https://example.com/GUG/?update=1.2.0", navigate: url => { navigations.push(url); return new Promise(() => {}); } },
    { url: "https://example.com/GUG/", navigate: url => { navigations.push(url); return Promise.resolve(); } },
  ];
  vm.runInNewContext(source, { URL, self: { addEventListener: (_, callback) => { activate = callback; }, clients: { claim: async () => {}, matchAll: async () => clients } } });
  activate({ waitUntil: promise => { lifecycle = promise; } });
  const completed = await Promise.race([lifecycle.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 100))]);
  assert.equal(completed, true, "a navigation fetch may wait for activation; activation must not wait for navigation");
  assert.deepEqual(navigations, ["https://example.com/GUG/?v=1.2.0"]);
});
