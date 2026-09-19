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
export function indexTrainingLog(sessions, program = {}, active = null) {
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
    day.status = day.inProgress ? "active-log" : day.workouts ? "done" : day.rest ? "rest" : "check-in";
  }
  return index;
}

export function makeTrainingEntry({ date, kind, dayId, name = "", notes = "", id, now = new Date(), program = {} }) {
  if (!validLogDate(date) || date > localDateKey(now)) throw new Error("Choose today or an earlier date.");
  if (!["workout", "rest", "check-in"].includes(kind)) throw new Error("Choose a workout or rest day.");
  const template = kind === "workout" ? program[dayId] : null;
  if (kind === "workout" && !template?.exercises && !name.trim()) throw new Error("Enter a workout name.");
  return {
    id, kind, dayId: kind === "rest" ? 6 : kind === "check-in" ? 0 : dayId,
    localDate: date,
    date: (date === localDateKey(now) ? now : new Date(`${date}T12:00:00`)).toISOString(),
    workoutName: kind === "workout" ? (name.trim() || template.name) : undefined,
    template: template ? { ...template, exercises: template.exercises.map(exercise => ({ ...exercise })) } : undefined,
    notes: notes.trim(), readiness: null, entries: {},
  };
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
