// Calendar dates are independent of program session numbers and weekdays.
export function localDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function validLogDate(key) {
  if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  return localDateKey(new Date(`${key}T12:00:00`)) === key;
}

export function sessionDateKey(session) {
  return validLogDate(session?.localDate) ? session.localDate : session?.date ? localDateKey(session.date) : "";
}

export function sessionKind(session, program = {}) {
  if (["workout", "rest", "check-in"].includes(session?.kind)) return session.kind;
  if (!session || Number(session.dayId) === 0) return "check-in";
  if (program?.[session.dayId]?.rest || [6, 7].includes(Number(session.dayId))) return "rest";
  return "workout";
}

export function sessionTitle(session, program = {}) {
  const kind = sessionKind(session, program);
  if (kind === "rest") return "Rest / recovery";
  if (kind === "check-in") return "Readiness check-in";
  return session.workoutName || session.template?.name || program?.[session.dayId]?.name || "Workout";
}

// One pass per data change; calendar cells never rescan the full history.
export function indexTrainingLog(sessions, program = {}, active = null, choices = {}) {
  const index = new Map();
  const pool = active ? [...sessions.filter(session => session?.id !== active.id), { ...active, inProgress: true }] : sessions;
  for (const session of pool) {
    if (!session) continue;
    const key = sessionDateKey(session);
    if (!key) continue;
    if (!index.has(key)) index.set(key, { records: [], workouts: 0, rest: 0, checkIns: 0, inProgress: false, status: "" });
    const day = index.get(key);
    day.records.push(session);
    const kind = sessionKind(session, program);
    if (session.inProgress) day.inProgress = true;
    else if (kind === "workout") day.workouts++;
    else if (kind === "rest") day.rest++;
    else day.checkIns++;
  }
  for (const [key, choice] of Object.entries(choices)) {
    if (!validLogDate(key) || !["workout", "rest", "unset"].includes(choice)) continue;
    if (!index.has(key)) index.set(key, { records: [], workouts: 0, rest: 0, checkIns: 0, inProgress: false });
    index.get(key).choice = choice;
  }
  for (const day of index.values()) {
    day.dayType = day.choice === "unset" ? null : day.choice || (day.workouts || day.inProgress ? "workout" : day.rest ? "rest" : null);
    day.status = day.dayType === "rest" ? "rest" : day.dayType === "workout" ? (day.inProgress ? "active-log" : day.workouts ? "done" : "workout-day") : day.checkIns ? "check-in" : "";
  }
  return index;
}

export function updateDayChoice(choices, date, kind) {
  if (!validLogDate(date) || !["workout", "rest", "unset"].includes(kind)) throw new Error("Choose a valid date and day type.");
  return { ...choices, [date]: kind };
}

export function datedTimestamp(date, now = new Date()) {
  if (!validLogDate(date) || date > localDateKey(now)) throw new Error("Choose today or an earlier date.");
  return (date === localDateKey(now) ? now : new Date(`${date}T12:00:00`)).toISOString();
}

export function makeTrainingEntry({ date, kind, dayId, name = "", notes = "", id, now = new Date(), program = {} }) {
  if (!validLogDate(date) || date > localDateKey(now)) throw new Error("Choose today or an earlier date.");
  if (!["workout", "rest", "check-in"].includes(kind)) throw new Error("Choose a workout or rest day.");
  const template = kind === "workout" ? program[dayId] : null;
  if (kind === "workout" && !template?.exercises && !name.trim()) throw new Error("Enter a workout name.");
  return {
    id, kind, dayId: kind === "rest" ? 6 : kind === "check-in" ? 0 : dayId,
    localDate: date,
    date: datedTimestamp(date, now),
    workoutName: kind === "workout" ? (name.trim() || template.name) : undefined,
    template: template ? { ...template, exercises: template.exercises.map(exercise => ({ ...exercise })) } : undefined,
    notes: notes.trim(), readiness: null, entries: {},
  };
}

