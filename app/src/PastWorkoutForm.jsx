import React, { useMemo, useState } from "react";
import DateInput from "./DateInput.jsx";
import { makeCompletedWorkout, localDateKey, sessionDateKey, sessionTitle, validLogDate } from "./training-log.js";

const uid = () => Math.random().toString(36).slice(2, 10);
const blankSet = () => ({ id: uid(), type: "T", reps: "", weight: "", seconds: "" });

export default function PastWorkoutForm({ initial, program, profile, muscles, onSave }) {
  const existing = initial.session;
  const [date, setDate] = useState(existing ? sessionDateKey(existing) : initial.date);
  const [dayId, setDayId] = useState(String(existing?.dayId || initial.dayId || "custom"));
  const [name, setName] = useState(existing ? sessionTitle(existing, program) : program[initial.dayId]?.name || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [units, setUnits] = useState(profile.units);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const library = useMemo(() => Object.values(program).flatMap(day => day.exercises || []), [program]);
  const [exerciseId, setExerciseId] = useState("new");
  const [exercises, setExercises] = useState(() => {
    const definitions = [...(existing?.template?.exercises || program[existing?.dayId]?.exercises || []), ...(existing?.extras || [])];
    return Object.entries(existing?.entries || {}).map(([id, entry]) => {
      const definition = definitions.find(exercise => exercise.id === id) || library.find(exercise => exercise.id === id) || { id, name: "Exercise", primary: "Other", custom: true };
      const swap = existing?.swaps?.[id];
      return { ...definition, ...(swap || {}), loggedSets: (entry?.sets || []).map(set => ({ ...set, weight: set.weight == null ? "" : profile.units === "metric" ? Number((set.weight / 2.20462).toFixed(6)) : set.weight })) };
    });
  });
  const available = (program[dayId]?.exercises || library).filter(exercise => !exercises.some(item => item.id === exercise.id));
  const updateExercise = (index, patch) => setExercises(items => items.map((item, i) => i === index ? { ...item, ...patch } : item));
  const updateSet = (index, setIndex, patch) => setExercises(items => items.map((item, i) => i === index ? { ...item, loggedSets: item.loggedSets.map((set, j) => j === setIndex ? { ...set, ...patch } : set) } : item));
  const addExercise = () => {
    const definition = library.find(exercise => exercise.id === exerciseId);
    setExercises(items => [...items, { ...(definition || { id: `custom-${uid()}`, name: "", primary: "Other", secondary: [], type: "isolation", custom: true }), loggedSets: [blankSet()] }]);
    setExerciseId("new");
  };
  const changeUnits = next => {
    setExercises(items => items.map(item => ({ ...item, loggedSets: item.loggedSets.map(set => ({ ...set, weight: set.weight === "" || set.weight == null ? "" : Number((Number(set.weight) * (next === "metric" ? 1 / 2.20462 : 2.20462)).toFixed(6)) })) })));
    setUnits(next);
  };
  const submit = async event => {
    event.preventDefault(); if (saving) return;
    setError("");
    try {
      const entry = makeCompletedWorkout({ date, dayId: dayId === "custom" ? dayId : Number(dayId), name, notes, exercises, units, existing, id: uid(), program });
      setSaving(true);
      if (!await onSave(entry, existing)) setError("The workout could not be saved. Your entries are still here.");
    } catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  };
  return <form className="past-workout-form" onSubmit={submit}>
    <p className="helper-text">Enter what you actually did, even years before you installed the app. This saves a completed workout without starting a live session.</p>
    <label className="form-label">Workout date<DateInput className="gu-input" required max={localDateKey()} value={date} onChange={event => setDate(event.target.value)} /></label>
    <label className="form-label">Workout template<select className="rir-select" value={dayId} onChange={event => { const id = event.target.value; setDayId(id); if (program[id]) setName(program[id].name); }}>
      <option value="custom">Custom workout</option>{Object.entries(program).filter(([, day]) => day.exercises).map(([id, day]) => <option key={id} value={id}>{day.name}</option>)}
      {existing && !program[dayId] && dayId !== "custom" && <option value={dayId}>Saved workout</option>}
    </select></label>
    <label className="form-label">Workout name<input className="gu-input" required maxLength={100} value={name} placeholder="e.g. Upper body at the gym" onChange={event => setName(event.target.value)} /></label>
    <label className="form-label">Weight unit<select className="rir-select" value={units} onChange={event => changeUnits(event.target.value)}><option value="imperial">Pounds (lb)</option><option value="metric">Kilograms (kg)</option></select></label>
    {exercises.map((exercise, index) => <fieldset className="history-exercise" key={exercise.id}>
      <legend>Exercise {index + 1}</legend>
      <div className="history-exercise-heading"><strong>{exercise.custom ? "Custom exercise" : exercise.name}</strong><button type="button" className="icon-btn" aria-label={`Remove exercise ${index + 1}`} onClick={() => setExercises(items => items.filter((_, i) => i !== index))}>×</button></div>
      {exercise.custom && <>
        <label className="form-label">Exercise {index + 1} name<input className="gu-input" required value={exercise.name} onChange={event => updateExercise(index, { name: event.target.value })} /></label>
        <label className="form-label">Exercise {index + 1} muscle<select className="rir-select" value={exercise.primary} onChange={event => updateExercise(index, { primary: event.target.value })}><option value="Other">Other / cardio</option>{Object.entries(muscles).map(([key, muscle]) => <option key={key} value={key}>{muscle.label}</option>)}</select></label>
        <label className="form-label">Exercise {index + 1} tracking<select className="rir-select" value={exercise.timeBased ? "time" : "reps"} onChange={event => updateExercise(index, { timeBased: event.target.value === "time" })}><option value="reps">Weight and reps</option><option value="time">Duration in seconds</option></select></label>
      </>}
      {exercise.loggedSets.map((set, setIndex) => <div className="history-set" key={set.id}>
        <div className="history-set-heading"><span>Set {setIndex + 1}</span><button type="button" className="icon-btn" aria-label={`Remove exercise ${index + 1} set ${setIndex + 1}`} onClick={() => updateExercise(index, { loggedSets: exercise.loggedSets.filter((_, i) => i !== setIndex) })}>×</button></div>
        <div className="history-set-fields">
          {exercise.timeBased ? <label className="form-label">Seconds<input className="gu-input" aria-label={`Exercise ${index + 1} set ${setIndex + 1} seconds`} type="number" inputMode="numeric" min="1" step="1" required value={set.seconds ?? ""} onChange={event => updateSet(index, setIndex, { seconds: event.target.value })} /></label> : <>
            <label className="form-label">Weight ({units === "metric" ? "kg" : "lb"})<input className="gu-input" aria-label={`Exercise ${index + 1} set ${setIndex + 1} weight`} type="number" inputMode="decimal" min="0" step="any" placeholder="0 = bodyweight" value={set.weight ?? ""} onChange={event => updateSet(index, setIndex, { weight: event.target.value })} /></label>
            <label className="form-label">Reps<input className="gu-input" aria-label={`Exercise ${index + 1} set ${setIndex + 1} reps`} type="number" inputMode="numeric" min="1" step="1" required value={set.reps ?? ""} onChange={event => updateSet(index, setIndex, { reps: event.target.value })} /></label>
          </>}
          <label className="form-label">Type<select className="rir-select" aria-label={`Exercise ${index + 1} set ${setIndex + 1} type`} value={set.type || "T"} onChange={event => updateSet(index, setIndex, { type: event.target.value })}><option value="T">Working</option><option value="W">Warm-up</option><option value="D">Drop</option><option value="F">Failure</option></select></label>
        </div>
      </div>)}
      <button type="button" className="ghost-btn" onClick={() => updateExercise(index, { loggedSets: [...exercise.loggedSets, blankSet()] })}>Add set to exercise {index + 1}</button>
    </fieldset>)}
    <label className="form-label">Exercise to add<select className="rir-select" value={exerciseId} onChange={event => setExerciseId(event.target.value)}><option value="new">Custom exercise…</option>{available.map(exercise => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}</select></label>
    <button type="button" className="ghost-btn" onClick={addExercise}>Add exercise</button>
    <label className="form-label history-notes">Workout notes<textarea className="gu-input" rows={2} value={notes} onChange={event => setNotes(event.target.value)} /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button type="submit" className="gold-btn" disabled={saving || !validLogDate(date) || date > localDateKey()}>{saving ? "Saving…" : existing ? "Save workout changes" : "Save past workout"}</button>
  </form>;
}
