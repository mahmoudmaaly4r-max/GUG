import test from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { localDateKey, validLogDate, sessionDateKey, sessionKind, sessionTitle, makeTrainingEntry, indexTrainingLog, upsertDailyLog, withDailyReadiness, sessionDuration, updateDayChoice, makeCompletedWorkout, datedTimestamp } from "../app/src/training-log.js";

const program = {
  1: { name: "THE ARMOR", focus: "Chest + Triceps", exercises: [{ id: "bench", name: "Bench press" }] },
  2: { name: "THE CAVE", focus: "Back + Biceps", exercises: [] },
  6: { name: "RECOVERY", rest: true }, 7: { name: "RECOVERY", rest: true },
};
const now = new Date(2026, 8, 20, 12);
const make = overrides => makeTrainingEntry({ date: "2026-09-19", kind: "workout", dayId: 1, id: "workout", now, program, ...overrides });

test("any template can be logged on Saturday and rest can be logged on Monday", () => {
  const workout = make({});
  const rest = make({ date: "2026-09-14", kind: "rest", id: "rest" });
  const index = indexTrainingLog([workout, rest], program);
  assert.equal(index.get("2026-09-19").status, "done");
  assert.equal(index.get("2026-09-14").status, "rest");
  assert.equal(index.has("2026-09-15"), false, "unlogged days must never be called missed or rest");
  assert.equal(workout.dayId, 1);
});

test("backdated workouts retain their intended local calendar date", () => {
  const entry = make({ date: "2026-03-08" });
  assert.equal(entry.localDate, "2026-03-08");
  assert.equal(sessionDateKey({ ...entry, date: "2026-03-09T01:00:00Z" }), "2026-03-08");
  assert.equal(localDateKey(new Date(entry.date)), "2026-03-08");
});

test("invalid, empty, impossible and future dates are rejected", () => {
  for (const date of ["", "bad", "2026-02-30", "2025-02-29", "2026-13-01"]) assert.equal(validLogDate(date), false);
  assert.equal(validLogDate("2024-02-29"), true);
  assert.throws(() => make({ date: "2026-09-21" }), /today or an earlier date/);
  assert.equal(sessionDateKey({}), "");
  assert.equal(indexTrainingLog([{ id: "broken", date: "invalid" }]).size, 0);
});

test("legacy readiness-only and unknown-template records render safely", () => {
  const readiness = { id: "readiness", dayId: 0, date: "2026-09-19T12:00:00", readiness: { sleep: 3 }, entries: {} };
  const unknown = { id: "old-workout", dayId: 91, localDate: "2026-09-18", date: "2026-09-18T12:00:00", entries: {} };
  assert.equal(sessionKind(readiness, program), "check-in");
  assert.equal(sessionTitle(readiness, program), "Readiness check-in");
  assert.equal(sessionTitle(unknown, program), "Workout");
  assert.equal(indexTrainingLog([readiness], program).get("2026-09-19").workouts, 0);
  assert.equal(indexTrainingLog([unknown], program).get("2026-09-18").workouts, 1);
  for (const dayId of [6, 7]) assert.equal(sessionKind({ dayId }, {}), "rest");
});

test("logging rest twice updates its marker without deleting a workout", () => {
  const workout = make({});
  const rest = make({ kind: "rest", id: "rest-1" });
  const next = upsertDailyLog([workout, rest], make({ kind: "rest", id: "rest-2", notes: "Recovery" }), program);
  assert.equal(next.length, 2);
  assert.equal(next.find(entry => entry.kind === "rest").id, "rest-1");
  assert.equal(next.find(entry => entry.kind === "rest").notes, "Recovery");
  assert.deepEqual(next.find(entry => entry.id === workout.id), workout);
  assert.equal(indexTrainingLog(next, program).get("2026-09-19").status, "done");
});

test("readiness updates preserve every workout, date, and set", () => {
  const today = localDateKey();
  const first = make({ date: today, now: new Date(), id: "first" });
  first.entries = { bench: { sets: [{ weight: 100, reps: 8 }] } };
  const second = { ...first, id: "second", dayId: 2 };
  const changed = withDailyReadiness([first, second], today, { sleep: 4, energy: 4, soreness: 2 }, "check-in", program);
  assert.equal(changed.length, 2);
  assert.deepEqual(changed[0].entries, first.entries);
  assert.deepEqual(changed[1], second);
  assert.equal(changed[0].readiness.energy, 4);
  assert.equal(first.readiness, null, "original data is not mutated");
  const fresh = withDailyReadiness([], today, { sleep: 3 }, "new", program);
  assert.equal(sessionKind(fresh[0]), "check-in");
});

test("active sessions are distinct from completed workouts and not double-counted", () => {
  const entry = make({});
  const bucket = indexTrainingLog([entry], program, entry).get(entry.localDate);
  assert.equal(bucket.records.length, 1);
  assert.equal(bucket.workouts, 0);
  assert.equal(bucket.inProgress, true);
  assert.equal(bucket.status, "active-log");
  assert.equal(entry.inProgress, undefined);
});

