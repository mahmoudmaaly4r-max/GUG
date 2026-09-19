import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { performance } from "node:perf_hooks";
import { JSDOM } from "jsdom";
import { IDBFactory } from "fake-indexeddb";
import { build } from "esbuild";
import { localDateKey } from "../app/src/training-log.js";

// In-memory component tests, not a browser or the user's real device storage.
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: "https://gotham.test/", pretendToBeVisual: true });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Node: dom.window.Node, getComputedStyle: dom.window.getComputedStyle.bind(dom.window), indexedDB: new IDBFactory(), IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });
window.indexedDB = globalThis.indexedDB;
window.scrollTo = () => {};
window.confirm = () => true;
globalThis.fetch = async () => ({ ok: false });
const require = createRequire(import.meta.url);
const compiled = await build({ entryPoints: [new URL("../app/src/GothamUnbound.jsx", import.meta.url).pathname], bundle: true, write: false, platform: "node", format: "cjs", packages: "external" });
const componentModule = { exports: {} };
new Function("require", "module", "exports", compiled.outputFiles[0].text)(require, componentModule, componentModule.exports);
const App = componentModule.exports.default;
await import("../app/src/storage-shim.js");
const React = await import("react");
const { render, screen, cleanup, fireEvent, waitFor, configure } = await import("@testing-library/react");
const { default: userEvent } = await import("@testing-library/user-event");
configure({ asyncUtilTimeout: 5000 });
const user = userEvent.setup({ document });
const read = async key => { try { return JSON.parse((await window.storage.get(key)).value); } catch { return null; } };
const write = (key, value) => window.storage.set(key, JSON.stringify(value));
const day = offset => { const value = new Date(); value.setDate(value.getDate() + offset); return localDateKey(value); };
const launch = async () => { render(React.createElement(App)); await screen.findByRole("button", { name: "CHOOSE A WORKOUT" }); };

beforeEach(async () => { cleanup(); const keys = (await window.storage.list()).keys; await Promise.all(keys.map(key => window.storage.delete(key))); });
afterEach(() => cleanup());

test("legacy readiness-only and removed-template logs do not crash Progress", async () => {
  await write("sessions", [{ id: "readiness", dayId: 0, date: new Date().toISOString(), readiness: { sleep: 3, energy: 3, soreness: 3 }, entries: {} }, { id: "old", dayId: 90, date: new Date().toISOString(), entries: {} }]);
  await launch();
  await user.click(screen.getByRole("button", { name: "Progress", exact: true }));
  assert.ok(screen.getByText("Training Calendar"));
  assert.ok(screen.getByText("Readiness check-in"));
  assert.ok(screen.getByText("Workout", { selector: ".nm" }));
  assert.equal(screen.queryByText("Missed"), null);
});

test("manual rest and workout dates are saved, shown in the calendar, and survive remount", async () => {
  await launch();
  await user.click(screen.getByRole("button", { name: "LOG REST DAY" }));
  fireEvent.change(screen.getByLabelText("Log date"), { target: { value: day(-2) } });
  await user.click(screen.getByRole("button", { name: "Save rest day" }));
  await waitFor(() => assert.ok(screen.queryByRole("dialog") === null));
  await user.click(screen.getByRole("button", { name: "CHOOSE A WORKOUT" }));
  fireEvent.change(screen.getByLabelText("Log date"), { target: { value: day(-1) } });
  await user.selectOptions(screen.getByLabelText("Workout", { exact: true }), "2");
  await user.click(screen.getByRole("button", { name: "Log completed workout" }));
  await waitFor(() => assert.ok(screen.queryByRole("dialog") === null));
  const sessions = await read("sessions");
  assert.equal(sessions.length, 2);
  assert.equal(sessions.find(session => session.kind === "rest").localDate, day(-2));
  assert.equal(sessions.find(session => session.kind === "workout").localDate, day(-1));
  assert.equal(sessions.find(session => session.kind === "workout").dayId, 2);
  cleanup(); await launch();
  await user.click(screen.getByRole("button", { name: "Progress", exact: true }));
  assert.ok(screen.getByRole("button", { name: /: Rest day/ }));
  assert.ok(screen.getByRole("button", { name: /Workout logged/ }));
});

test("logging readiness never wipes completed workout sets", async () => {
  const workout = { id: "preserve", dayId: 1, localDate: day(0), date: new Date().toISOString(), entries: { d1e1: { sets: [{ id: "one", type: "T", weight: 100, reps: 8 }] } } };
  await write("sessions", [workout]); await launch();
  await user.click(screen.getByRole("button", { name: "Log readiness" }));
  await user.click(screen.getByRole("button", { name: "SAVE", exact: true }));
  await waitFor(() => assert.ok(screen.queryByRole("dialog") === null));
  const sessions = await read("sessions");
  assert.equal(sessions.length, 1);
  assert.deepEqual(sessions[0].entries, workout.entries);
  assert.equal(sessions[0].readiness.sleep, 3);
});