// Historical sets use the date the workout happened; entering them never starts
// a live session or its timers. Existing IDs and readiness survive corrections.
export function makeCompletedWorkout({ date, dayId = "custom", name, notes = "", exercises, units = "imperial", id, existing, now = new Date(), program = {} }) {
  if (!name?.trim()) throw new Error("Enter a workout name.");
  if (!exercises?.length) throw new Error("Add an exercise and the sets you completed.");
  const entry = makeTrainingEntry({ date, kind: "workout", dayId, name, notes, id: existing?.id || id, now, program });
  const entries = {}, definitions = [];
  for (const exercise of exercises) {
    if (!exercise.name?.trim()) throw new Error("Enter a name for every exercise.");
    const exerciseId = exercise.custom ? `custom:${exercise.name.trim().toLowerCase().replace(/\s+/g, " ")}:${exercise.timeBased ? "time" : "reps"}` : exercise.id;
    if (!exercise.loggedSets?.length) throw new Error(`Add a set for ${exercise.name}, or remove the exercise.`);
    const sets = exercise.loggedSets.map((set, index) => {
      const count = Number(exercise.timeBased ? set.seconds : set.reps);
      if (!Number.isFinite(count) || count <= 0 || (!exercise.timeBased && !Number.isInteger(count))) throw new Error(`Enter valid ${exercise.timeBased ? "seconds" : "reps"} for ${exercise.name}, set ${index + 1}.`);
      const weight = set.weight === "" || set.weight == null ? 0 : Number(set.weight);
      if (!Number.isFinite(weight) || weight < 0) throw new Error(`Enter a valid weight for ${exercise.name}.`);
      return { ...set, id: set.id || `${entry.id}-${exercise.id}-${index}`, type: ["W", "T", "D", "F"].includes(set.type) ? set.type : "T",
        ...(exercise.timeBased ? { seconds: count } : { reps: count, weight: units === "metric" ? weight * 2.20462 : weight }) };
    });
    if (entries[exerciseId]) throw new Error("This exercise is already in the workout. Add another set to it instead.");
    const { loggedSets, ...definition } = exercise;
    definitions.push({ ...definition, id: exerciseId, name: exercise.name.trim(), sets: sets.length, repRange: definition.repRange || [1, 20], secondary: definition.secondary || [], restSec: definition.restSec || 90 });
    entries[exerciseId] = { ...(existing?.entries?.[exercise.id] || {}), sets };
  }
  return { ...existing, ...entry, date: existing && sessionDateKey(existing) === date ? existing.date : entry.date,
    template: { ...(existing?.template || entry.template || {}), name: name.trim(), exercises: definitions }, entries,
    extras: [], swaps: {}, readiness: existing?.readiness || null, manualLog: false, source: "history", completedAt: existing?.completedAt || now.toISOString() };
}

// Rest and readiness are single daily check-ins. Never replace workout history.
export function upsertDailyLog(sessions, entry, program = {}) {
  const kind = sessionKind(entry, program);
  if (kind === "workout") return [...sessions.filter(session => session.id !== entry.id), entry];
  const key = sessionDateKey(entry);
  const previous = sessions.find(session => sessionDateKey(session) === key && sessionKind(session, program) === kind);
  return [
    ...sessions.filter(session => sessionDateKey(session) !== key || sessionKind(session, program) !== kind),
    { ...previous, ...entry, id: previous?.id || entry.id, readiness: entry.readiness || previous?.readiness || null },
  ];
}

export function withDailyReadiness(sessions, key, readiness, id, program = {}) {
  const day = sessions.filter(session => sessionDateKey(session) === key);
  const target = day.find(session => sessionKind(session, program) === "workout") || day[day.length - 1];
  if (target) return sessions.map(session => session.id === target.id ? { ...session, readiness } : session);
  return [...sessions, { ...makeTrainingEntry({ date: key, kind: "check-in", id }), readiness }];
}

export function sessionDuration(session) {
  let first = Infinity, last = -Infinity;
  for (const entry of Object.values(session.entries || {})) {
    for (const set of entry?.sets || []) {
      const time = Date.parse(set.ts);
      if (Number.isFinite(time)) { first = Math.min(first, time); last = Math.max(last, time); }
    }
  }
  return first < last ? (last - first) / 60000 : null;
}
