import React, { useState } from "react";
import { validLogDate } from "./training-log.js";

export default function DayTypeControl({ date, value, onChange }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const choose = async kind => {
    setSaving(true); setError("");
    try { if (!await onChange(date, kind)) setError("Day type could not be saved. Try again."); }
    catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  };
  return <div className="day-type-control">
    <div className="field-lbl">YOU DECIDE THIS DAY</div>
    <div className="day-type-options" role="group" aria-label="Choose day type">
      {[["workout", "Workout day"], ["rest", "Rest day"], ["unset", "Not set"]].map(([kind, label]) =>
        <button type="button" key={kind} aria-pressed={(value || "unset") === kind} disabled={saving || !validLogDate(date)} onClick={() => choose(kind)}>{label}</button>)}
    </div>
    {saving && <span role="status" className="helper-text">Saving day type…</span>}
    {error && <p role="alert" className="form-error">{error}</p>}
  </div>;
}