test("a tracked workout keeps its chosen date, can finish, and retains logged sets", async () => {
  await launch(); await user.click(screen.getByRole("button", { name: "CHOOSE A WORKOUT" }));
  fireEvent.change(screen.getByLabelText("Log date"), { target: { value: day(-1) } });
  await user.click(screen.getByRole("button", { name: "Start tracking sets" }));
  assert.ok(screen.getByText(/Logging for/));
  await user.click(screen.getByRole("button", { name: "Open Bench Press", exact: true }));
  await user.click(screen.getByRole("button", { name: "Increase Weight" }));
  await user.click(screen.getByRole("button", { name: "Increase Reps" }));
  await user.click(screen.getByRole("button", { name: "Working", exact: true }));
  await user.click(screen.getByRole("button", { name: "LOG SET", exact: true }));
  await user.click(screen.getByRole("button", { name: "Back to workout" }));
  await user.click(screen.getByRole("button", { name: "Finish", exact: true }));
  await screen.findByRole("button", { name: "CHOOSE A WORKOUT" });
  const sessions = await read("sessions");
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].localDate, day(-1));
  assert.equal(sessions[0].entries.d1e1.sets.length, 1);
  assert.ok(sessions[0].entries.d1e1.sets[0].weight > 0);
  await waitFor(async () => assert.equal(await read("activeSession"), null));
});

test("starting another session cannot silently overwrite an unfinished workout", async () => {
  await launch(); await user.click(screen.getByRole("button", { name: "CHOOSE A WORKOUT" }));
  await user.click(screen.getByRole("button", { name: "Start tracking sets" }));
  await user.click(screen.getByRole("button", { name: "Program", exact: true }));
  await user.click(screen.getByRole("button", { name: /THE CAVE/ }));
  assert.equal(screen.getByRole("button", { name: "Start tracking sets" }).disabled, true);
  assert.ok(screen.getByRole("button", { name: "Resume saved workout" }));
  assert.equal((await read("activeSession")).dayId, 1);
});

test("future logging is disabled and custom completed workouts are supported", async () => {
  await launch(); await user.click(screen.getByRole("button", { name: "CHOOSE A WORKOUT" }));
  fireEvent.change(screen.getByLabelText("Log date"), { target: { value: day(1) } });
  assert.equal(screen.getByRole("button", { name: "Log completed workout" }).disabled, true);
  fireEvent.change(screen.getByLabelText("Log date"), { target: { value: day(0) } });
  await user.selectOptions(screen.getByLabelText("Workout", { exact: true }), "custom");
  await user.type(screen.getByLabelText("Custom workout name"), "Swimming");
  await user.click(screen.getByRole("button", { name: "Log completed workout" }));
  await waitFor(() => assert.ok(screen.queryByRole("dialog") === null));
  assert.equal((await read("sessions"))[0].workoutName, "Swimming");
});

test("Progress mounts with 10,000 logs and body/strength/volume tabs remain usable", async () => {
  const history = Array.from({ length: 10000 }, (_, index) => ({ id: `old-${index}`, dayId: 1, date: new Date(2025, 0, 1 + index % 365, 12).toISOString(), entries: { d1e1: { sets: [{ type: "T", weight: 100, reps: 8 }] } } }));
  history.push({ id: "check-in", dayId: 0, date: new Date().toISOString(), entries: {}, readiness: { sleep: 3, energy: 3, soreness: 3 } });
  await write("sessions", history); await launch();
  const start = performance.now();
  await user.click(screen.getByRole("button", { name: "Progress", exact: true }));
  assert.ok(screen.getByText("Training Calendar"));
  console.log(`In-memory UI test: opened Progress with 10,000 logs in ${(performance.now() - start).toFixed(0)} ms (includes test-harness overhead).`);
  await user.click(screen.getByRole("button", { name: "Strength", exact: true })); assert.ok(screen.getByText("est. 1RM change"));
  await user.click(screen.getByRole("button", { name: "Volume", exact: true })); assert.ok(screen.getByText("Muscle Workload"));
  await user.click(screen.getByRole("button", { name: "Body", exact: true })); assert.ok(screen.getByText("Body Measurements"));
});