test("custom workout completion and template snapshots survive later program edits", () => {
  const custom = make({ dayId: "custom", name: " Swimming " });
  assert.equal(sessionTitle(custom, {}), "Swimming");
  assert.equal(sessionKind(custom, {}), "workout");
  assert.throws(() => make({ dayId: "custom", name: " " }), /workout name/);
  const original = make({});
  assert.equal(sessionTitle(original, { 1: { name: "Changed" } }), "THE ARMOR");
  const conditioning = [{ label: "Recovery walk", seconds: 60 }];
  const full = make({ program: { 1: { ...program[1], finisher: "Walk", conditioning } } });
  assert.equal(full.template.finisher, "Walk");
  assert.deepEqual(full.template.conditioning, conditioning);
});

test("duration uses timestamp bounds and tolerates incomplete logs", () => {
  const entry = { entries: { bench: { sets: [{ ts: "2026-09-19T12:30:00Z" }, { ts: "invalid" }, { ts: "2026-09-19T12:00:00Z" }] } } };
  assert.equal(sessionDuration(entry), 30);
  assert.equal(sessionDuration({ entries: {} }), null);
});

test("large histories are indexed once for constant-time calendar lookups", () => {
  const history = Array.from({ length: 10000 }, (_, index) => ({ id: String(index), kind: "workout", dayId: 1, localDate: localDateKey(new Date(2025, 0, 1 + index % 365)), date: "2025-01-01T12:00:00Z", entries: {} }));
  const started = performance.now();
  const index = indexTrainingLog(history, program);
  const elapsed = performance.now() - started;
  assert.equal(index.size, 365);
  assert.equal([...index.values()].reduce((sum, day) => sum + day.workouts, 0), 10000);
  console.log(`Indexed 10,000 logs in ${elapsed.toFixed(1)} ms; month cells use Map lookups.`);
});

test("explicit rest overrides a workout marker without erasing any completed sets", () => {
  const workout = { ...make({}), entries: { bench: { sets: [{ weight: 100, reps: 8 }] } } };
  let choices = updateDayChoice({}, workout.localDate, "rest");
  let day = indexTrainingLog([workout], program, null, choices).get(workout.localDate);
  assert.equal(day.dayType, "rest"); assert.equal(day.status, "rest");
  assert.deepEqual(day.records[0], workout); assert.equal(day.workouts, 1);
  choices = updateDayChoice(choices, workout.localDate, "workout");
  day = indexTrainingLog([workout], program, null, choices).get(workout.localDate);
  assert.equal(day.status, "done");
  choices = updateDayChoice(choices, workout.localDate, "unset");
  assert.equal(indexTrainingLog([workout], program, null, choices).get(workout.localDate).dayType, null);
});

test("future day choices do not fabricate completed workouts", () => {
  const choices = updateDayChoice({}, "2030-06-15", "workout");
  const day = indexTrainingLog([], program, null, choices).get("2030-06-15");
  assert.equal(day.status, "workout-day"); assert.equal(day.workouts, 0); assert.deepEqual(day.records, []);
  assert.throws(() => updateDayChoice({}, "bad-date", "rest"), /valid date/);
});

test("historical sets retain actual dates, units, exercise IDs and readiness when edited", () => {
  const exercises = [{ id: "bench", name: "Bench Press", primary: "Chest", loggedSets: [{ type: "T", weight: "100", reps: "8" }] }];
  const entry = makeCompletedWorkout({ date: "2020-06-13", name: "Old workout", id: "old", exercises, units: "metric", program, now });
  assert.equal(entry.localDate, "2020-06-13"); assert.equal(localDateKey(entry.date), "2020-06-13");
  assert.equal(entry.entries.bench.sets[0].weight, 220.462); assert.equal(entry.entries.bench.sets[0].reps, 8);
  assert.equal(entry.manualLog, false); assert.equal(entry.template.exercises[0].id, "bench");
  const existing = { ...entry, readiness: { sleep: 4, energy: 3, soreness: 2 } };
  const edited = makeCompletedWorkout({ date: "2020-06-14", name: "Corrected workout", existing, exercises, units: "metric", id: "ignored", program, now });
  assert.equal(edited.id, "old"); assert.equal(edited.localDate, "2020-06-14"); assert.deepEqual(edited.readiness, existing.readiness);
  assert.throws(() => makeCompletedWorkout({ date: "2020-06-13", name: "Old", exercises: [{ ...exercises[0], loggedSets: [{ reps: "", weight: "100" }] }], now }), /valid reps/);
  assert.throws(() => makeCompletedWorkout({ date: "2030-01-01", name: "Old", exercises, now }), /today or an earlier date/);
  assert.equal(localDateKey(datedTimestamp("2019-02-01", now)), "2019-02-01");
});

test("repeated custom exercise names share a history key and timed sets stay timed", () => {
  const makeOld = id => makeCompletedWorkout({ date: "2020-06-13", name: "Core", id, exercises: [{ id, custom: true, name: "Hollow Hold", timeBased: true, loggedSets: [{ seconds: "45", type: "T" }] }], now });
  const first = makeOld("one"), second = makeOld("two");
  assert.deepEqual(Object.keys(first.entries), Object.keys(second.entries));
  assert.equal(Object.values(first.entries)[0].sets[0].seconds, 45);
});