test("a date can switch from workout to rest and back independently of recorded sets", async () => {
  const workout = { id: "old-saturday", dayId: 1, localDate: "2020-06-13", date: "2020-06-13T12:00:00", entries: { d1e1: { sets: [{ id: "set", type: "T", weight: 100, reps: 8 }] } } };
  await write("sessions", [workout]); await launch();
  await user.click(screen.getByRole("button", { name: "Progress", exact: true }));
  fireEvent.change(screen.getByLabelText("Go to date"), { target: { value: "2020-06-13" } });
  await user.click(screen.getByRole("button", { name: "Rest day", exact: true }));
  await waitFor(async () => assert.equal((await read("dayChoices"))["2020-06-13"], "rest"));
  assert.ok(screen.getByRole("button", { name: "Saturday, June 13, 2020: Rest day" }));
  assert.deepEqual((await read("sessions"))[0], workout);
  await user.click(screen.getByRole("button", { name: "Workout day", exact: true }));
  await waitFor(async () => assert.equal((await read("dayChoices"))["2020-06-13"], "workout"));
  assert.ok(screen.getByRole("button", { name: "Saturday, June 13, 2020: Workout logged" }));
  cleanup(); await launch();
  await user.click(screen.getByRole("button", { name: "Program", exact: true }));
  fireEvent.change(screen.getByLabelText("Training date"), { target: { value: "2030-06-15" } });
  await user.click(screen.getByRole("button", { name: "Workout day", exact: true }));
  await waitFor(async () => assert.equal((await read("dayChoices"))["2030-06-15"], "workout"));
  assert.equal((await read("sessions")).length, 1);
});

test("past workouts accept direct sets, can be edited, and leave an active workout intact", async () => {
  const active = { id: "still-training", dayId: 2, date: new Date().toISOString(), entries: { d2e1: { sets: [{ id: "active-set", type: "T", weight: 90, reps: 9 }] } } };
  await launch(); await write("activeSession", active);
  cleanup(); render(React.createElement(App)); await screen.findByRole("button", { name: "CONTINUE WORKOUT" });
  await user.click(screen.getByRole("button", { name: "Add past workout", exact: true }));
  fireEvent.input(screen.getByLabelText("Workout date"), { target: { value: "2020-06-13" } });
  await user.selectOptions(screen.getByLabelText("Workout template"), "1");
  await user.selectOptions(screen.getByLabelText("Exercise to add"), "d1e1");
  await user.click(screen.getByRole("button", { name: "Add exercise", exact: true }));
  await user.type(screen.getByLabelText("Exercise 1 set 1 weight"), "100");
  await user.type(screen.getByLabelText("Exercise 1 set 1 reps"), "8");
  await user.click(screen.getByRole("button", { name: "Save past workout" }));
  await waitFor(() => assert.ok(screen.queryByRole("dialog") === null));
  assert.deepEqual(await read("activeSession"), active);
  assert.equal((await read("sessions"))[0].entries.d1e1.sets[0].weight, 100);
  await user.click(screen.getByRole("button", { name: "Progress", exact: true }));
  fireEvent.change(screen.getByLabelText("Go to date"), { target: { value: "2020-06-13" } });
  await user.click(screen.getByRole("button", { name: "Edit workout", exact: true }));
  fireEvent.change(screen.getByLabelText("Workout date"), { target: { value: "2020-06-14" } });
  fireEvent.change(screen.getByLabelText("Exercise 1 set 1 reps"), { target: { value: "10" } });
  await user.click(screen.getByRole("button", { name: "Save workout changes" }));
  await waitFor(() => assert.ok(screen.queryByRole("dialog") === null));
  const sessions = await read("sessions");
  assert.equal(sessions.length, 1); assert.equal(sessions[0].localDate, "2020-06-14");
  assert.equal(sessions[0].entries.d1e1.sets[0].reps, 10);
  assert.deepEqual(await read("activeSession"), active);
});

test("body progress can be entered years before installation and remains ordered by measurement date", async () => {
  await write("measurements", [{ id: "later", date: "2021-06-01T12:00:00", weight: 180 }]);
  await launch(); await user.click(screen.getByRole("button", { name: "Progress", exact: true }));
  await user.click(screen.getByRole("button", { name: "Body", exact: true }));
  fireEvent.input(screen.getByLabelText("Measurement date"), { target: { value: "2020-06-13" } });
  await user.type(screen.getByLabelText("Weight measurement"), "200");
  await user.click(screen.getByRole("button", { name: "Log Measurements" }));
  await waitFor(async () => assert.equal((await read("measurements")).length, 2));
  const older = (await read("measurements")).find(entry => entry.weight === 200);
  assert.equal(older.localDate, "2020-06-13");
  assert.ok(screen.getByRole("img", { name: /Weight trend: Jun 13, 20: 200 lb, Jun 1, 21: 180 lb/ }));
  assert.ok(screen.getByLabelText("Photo date"));
});
