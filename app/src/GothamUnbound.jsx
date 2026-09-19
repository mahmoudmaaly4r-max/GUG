import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Menu, Bell, ChevronLeft, ChevronRight, Plus, X, Check,
  Home as HomeIcon, Dumbbell, TrendingUp as TrendingUpIcon, Utensils, MoreHorizontal,
  Droplet, Play, Pause, Minus, Settings, HelpCircle, Award, Target,
  Download, Upload, User, Camera, Ruler, AlertTriangle, ShieldAlert,
  RotateCcw, Bell as BellIcon, BellOff, Bookmark, ArrowLeftRight, Trophy, ArrowUp, ArrowDown,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

/* ---------------------------------------------------------------------- */
/*  PROGRAM DATA                                                           */
/* ---------------------------------------------------------------------- */

const ex = (id, name, sets, repRange, primary, secondary, type, restSec, opts = {}) => ({
  id, name, sets, repRange, primary, secondary, type, restSec, ...opts,
});

const MUSCLES = {
  Chest: { label: "Chest", min: 10, max: 20 },
  Back: { label: "Back", min: 10, max: 20 },
  Lats: { label: "Lats", min: 10, max: 20 },
  Shoulders: { label: "Shoulders", min: 8, max: 16 },
  SideDelts: { label: "Side Delts", min: 12, max: 20 },
  RearDelts: { label: "Rear Delts", min: 8, max: 16 },
  Biceps: { label: "Biceps", min: 10, max: 18 },
  Triceps: { label: "Triceps", min: 10, max: 18 },
  Quads: { label: "Quads", min: 10, max: 18 },
  Hamstrings: { label: "Hamstrings", min: 8, max: 16 },
  Glutes: { label: "Glutes", min: 6, max: 14 },
  Calves: { label: "Calves", min: 8, max: 16 },
  Core: { label: "Core", min: 8, max: 15 },
  Forearms: { label: "Forearms", min: 6, max: 12 },
};

const DEFAULT_PROGRAM = {
  1: {
    code: "DAY I", name: "THE ARMOR", focus: "Chest + Triceps", goal: "Thick, armored chest",
    exercises: [
      ex("d1e1", "Bench Press", 4, [6, 8], "Chest", ["Triceps", "Shoulders"], "heavy", 210),
      ex("d1e2", "Incline Dumbbell Press", 3, [8, 10], "Chest", ["Shoulders", "Triceps"], "compound", 150),
      ex("d1e3", "Machine Chest Press", 3, [10, 12], "Chest", ["Triceps"], "compound", 120),
      ex("d1e4", "Cable Fly", 3, [12, 15], "Chest", [], "isolation", 75),
      ex("d1e5", "Triceps Pushdown", 3, [10, 12], "Triceps", [], "isolation", 75),
      ex("d1e6", "Overhead Cable Triceps Extension", 3, [10, 12], "Triceps", [], "isolation", 75),
      ex("d1e7", "Dips", 2, null, "Chest", ["Triceps", "Shoulders"], "compound", 120, { amrap: true }),
    ],
    finisher: "Incline treadmill — 8–10 min",
  },
  2: {
    code: "DAY II", name: "THE CAVE", focus: "Back + Biceps", goal: "Wide, powerful V-taper",
    exercises: [
      ex("d2e1", "Lat Pulldown / Assisted Pull-up", 4, [8, 10], "Lats", ["Biceps"], "compound", 150),
      ex("d2e2", "Chest-Supported Row", 4, [8, 10], "Back", ["Lats", "Biceps"], "compound", 150),
      ex("d2e3", "Seated Cable Row", 3, [10, 12], "Back", ["Lats", "Biceps"], "compound", 120),
      ex("d2e4", "Single-Arm Lat Pulldown", 3, [10, 12], "Lats", ["Biceps"], "compound", 90),
      ex("d2e5", "Face Pull", 3, [12, 15], "RearDelts", ["Back"], "isolation", 75),
      ex("d2e6", "Dumbbell Curl", 3, [8, 12], "Biceps", [], "isolation", 75),
      ex("d2e7", "Hammer Curl", 3, [10, 12], "Biceps", ["Forearms"], "isolation", 75),
    ],
    finisher: null,
  },
  3: {
    code: "DAY III", name: "THE LEGS", focus: "Legs + Core", goal: "Athletic, functional lower body",
    exercises: [
      ex("d3e1", "Squat or Leg Press", 4, [6, 10], "Quads", ["Glutes"], "heavy", 240),
      ex("d3e2", "Romanian Deadlift", 3, [8, 10], "Hamstrings", ["Glutes", "Back"], "heavy", 210),
      ex("d3e3", "Bulgarian Split Squat", 3, [8, 10], "Quads", ["Glutes"], "compound", 120, { perLeg: true }),
      ex("d3e4", "Leg Curl", 3, [10, 12], "Hamstrings", [], "isolation", 75),
      ex("d3e5", "Leg Extension", 3, [10, 15], "Quads", [], "isolation", 75),
      ex("d3e6", "Standing Calf Raise", 4, [10, 15], "Calves", [], "isolation", 60),
      ex("d3e7", "Cable Crunch", 3, [12, 15], "Core", [], "isolation", 60),
      ex("d3e8", "Hanging Knee Raise", 3, [10, 15], "Core", [], "isolation", 60),
      ex("d3e9", "Plank", 3, [30, 60], "Core", [], "isolation", 45, { timeBased: true }),
    ],
    finisher: null,
  },
  4: {
    code: "DAY IV", name: "THE CAPE", focus: "Shoulders + Arms", goal: "Broad shoulders, defined arms",
    exercises: [
      ex("d4e1", "Machine / Seated Shoulder Press", 3, [6, 10], "Shoulders", ["Triceps"], "compound", 150),
      ex("d4e2", "Dumbbell Lateral Raise", 4, [12, 15], "SideDelts", [], "isolation", 75),
      ex("d4e3", "Cable Lateral Raise", 3, [12, 15], "SideDelts", [], "isolation", 75),
      ex("d4e4", "Rear-Delt Fly", 3, [12, 15], "RearDelts", [], "isolation", 75),
      ex("d4e5", "EZ-Bar Curl", 3, [8, 12], "Biceps", [], "isolation", 75),
      ex("d4e6", "Hammer Curl", 3, [10, 12], "Biceps", ["Forearms"], "isolation", 75),
      ex("d4e7", "Rope Pushdown", 3, [10, 15], "Triceps", [], "isolation", 75),
      ex("d4e8", "Overhead Triceps Extension", 3, [10, 15], "Triceps", [], "isolation", 75),
    ],
    finisher: "Optional — incline treadmill 10–15 min",
  },
  5: {
    code: "DAY V", name: "THE VIGILANTE", focus: "Upper Body + Conditioning", goal: "Batman-style athletic physique",
    exercises: [
      ex("d5e1", "Incline Bench Press", 3, [8, 10], "Chest", ["Shoulders", "Triceps"], "compound", 150),
      ex("d5e2", "Pull-ups / Lat Pulldown", 3, [8, 12], "Lats", ["Biceps"], "compound", 150),
      ex("d5e3", "Cable Row", 3, [8, 12], "Back", ["Lats", "Biceps"], "compound", 120),
      ex("d5e4", "Dumbbell Shoulder Press", 3, [8, 10], "Shoulders", ["Triceps"], "compound", 120),
      ex("d5e5", "Cable Lateral Raise", 3, [12, 15], "SideDelts", [], "isolation", 75),
      ex("d5e6", "Cable Fly", 2, [12, 15], "Chest", [], "isolation", 75),
      ex("d5e7", "Face Pull", 2, [15, 15], "RearDelts", ["Back"], "isolation", 60),
    ],
    conditioning: [
      { label: "Easy walk", seconds: 300 }, { label: "Brisk incline walk", seconds: 600 },
      { label: "Fast interval", seconds: 30 }, { label: "Easy recovery", seconds: 75 },
      { label: "Fast interval", seconds: 30 }, { label: "Easy recovery", seconds: 75 },
      { label: "Fast interval", seconds: 30 }, { label: "Easy recovery", seconds: 75 },
      { label: "Fast interval", seconds: 30 }, { label: "Easy recovery", seconds: 75 },
      { label: "Fast interval", seconds: 30 }, { label: "Cooldown", seconds: 300 },
    ],
  },
  6: { code: "DAY VI", name: "RECOVERY", focus: "Rest / Walking", goal: "Recovery", rest: true },
  7: { code: "DAY VII", name: "RECOVERY", focus: "Rest / Walking", goal: "Recovery", rest: true },
};

const SET_TYPES = [
  { key: "W", label: "Warm-up", credit: 0 },
  { key: "T", label: "Working", credit: 1 },
  { key: "D", label: "Drop", credit: 0.5 },
  { key: "F", label: "Failure", credit: 1 },
];
const PLATES = [45, 35, 25, 10, 5, 2.5];
const MEASURE_FIELDS = [
  { key: "weight", label: "Weight", kind: "weight" },
  { key: "chest", label: "Chest", kind: "length" },
  { key: "waist", label: "Waist", kind: "length" },
  { key: "shoulders", label: "Shoulders", kind: "length" },
  { key: "arms", label: "Arms", kind: "length" },
  { key: "thighs", label: "Thighs", kind: "length" },
  { key: "neck", label: "Neck", kind: "length" },
  { key: "bodyFatPct", label: "Body Fat", kind: "pct" },
];
const GOALS = ["Cut", "Maintain", "Lean Bulk", "Bulk"];
const ACTIVITIES = ["Sedentary", "Light", "Moderate", "Very Active", "Athlete"];
const ANGLES = ["front", "side", "back"];
const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_LABELS = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };

/* ---------------------------------------------------------------------- */
/*  HELPERS                                                                 */
/* ---------------------------------------------------------------------- */

const uid = () => Math.random().toString(36).slice(2, 10);
const volumeLoad = (w, r) => (Number(w) || 0) * (Number(r) || 0);
const epley1RM = (w, r) => (Number(w) || 0) * (1 + (Number(r) || 0) / 30);
const isoWeek = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return date.getFullYear() + "-" + (1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7));
};
const pad2 = (n) => String(n).padStart(2, "0");
const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const monthKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
const keyToDate = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const fmtHM = (iso) => { const d = new Date(iso); const h = d.getHours() % 12 || 12; return `${h}:${pad2(d.getMinutes())}${d.getHours() < 12 ? "a" : "p"}`; };
function suggestMeal() {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 18) return "snack";
  return "dinner";
}
function applySwap(exDef, swaps) {
  if (!exDef) return exDef;
  const s = swaps && swaps[exDef.id];
  if (!s) return exDef;
  return { ...exDef, name: s.name || exDef.name, primary: s.primary || exDef.primary, secondary: s.secondary || exDef.secondary, swapped: true, originalName: exDef.name };
}
function fmtDuration(mins) {
  if (!mins || mins < 1) return null;
  const h = Math.floor(mins / 60), m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/* -- unit conversion (canonical storage: lb, inches, oz) -- */
const LB_PER_KG = 2.20462;
const lbToKg = (lb) => lb / LB_PER_KG;
const kgToLb = (kg) => kg * LB_PER_KG;
const inToCm = (i) => i * 2.54;
const cmToIn = (c) => c / 2.54;
const ozToMl = (oz) => oz * 29.5735;
const mlToOz = (ml) => ml / 29.5735;
const ozFromLiters = (l) => (l * 1000) / 29.5735;
const weightUnitLabel = (units) => (units === "metric" ? "kg" : "lb");
const lengthUnitLabel = (units) => (units === "metric" ? "cm" : "in");
const fmtWeight = (lb, units) => (units === "metric" ? Math.round(lbToKg(lb) * 10) / 10 : Math.round(lb * 10) / 10);
const fmtLength = (inches, units) => (units === "metric" ? Math.round(inToCm(inches) * 10) / 10 : Math.round(inches * 10) / 10);
const parseWeightInput = (val, units) => { const n = Number(val) || 0; return units === "metric" ? kgToLb(n) : n; };
const parseLengthInput = (val, units) => { const n = Number(val) || 0; return units === "metric" ? cmToIn(n) : n; };
const fmtWaterDisplay = (oz, units) => {
  if (units !== "metric") return { value: Math.round(oz), unit: "oz" };
  const ml = ozToMl(oz);
  if (ml >= 1000) return { value: Math.round(ml / 100) / 10, unit: "L" };
  return { value: Math.round(ml), unit: "mL" };
};
const fmtWaterTotal = (oz, units) => (units === "metric" ? { value: Math.round(ozToMl(oz) / 100) / 10, unit: "L" } : { value: Math.round(oz), unit: "oz" });

function fileToCompressedDataUrl(file, maxDim = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round(height * (maxDim / width)); width = maxDim; }
        else if (height >= width && height > maxDim) { width = Math.round(width * (maxDim / height)); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function storageGet(key) {
  try { const r = await window.storage.get(key, false); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function storageSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val), false); } catch { /* best effort */ }
}

/* ---------------------------------------------------------------------- */
/*  EXERCISE DEMO ANIMATIONS — via the free ExerciseDB (oss.exercisedb.dev)*/
/* ---------------------------------------------------------------------- */

const EXERCISE_DB_BASE = "https://oss.exercisedb.dev/api/v1/exercises";

function edbNormTokens(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

// Fetch the free ExerciseDB catalog a page at a time (cursor pagination) and
// cache the merged result — this only ever runs once per browser.
async function fetchExerciseDbCatalog(maxPages = 20) {
  let all = [];
  let cursor = null;
  for (let i = 0; i < maxPages; i++) {
    const url = EXERCISE_DB_BASE + "?limit=100" + (cursor ? "&after=" + encodeURIComponent(cursor) : "");
    let json;
    try {
      const res = await fetch(url);
      if (!res.ok) break;
      json = await res.json();
    } catch {
      break;
    }
    const data = Array.isArray(json && json.data) ? json.data : [];
    if (!data.length) break;
    all = all.concat(data);
    if (!json.meta || !json.meta.hasNextPage || !json.meta.nextCursor) break;
    cursor = json.meta.nextCursor;
  }
  return all;
}

async function getExerciseDbCatalog() {
  const cached = await storageGet("exerciseDbCache");
  if (Array.isArray(cached) && cached.length) return cached;
  const fresh = await fetchExerciseDbCatalog();
  if (fresh.length) storageSet("exerciseDbCache", fresh);
  return fresh;
}

// Token-overlap fuzzy match; handles compound names like "Lat Pulldown / Assisted Pull-up"
// by scoring each half separately and keeping whichever candidate scores best.
function edbBestMatch(name, catalog) {
  const halves = String(name).split("/").map((p) => p.trim()).filter(Boolean);
  let best = null, bestScore = 0;
  halves.forEach((half) => {
    const qTokens = new Set(edbNormTokens(half));
    if (!qTokens.size) return;
    catalog.forEach((ex) => {
      if (!ex.gifUrl) return;
      const nTokens = new Set(edbNormTokens(ex.name || ""));
      let overlap = 0;
      qTokens.forEach((t) => { if (nTokens.has(t)) overlap++; });
      const score = overlap / qTokens.size;
      if (score > bestScore) { bestScore = score; best = ex; }
    });
  });
  return bestScore >= 0.5 ? best : null;
}

async function resolveExerciseDemo(exerciseName) {
  const cacheKey = "exDemo:" + exerciseName.toLowerCase().trim();
  const cached = await storageGet(cacheKey);
  if (cached) return cached;
  const catalog = await getExerciseDbCatalog();
  const match = catalog.length ? edbBestMatch(exerciseName, catalog) : null;
  const result = match ? { found: true, gifUrl: match.gifUrl, matchedName: match.name } : { found: false };
  storageSet(cacheKey, result);
  return result;
}

/* ---------------------------------------------------------------------- */
/*  STYLES — redesign: rounded, premium dark UI, warm gold accent           */
/* ---------------------------------------------------------------------- */

const CSS = `
:root{
  --bg:#0a0b0e; --card:#14161c; --card2:#191c23; --line:#262932;
  --gold:#f0b429; --gold-soft:rgba(240,180,41,0.15); --gold-dim:#8a6a22;
  --green:#34d399; --blue:#4fa3e0; --red:#e0524a; --red-soft:rgba(224,82,74,0.16);
  --text:#f3f1ec; --dim:#8b8d97; --dim2:#5c5e68;
}
*{box-sizing:border-box;}
.gu-root{
  background:var(--bg); color:var(--text); font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  min-height:100vh; width:100%; max-width:480px; margin:0 auto; padding-bottom:90px; position:relative;
}
.topbar{ display:flex; align-items:center; justify-content:space-between; padding:16px 18px 10px; }
.topbar .t{ font-size:17px; font-weight:700; }
.topbar .side{ display:flex; align-items:center; gap:12px; color:var(--dim); }
.topbar .side button{ background:none; border:none; color:var(--dim); display:flex; }
.gu-body{ padding:0 16px 8px; }
.gu-body.flush{ padding-top:0; }

/* hero / home header */
.hero{ position:relative; height:190px; margin:-4px -16px 16px; overflow:hidden; }
.hero svg{ position:absolute; inset:0; width:100%; height:100%; }
.hero .label{ position:absolute; left:18px; bottom:16px; }
.hero .brand{ font-size:22px; font-weight:800; letter-spacing:0.06em; color:#fff; text-shadow:0 2px 12px rgba(0,0,0,0.6); }
.hero .tag{ font-size:10px; letter-spacing:0.18em; color:var(--gold); margin-top:3px; font-weight:600; }
.icon-btn{ background:var(--card2); border:1px solid var(--line); color:var(--dim); width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.icon-btn:disabled{ opacity:0.3; }
.icon-circle{ width:38px; height:38px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

.card{ background:var(--card); border:1px solid var(--line); border-radius:18px; margin-bottom:14px; overflow:hidden; }
.card-hd{ display:flex; align-items:center; justify-content:space-between; padding:14px 16px 4px; }
.card-hd .t{ font-size:13px; font-weight:700; color:var(--dim); text-transform:uppercase; letter-spacing:0.05em; }
.card-hd .s{ font-size:11px; color:var(--dim2); }
.card-bd{ padding:14px 16px 16px; }

.today-card{ background:linear-gradient(135deg,var(--card2),var(--card)); border:1px solid var(--line); border-radius:18px; padding:16px; margin-bottom:14px; }
.today-card .lbl{ font-size:10px; color:var(--dim); letter-spacing:0.08em; margin-bottom:4px; }
.today-card .row{ display:flex; align-items:center; justify-content:space-between; }
.today-card .nm{ font-size:17px; font-weight:700; }
.today-card .sub{ font-size:12px; color:var(--dim); margin-top:2px; }

.gold-btn{ background:var(--gold); color:#161005; border:none; font-weight:700; font-size:13.5px; border-radius:14px; padding:14px; width:100%; display:flex; align-items:center; justify-content:center; gap:8px; }
.gold-btn:disabled{ opacity:0.4; }
.ghost-btn{ background:var(--card2); border:1px solid var(--line); color:var(--text); border-radius:14px; padding:12px; width:100%; font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; }
.pill-btn{ border-radius:999px; padding:8px 16px; font-size:12px; border:1px solid var(--line); background:var(--card2); color:var(--dim); }
.pill-btn.on{ background:var(--gold); color:#161005; border-color:var(--gold); font-weight:700; }

.stat-grid-2{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
.stat-tile{ background:var(--card); border:1px solid var(--line); border-radius:16px; padding:13px 14px; }
.stat-tile .lbl{ font-size:10px; color:var(--dim); letter-spacing:0.06em; margin-bottom:6px; }
.stat-tile .big{ font-size:20px; font-weight:700; }
.stat-tile .sub{ font-size:11px; color:var(--dim2); margin-top:2px; }
.stat-tile .bar{ height:6px; background:#22252c; border-radius:4px; margin-top:8px; overflow:hidden; }
.stat-tile .bar > div{ height:100%; border-radius:4px; }
.stat-tile.readiness{ display:flex; align-items:center; gap:10px; }

.bottom-nav{ position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:480px; display:flex; background:var(--card); border-top:1px solid var(--line); z-index:40; padding-bottom:2px; }
.nav-btn{ flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding:10px 4px 9px; color:var(--dim); background:none; border:none; font-size:9.5px; letter-spacing:0.02em; position:relative; }
.nav-btn.active{ color:var(--gold); }
.nav-dot{ position:absolute; top:5px; right:calc(50% - 15px); width:6px; height:6px; background:var(--red); border-radius:50%; }

.day-row{ display:flex; align-items:center; gap:12px; padding:13px 14px; background:var(--card); border:1px solid var(--line); border-radius:16px; margin-bottom:9px; }
.day-row.today{ border-color:var(--gold); }
.day-row .icon-circle{ background:var(--card2); color:var(--gold); }
.day-row .info{ flex:1; min-width:0; }
.day-row .nm{ font-weight:700; font-size:14px; }
.day-row .status{ font-size:11.5px; margin-top:2px; display:flex; align-items:center; gap:4px; }
.day-row .status.done{ color:var(--green); }
.day-row .status.today{ color:var(--gold); }
.day-row .status.missed{ color:var(--red); }
.day-row .status.upcoming{ color:var(--dim); }

.ex-row{ display:flex; align-items:center; gap:12px; padding:12px 14px; background:var(--card); border:1px solid var(--line); border-radius:16px; margin-bottom:9px; }
.ex-row .idx{ width:26px; height:26px; border-radius:9px; background:var(--card2); color:var(--dim); font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ex-row .info{ flex:1; min-width:0; }
.ex-row .nm{ font-weight:600; font-size:13.5px; }
.ex-row .sub{ font-size:11.5px; color:var(--dim); margin-top:1px; }
.ex-row .badge{ font-size:10.5px; padding:4px 9px; border-radius:999px; background:var(--card2); color:var(--dim); white-space:nowrap; }
.ex-row .badge.done{ background:rgba(52,211,153,0.15); color:var(--green); }

.ex-hero{ display:flex; align-items:center; gap:12px; margin-bottom:16px; }
.ex-hero .art{ width:52px; height:52px; border-radius:14px; background:var(--card2); display:flex; align-items:center; justify-content:center; color:var(--gold); flex-shrink:0; overflow:hidden; }
.ex-hero .art img{ width:100%; height:100%; object-fit:cover; }
.ex-demo{ width:100%; height:190px; border-radius:16px; overflow:hidden; background:var(--card2); display:flex; align-items:center; justify-content:center; margin-bottom:14px; position:relative; color:var(--dim); }
.ex-demo img{ width:100%; height:100%; object-fit:cover; }
.ex-demo .credit{ position:absolute; bottom:7px; right:9px; font-size:9px; color:rgba(255,255,255,0.7); background:rgba(0,0,0,0.4); padding:3px 7px; border-radius:7px; letter-spacing:0.02em; }
.ex-demo .label{ font-size:11px; letter-spacing:0.02em; }
.ex-hero .nm{ font-size:16px; font-weight:700; }
.ex-hero .sub{ font-size:12px; color:var(--dim); margin-top:2px; }

.set-tabs{ display:flex; gap:6px; margin-bottom:16px; overflow-x:auto; }
.set-tab{ min-width:38px; height:34px; border-radius:11px; background:var(--card2); border:1px solid var(--line); color:var(--dim); font-weight:700; font-size:13px; flex-shrink:0; }
.set-tab.on{ background:var(--gold); color:#161005; border-color:var(--gold); }
.set-tab.logged{ border-color:var(--green); color:var(--green); }
.set-tab.add{ color:var(--dim); }

.field-lbl{ font-size:10.5px; color:var(--dim); letter-spacing:0.06em; margin:0 0 8px; text-transform:uppercase; }
.stepper{ display:flex; align-items:center; gap:14px; background:var(--card2); border:1px solid var(--line); border-radius:14px; padding:10px 14px; margin-bottom:16px; }
.stepper button{ width:34px; height:34px; border-radius:10px; background:var(--card); border:1px solid var(--line); color:var(--text); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.stepper .val{ flex:1; text-align:center; font-size:19px; font-weight:700; }
.stepper .u{ font-size:11px; color:var(--dim); margin-left:2px; }

.type-row{ display:flex; gap:6px; margin-bottom:16px; }
.type-chip{ flex:1; padding:9px 4px; border-radius:11px; background:var(--card2); border:1px solid var(--line); color:var(--dim); font-size:11.5px; }
.type-chip.on{ background:var(--gold); color:#161005; border-color:var(--gold); font-weight:700; }
.type-chip.on.F{ background:var(--red); color:#fff; border-color:var(--red); }
.type-chip.on.D{ background:#d98a3a; color:#161005; border-color:#d98a3a; }

.notes-input{ width:100%; background:var(--card2); border:1px solid var(--line); border-radius:12px; padding:10px 12px; color:var(--text); font-size:13px; margin-bottom:16px; }
.gu-input{ background:var(--card2); border:1px solid var(--line); border-radius:12px; color:var(--text); font-size:13px; padding:10px; text-align:center; width:100%; min-width:0; }
.gu-input:focus{ outline:none; border-color:var(--gold); }
.rir-select{ background:var(--card2); border:1px solid var(--line); border-radius:12px; color:var(--text); font-size:12px; padding:9px 4px; width:100%; }

.rest-bar{ display:flex; align-items:center; gap:12px; background:var(--card2); border:1px solid var(--line); border-radius:14px; padding:12px 14px; margin-top:6px; }
.rest-bar .lbl{ font-size:10px; color:var(--dim); letter-spacing:0.05em; }
.rest-bar .clock{ font-size:19px; font-weight:700; color:var(--gold); }
.rest-bar .spacer{ flex:1; }
.rest-bar .ctrl{ width:38px; height:38px; border-radius:12px; background:var(--card); border:1px solid var(--line); color:var(--text); display:flex; align-items:center; justify-content:center; }

.exdetail-nav{ display:flex; align-items:center; justify-content:space-between; margin-top:16px; }
.exdetail-nav button{ display:flex; align-items:center; gap:4px; background:none; border:none; color:var(--dim); font-size:12px; }
.exdetail-nav button.gym{ color:var(--gold); }

.gym-wrap{ position:fixed; inset:0; background:var(--bg); z-index:80; overflow-y:auto; padding:18px 18px 24px; }
.gym-dial{ position:relative; width:96px; height:96px; margin:0 auto 6px; }

.subtabs{ display:flex; gap:6px; margin-bottom:14px; overflow-x:auto; }
.subtab{ padding:8px 14px; border-radius:999px; background:var(--card); border:1px solid var(--line); color:var(--dim); font-size:12px; white-space:nowrap; }
.subtab.on{ background:var(--gold); color:#161005; border-color:var(--gold); font-weight:700; }

.strength-row{ display:flex; align-items:center; gap:12px; padding:11px 0; border-bottom:1px solid var(--line); }
.strength-row:last-child{ border-bottom:none; }
.strength-row .info{ flex:1; }
.strength-row .nm{ font-size:13px; font-weight:600; }
.strength-row .sub{ font-size:11.5px; color:var(--dim); margin-top:1px; }
.strength-row .pct{ font-size:13px; font-weight:700; display:flex; align-items:center; gap:3px; }
.pct.up{ color:var(--green); } .pct.down{ color:var(--red); } .pct.flat{ color:var(--dim); }

.vol-row{ margin-bottom:14px; }
.vol-row .top{ display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px; }
.vol-row .name{ font-weight:600; } .vol-row .num{ color:var(--dim); }
.vol-track{ height:7px; background:#22252c; border-radius:4px; position:relative; overflow:hidden; }
.vol-fill{ height:100%; background:var(--gold); border-radius:4px; }
.vol-fill.under{ background:#4a4c55; } .vol-fill.over{ background:var(--red); }
.vol-band{ position:absolute; top:0; bottom:0; border-left:1px dashed rgba(255,255,255,0.3); }

.measure-row{ display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--line); }
.measure-row:last-child{ border-bottom:none; }
.measure-row .info{ flex:1; font-size:13px; font-weight:600; }
.measure-row .val{ font-size:13px; color:var(--dim); }
.trend{ display:flex; align-items:center; gap:3px; font-size:11px; }
.trend.up{ color:var(--green); } .trend.down{ color:var(--red); } .trend.flat{ color:var(--dim); }

.measure-grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
.measure-grid .cell label{ display:block; font-size:9.5px; color:var(--dim); margin-bottom:5px; letter-spacing:0.03em; }

.photo-slots{ display:flex; gap:8px; margin-bottom:14px; }
.photo-slot{ flex:1; aspect-ratio:3/4; border-radius:14px; border:1.5px dashed var(--line); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; background:var(--card2); }
.photo-slot img{ width:100%; height:100%; object-fit:cover; }
.photo-slot .add-lbl{ font-size:9px; color:var(--dim); text-align:center; letter-spacing:0.04em; line-height:1.5; }
.photo-slot .angle-lbl{ position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.55); color:var(--gold); font-size:9px; text-align:center; padding:3px 0; }
.photo-slot .del-btn{ position:absolute; top:4px; right:4px; background:rgba(0,0,0,0.6); border:none; color:#f0b3ae; width:18px; height:18px; border-radius:6px; display:flex; align-items:center; justify-content:center; }
.compare-row{ display:flex; gap:8px; }
.compare-col{ flex:1; }
.compare-col select{ width:100%; margin-bottom:6px; }
.compare-col img{ width:100%; aspect-ratio:3/4; object-fit:cover; border-radius:12px; border:1px solid var(--line); display:block; }

.macro-dot-row{ display:flex; align-items:center; gap:10px; padding:8px 0; }
.macro-dot{ width:9px; height:9px; border-radius:50%; flex-shrink:0; }
.macro-dot-row .lbl{ font-size:12px; flex:1; }
.macro-dot-row .val{ font-size:12px; color:var(--dim); }
.macro-bar-track{ height:5px; background:#22252c; border-radius:3px; margin-top:5px; overflow:hidden; }
.macro-bar-fill{ height:100%; border-radius:3px; }

.meal-group{ margin-bottom:6px; }
.meal-group .mg-hd{ display:flex; justify-content:space-between; font-size:11.5px; color:var(--gold); text-transform:uppercase; letter-spacing:0.05em; padding:10px 2px 6px; }
.meal-card{ display:flex; align-items:center; gap:12px; background:var(--card); border:1px solid var(--line); border-radius:14px; padding:10px 12px; margin-bottom:8px; }
.meal-card .thumb{ width:44px; height:44px; border-radius:11px; background:var(--card2); display:flex; align-items:center; justify-content:center; color:var(--dim); flex-shrink:0; overflow:hidden; }
.meal-card .thumb img{ width:100%; height:100%; object-fit:cover; }
.meal-card .info{ flex:1; min-width:0; }
.meal-card .nm{ font-size:13px; font-weight:600; }
.meal-card .sub{ font-size:11.5px; color:var(--dim); margin-top:1px; }

.quick-row{ display:flex; gap:6px; flex-wrap:wrap; margin:10px 0; }
.quick-chip{ flex:1; min-width:56px; background:var(--card2); border:1px solid var(--line); color:var(--text); border-radius:11px; padding:9px 4px; font-size:12px; }
.qf-chip{ font-size:10.5px; padding:7px 10px; border-radius:999px; background:var(--card2); border:1px solid var(--line); color:var(--text); }

.goal-row{ display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.goal-row label{ font-size:11px; color:var(--dim); flex:1; }
.goal-row input{ width:84px; }
.units-toggle{ display:flex; border:1px solid var(--line); border-radius:12px; overflow:hidden; }
.units-toggle button{ flex:1; padding:9px; background:var(--card2); border:none; color:var(--dim); font-size:12px; }
.units-toggle button.on{ background:var(--gold); color:#161005; font-weight:700; }

.cal-grid{ display:grid; grid-template-columns:repeat(7,1fr); gap:5px; }
.cal-dow{ text-align:center; font-size:9.5px; color:var(--dim); padding-bottom:4px; }
.cal-cell{ aspect-ratio:1; background:var(--card2); border:1px solid transparent; border-radius:12px; color:var(--dim); font-size:12px; display:flex; align-items:center; justify-content:center; position:relative; transition:transform .1s; }
.cal-cell:active{ transform:scale(0.92); }
.cal-cell .dot{ position:absolute; bottom:5px; width:5px; height:5px; border-radius:50%; }
.cal-cell.done{ background:var(--gold-soft); color:var(--gold); border-color:var(--gold); font-weight:700; }
.cal-cell.done .dot{ background:var(--gold); }
.cal-cell.rest{ color:var(--dim2); }
.cal-cell.rest .dot{ background:var(--dim2); }
.cal-cell.missed{ background:var(--red-soft); color:var(--red); border-color:var(--red); }
.cal-cell.missed .dot{ background:var(--red); }
.cal-cell.today{ box-shadow:0 0 0 2px var(--gold) inset; }
.cal-cell.sel{ box-shadow:0 0 0 2px #fff inset; }
.cal-legend{ display:flex; gap:14px; margin:12px 0 4px; font-size:10px; color:var(--dim); }
.cal-legend .dot{ display:inline-block; width:7px; height:7px; border-radius:50%; margin-right:4px; vertical-align:middle; }
.cal-legend .dot.done{ background:var(--gold); } .cal-legend .dot.rest{ background:var(--dim2); } .cal-legend .dot.missed{ background:var(--red); }

.day-summary{ display:flex; align-items:center; gap:12px; background:var(--card); border:1px solid var(--line); border-radius:16px; padding:14px; margin-top:12px; }
.day-summary .icon-circle{ background:var(--gold-soft); color:var(--gold); }
.day-summary .info{ flex:1; }
.day-summary .d{ font-size:11px; color:var(--dim); }
.day-summary .nm{ font-size:14px; font-weight:700; margin-top:1px; }
.day-summary .sub{ font-size:11.5px; color:var(--dim); margin-top:1px; }

.profile-hd{ display:flex; align-items:center; gap:14px; padding:6px 2px 18px; }
.profile-hd .avatar{ width:54px; height:54px; border-radius:16px; background:var(--card2); border:1px solid var(--line); display:flex; align-items:center; justify-content:center; color:var(--dim); }
.profile-hd .nm{ font-size:16px; font-weight:700; }
.profile-hd .sub{ font-size:11.5px; color:var(--dim); margin-top:2px; }
.more-row{ display:flex; align-items:center; gap:13px; padding:13px 4px; border-bottom:1px solid var(--line); }
.more-row:last-child{ border-bottom:none; }
.more-row .icon-circle{ background:var(--card2); color:var(--gold); width:36px; height:36px; border-radius:11px; }
.more-row .info{ flex:1; }
.more-row .nm{ font-size:13.5px; font-weight:600; }
.more-row .sub{ font-size:11px; color:var(--dim); margin-top:1px; }
.quote-card{ position:relative; border-radius:18px; overflow:hidden; padding:20px 16px; margin-top:8px; min-height:110px; display:flex; align-items:flex-end; }
.quote-card svg{ position:absolute; inset:0; width:100%; height:100%; }
.quote-card p{ position:relative; font-size:12.5px; color:#e8e6e0; line-height:1.6; font-style:italic; }
.quote-card .bar{ position:absolute; bottom:0; left:0; height:3px; background:var(--gold); }

.alert-banner{ display:flex; gap:8px; align-items:flex-start; background:var(--red-soft); border:1px solid var(--red); border-radius:14px; padding:11px 13px; margin:0 0 12px; font-size:11.5px; color:#f5c2bd; }
.deload-banner{ border:1px solid var(--red); background:var(--red-soft); border-radius:16px; padding:14px 16px; margin-bottom:14px; }
.deload-banner .hd{ display:flex; align-items:center; gap:8px; color:#f5c2bd; font-weight:700; font-size:12px; margin-bottom:6px; }
.deload-banner ul{ margin:6px 0 10px; padding-left:18px; font-size:11.5px; color:#d9a9a4; }
.deload-active{ border:1px solid var(--gold); background:var(--gold-soft); border-radius:14px; padding:11px 14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--gold); gap:10px; }

.slider-row{ margin-bottom:16px; }
.slider-row .lbl{ display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px; color:var(--dim); }
.slider-row .lbl b{ color:var(--text); font-weight:600; }
input[type=range]{ width:100%; }
.entry-row{ display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:12px; }
.chip-row{ display:flex; gap:6px; flex-wrap:wrap; margin-top:8px; }
.seg-chip{ font-size:11px; padding:7px 11px; border-radius:999px; border:1px solid var(--line); color:var(--dim); background:var(--card2); flex:1; }
.seg-chip.on{ background:var(--gold); border-color:var(--gold); color:#161005; font-weight:700; }
::-webkit-scrollbar{ width:0; height:0; }

/* --- smoother, lighter interaction feedback --- */
.gold-btn, .ghost-btn, .icon-btn, .pill-btn, .seg-chip, .subtab, .set-tab, .type-chip,
.quick-chip, .qf-chip, .units-toggle button, .stepper button, .day-row, .ex-row, .more-row, .photo-slot, .cal-cell {
  transition: transform .12s cubic-bezier(0.4,0,0.2,1), background-color .15s ease, border-color .15s ease, color .15s ease, box-shadow .15s ease, opacity .15s ease;
}
.gold-btn{ box-shadow:0 3px 14px rgba(240,180,41,0.18); }
.gold-btn:active:not(:disabled){ transform:scale(0.97); box-shadow:0 1px 4px rgba(240,180,41,0.15); }
.ghost-btn:active{ transform:scale(0.97); background:var(--card); }
.icon-btn:active:not(:disabled){ transform:scale(0.9); }
.pill-btn:active{ transform:scale(0.94); }
.seg-chip:active{ transform:scale(0.95); }
.seg-chip.on{ font-weight:600; }
.subtab:active{ transform:scale(0.95); }
.subtab.on{ font-weight:600; }
.set-tab:active{ transform:scale(0.9); }
.type-chip:active{ transform:scale(0.95); }
.type-chip.on{ font-weight:600; }
.quick-chip:active{ transform:scale(0.94); background:var(--card); }
.qf-chip:active{ transform:scale(0.94); }
.units-toggle button:active{ transform:scale(0.95); }
.units-toggle button.on{ font-weight:600; }
.stepper button{ transition: transform .12s cubic-bezier(0.4,0,0.2,1), background-color .15s ease, border-color .15s ease; }
.stepper button:active{ transform:scale(0.88); background:var(--card2); }
.day-row:active{ transform:scale(0.985); border-color:var(--gold); }
.ex-row:active{ transform:scale(0.985); }
.more-row:active{ background:var(--card2); }
.photo-slot:active{ transform:scale(0.97); }
.pill-btn.on{ font-weight:600; }
.nav-btn{ transition: color .15s ease, opacity .12s ease; }
.nav-btn svg{ transition: transform .18s cubic-bezier(0.4,0,0.2,1); }
.nav-btn.active svg{ transform:scale(1.1); }
.nav-btn:active{ opacity:0.5; }
.stat-tile .bar > div, .vol-fill, .macro-bar-fill { transition: width .5s cubic-bezier(0.4,0,0.2,1); }
.gauge-arc{ transition: stroke-dashoffset .6s cubic-bezier(0.4,0,0.2,1); }

/* --- custom slider: filled track + soft glowing thumb --- */
input[type=range]{
  -webkit-appearance:none; appearance:none;
  width:100%; height:6px; border-radius:999px; outline:none; cursor:pointer; margin:4px 0;
}
input[type=range]::-webkit-slider-runnable-track{ height:6px; border-radius:999px; background:transparent; }
input[type=range]::-webkit-slider-thumb{
  -webkit-appearance:none; appearance:none;
  width:20px; height:20px; border-radius:50%; margin-top:-7px;
  background:var(--gold); box-shadow:0 1px 4px rgba(0,0,0,0.45), 0 0 0 5px rgba(240,180,41,0.16);
  cursor:pointer; transition: transform .12s cubic-bezier(0.4,0,0.2,1), box-shadow .15s ease;
}
input[type=range]:active::-webkit-slider-thumb{ transform:scale(1.18); box-shadow:0 1px 6px rgba(0,0,0,0.5), 0 0 0 7px rgba(240,180,41,0.22); }
input[type=range]::-moz-range-track{ height:6px; border-radius:999px; background:#22252c; }
input[type=range]::-moz-range-progress{ height:6px; border-radius:999px; background:var(--gold); }
input[type=range]::-moz-range-thumb{
  width:20px; height:20px; border-radius:50%; border:none;
  background:var(--gold); box-shadow:0 1px 4px rgba(0,0,0,0.45), 0 0 0 5px rgba(240,180,41,0.16);
  cursor:pointer; transition: transform .12s cubic-bezier(0.4,0,0.2,1), box-shadow .15s ease;
}
input[type=range]:active::-moz-range-thumb{ transform:scale(1.18); }
@keyframes prSlideIn{ from{ transform:translateY(-16px); opacity:0; } to{ transform:translateY(0); opacity:1; } }
.pr-banner{ animation: prSlideIn .3s cubic-bezier(0.4,0,0.2,1); }
`;

/* ---------------------------------------------------------------------- */
/*  SMALL SHARED COMPONENTS                                                 */
/* ---------------------------------------------------------------------- */

function Card({ title, sub, children, flush }) {
  return (
    <div className="card">
      {title && <div className="card-hd"><span className="t">{title}</span>{sub && <span className="s">{sub}</span>}</div>}
      <div className="card-bd" style={flush ? { paddingTop: 6 } : undefined}>{children}</div>
    </div>
  );
}

function fmtClock(s) {
  const m = Math.floor(Math.max(0, s) / 60);
  const sec = Math.max(0, s) % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 740;
    o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.start(); o.stop(ctx.currentTime + 0.55);
  } catch { /* audio unavailable */ }
}

function useExerciseDemo(name) {
  const [state, setState] = useState({ status: "loading" });
  useEffect(() => {
    let alive = true;
    setState({ status: "loading" });
    resolveExerciseDemo(name).then((r) => {
      if (!alive) return;
      setState(r.found ? { status: "found", gifUrl: r.gifUrl } : { status: "none" });
    });
    return () => { alive = false; };
  }, [name]);
  return state;
}

// Big demo panel — used at the top of Exercise Detail.
function ExerciseAnimation({ name }) {
  const state = useExerciseDemo(name);
  return (
    <div className="ex-demo">
      {state.status === "found" && (
        <>
          <img src={state.gifUrl} alt={name} />
          <span className="credit">via ExerciseDB</span>
        </>
      )}
      {state.status === "loading" && <span className="label">Loading demo…</span>}
      {state.status === "none" && <Dumbbell size={30} />}
    </div>
  );
}

// Compact circular version — used wherever the old static icon lived (Gym Mode).
function ExerciseAnimationSmall({ name }) {
  const state = useExerciseDemo(name);
  return <div className="art">{state.status === "found" ? <img src={state.gifUrl} alt="" /> : <Dumbbell size={24} />}</div>;
}

function PhotoThumb({ id, onClick }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let alive = true;
    storageGet("photo:" + id).then((v) => { if (alive) setSrc(v); });
    return () => { alive = false; };
  }, [id]);
  if (!src) return <div style={{ width: "100%", height: "100%", background: "#1c1f27" }} />;
  return <img src={src} alt="" onClick={onClick} />;
}

/* circular progress gauge, pure svg */
function Gauge({ pct, size = 56, stroke = 6, color = "var(--gold)", track = "#22252c", children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" className="gauge-arc"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

function Stepper({ label, value, unit, onChange, step = 1, min = 0 }) {
  return (
    <div>
      <div className="field-lbl">{label}{unit ? ` (${unit})` : ""}</div>
      <div className="stepper">
        <button onClick={() => onChange(Math.max(min, (Number(value) || 0) - step))}><Minus size={16} /></button>
        <div className="val">{value === "" || value == null ? "–" : value}</div>
        <button onClick={() => onChange((Number(value) || 0) + step)}><Plus size={16} /></button>
      </div>
    </div>
  );
}

function GothamSkyline({ opacityBuildings = 0.9 }) {
  return (
    <svg viewBox="0 0 400 190" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="skySky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2233" /><stop offset="60%" stopColor="#0e1220" /><stop offset="100%" stopColor="#07080d" />
        </linearGradient>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0b0e" stopOpacity="0" /><stop offset="100%" stopColor="#0a0b0e" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect width="400" height="190" fill="url(#skySky)" />
      <circle cx="330" cy="42" r="20" fill="#f0b429" opacity="0.85" />
      <g opacity={opacityBuildings} fill="#12141b">
        <rect x="0" y="110" width="30" height="80" /><rect x="28" y="90" width="24" height="100" />
        <rect x="54" y="120" width="34" height="70" /><rect x="90" y="70" width="20" height="120" />
        <rect x="112" y="100" width="30" height="90" /><rect x="146" y="60" width="18" height="130" />
        <rect x="166" y="95" width="26" height="95" /><rect x="196" y="80" width="22" height="110" />
        <rect x="222" y="115" width="30" height="75" /><rect x="256" y="65" width="20" height="125" />
        <rect x="280" y="100" width="28" height="90" /><rect x="312" y="85" width="18" height="105" />
        <rect x="334" y="112" width="26" height="78" /><rect x="364" y="92" width="36" height="98" />
      </g>
      <g opacity={opacityBuildings * 0.6} fill="#0a0b10">
        <rect x="10" y="150" width="18" height="40" /><rect x="70" y="140" width="22" height="50" />
        <rect x="150" y="145" width="20" height="45" /><rect x="230" y="150" width="18" height="40" />
        <rect x="300" y="142" width="24" height="48" /><rect x="370" y="148" width="20" height="42" />
      </g>
      <rect width="400" height="190" fill="url(#fade)" />
    </svg>
  );
}

/* ---------------------------------------------------------------------- */
/*  MAIN APP                                                                */
/* ---------------------------------------------------------------------- */

export default function GothamUnbound() {
  const [ready, setReady] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [profile, setProfile] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [photoIndex, setPhotoIndex] = useState([]);
  const [quickFoods, setQuickFoods] = useState([]);
  const [program, setProgram] = useState(null);
  const [prLog, setPrLog] = useState([]);
  const [hydrationAlert, setHydrationAlert] = useState(false);
  const [prBanner, setPrBanner] = useState(null);

  const [tab, setTab] = useState("home");
  const [workoutDay, setWorkoutDay] = useState(null);
  const [exerciseIdx, setExerciseIdx] = useState(null);
  const [gymMode, setGymMode] = useState(false);
  const [progressSubtab, setProgressSubtab] = useState("overview");
  const [showReadiness, setShowReadiness] = useState(false);
  const [restDayPrompt, setRestDayPrompt] = useState(null);

  const [timer, setTimer] = useState(null);
  const [condPlayer, setCondPlayer] = useState(null);
  const timerRef = useRef(null);
  const condRef = useRef(null);
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    (async () => {
      const [s, a, n, p, m, pi, qf, cp, pl] = await Promise.all([
        storageGet("sessions"), storageGet("activeSession"), storageGet("nutrition"),
        storageGet("profile"), storageGet("measurements"), storageGet("photoIndex"), storageGet("quickFoods"),
        storageGet("customProgram"), storageGet("prLog"),
      ]);
      setSessions(Array.isArray(s) ? s : []);
      setActive(a || null);
      setNutrition(n && n.settings ? n : { settings: { reminderEnabled: true, reminderMinutes: 60 }, days: {}, lastHydrationTs: null, snoozeUntil: null });
      setProfile(
        p && p.units ? { proteinGoal: 160, carbsGoal: 260, fatGoal: 70, ...p } : {
          heightIn: null, ageYears: null, goal: "", activity: "", units: "imperial",
          calorieGoal: (n && n.settings && n.settings.calorieGoal) || 2400,
          proteinGoal: 160, carbsGoal: 260, fatGoal: 70,
          waterGoalOz: (n && n.settings && n.settings.hydrationGoal) || 100,
          deload: { active: false, startedAt: null, until: null },
        }
      );
      setMeasurements(Array.isArray(m) ? m : []);
      setPhotoIndex(Array.isArray(pi) ? pi : []);
      setQuickFoods(Array.isArray(qf) ? qf : []);
      setProgram(cp && cp[1] ? cp : JSON.parse(JSON.stringify(DEFAULT_PROGRAM)));
      setPrLog(Array.isArray(pl) ? pl : []);
      setReady(true);
    })();
  }, []);

  const persistSessions = useCallback((next) => { setSessions(next); storageSet("sessions", next); }, []);
  const persistActive = useCallback((next) => { setActive(next); storageSet("activeSession", next); }, []);
  const persistNutrition = useCallback((next) => { setNutrition(next); storageSet("nutrition", next); }, []);
  const persistProfile = useCallback((next) => { setProfile(next); storageSet("profile", next); }, []);
  const persistMeasurements = useCallback((next) => { setMeasurements(next); storageSet("measurements", next); }, []);
  const persistPhotoIndex = useCallback((next) => { setPhotoIndex(next); storageSet("photoIndex", next); }, []);
  const persistQuickFoods = useCallback((next) => { setQuickFoods(next); storageSet("quickFoods", next); }, []);
  const persistProgram = useCallback((next) => { setProgram(next); storageSet("customProgram", next); }, []);
  const persistPrLog = useCallback((next) => { setPrLog(next); storageSet("prLog", next); }, []);

  useEffect(() => {
    if (!timer || !timer.running) return;
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (!t) return t;
        if (t.remaining <= 1) { clearInterval(timerRef.current); beep(); return { ...t, remaining: 0, running: false, done: true }; }
        return { ...t, remaining: t.remaining - 1 };
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timer && timer.running]);
  const startTimer = (label, seconds) => setTimer({ label, total: seconds, remaining: seconds, running: true, done: false });

  useEffect(() => {
    if (!condPlayer || !condPlayer.running) return;
    condRef.current = setInterval(() => {
      setCondPlayer((c) => {
        if (!c) return c;
        if (c.remaining <= 1) {
          beep();
          const nextIdx = c.idx + 1;
          const block = program[5].conditioning[nextIdx];
          if (!block) { clearInterval(condRef.current); return { ...c, remaining: 0, running: false, finished: true }; }
          return { ...c, idx: nextIdx, remaining: block.seconds };
        }
        return { ...c, remaining: c.remaining - 1 };
      });
    }, 1000);
    return () => clearInterval(condRef.current);
  }, [condPlayer && condPlayer.running, condPlayer && condPlayer.idx]);

  useEffect(() => {
    if (!nutrition) return;
    const tick = () => {
      const { reminderEnabled, reminderMinutes } = nutrition.settings;
      if (!reminderEnabled) { setHydrationAlert(false); return; }
      if (nutrition.snoozeUntil && Date.now() < new Date(nutrition.snoozeUntil).getTime()) { setHydrationAlert(false); return; }
      const base = nutrition.lastHydrationTs ? new Date(nutrition.lastHydrationTs).getTime() : mountedAt.current;
      setHydrationAlert((Date.now() - base) / 60000 >= reminderMinutes);
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, [nutrition]);

  useEffect(() => {
    if (!hydrationAlert) return;
    beep();
    try { if (typeof Notification !== "undefined" && Notification.permission === "granted") new Notification("Gotham Unbound", { body: "Hydration check — log some water." }); } catch { /* n/a */ }
  }, [hydrationAlert]);

  useEffect(() => {
    if (!prBanner) return;
    const id = setTimeout(() => setPrBanner(null), 4000);
    return () => clearTimeout(id);
  }, [prBanner]);

  const historyFor = useMemo(() => {
    const map = {};
    sessions.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((s) => {
      Object.entries(s.entries || {}).forEach(([exId, data]) => {
        if (!map[exId]) map[exId] = [];
        map[exId].push({ date: s.date, sets: data.sets });
      });
    });
    return map;
  }, [sessions]);

  const lastWorkingSet = (exId) => {
    const h = historyFor[exId];
    if (!h || !h.length) return null;
    const last = h[h.length - 1];
    const working = last.sets.filter((s) => s.type !== "W");
    return working[working.length - 1] || last.sets[last.sets.length - 1] || null;
  };

  const stagnation = (exId) => {
    const h = historyFor[exId];
    if (!h || h.length < 3) return false;
    const last3 = h.slice(-3).map((s) => s.sets.filter((x) => x.type !== "W" && x.weight != null).reduce((sum, x) => sum + volumeLoad(x.weight, x.reps), 0));
    if (last3.some((v) => v === 0)) return false;
    return last3[0] >= last3[1] && last3[1] >= last3[2];
  };

  const deloadSignal = useMemo(() => {
    const trained = sessions.filter((s) => program[s.dayId] && program[s.dayId].exercises).sort((a, b) => new Date(b.date) - new Date(a.date));
    const last3 = trained.slice(0, 3);
    if (last3.length < 2) return { recommended: false, signals: [] };
    let stagnantCount = 0;
    Object.values(program).forEach((day) => { if (!day.exercises) return; day.exercises.forEach((exDef) => { if (stagnation(exDef.id)) stagnantCount++; }); });
    const withReadiness = last3.filter((s) => s.readiness);
    const avgSoreness = withReadiness.length ? withReadiness.reduce((s, x) => s + x.readiness.soreness, 0) / withReadiness.length : 0;
    const avgSleep = withReadiness.length ? withReadiness.reduce((s, x) => s + x.readiness.sleep, 0) / withReadiness.length : 5;
    let failureCount = 0;
    last3.forEach((s) => Object.values(s.entries || {}).forEach((d) => (d.sets || []).forEach((set) => { if (set.type === "F") failureCount++; })));
    const signals = [];
    if (stagnantCount >= 2) signals.push(`${stagnantCount} exercises have stalled across their last 3 sessions`);
    if (withReadiness.length && avgSoreness >= 4) signals.push("soreness has stayed high going into recent sessions");
    if (withReadiness.length && avgSleep <= 2) signals.push("sleep quality has been poor going into recent sessions");
    if (failureCount >= 5) signals.push("you've been pushing sets to failure often lately");
    return { recommended: signals.length >= 2, signals };
  }, [sessions]);
  const deloadActive = !!(profile && profile.deload && profile.deload.active && profile.deload.until && new Date(profile.deload.until) > new Date());

  /* ---- readiness composite score ---- */
  const todaysReadiness = active && active.dayId === workoutDay ? active.readiness : (sessions.find((s) => dateKey(new Date(s.date)) === dateKey())?.readiness || null);
  const readinessPct = todaysReadiness ? Math.round(((todaysReadiness.sleep + todaysReadiness.energy + (6 - todaysReadiness.soreness)) / 15) * 100) : null;
  const readinessTier = readinessPct == null ? null : readinessPct >= 80 ? "Great" : readinessPct >= 65 ? "Good" : readinessPct >= 45 ? "Fair" : "Low";

  /* ---- navigation helpers ---- */
  const goProgram = () => { setTab("program"); setWorkoutDay(null); setExerciseIdx(null); setGymMode(false); };
  const switchTab = (t) => { setTab(t); setWorkoutDay(null); setExerciseIdx(null); setGymMode(false); };
  const openDay = (dayId) => {
    if (program[dayId].rest) { setRestDayPrompt(dayId); return; }
    if (!active || active.dayId !== dayId) persistActive({ id: uid(), dayId, date: new Date().toISOString(), readiness: null, entries: {} });
    setWorkoutDay(dayId); setExerciseIdx(null);
  };
  const openExercise = (i) => { setExerciseIdx(i); setGymMode(false); };
  const backToWorkout = () => { setExerciseIdx(null); setGymMode(false); };
  const backToProgram = () => { setWorkoutDay(null); setExerciseIdx(null); setGymMode(false); };

  const setReadiness = (readiness) => persistActive({ ...active, readiness });
  const logRestDay = (dayId, readiness) => {
    persistSessions([...sessions, { id: uid(), dayId, date: new Date().toISOString(), readiness, entries: {} }]);
    setRestDayPrompt(null);
  };

  const addSet = (exId, set) => {
    const entries = { ...(active.entries || {}) };
    const cur = entries[exId] || { sets: [] };
    entries[exId] = { sets: [...cur.sets, { id: uid(), ts: new Date().toISOString(), ...set }] };
    persistActive({ ...active, entries });
  };
  const updateSet = (exId, setId, patch) => {
    const entries = { ...(active.entries || {}) };
    const cur = entries[exId] || { sets: [] };
    entries[exId] = { sets: cur.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) };
    persistActive({ ...active, entries });
  };
  const removeSet = (exId, setId) => {
    const entries = { ...(active.entries || {}) };
    const cur = entries[exId] || { sets: [] };
    entries[exId] = { sets: cur.sets.filter((s) => s.id !== setId) };
    persistActive({ ...active, entries });
  };
  const finishWorkout = () => {
    if (!active) return;
    persistSessions([...sessions, active]);
    persistActive(null);
    setTab("home"); setWorkoutDay(null); setExerciseIdx(null); setGymMode(false);
  };
  const discardWorkout = () => { persistActive(null); setWorkoutDay(null); setExerciseIdx(null); setGymMode(false); };

  const logHydration = (oz) => {
    if (!nutrition) return;
    const key = dateKey();
    const days = { ...nutrition.days };
    const day = days[key] || { calories: [], hydration: [] };
    const entry = { id: uid(), oz: Number(oz) || 0, ts: new Date().toISOString() };
    days[key] = { ...day, hydration: [...day.hydration, entry] };
    persistNutrition({ ...nutrition, days, lastHydrationTs: entry.ts, snoozeUntil: null });
    setHydrationAlert(false);
  };
  const removeHydration = (key, id) => {
    const days = { ...nutrition.days };
    const day = days[key]; if (!day) return;
    days[key] = { ...day, hydration: day.hydration.filter((h) => h.id !== id) };
    persistNutrition({ ...nutrition, days });
  };
  const logCalories = ({ name, kcal, protein, carbs, fat, meal, photoId }) => {
    if (!nutrition) return;
    const key = dateKey();
    const days = { ...nutrition.days };
    const day = days[key] || { calories: [], hydration: [] };
    const entry = {
      id: uid(), name: name || "Entry", kcal: Number(kcal) || 0, protein: Number(protein) || 0,
      carbs: Number(carbs) || 0, fat: Number(fat) || 0, meal: meal || suggestMeal(), photoId: photoId || null, ts: new Date().toISOString(),
    };
    days[key] = { ...day, calories: [...day.calories, entry] };
    persistNutrition({ ...nutrition, days });
  };
  const removeCalories = (key, id) => {
    const days = { ...nutrition.days };
    const day = days[key]; if (!day) return;
    days[key] = { ...day, calories: day.calories.filter((c) => c.id !== id) };
    persistNutrition({ ...nutrition, days });
  };
  const updateNutritionSettings = (patch) => persistNutrition({ ...nutrition, settings: { ...nutrition.settings, ...patch } });
  const snoozeHydration = (mins) => { persistNutrition({ ...nutrition, snoozeUntil: new Date(Date.now() + mins * 60000).toISOString() }); setHydrationAlert(false); };

  const updateProfile = (patch) => persistProfile({ ...profile, ...patch });
  const startDeload = () => { const now = new Date(); const until = new Date(now.getTime() + 7 * 86400000); updateProfile({ deload: { active: true, startedAt: now.toISOString(), until: until.toISOString() } }); };
  const endDeload = () => updateProfile({ deload: { active: false, startedAt: null, until: null } });

  const addMeasurement = (entry) => persistMeasurements([...measurements, { id: uid(), date: new Date().toISOString(), ...entry }]);

  const addPhoto = async (angle, dataUrl) => {
    const id = uid();
    await storageSet("photo:" + id, dataUrl);
    persistPhotoIndex([...photoIndex, { id, date: new Date().toISOString(), angle, monthKey: monthKey() }]);
    return id;
  };
  const deletePhoto = async (id) => {
    persistPhotoIndex(photoIndex.filter((p) => p.id !== id));
    try { await window.storage.delete("photo:" + id, false); } catch { /* best effort */ }
  };

  const saveQuickFood = (qf) => persistQuickFoods([...quickFoods, { id: uid(), name: qf.name, kcal: Number(qf.kcal) || 0, protein: Number(qf.protein) || 0, carbs: Number(qf.carbs) || 0, fat: Number(qf.fat) || 0 }]);
  const deleteQuickFood = (id) => persistQuickFoods(quickFoods.filter((q) => q.id !== id));

  /* ---- program editor ---- */
  const updateExercise = (dayId, exId, patch) => {
    const next = JSON.parse(JSON.stringify(program));
    next[dayId].exercises = next[dayId].exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e));
    persistProgram(next);
  };
  const addExerciseToProgram = (dayId, def) => {
    const next = JSON.parse(JSON.stringify(program));
    next[dayId].exercises = [...next[dayId].exercises, { id: "ex_" + uid(), secondary: [], type: "isolation", restSec: 75, ...def }];
    persistProgram(next);
  };
  const removeExerciseFromProgram = (dayId, exId) => {
    const next = JSON.parse(JSON.stringify(program));
    next[dayId].exercises = next[dayId].exercises.filter((e) => e.id !== exId);
    persistProgram(next);
  };
  const moveExercise = (dayId, exId, dir) => {
    const next = JSON.parse(JSON.stringify(program));
    const arr = next[dayId].exercises;
    const i = arr.findIndex((e) => e.id === exId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    persistProgram(next);
  };
  const resetProgram = () => persistProgram(JSON.parse(JSON.stringify(DEFAULT_PROGRAM)));

  /* ---- exercise swap + ad-hoc extras (session-scoped) ---- */
  const setSwap = (exId, swapDef) => persistActive({ ...active, swaps: { ...(active.swaps || {}), [exId]: swapDef } });
  const clearSwap = (exId) => {
    const swaps = { ...(active.swaps || {}) };
    delete swaps[exId];
    persistActive({ ...active, swaps });
  };
  const addExtra = (def) => {
    const extra = { id: "extra_" + uid(), secondary: [], type: "isolation", restSec: 75, timeBased: false, amrap: false, ...def };
    persistActive({ ...active, extras: [...(active.extras || []), extra] });
  };
  const removeExtra = (exId) => persistActive({ ...active, extras: (active.extras || []).filter((e) => e.id !== exId) });

  /* ---- PR detection ---- */
  const bestEver = (exId, timeBased) => {
    const h = historyFor[exId];
    if (!h || !h.length) return null;
    let best = null;
    h.forEach((session) => session.sets.forEach((s) => {
      if (s.type === "W") return;
      const val = timeBased ? Number(s.seconds) || 0 : epley1RM(s.weight, s.reps);
      if (val && (best === null || val > best)) best = val;
    }));
    return best;
  };
  const recordPR = (exerciseName, value, unit) => {
    persistPrLog([{ id: uid(), exerciseName, value: Math.round(value * 10) / 10, unit, date: new Date().toISOString() }, ...prLog].slice(0, 100));
    setPrBanner({ exerciseName, value: Math.round(value * 10) / 10, unit });
  };

  const exportData = async () => {
    const photos = {};
    for (const p of photoIndex) { try { photos[p.id] = await storageGet("photo:" + p.id); } catch { /* skip missing */ } }
    const blob = { exportedAt: new Date().toISOString(), version: 1, sessions, nutrition, profile, measurements, photoIndex, quickFoods, program, prLog, photos };
    const url = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blob));
    const a = document.createElement("a");
    a.href = url; a.download = `gotham-unbound-export-${dateKey()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const importData = async (data) => {
    if (Array.isArray(data.sessions)) persistSessions(data.sessions);
    if (data.nutrition && data.nutrition.settings) persistNutrition(data.nutrition);
    if (data.profile && data.profile.units) persistProfile({ proteinGoal: 160, carbsGoal: 260, fatGoal: 70, ...data.profile });
    if (Array.isArray(data.measurements)) persistMeasurements(data.measurements);
    if (Array.isArray(data.photoIndex)) persistPhotoIndex(data.photoIndex);
    if (Array.isArray(data.quickFoods)) persistQuickFoods(data.quickFoods);
    if (data.program && data.program[1]) persistProgram(data.program);
    if (Array.isArray(data.prLog)) persistPrLog(data.prLog);
    if (data.photos && typeof data.photos === "object") {
      for (const [id, dataUrl] of Object.entries(data.photos)) { if (dataUrl) await storageSet("photo:" + id, dataUrl); }
    }
    persistActive(null);
  };

  if (!ready) {
    return (
      <div className="gu-root">
        <style>{CSS}</style>
        <div style={{ padding: 60, textAlign: "center", color: "var(--dim)", fontSize: 12, letterSpacing: "0.06em" }}>LOADING LOGBOOK…</div>
      </div>
    );
  }

  const day = workoutDay ? program[workoutDay] : null;
  const combinedExercises = day ? [...day.exercises, ...(active?.extras || [])] : [];
  const exDef = exerciseIdx != null ? applySwap(combinedExercises[exerciseIdx], active?.swaps) : null;

  return (
    <div className="gu-root">
      <style>{CSS}</style>

      {hydrationAlert && (
        <div className="alert-banner" style={{ margin: "0 16px 0", borderRadius: 0, background: "var(--gold-soft)", borderColor: "var(--gold)", color: "var(--gold)" }}>
          <Droplet size={14} />
          <div style={{ flex: 1 }}>Hydration check — log some water.</div>
          <button className="pill-btn" style={{ padding: "5px 10px" }} onClick={() => switchTab("nutrition")}>OPEN</button>
          <button className="pill-btn" style={{ padding: "5px 10px" }} onClick={() => snoozeHydration(15)}>SNOOZE</button>
        </div>
      )}

      {tab === "program" && workoutDay && exerciseIdx != null && exDef && !gymMode && (
        <ExerciseDetailView
          exDef={exDef} day={day} active={active}
          addSet={(set) => addSet(exDef.id, set)}
          updateSet={(setId, patch) => updateSet(exDef.id, setId, patch)}
          removeSet={(setId) => removeSet(exDef.id, setId)}
          lastSet={lastWorkingSet(exDef.id)} flagged={stagnation(exDef.id)}
          startTimer={startTimer} timer={timer} setTimer={setTimer}
          exerciseIdx={exerciseIdx} setExerciseIdx={setExerciseIdx} exerciseCount={combinedExercises.length}
          onBack={backToWorkout} onEnterGym={() => setGymMode(true)}
          isExtra={exerciseIdx >= day.exercises.length} onRemoveExtra={() => { removeExtra(exDef.id); backToWorkout(); }}
          onSwap={(def) => setSwap(exDef.id, def)} onClearSwap={() => clearSwap(exDef.id)}
          bestEver={bestEver} onPR={recordPR}
        />
      )}
      {tab === "program" && workoutDay && exerciseIdx != null && exDef && gymMode && (
        <GymModeView exDef={exDef} active={active} addSet={(set) => addSet(exDef.id, set)}
          lastSet={lastWorkingSet(exDef.id)} startTimer={startTimer} timer={timer} setTimer={setTimer}
          day={day} exerciseIdx={exerciseIdx} setExerciseIdx={setExerciseIdx} exerciseCount={combinedExercises.length} onExit={() => setGymMode(false)}
          bestEver={bestEver} onPR={recordPR} />
      )}
      {!(workoutDay && exerciseIdx != null) && (
        <>
          <div className="topbar" style={{ display: tab === "home" ? "none" : "flex" }}>
            {workoutDay ? (
              <>
                <button className="icon-btn" onClick={backToProgram}><ChevronLeft size={18} /></button>
                <span className="t">{day.rest ? "Recovery" : day.name}</span>
                <span style={{ width: 32 }} />
              </>
            ) : (
              <>
                <span className="t">
                  {tab === "program" && "Program"}
                  {tab === "progress" && "Progress"}
                  {tab === "nutrition" && "Nutrition"}
                  {tab === "more" && "More"}
                </span>
                <div className="side">
                  {tab === "nutrition" && <Bell size={18} />}
                </div>
              </>
            )}
          </div>

          <div className="gu-body">
            {tab === "home" && (
              <HomeView
                active={active} openDay={openDay} sessions={sessions} measurements={measurements} photoIndex={photoIndex}
                deloadSignal={deloadSignal} deloadActive={deloadActive} startDeload={startDeload} endDeload={endDeload}
                setTab={setTab} profile={profile} nutrition={nutrition} program={program}
                readinessPct={readinessPct} readinessTier={readinessTier} onTapReadiness={() => setShowReadiness(true)}
              />
            )}
            {tab === "program" && !workoutDay && <ProgramView sessions={sessions} active={active} openDay={openDay} program={program} />}
            {tab === "program" && workoutDay && exerciseIdx == null && (
              <WorkoutView day={day} dayId={workoutDay} active={active} onStart={() => setExerciseIdx(0)} onOpenExercise={openExercise}
                finishWorkout={finishWorkout} discardWorkout={discardWorkout}
                condPlayer={condPlayer} setCondPlayer={setCondPlayer} deloadActive={deloadActive} onOpenReadiness={() => setShowReadiness(true)}
                addExtra={addExtra} />
            )}
            {tab === "progress" && (
              <ProgressView
                subtab={progressSubtab} setSubtab={setProgressSubtab} sessions={sessions} active={active}
                measurements={measurements} addMeasurement={addMeasurement} photoIndex={photoIndex} addPhoto={addPhoto} deletePhoto={deletePhoto} profile={profile}
                program={program} prLog={prLog}
              />
            )}
            {tab === "nutrition" && nutrition && profile && (
              <NutritionView
                nutrition={nutrition} profile={profile} updateProfile={updateProfile} logHydration={logHydration} removeHydration={removeHydration}
                logCalories={logCalories} removeCalories={removeCalories} updateNutritionSettings={updateNutritionSettings}
                quickFoods={quickFoods} saveQuickFood={saveQuickFood} deleteQuickFood={deleteQuickFood} addPhoto={addPhoto}
              />
            )}
            {tab === "more" && profile && (
              <MoreView profile={profile} updateProfile={updateProfile} nutrition={nutrition} updateNutritionSettings={updateNutritionSettings}
                sessions={sessions} measurements={measurements} photoIndex={photoIndex} exportData={exportData} importData={importData}
                program={program} updateExercise={updateExercise} addExerciseToProgram={addExerciseToProgram}
                removeExerciseFromProgram={removeExerciseFromProgram} moveExercise={moveExercise} resetProgram={resetProgram} />
            )}
          </div>

          <div className="bottom-nav">
            <button className={`nav-btn ${tab === "home" ? "active" : ""}`} onClick={() => switchTab("home")}><HomeIcon size={19} /> Home</button>
            <button className={`nav-btn ${tab === "program" ? "active" : ""}`} onClick={goProgram}><Dumbbell size={19} /> Program</button>
            <button className={`nav-btn ${tab === "progress" ? "active" : ""}`} onClick={() => switchTab("progress")}><TrendingUpIcon size={19} /> Progress</button>
            <button className={`nav-btn ${tab === "nutrition" ? "active" : ""}`} onClick={() => switchTab("nutrition")}>
              {hydrationAlert && <span className="nav-dot" />}<Utensils size={19} /> Nutrition
            </button>
            <button className={`nav-btn ${tab === "more" ? "active" : ""}`} onClick={() => switchTab("more")}><MoreHorizontal size={19} /> More</button>
          </div>
        </>
      )}

      {showReadiness && (
        <ReadinessModal
          initial={todaysReadiness}
          onClose={() => setShowReadiness(false)}
          onSave={(r) => {
            if (active) setReadiness(r);
            else persistSessions([...sessions.filter((s) => dateKey(new Date(s.date)) !== dateKey()), { id: uid(), dayId: 0, date: new Date().toISOString(), readiness: r, entries: {} }]);
            setShowReadiness(false);
          }}
        />
      )}

      {restDayPrompt && <RestDayModal dayId={restDayPrompt} onSave={(r) => logRestDay(restDayPrompt, r)} onClose={() => setRestDayPrompt(null)} />}

      {timer && !workoutDay && (
        <div className="alert-banner" style={{ position: "fixed", bottom: 84, left: 8, right: 8, borderRadius: 16, background: "var(--card)", borderColor: "var(--line)", color: "var(--text)", alignItems: "center", zIndex: 60 }}>
          <span style={{ flex: 1 }}>Rest — {timer.label}: <b style={{ color: "var(--gold)" }}>{fmtClock(timer.remaining)}</b></span>
          <button className="icon-btn" onClick={() => setTimer(null)}><X size={14} /></button>
        </div>
      )}

      {prBanner && (
        <div className="pr-banner" style={{ position: "fixed", top: 14, left: 8, right: 8, maxWidth: 464, margin: "0 auto", zIndex: 95, background: "linear-gradient(135deg, var(--gold), #d99a1f)", borderRadius: 16, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 8px 24px rgba(240,180,41,0.35)" }} onClick={() => setPrBanner(null)}>
          <Trophy size={22} color="#161005" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#161005", letterSpacing: "0.03em" }}>NEW PR!</div>
            <div style={{ fontSize: 12, color: "#3a2c08" }}>{prBanner.exerciseName} — {prBanner.value} {prBanner.unit}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReadinessModal({ initial, onSave, onClose }) {
  const [v, setV] = useState(initial || { sleep: 3, soreness: 3, energy: 3 });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(4,4,6,0.7)", zIndex: 90, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div className="card" style={{ width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "20px 20px 0 0" }} onClick={(e) => e.stopPropagation()}>
        <div className="card-hd"><span className="t">Today's Readiness</span></div>
        <div className="card-bd">
          <SliderRow label="Sleep Quality" val={v.sleep} onChange={(x) => setV((s) => ({ ...s, sleep: x }))} />
          <SliderRow label="Muscle Soreness" val={v.soreness} onChange={(x) => setV((s) => ({ ...s, soreness: x }))} />
          <SliderRow label="Energy Level" val={v.energy} onChange={(x) => setV((s) => ({ ...s, energy: x }))} />
          <button className="gold-btn" onClick={() => onSave(v)}><Check size={16} /> SAVE</button>
        </div>
      </div>
    </div>
  );
}
function SliderRow({ label, val, onChange }) {
  const pct = ((val - 1) / 4) * 100;
  return (
    <div className="slider-row">
      <div className="lbl"><span>{label}</span><b>{val} / 5</b></div>
      <input
        type="range" min={1} max={5} value={val}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(to right, var(--gold) ${pct}%, #22252c ${pct}%)` }}
      />
    </div>
  );
}
function RestDayModal({ dayId, onSave, onClose }) {
  const [v, setV] = useState({ sleep: 3, soreness: 3, energy: 3 });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(4,4,6,0.7)", zIndex: 90, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div className="card" style={{ width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "20px 20px 0 0" }} onClick={(e) => e.stopPropagation()}>
        <div className="card-hd"><span className="t">Recovery Day</span></div>
        <div className="card-bd">
          <p style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 0 }}>A walk, mobility work, and sleep. Log how you're feeling to keep the record complete.</p>
          <SliderRow label="Sleep Quality" val={v.sleep} onChange={(x) => setV((s) => ({ ...s, sleep: x }))} />
          <SliderRow label="Muscle Soreness" val={v.soreness} onChange={(x) => setV((s) => ({ ...s, soreness: x }))} />
          <SliderRow label="Energy Level" val={v.energy} onChange={(x) => setV((s) => ({ ...s, energy: x }))} />
          <button className="gold-btn" onClick={() => onSave(v)}><Check size={16} /> SAVE</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  SMALL BAT MARK (decorative, used on program/workout rows)               */
/* ---------------------------------------------------------------------- */

function BatIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 3c.6 1.6 1.7 2.8 3.2 3.4 1.8-1 3.6-1.1 5.3-.3-1 1.3-1.5 2.6-1.5 4 1.7.3 3 1.1 3.9 2.5-1.9.4-3.3 1.1-4.3 2.2.6 1.4.6 2.8 0 4.2-1.4-.8-2.8-1.1-4.2-.9-.6 1.1-1.4 1.9-2.4 2.4-1-.5-1.8-1.3-2.4-2.4-1.4-.2-2.8.1-4.2.9-.6-1.4-.6-2.8 0-4.2-1-1.1-2.4-1.8-4.3-2.2.9-1.4 2.2-2.2 3.9-2.5 0-1.4-.5-2.7-1.5-4 1.7-.8 3.5-.7 5.3.3C10.3 5.8 11.4 4.6 12 3z" />
    </svg>
  );
}

/* ---------------------------------------------------------------------- */
/*  HOME                                                                    */
/* ---------------------------------------------------------------------- */

function HomeView({ active, openDay, sessions, deloadSignal, deloadActive, startDeload, endDeload, setTab, profile, nutrition, program, readinessPct, readinessTier, onTapReadiness }) {
  const scheduledId = ((new Date().getDay() + 6) % 7) + 1;
  const todayProgram = program[scheduledId];
  const todayKey = dateKey();
  const alreadyDone = sessions.some((s) => dateKey(new Date(s.date)) === todayKey && s.dayId === scheduledId);

  const today = nutrition.days[todayKey] || { calories: [], hydration: [] };
  const totalKcal = today.calories.reduce((s, c) => s + (Number(c.kcal) || 0), 0);
  const totalProtein = today.calories.reduce((s, c) => s + (Number(c.protein) || 0), 0);
  const totalOz = today.hydration.reduce((s, h) => s + (Number(h.oz) || 0), 0);
  const units = profile.units;
  const waterDisp = fmtWaterTotal(totalOz, units);
  const waterGoalDisp = fmtWaterTotal(profile.waterGoalOz, units);

  return (
    <>
      <div className="hero">
        <GothamSkyline />
        <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between" }}>
          <div className="icon-btn" style={{ background: "rgba(20,22,28,0.55)" }}><Menu size={16} /></div>
          <button className="icon-btn" style={{ background: "rgba(20,22,28,0.55)" }} onClick={() => switchTab("more")}><Bell size={16} /></button>
        </div>
        <div className="label">
          <div className="brand">GOTHAM UNBOUND</div>
          <div className="tag">DISCIPLINE BUILDS FREEDOM</div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        {deloadActive && (
          <div className="deload-active">
            <span><ShieldAlert size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} /> Deload week active — reduce sets ~30–40%, RIR 3–4.</span>
            <button className="icon-btn" onClick={endDeload}><X size={13} /></button>
          </div>
        )}
        {!deloadActive && deloadSignal.recommended && (
          <div className="deload-banner">
            <div className="hd"><ShieldAlert size={15} /> RECOVERY PROTOCOL</div>
            <div style={{ fontSize: 12, color: "#f0d8d5", marginBottom: 4 }}>Performance has declined across multiple sessions:</div>
            <ul>{deloadSignal.signals.map((s, i) => <li key={i}>{s}</li>)}</ul>
            <div style={{ fontSize: 11.5, color: "#d9a9a4", marginBottom: 10 }}>Suggested: reduce working sets by 30–40% this week, keep 3–4 RIR.</div>
            <button className="gold-btn" onClick={startDeload}><ShieldAlert size={15} /> Start Deload</button>
          </div>
        )}

        <div className="today-card">
          <div className="lbl">TODAY'S WORKOUT</div>
          <div className="row">
            <div>
              <div className="nm">{todayProgram.rest ? "Recovery Day" : todayProgram.focus}</div>
              <div className="sub">Day {scheduledId} of 5{!todayProgram.rest ? ` · ${todayProgram.exercises.length} exercises` : ""}</div>
            </div>
            <ChevronRight size={18} color="var(--dim)" />
          </div>
          <button className="gold-btn" style={{ marginTop: 12 }} onClick={() => openDay(scheduledId)}>
            <Play size={15} />
            {alreadyDone ? "VIEW WORKOUT" : active && active.dayId === scheduledId ? "CONTINUE WORKOUT" : todayProgram.rest ? "LOG RECOVERY" : "START WORKOUT"}
          </button>
        </div>

        <div className="stat-grid-2">
          <div className="stat-tile readiness" onClick={onTapReadiness} style={{ cursor: "pointer" }}>
            <Gauge pct={readinessPct || 0} size={48} stroke={5} color={readinessPct >= 65 ? "var(--green)" : readinessPct >= 45 ? "var(--gold)" : "var(--red)"}>
              <span style={{ fontSize: 11, fontWeight: 700 }}>{readinessPct != null ? `${readinessPct}%` : "–"}</span>
            </Gauge>
            <div>
              <div className="lbl">READINESS</div>
              <div className="big" style={{ fontSize: 14 }}>{readinessTier || "Log now"}</div>
            </div>
          </div>
          <div className="stat-tile">
            <div className="lbl">CALORIES</div>
            <div className="big">{totalKcal.toLocaleString()} <span style={{ fontSize: 12, color: "var(--dim)" }}>/ {profile.calorieGoal.toLocaleString()}</span></div>
            <div className="bar"><div style={{ width: `${Math.min(100, (totalKcal / profile.calorieGoal) * 100)}%`, background: "var(--gold)" }} /></div>
          </div>
          <div className="stat-tile">
            <div className="lbl">PROTEIN</div>
            <div className="big">{totalProtein} <span style={{ fontSize: 12, color: "var(--dim)" }}>/ {profile.proteinGoal} g</span></div>
            <div className="bar"><div style={{ width: `${Math.min(100, (totalProtein / profile.proteinGoal) * 100)}%`, background: "var(--green)" }} /></div>
          </div>
          <div className="stat-tile">
            <div className="lbl">WATER</div>
            <div className="big">{waterDisp.value} <span style={{ fontSize: 12, color: "var(--dim)" }}>/ {waterGoalDisp.value} {waterDisp.unit}</span></div>
            <div className="bar"><div style={{ width: `${Math.min(100, (totalOz / profile.waterGoalOz) * 100)}%`, background: "var(--blue)" }} /></div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------- */
/*  PROGRAM                                                                 */
/* ---------------------------------------------------------------------- */

function ProgramView({ sessions, openDay, program }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const WEEK_TABS = [{ o: 0, l: "This Week" }, { o: -1, l: "Last Week" }, { o: -2, l: "2 Wks Ago" }, { o: -3, l: "3 Wks Ago" }];

  const start = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + weekOffset * 7);
    return d;
  }, [weekOffset]);
  const todayKey = dateKey();

  const rows = [1, 2, 3, 4, 5, 6, 7].map((dayId) => {
    const d = new Date(start); d.setDate(d.getDate() + (dayId - 1));
    const k = dateKey(d);
    const prog = program[dayId];
    const has = sessions.some((s) => dateKey(new Date(s.date)) === k);
    let status = "upcoming";
    if (has) status = "done";
    else if (k === todayKey) status = "today";
    else if (k < todayKey && !prog.rest) status = "missed";
    else if (k < todayKey && prog.rest) status = "done";
    return { dayId, date: d, prog, status };
  });

  return (
    <>
      <div className="subtabs">
        {WEEK_TABS.map((w) => <button key={w.o} className={`subtab ${weekOffset === w.o ? "on" : ""}`} onClick={() => setWeekOffset(w.o)}>{w.l}</button>)}
      </div>
      {rows.map((r) => (
        <div key={r.dayId} className={`day-row ${r.status === "today" ? "today" : ""}`} style={{ cursor: weekOffset === 0 ? "pointer" : "default" }} onClick={() => weekOffset === 0 && openDay(r.dayId)}>
          <div className="icon-circle"><BatIcon size={18} color="var(--gold)" /></div>
          <div className="info">
            <div className="nm">{r.date.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase()} · {r.prog.focus}</div>
            <div className={`status ${r.status}`}>
              {r.status === "done" && <><Check size={12} /> Completed</>}
              {r.status === "today" && "Today"}
              {r.status === "missed" && "Missed"}
              {r.status === "upcoming" && (r.prog.rest ? "Rest / Active Recovery" : "Upcoming")}
            </div>
          </div>
          {weekOffset === 0 && <ChevronRight size={16} color="var(--dim)" />}
        </div>
      ))}
    </>
  );
}

/* ---------------------------------------------------------------------- */
/*  WORKOUT (exercise list for a day)                                       */
/* ---------------------------------------------------------------------- */

function WorkoutView({ day, dayId, active, onStart, onOpenExercise, finishWorkout, discardWorkout, condPlayer, setCondPlayer, deloadActive, onOpenReadiness, addExtra }) {
  const entries = active?.entries || {};
  const extras = active?.extras || [];
  const combined = [...day.exercises, ...extras].map((e) => applySwap(e, active?.swaps));
  const doneCount = combined.filter((e) => (entries[e.id]?.sets || []).some((s) => s.type !== "W")).length;
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [extraForm, setExtraForm] = useState({ name: "", primary: "Chest", sets: 3, repLo: 8, repHi: 12 });

  const submitExtra = () => {
    if (!extraForm.name.trim()) return;
    addExtra({ name: extraForm.name.trim(), primary: extraForm.primary, sets: Number(extraForm.sets) || 3, repRange: [Number(extraForm.repLo) || 8, Number(extraForm.repHi) || 12], type: "isolation" });
    setExtraForm({ name: "", primary: "Chest", sets: 3, repLo: 8, repHi: 12 });
    setShowAddExtra(false);
  };

  return (
    <>
      <div className="ex-hero">
        <div className="art"><BatIcon size={26} /></div>
        <div>
          <div className="nm">{day.name}</div>
          <div className="sub">Day {dayId} of 5 · {combined.length} exercise{combined.length === 1 ? "" : "s"}</div>
        </div>
      </div>

      {deloadActive && (
        <div className="alert-banner" style={{ background: "var(--gold-soft)", borderColor: "var(--gold)", color: "var(--gold)" }}>
          <ShieldAlert size={14} /> Deload week — aim for ~60% of prescribed sets, RIR 3–4.
        </div>
      )}
      {!active?.readiness && (
        <button className="ghost-btn" style={{ marginBottom: 12 }} onClick={onOpenReadiness}>Log pre-workout readiness</button>
      )}

      {combined.map((exDef, i) => {
        const sets = entries[exDef.id]?.sets || [];
        const workingCount = sets.filter((s) => s.type !== "W").length;
        const complete = workingCount >= exDef.sets;
        const isExtra = i >= day.exercises.length;
        return (
          <div key={exDef.id} className="ex-row" onClick={() => onOpenExercise(i)}>
            <div className="idx">{isExtra ? <Plus size={13} /> : i + 1}</div>
            <div className="info">
              <div className="nm">{exDef.name}{exDef.swapped && <span className="pill" style={{ marginLeft: 6 }}>swapped</span>}</div>
              <div className="sub">{exDef.sets} × {exDef.amrap ? "AMRAP" : exDef.timeBased ? `${exDef.repRange[0]}–${exDef.repRange[1]}s` : `${exDef.repRange[0]}–${exDef.repRange[1]}`}{isExtra ? " · extra" : ""}</div>
            </div>
            <div className={`badge ${complete ? "done" : ""}`}>{workingCount}/{exDef.sets} sets</div>
          </div>
        );
      })}

      {showAddExtra ? (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-bd">
            <input className="gu-input" style={{ textAlign: "left", padding: 10, marginBottom: 8 }} placeholder="Exercise name" value={extraForm.name} onChange={(e) => setExtraForm((f) => ({ ...f, name: e.target.value }))} />
            <div className="field-lbl">PRIMARY MUSCLE</div>
            <select className="rir-select" style={{ marginBottom: 10 }} value={extraForm.primary} onChange={(e) => setExtraForm((f) => ({ ...f, primary: e.target.value }))}>
              {Object.entries(MUSCLES).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
            </select>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <div style={{ flex: 1 }}><div className="field-lbl">SETS</div><input className="gu-input" type="number" value={extraForm.sets} onChange={(e) => setExtraForm((f) => ({ ...f, sets: e.target.value }))} /></div>
              <div style={{ flex: 1 }}><div className="field-lbl">REPS LOW</div><input className="gu-input" type="number" value={extraForm.repLo} onChange={(e) => setExtraForm((f) => ({ ...f, repLo: e.target.value }))} /></div>
              <div style={{ flex: 1 }}><div className="field-lbl">REPS HIGH</div><input className="gu-input" type="number" value={extraForm.repHi} onChange={(e) => setExtraForm((f) => ({ ...f, repHi: e.target.value }))} /></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ghost-btn" onClick={() => setShowAddExtra(false)}>Cancel</button>
              <button className="gold-btn" onClick={submitExtra}><Plus size={16} /> Add</button>
            </div>
          </div>
        </div>
      ) : (
        <button className="ghost-btn" style={{ marginBottom: 12 }} onClick={() => setShowAddExtra(true)}><Plus size={14} /> Add Extra Exercise</button>
      )}

      {day.finisher && <Card title="Finisher" sub="cardio"><p style={{ fontSize: 13, color: "var(--dim)", margin: 0 }}>{day.finisher}</p></Card>}
      {day.conditioning && <ConditioningPanel condPlayer={condPlayer} setCondPlayer={setCondPlayer} blocks={day.conditioning} />}

      {doneCount > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button className="ghost-btn" onClick={discardWorkout}><RotateCcw size={14} /> Discard</button>
          <button className="ghost-btn" onClick={finishWorkout}><Check size={14} /> Finish</button>
        </div>
      )}
      <button className="gold-btn" onClick={onStart}><Play size={16} /> {doneCount > 0 ? "CONTINUE WORKOUT" : "START WORKOUT"}</button>
    </>
  );
}

function ConditioningPanel({ condPlayer, setCondPlayer, blocks }) {
  const activeP = !!condPlayer;
  const current = activeP ? blocks[condPlayer.idx] : blocks[0];
  const remaining = activeP ? condPlayer.remaining : current.seconds;
  return (
    <Card title="Batman Conditioning" sub={`${blocks.length} blocks`}>
      <div style={{ textAlign: "center", padding: "4px 0 14px" }}>
        <div style={{ fontSize: 11, color: "var(--dim)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{condPlayer?.finished ? "Protocol Complete" : current.label}</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: "var(--gold)" }}>{fmtClock(remaining)}</div>
        <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 4 }}>Block {activeP ? condPlayer.idx + 1 : 1} of {blocks.length}</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {!activeP && <button className="gold-btn" onClick={() => setCondPlayer({ idx: 0, remaining: blocks[0].seconds, running: true })}><Play size={14} /> Start Protocol</button>}
        {activeP && !condPlayer.finished && (
          <>
            <button className="ghost-btn" onClick={() => setCondPlayer((c) => ({ ...c, running: !c.running }))}>{condPlayer.running ? <Pause size={14} /> : <Play size={14} />} {condPlayer.running ? "Pause" : "Resume"}</button>
            <button className="ghost-btn" onClick={() => setCondPlayer(null)}><RotateCcw size={14} /> Reset</button>
          </>
        )}
        {condPlayer?.finished && <button className="ghost-btn" onClick={() => setCondPlayer(null)}><RotateCcw size={14} /> Run Again</button>}
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------------- */
/*  EXERCISE DETAIL                                                         */
/* ---------------------------------------------------------------------- */

function useSetDraft(exDef, sets, lastSet) {
  const [selIdx, setSelIdx] = useState(sets.length < exDef.sets ? sets.length : Math.max(0, sets.length - 1));
  const [draft, setDraft] = useState(null);
  useEffect(() => {
    if (sets[selIdx]) setDraft({ ...sets[selIdx] });
    else {
      // Prefer the set just logged THIS session (most relevant); fall back to last time this exercise was trained.
      const l = sets.length ? sets[sets.length - 1] : lastSet;
      const isFirstOfSession = sets.length === 0;
      const defaultType = isFirstOfSession && (exDef.type === "heavy" || exDef.type === "compound") && !exDef.timeBased && !exDef.amrap ? "W" : "T";
      setDraft({
        type: defaultType,
        weight: l && !exDef.timeBased ? l.weight : "",
        reps: exDef.timeBased ? "" : l ? l.reps : "",
        seconds: exDef.timeBased ? (l ? l.seconds : "") : undefined,
        rir: l ? l.rir : "",
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selIdx, exDef.id, sets.length]);
  return [selIdx, setSelIdx, draft, setDraft];
}

function ExerciseDetailView({ exDef, day, active, addSet, updateSet, removeSet, lastSet, flagged, startTimer, timer, setTimer, exerciseIdx, setExerciseIdx, exerciseCount, onBack, onEnterGym, isExtra, onRemoveExtra, onSwap, onClearSwap, bestEver, onPR }) {
  const sets = active.entries[exDef.id]?.sets || [];
  const [selIdx, setSelIdx, draft, setDraft] = useSetDraft(exDef, sets, lastSet);
  const [showPlates, setShowPlates] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [swapForm, setSwapForm] = useState({ name: "", primary: exDef.primary });
  if (!draft) return null;

  const tabCount = Math.max(exDef.sets, sets.length + 1);
  const isLogged = !!sets[selIdx];
  const patch = (p) => setDraft((d) => ({ ...d, ...p }));

  const handleLog = () => {
    if (isLogged) { updateSet(sets[selIdx].id, draft); return; }
    if (draft.type !== "W" && bestEver) {
      const sessionVals = sets.filter((s) => s.type !== "W").map((s) => (exDef.timeBased ? Number(s.seconds) || 0 : epley1RM(s.weight, s.reps)));
      const historicalBest = bestEver(exDef.id, exDef.timeBased);
      const prevBest = Math.max(historicalBest || 0, ...sessionVals, 0) || null;
      const newVal = exDef.timeBased ? Number(draft.seconds) || 0 : epley1RM(draft.weight, draft.reps);
      if (prevBest && newVal > prevBest) onPR(exDef.name, newVal, exDef.timeBased ? "sec" : "e1RM lb");
    }
    addSet(draft);
    startTimer(exDef.name, exDef.restSec);
    setSelIdx(selIdx + 1);
  };
  const handleDelete = () => { removeSet(sets[selIdx].id); setSelIdx(Math.max(0, selIdx - 1)); };
  const submitSwap = () => {
    if (!swapForm.name.trim()) return;
    onSwap({ name: swapForm.name.trim(), primary: swapForm.primary });
    setShowSwap(false);
  };

  const canPrev = exerciseIdx > 0;
  const canNext = exerciseIdx < exerciseCount - 1;

  return (
    <div className="gu-body" style={{ paddingTop: 16 }}>
      <div className="topbar" style={{ padding: "0 0 12px" }}>
        <button className="icon-btn" onClick={onBack}><ChevronLeft size={18} /></button>
        <span className="t" style={{ fontSize: 14 }}>Exercise Detail</span>
        {isExtra ? (
          <button className="icon-btn" onClick={onRemoveExtra} title="Remove this extra exercise"><X size={16} /></button>
        ) : (
          <button className="icon-btn" onClick={() => setShowSwap((s) => !s)} title="Swap exercise"><ArrowLeftRight size={15} /></button>
        )}
      </div>

      <ExerciseAnimation name={exDef.name} />
      <div className="ex-hero" style={{ marginBottom: 14 }}>
        <div>
          <div className="nm">{exDef.name}</div>
          <div className="sub">{MUSCLES[exDef.primary]?.label} · {exDef.sets} × {exDef.amrap ? "AMRAP" : exDef.timeBased ? `${exDef.repRange[0]}–${exDef.repRange[1]}s` : `${exDef.repRange[0]}–${exDef.repRange[1]}`}</div>
        </div>
      </div>

      {exDef.swapped && (
        <div className="alert-banner" style={{ background: "var(--gold-soft)", borderColor: "var(--gold)", color: "var(--gold)" }}>
          <ArrowLeftRight size={14} /> Swapped in for {exDef.originalName} today.
          <button className="pill-btn" style={{ marginLeft: "auto", padding: "4px 9px" }} onClick={onClearSwap}>Revert</button>
        </div>
      )}
      {showSwap && !isExtra && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-bd">
            <div className="field-lbl">SWAP IN A DIFFERENT EXERCISE FOR TODAY</div>
            <input className="gu-input" style={{ textAlign: "left", padding: 10, marginBottom: 8 }} placeholder="e.g. Smith Machine Bench Press" value={swapForm.name} onChange={(e) => setSwapForm((f) => ({ ...f, name: e.target.value }))} />
            <select className="rir-select" style={{ marginBottom: 10 }} value={swapForm.primary} onChange={(e) => setSwapForm((f) => ({ ...f, primary: e.target.value }))}>
              {Object.entries(MUSCLES).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ghost-btn" onClick={() => setShowSwap(false)}>Cancel</button>
              <button className="gold-btn" onClick={submitSwap}><ArrowLeftRight size={15} /> Swap</button>
            </div>
          </div>
        </div>
      )}

      {flagged && <div className="alert-banner"><AlertTriangle size={14} /> Volume load has flatlined here across your last 3 sessions — consider a variation swap or a deload.</div>}
      {lastSet && (
        <div style={{ fontSize: 11.5, color: "var(--dim)", marginBottom: 14 }}>
          LAST TIME: {exDef.timeBased ? `${lastSet.seconds}s` : `${lastSet.weight || 0}×${lastSet.reps || 0}`}
          {lastSet.rir !== "" && lastSet.rir != null && ` @RIR${lastSet.rir}`}
        </div>
      )}

      <div className="field-lbl" style={{ marginBottom: 8 }}>SET</div>
      <div className="set-tabs">
        {Array.from({ length: tabCount }).map((_, i) => (
          <button key={i} className={`set-tab ${i === selIdx ? "on" : sets[i] ? "logged" : ""}`} onClick={() => setSelIdx(i)}>{i + 1}</button>
        ))}
      </div>

      {exDef.timeBased ? (
        <Stepper label="Duration" unit="sec" value={draft.seconds} step={5} onChange={(v) => patch({ seconds: v })} />
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: -4 }}>
            <div style={{ flex: 1 }}><Stepper label="Weight" unit="lb" value={draft.weight} step={2.5} onChange={(v) => patch({ weight: v })} /></div>
            <button className="icon-btn" style={{ marginTop: 18 }} onClick={() => setShowPlates((s) => !s)} title="Plate calculator"><Ruler size={15} /></button>
          </div>
          {showPlates && <PlateMini target={draft.weight} />}
          <Stepper label="Reps" value={draft.reps} step={1} onChange={(v) => patch({ reps: v })} />
          <Stepper label="RIR" value={draft.rir} step={1} min={0} onChange={(v) => patch({ rir: Math.min(4, v) })} />
        </>
      )}

      <div className="field-lbl">SET TYPE</div>
      <div className="type-row">
        {SET_TYPES.map((t) => <button key={t.key} className={`type-chip ${draft.type === t.key ? "on " + t.key : ""}`} onClick={() => patch({ type: t.key })}>{t.label}</button>)}
      </div>

      <div className="field-lbl">NOTES (OPTIONAL)</div>
      <input className="notes-input" placeholder="Add notes…" value={draft.notes || ""} onChange={(e) => patch({ notes: e.target.value })} />

      <div style={{ display: "flex", gap: 8 }}>
        {isLogged && <button className="icon-btn" style={{ width: 48 }} onClick={handleDelete}><X size={16} /></button>}
        <button className="gold-btn" onClick={handleLog}><Check size={16} /> {isLogged ? "UPDATE SET" : "LOG SET"}</button>
      </div>

      {timer && (
        <div className="rest-bar">
          <TimerIconIndicator done={timer.done} />
          <div>
            <div className="lbl">REST TIMER</div>
            <div className="clock">{fmtClock(timer.remaining)}</div>
          </div>
          <div className="spacer" />
          <button className="ctrl" onClick={() => setTimer((t) => ({ ...t, running: !t.running }))}>{timer.running ? <Pause size={16} /> : <Play size={16} />}</button>
        </div>
      )}

      <div className="exdetail-nav">
        <button disabled={!canPrev} style={{ opacity: canPrev ? 1 : 0.3 }} onClick={() => setExerciseIdx(exerciseIdx - 1)}><ChevronLeft size={14} /> Previous</button>
        <button className="gym" onClick={onEnterGym}>Gym Mode</button>
        <button disabled={!canNext} style={{ opacity: canNext ? 1 : 0.3 }} onClick={() => setExerciseIdx(exerciseIdx + 1)}>Next <ChevronRight size={14} /></button>
      </div>
    </div>
  );
}

function TimerIconIndicator({ done }) {
  return (
    <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--card)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: done ? "var(--green)" : "var(--gold)" }}>
      <Play size={14} style={{ opacity: 0 }} />
    </div>
  );
}

function PlateMini({ target }) {
  const t = Number(target) || 0;
  const bar = 45;
  let side = Math.max(0, (t - bar) / 2);
  const used = [];
  PLATES.forEach((p) => {
    const count = Math.floor(side / p + 1e-6);
    if (count > 0) { used.push({ p, count }); side = Math.round((side - count * p) * 100) / 100; }
  });
  return (
    <div style={{ background: "var(--card2)", border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px", marginBottom: 16, fontSize: 11.5, color: "var(--dim)" }}>
      {used.length === 0 ? "Bar only (45 lb)." : (
        <>Per side: {used.map((u) => `${u.count}×${u.p}`).join(" + ")} <span style={{ color: "var(--dim2)" }}>(45 lb bar)</span></>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  GYM MODE (fullscreen focus variant)                                     */
/* ---------------------------------------------------------------------- */

function GymModeView({ exDef, active, addSet, lastSet, startTimer, timer, setTimer, day, exerciseIdx, setExerciseIdx, exerciseCount, onExit, bestEver, onPR }) {
  const sets = active.entries[exDef.id]?.sets || [];
  const [selIdx, setSelIdx, draft, setDraft] = useSetDraft(exDef, sets, lastSet);
  if (!draft) return null;
  const patch = (p) => setDraft((d) => ({ ...d, ...p }));
  const isLogged = !!sets[selIdx];
  const setsDoneCount = sets.filter((s) => s.type !== "W").length;

  const handleLog = () => {
    if (isLogged) return;
    if (draft.type !== "W" && bestEver) {
      const sessionVals = sets.filter((s) => s.type !== "W").map((s) => (exDef.timeBased ? Number(s.seconds) || 0 : epley1RM(s.weight, s.reps)));
      const historicalBest = bestEver(exDef.id, exDef.timeBased);
      const prevBest = Math.max(historicalBest || 0, ...sessionVals, 0) || null;
      const newVal = exDef.timeBased ? Number(draft.seconds) || 0 : epley1RM(draft.weight, draft.reps);
      if (prevBest && newVal > prevBest) onPR(exDef.name, newVal, exDef.timeBased ? "sec" : "e1RM lb");
    }
    addSet(draft);
    startTimer(exDef.name, exDef.restSec);
    setSelIdx(selIdx + 1);
  };
  const pct = timer ? Math.round((1 - timer.remaining / timer.total) * 100) : 0;

  return (
    <div className="gym-wrap">
      <style>{CSS}</style>
      <div className="topbar" style={{ padding: "0 0 14px" }}>
        <button className="icon-btn" onClick={onExit}><ChevronLeft size={18} /></button>
        <span className="t" style={{ fontSize: 15 }}>Gym Mode</span>
        <span style={{ width: 32 }} />
      </div>

      <div className="ex-hero">
        <ExerciseAnimationSmall name={exDef.name} />
        <div>
          <div className="nm">{exDef.name}</div>
          <div className="sub">{MUSCLES[exDef.primary]?.label} · {setsDoneCount} × {sets[sets.length - 1] && !exDef.timeBased ? sets[sets.length - 1].reps : exDef.sets}</div>
        </div>
      </div>

      <div className="gym-dial">
        <Gauge pct={timer ? 100 - pct : 0} size={96} stroke={7} color="var(--gold)">
          <div style={{ textAlign: "center" }}><Dumbbell size={22} color="var(--gold)" /></div>
        </Gauge>
      </div>

      {exDef.timeBased ? (
        <Stepper label="Duration" unit="sec" value={draft.seconds} step={5} onChange={(v) => patch({ seconds: v })} />
      ) : (
        <>
          <Stepper label="Weight" unit="kg" value={draft.weight} step={2.5} onChange={(v) => patch({ weight: v })} />
          <Stepper label="Reps" value={draft.reps} step={1} onChange={(v) => patch({ reps: v })} />
          <Stepper label="RIR" value={draft.rir} step={1} min={0} onChange={(v) => patch({ rir: Math.min(4, v) })} />
        </>
      )}

      <div className="field-lbl">SET TYPE</div>
      <div className="type-row">
        {SET_TYPES.map((t) => <button key={t.key} className={`type-chip ${draft.type === t.key ? "on " + t.key : ""}`} onClick={() => patch({ type: t.key })}>{t.label}</button>)}
      </div>

      <button className="gold-btn" onClick={handleLog} disabled={isLogged}><Check size={16} /> {isLogged ? "SET LOGGED" : "COMPLETE SET"}</button>

      {timer && (
        <div className="rest-bar">
          <TimerIconIndicator done={timer.done} />
          <div><div className="lbl">REST TIMER</div><div className="clock">{fmtClock(timer.remaining)}</div></div>
          <div className="spacer" />
          <button className="ctrl" onClick={() => setTimer((t) => ({ ...t, running: !t.running }))}>{timer.running ? <Pause size={16} /> : <Play size={16} />}</button>
        </div>
      )}

      {exerciseIdx < exerciseCount - 1 && (
        <button className="ghost-btn" style={{ marginTop: 14 }} onClick={() => setExerciseIdx(exerciseIdx + 1)}>
          Next exercise <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  PROGRESS — Overview (calendar) / Strength / Volume / Body               */
/* ---------------------------------------------------------------------- */

function volumeForSessions(sessionList, program) {
  const totals = {};
  Object.keys(MUSCLES).forEach((m) => (totals[m] = 0));
  sessionList.forEach((s) => {
    const day = program[s.dayId];
    if (!day || !day.exercises) return;
    Object.entries(s.entries || {}).forEach(([exId, data]) => {
      const exDef = day.exercises.find((e) => e.id === exId);
      if (!exDef) return;
      (data.sets || []).forEach((set) => {
        const st = SET_TYPES.find((t) => t.key === set.type) || SET_TYPES[1];
        if (st.credit === 0) return;
        totals[exDef.primary] = (totals[exDef.primary] || 0) + st.credit;
        (exDef.secondary || []).forEach((m2) => { totals[m2] = (totals[m2] || 0) + st.credit * 0.5; });
      });
    });
  });
  return totals;
}

function DayDetail({ dateStr, sessions, program }) {
  const d = keyToDate(dateStr);
  const scheduledId = ((d.getDay() + 6) % 7) + 1;
  const scheduled = program[scheduledId];
  const daySessions = sessions.filter((s) => dateKey(new Date(s.date)) === dateStr);
  const dur = (s) => {
    const all = Object.values(s.entries || {}).flatMap((d2) => (d2.sets || []).map((x) => x.ts).filter(Boolean));
    if (all.length < 2) return null;
    const sorted = all.map((t) => new Date(t).getTime()).sort((a, b) => a - b);
    return fmtDuration((sorted[sorted.length - 1] - sorted[0]) / 60000);
  };
  return (
    <div className="day-summary">
      <div className="icon-circle"><BatIcon size={18} color="var(--gold)" /></div>
      <div className="info">
        <div className="d">{d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</div>
        {!daySessions.length ? (
          <div className="nm" style={{ color: "var(--dim)" }}>Nothing logged · scheduled: {scheduled.name}</div>
        ) : daySessions.map((s) => {
          const day = program[s.dayId];
          const setCount = Object.values(s.entries || {}).reduce((n, d2) => n + (d2.sets || []).length, 0);
          const d2 = dur(s);
          return (
            <div key={s.id} style={{ marginBottom: 4 }}>
              <div className="nm">{day.name}</div>
              <div className="sub">{day.exercises ? `${day.exercises.length} exercises` : "Recovery"}{setCount ? ` · ${setCount} sets` : ""}{d2 ? ` · ${d2}` : ""}</div>
            </div>
          );
        })}
      </div>
      <ChevronRight size={16} color="var(--dim)" />
    </div>
  );
}

function CalendarPanel({ sessions, program }) {
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; });
  const [selectedDate, setSelectedDate] = useState(dateKey());

  const year = calMonth.getFullYear(), month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = dateKey(new Date());

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const statusFor = (date) => {
    const k = dateKey(date);
    const scheduledId = ((date.getDay() + 6) % 7) + 1;
    const scheduled = program[scheduledId];
    const has = sessions.some((s) => dateKey(new Date(s.date)) === k);
    if (has) return "done";
    if (scheduled.rest) return "rest";
    if (k < todayKey) return "missed";
    return "";
  };

  return (
    <Card title="Training Calendar">
      <div className="period-nav" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <button className="icon-btn" onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}><ChevronLeft size={14} /></button>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{calMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
        <button className="icon-btn" onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}><ChevronRight size={14} /></button>
      </div>
      <div className="cal-grid">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i} className="cal-dow">{d}</div>)}
        {cells.map((date, i) =>
          date ? (
            <button key={i} className={`cal-cell ${statusFor(date)} ${dateKey(date) === selectedDate ? "sel" : ""} ${dateKey(date) === todayKey ? "today" : ""}`}
              onClick={() => setSelectedDate(dateKey(date))}>
              {date.getDate()}
              <span className="dot" />
            </button>
          ) : <div key={i} />
        )}
      </div>
      <div className="cal-legend">
        <span><i className="dot done" /> Workout</span>
        <span><i className="dot missed" /> Missed</span>
        <span><i className="dot rest" /> Rest</span>
      </div>
      {selectedDate && <DayDetail dateStr={selectedDate} sessions={sessions} program={program} />}
    </Card>
  );
}

function StrengthTab({ sessions, program, prLog }) {
  const rows = useMemo(() => {
    const byExercise = {};
    sessions.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((s) => {
      const day = program[s.dayId];
      if (!day || !day.exercises) return;
      Object.entries(s.entries || {}).forEach(([exId, data]) => {
        const exDef = day.exercises.find((e) => e.id === exId);
        if (!exDef || exDef.timeBased) return;
        const working = (data.sets || []).filter((x) => x.type !== "W" && x.weight);
        if (!working.length) return;
        const best = working.reduce((a, b) => (epley1RM(b.weight, b.reps) > epley1RM(a.weight, a.reps) ? b : a));
        if (!byExercise[exId]) byExercise[exId] = { name: exDef.name, entries: [] };
        byExercise[exId].entries.push({ date: s.date, weight: best.weight, reps: best.reps });
      });
    });
    return Object.values(byExercise)
      .map((e) => {
        const first = e.entries[0], last = e.entries[e.entries.length - 1];
        const firstRM = epley1RM(first.weight, first.reps), lastRM = epley1RM(last.weight, last.reps);
        const pct = firstRM ? ((lastRM - firstRM) / firstRM) * 100 : 0;
        return { name: e.name, weight: last.weight, reps: last.reps, pct, sessions: e.entries.length };
      })
      .filter((e) => e.sessions >= 2)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 6);
  }, [sessions]);

  return (
    <Card title="Strength" sub="est. 1RM change">
      {!rows.length && <div style={{ fontSize: 12, color: "var(--dim)" }}>Log the same exercise across a few sessions to see trends here.</div>}
      {rows.map((r) => (
        <div className="strength-row" key={r.name}>
          <div className="icon-circle" style={{ background: "var(--card2)", color: "var(--gold)", width: 34, height: 34 }}><Dumbbell size={15} /></div>
          <div className="info"><div className="nm">{r.name}</div><div className="sub">{r.weight} lb × {r.reps}</div></div>
          <div className={`pct ${r.pct > 1 ? "up" : r.pct < -1 ? "down" : "flat"}`}>
            {r.pct > 1 && <TrendingUpIcon size={14} />}{r.pct < -1 && <Minus size={14} />}
            {r.pct > 0 ? "+" : ""}{r.pct.toFixed(1)}%
          </div>
        </div>
      ))}
    </Card>
  );
}

function VolumeTab({ sessions, program }) {
  const totals = useMemo(() => volumeForSessions(sessions.filter((s) => { const wk = isoWeek(new Date(s.date)); return wk === isoWeek(new Date()); }), program), [sessions, program]);
  return (
    <Card title="Muscle Workload" sub="this week vs target">
      {Object.entries(MUSCLES).map(([key, m]) => {
        const val = Math.round((totals[key] || 0) * 10) / 10;
        const pct = Math.min(100, (val / m.max) * 100);
        const minPct = (m.min / m.max) * 100;
        const status = val < m.min ? "under" : val > m.max ? "over" : "";
        return (
          <div className="vol-row" key={key}>
            <div className="top"><span className="name">{m.label}</span><span className="num">{val} / {m.min}–{m.max}</span></div>
            <div className="vol-track"><div className={`vol-fill ${status}`} style={{ width: `${pct}%` }} /><div className="vol-band" style={{ left: `${minPct}%` }} /></div>
          </div>
        );
      })}
    </Card>
  );
}

function BodyTab({ measurements, addMeasurement, photoIndex, addPhoto, deletePhoto, profile }) {
  const units = profile.units;
  const [form, setForm] = useState({});
  const submit = () => {
    if (!Object.values(form).some((v) => v !== "" && v != null)) return;
    const clean = {};
    MEASURE_FIELDS.forEach(({ key, kind }) => {
      const raw = form[key];
      if (raw === "" || raw == null) return;
      clean[key] = kind === "weight" ? parseWeightInput(raw, units) : kind === "length" ? parseLengthInput(raw, units) : Number(raw);
    });
    addMeasurement(clean);
    setForm({});
  };
  const sorted = measurements.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const weightSeries = sorted.filter((m) => m.weight != null).slice(-12).map((m) => ({ date: new Date(m.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }), kg: Math.round(fmtWeight(m.weight, units) * 10) / 10 }));
  const latestW = weightSeries[weightSeries.length - 1];
  const prevW = weightSeries[weightSeries.length - 2];

  return (
    <>
      {weightSeries.length >= 2 && (
        <Card title="Weight" sub={weightUnitLabel(units)}>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{latestW.kg} <span style={{ fontSize: 13, color: "var(--dim)", fontWeight: 400 }}>{weightUnitLabel(units)}</span></div>
          {prevW && <div style={{ fontSize: 12, color: latestW.kg < prevW.kg ? "var(--green)" : latestW.kg > prevW.kg ? "var(--red)" : "var(--dim)", marginBottom: 8 }}>
            {latestW.kg < prevW.kg ? "↓" : latestW.kg > prevW.kg ? "↑" : "→"} {Math.abs(Math.round((latestW.kg - prevW.kg) * 10) / 10)} {weightUnitLabel(units)} since last log
          </div>}
          <div style={{ height: 140, marginTop: 6 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightSeries} margin={{ top: 6, right: 6, left: -24, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#8b8d97" }} axisLine={false} tickLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#8b8d97" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ background: "#191c23", border: "1px solid #262932", borderRadius: 10, fontSize: 11 }} />
                <Line type="monotone" dataKey="kg" stroke="#f0b429" strokeWidth={2} dot={{ r: 2.5, fill: "#f0b429" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card title="Body Measurements" sub={units === "metric" ? "kg / cm" : "lb / in"}>
        <div className="measure-grid">
          {MEASURE_FIELDS.map(({ key, label, kind }) => (
            <div className="cell" key={key}>
              <label>{label}{kind === "weight" ? ` (${weightUnitLabel(units)})` : kind === "length" ? ` (${lengthUnitLabel(units)})` : " %"}</label>
              <input className="gu-input" type="number" value={form[key] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <button className="gold-btn" onClick={submit}><Plus size={16} /> Log Measurements</button>
        {sorted.length > 0 && (
          <div style={{ marginTop: 14 }}>
            {MEASURE_FIELDS.map(({ key, label, kind }) => {
              const entries = sorted.filter((m) => m[key] != null);
              if (!entries.length) return null;
              const latest = entries[entries.length - 1], prev = entries[entries.length - 2];
              const fmt = (v) => (kind === "weight" ? fmtWeight(v, units) : kind === "length" ? fmtLength(v, units) : v);
              const trend = prev ? (latest[key] > prev[key] ? "up" : latest[key] < prev[key] ? "down" : "flat") : null;
              return (
                <div className="measure-row" key={key}>
                  <div className="info">{label}</div>
                  <div className="val">{fmt(latest[key])}{kind === "pct" ? "%" : ""}</div>
                  {trend && <span className={`trend ${trend}`}>{trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}</span>}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <PhotosPanel photoIndex={photoIndex} addPhoto={addPhoto} deletePhoto={deletePhoto} />
    </>
  );
}

function PhotosPanel({ photoIndex, addPhoto, deletePhoto }) {
  const inputRef = useRef(null);
  const [pendingAngle, setPendingAngle] = useState(null);
  const [busy, setBusy] = useState(false);
  const mk = monthKey();
  const thisMonth = ANGLES.map((a) => {
    const list = photoIndex.filter((p) => p.angle === a && p.monthKey === mk).sort((x, y) => new Date(y.date) - new Date(x.date));
    return { angle: a, entry: list[0] || null };
  });
  const openPicker = (angle) => { setPendingAngle(angle); inputRef.current?.click(); };
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !pendingAngle) return;
    setBusy(true);
    try { await addPhoto(pendingAngle, await fileToCompressedDataUrl(file)); } finally { setBusy(false); setPendingAngle(null); }
  };
  const [compareAngle, setCompareAngle] = useState("front");
  const compareList = photoIndex.filter((p) => p.angle === compareAngle).sort((a, b) => new Date(a.date) - new Date(b.date));
  const [leftId, setLeftId] = useState(""); const [rightId, setRightId] = useState("");
  const leftPick = leftId || compareList[0]?.id || "";
  const rightPick = rightId || compareList[compareList.length - 1]?.id || "";

  return (
    <Card title="Progress Photos" sub={new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={onFile} />
      <div className="photo-slots">
        {thisMonth.map(({ angle, entry }) => (
          <div className="photo-slot" key={angle} onClick={() => !entry && openPicker(angle)}>
            {entry ? (<><PhotoThumb id={entry.id} /><button className="del-btn" onClick={(e) => { e.stopPropagation(); deletePhoto(entry.id); }}><X size={11} /></button></>)
              : <div className="add-lbl"><Camera size={16} /><div style={{ marginTop: 4 }}>ADD<br />{angle.toUpperCase()}</div></div>}
            <div className="angle-lbl">{angle.toUpperCase()}</div>
          </div>
        ))}
      </div>
      {busy && <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 10 }}>Processing photo…</div>}
      <div className="field-lbl">COMPARE</div>
      <div className="chip-row" style={{ marginBottom: 10 }}>
        {ANGLES.map((a) => <button key={a} className={`seg-chip ${compareAngle === a ? "on" : ""}`} onClick={() => { setCompareAngle(a); setLeftId(""); setRightId(""); }}>{a.toUpperCase()}</button>)}
      </div>
      {compareList.length < 2 ? <div style={{ fontSize: 12, color: "var(--dim)" }}>Add two {compareAngle} photos, in different months, to compare.</div> : (
        <div className="compare-row">
          <div className="compare-col">
            <select className="rir-select" value={leftPick} onChange={(e) => setLeftId(e.target.value)}>{compareList.map((p) => <option key={p.id} value={p.id}>{new Date(p.date).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</option>)}</select>
            {leftPick && <PhotoThumb id={leftPick} />}
          </div>
          <div className="compare-col">
            <select className="rir-select" value={rightPick} onChange={(e) => setRightId(e.target.value)}>{compareList.map((p) => <option key={p.id} value={p.id}>{new Date(p.date).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</option>)}</select>
            {rightPick && <PhotoThumb id={rightPick} />}
          </div>
        </div>
      )}
    </Card>
  );
}

function ProgressView({ subtab, setSubtab, sessions, active, measurements, addMeasurement, photoIndex, addPhoto, deletePhoto, profile, program, prLog }) {
  const pool = active ? [...sessions, active] : sessions;
  return (
    <>
      <div className="subtabs">
        {["overview", "strength", "volume", "body"].map((t) => (
          <button key={t} className={`subtab ${subtab === t ? "on" : ""}`} onClick={() => setSubtab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      {subtab === "overview" && <CalendarPanel sessions={pool} program={program} />}
      {subtab === "strength" && <StrengthTab sessions={pool} program={program} prLog={prLog} />}
      {subtab === "volume" && <VolumeTab sessions={pool} program={program} />}
      {subtab === "body" && <BodyTab measurements={measurements} addMeasurement={addMeasurement} photoIndex={photoIndex} addPhoto={addPhoto} deletePhoto={deletePhoto} profile={profile} />}
    </>
  );
}

/* ---------------------------------------------------------------------- */
/*  NUTRITION                                                               */
/* ---------------------------------------------------------------------- */

const MACROS = [
  { key: "protein", label: "Protein", color: "var(--green)", goalKey: "proteinGoal" },
  { key: "carbs", label: "Carbs", color: "var(--blue)", goalKey: "carbsGoal" },
  { key: "fat", label: "Fats", color: "var(--gold)", goalKey: "fatGoal" },
];

function NutritionView({ nutrition, profile, updateProfile, logHydration, removeHydration, logCalories, removeCalories, updateNutritionSettings, quickFoods, saveQuickFood, deleteQuickFood, addPhoto }) {
  const [range, setRange] = useState("today");
  const key = dateKey();
  const today = nutrition.days[key] || { calories: [], hydration: [] };
  const totalKcal = today.calories.reduce((s, c) => s + (Number(c.kcal) || 0), 0);
  const totals = { protein: today.calories.reduce((s, c) => s + (Number(c.protein) || 0), 0), carbs: today.calories.reduce((s, c) => s + (Number(c.carbs) || 0), 0), fat: today.calories.reduce((s, c) => s + (Number(c.fat) || 0), 0) };
  const totalOz = today.hydration.reduce((s, h) => s + (Number(h.oz) || 0), 0);
  const units = profile.units;

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", kcal: "", protein: "", carbs: "", fat: "", meal: suggestMeal(), photoId: null });
  const fileRef = useRef(null);

  const submitMeal = () => {
    if (!form.kcal) return;
    logCalories(form);
    setForm({ name: "", kcal: "", protein: "", carbs: "", fat: "", meal: suggestMeal(), photoId: null });
    setShowAdd(false);
  };
  const attachPhoto = async (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    const dataUrl = await fileToCompressedDataUrl(file, 500, 0.7);
    const id = uid();
    await storageSet("photo:" + id, dataUrl);
    setForm((f) => ({ ...f, photoId: id }));
  };

  const grouped = MEAL_ORDER.map((m) => ({ meal: m, entries: today.calories.filter((c) => (c.meal || "snack") === m) })).filter((g) => g.entries.length);

  /* week/month rollups */
  const rollup = useMemo(() => {
    if (range === "today") return null;
    const now = new Date();
    const start = range === "week" ? new Date(now.getTime() - 6 * 86400000) : new Date(now.getFullYear(), now.getMonth(), 1);
    let days = 0, kc = 0, pr = 0, ca = 0, ft = 0, oz = 0;
    Object.entries(nutrition.days).forEach(([k, rec]) => {
      const d = keyToDate(k);
      if (d < start || d > now) return;
      const hasCal = (rec.calories || []).length, hasHy = (rec.hydration || []).length;
      if (hasCal || hasHy) days++;
      kc += (rec.calories || []).reduce((s, c) => s + (Number(c.kcal) || 0), 0);
      pr += (rec.calories || []).reduce((s, c) => s + (Number(c.protein) || 0), 0);
      ca += (rec.calories || []).reduce((s, c) => s + (Number(c.carbs) || 0), 0);
      ft += (rec.calories || []).reduce((s, c) => s + (Number(c.fat) || 0), 0);
      oz += (rec.hydration || []).reduce((s, h) => s + (Number(h.oz) || 0), 0);
    });
    const n = Math.max(1, days);
    return { days, kcal: Math.round(kc / n), protein: Math.round(pr / n), carbs: Math.round(ca / n), fat: Math.round(ft / n), oz: Math.round(oz / n) };
  }, [range, nutrition.days]);

  const pct = Math.min(100, (totalKcal / profile.calorieGoal) * 100);

  return (
    <>
      <div className="subtabs">
        {["today", "week", "custom"].map((r) => <button key={r} className={`subtab ${range === r ? "on" : ""}`} onClick={() => setRange(r)}>{r[0].toUpperCase() + r.slice(1)}</button>)}
      </div>

      {range === "today" ? (
        <>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Gauge pct={pct} size={80} stroke={8} color={totalKcal > profile.calorieGoal ? "var(--red)" : "var(--gold)"}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{totalKcal.toLocaleString()}</div>
                  <div style={{ fontSize: 9, color: "var(--dim)" }}>kcal of {profile.calorieGoal.toLocaleString()}</div>
                </div>
              </Gauge>
              <div style={{ flex: 1 }}>
                {MACROS.map((m) => {
                  const cur = totals[m.key], goal = profile[m.goalKey];
                  return (
                    <div className="macro-dot-row" key={m.key}>
                      <span className="macro-dot" style={{ background: m.color }} />
                      <span className="lbl">{m.label}</span>
                      <span className="val">{cur} / {goal} g</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card title="Hydration" sub="today">
            <div className="stat-grid-2" style={{ marginBottom: 8, gridTemplateColumns: "1fr" }}>
              <div className="stat-tile">
                <div className="lbl">WATER</div>
                <div className="big">{fmtWaterTotal(totalOz, units).value} <span style={{ fontSize: 12, color: "var(--dim)" }}>/ {fmtWaterTotal(profile.waterGoalOz, units).value} {fmtWaterTotal(totalOz, units).unit}</span></div>
                <div className="bar"><div style={{ width: `${Math.min(100, (totalOz / profile.waterGoalOz) * 100)}%`, background: "var(--blue)" }} /></div>
              </div>
            </div>
            <div className="quick-row">
              {(units === "metric" ? [250, 350, 500, 750] : [8, 16, 20, 24, 32]).map((amt) => (
                <button key={amt} className="quick-chip" onClick={() => logHydration(units === "metric" ? mlToOz(amt) : amt)}>+{amt}{units === "metric" ? "mL" : "oz"}</button>
              ))}
            </div>
            {today.hydration.slice().reverse().slice(0, 4).map((h) => {
              const d = fmtWaterDisplay(h.oz, units);
              return <div className="entry-row" key={h.id} style={{ padding: "5px 0" }}><span>{d.value} {d.unit}</span><span style={{ color: "var(--dim)" }}>{fmtHM(h.ts)}</span><button className="icon-btn" style={{ width: 22, height: 22 }} onClick={() => removeHydration(key, h.id)}><X size={11} /></button></div>;
            })}
          </Card>

          <Card title="Meals" flush>
            {quickFoods.length > 0 && (
              <div className="qf-row" style={{ marginBottom: 12 }}>
                {quickFoods.map((qf) => (
                  <button key={qf.id} className="qf-chip" onClick={() => logCalories({ name: qf.name, kcal: qf.kcal, protein: qf.protein, carbs: qf.carbs, fat: qf.fat, meal: suggestMeal() })}>
                    <Bookmark size={10} style={{ verticalAlign: "-1px", marginRight: 4 }} />{qf.name}
                  </button>
                ))}
              </div>
            )}
            {grouped.map(({ meal: m, entries }) => (
              <div className="meal-group" key={m}>
                <div className="mg-hd"><span>{MEAL_LABELS[m]}</span><span>{entries.reduce((s, c) => s + c.kcal, 0)} kcal · {entries.reduce((s, c) => s + c.protein, 0)}g protein</span></div>
                {entries.map((c) => (
                  <div className="meal-card" key={c.id}>
                    <div className="thumb">{c.photoId ? <PhotoThumb id={c.photoId} /> : <Utensils size={16} />}</div>
                    <div className="info"><div className="nm">{c.name}</div><div className="sub">{c.kcal} kcal · {c.protein}g protein</div></div>
                    <button className="icon-btn" onClick={() => removeCalories(key, c.id)}><X size={13} /></button>
                  </div>
                ))}
              </div>
            ))}
            {!grouped.length && <div style={{ fontSize: 12, color: "var(--dim)", padding: "4px 2px 10px" }}>Nothing logged yet today.</div>}

            {showAdd ? (
              <div style={{ borderTop: "1px solid var(--line)", marginTop: 6, paddingTop: 14 }}>
                <div className="chip-row" style={{ marginBottom: 10 }}>
                  {MEAL_ORDER.map((m) => <button key={m} className={`seg-chip ${form.meal === m ? "on" : ""}`} onClick={() => setForm((f) => ({ ...f, meal: m }))}>{MEAL_LABELS[m]}</button>)}
                </div>
                <input className="gu-input" style={{ textAlign: "left", padding: 10, marginBottom: 8 }} placeholder="What'd you eat?" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <input className="gu-input" type="number" placeholder="kcal" value={form.kcal} onChange={(e) => setForm((f) => ({ ...f, kcal: e.target.value }))} />
                  <input className="gu-input" type="number" placeholder="protein g" value={form.protein} onChange={(e) => setForm((f) => ({ ...f, protein: e.target.value }))} />
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <input className="gu-input" type="number" placeholder="carbs g" value={form.carbs} onChange={(e) => setForm((f) => ({ ...f, carbs: e.target.value }))} />
                  <input className="gu-input" type="number" placeholder="fat g" value={form.fat} onChange={(e) => setForm((f) => ({ ...f, fat: e.target.value }))} />
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={attachPhoto} />
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button className="ghost-btn" onClick={() => fileRef.current?.click()}><Camera size={14} /> {form.photoId ? "Photo added" : "Add photo"}</button>
                  <button className="ghost-btn" onClick={() => { if (form.name && form.kcal) saveQuickFood(form); }}><Bookmark size={14} /> Save as quick food</button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="ghost-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button className="gold-btn" onClick={submitMeal}><Plus size={16} /> Log Meal</button>
                </div>
              </div>
            ) : (
              <button className="gold-btn" onClick={() => setShowAdd(true)}><Plus size={16} /> ADD MEAL</button>
            )}
          </Card>
        </>
      ) : (
        <Card title={range === "week" ? "Last 7 Days" : "This Month"} sub={`${rollup.days} day(s) logged`}>
          <div className="stat-grid-2">
            <div className="stat-tile"><div className="lbl">AVG CALORIES</div><div className="big">{rollup.kcal}</div></div>
            <div className="stat-tile"><div className="lbl">AVG PROTEIN</div><div className="big">{rollup.protein}g</div></div>
            <div className="stat-tile"><div className="lbl">AVG CARBS</div><div className="big">{rollup.carbs}g</div></div>
            <div className="stat-tile"><div className="lbl">AVG FAT</div><div className="big">{rollup.fat}g</div></div>
          </div>
          <div className="stat-tile" style={{ marginTop: 4 }}><div className="lbl">AVG WATER</div><div className="big">{fmtWaterTotal(rollup.oz, units).value} {fmtWaterTotal(rollup.oz, units).unit}</div></div>
        </Card>
      )}
    </>
  );
}

/* ---------------------------------------------------------------------- */
/*  MORE                                                                    */
/* ---------------------------------------------------------------------- */

function MoreRow({ icon, name, sub, onClick, open }) {
  return (
    <div className="more-row" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="icon-circle">{icon}</div>
      <div className="info"><div className="nm">{name}</div><div className="sub">{sub}</div></div>
      <ChevronRight size={15} color="var(--dim)" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
    </div>
  );
}

function ProgramEditor({ program, updateExercise, addExerciseToProgram, removeExerciseFromProgram, moveExercise, resetProgram }) {
  const [dayId, setDayId] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", primary: "Chest", sets: 3, repLo: 8, repHi: 12, restSec: 90 });
  const [confirmReset, setConfirmReset] = useState(false);
  const day = program[dayId];

  const submitAdd = () => {
    if (!addForm.name.trim()) return;
    addExerciseToProgram(dayId, {
      name: addForm.name.trim(), primary: addForm.primary,
      sets: Number(addForm.sets) || 3, repRange: [Number(addForm.repLo) || 8, Number(addForm.repHi) || 12],
      restSec: Number(addForm.restSec) || 90,
    });
    setAddForm({ name: "", primary: "Chest", sets: 3, repLo: 8, repHi: 12, restSec: 90 });
    setShowAdd(false);
  };

  return (
    <div>
      <div className="chip-row" style={{ marginBottom: 14 }}>
        {[1, 2, 3, 4, 5].map((d) => <button key={d} className={`seg-chip ${dayId === d ? "on" : ""}`} onClick={() => setDayId(d)}>Day {d}</button>)}
      </div>
      {day.exercises.map((ex, i) => (
        <div key={ex.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 12, marginBottom: 8 }}>
          <input className="gu-input" style={{ textAlign: "left", padding: 8, marginBottom: 8 }} value={ex.name} onChange={(e) => updateExercise(dayId, ex.id, { name: e.target.value })} />
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <div style={{ flex: 1 }}><div className="field-lbl">SETS</div><input className="gu-input" type="number" value={ex.sets} onChange={(e) => updateExercise(dayId, ex.id, { sets: Number(e.target.value) || 1 })} /></div>
            <div style={{ flex: 1 }}><div className="field-lbl">REST (SEC)</div><input className="gu-input" type="number" value={ex.restSec} onChange={(e) => updateExercise(dayId, ex.id, { restSec: Number(e.target.value) || 60 })} /></div>
          </div>
          {!ex.timeBased && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <div style={{ flex: 1 }}><div className="field-lbl">{ex.amrap ? "AMRAP" : "REPS LOW"}</div><input className="gu-input" type="number" disabled={ex.amrap} value={ex.repRange ? ex.repRange[0] : ""} onChange={(e) => updateExercise(dayId, ex.id, { repRange: [Number(e.target.value) || 1, (ex.repRange && ex.repRange[1]) || 1] })} /></div>
              {!ex.amrap && <div style={{ flex: 1 }}><div className="field-lbl">REPS HIGH</div><input className="gu-input" type="number" value={ex.repRange ? ex.repRange[1] : ""} onChange={(e) => updateExercise(dayId, ex.id, { repRange: [(ex.repRange && ex.repRange[0]) || 1, Number(e.target.value) || 1] })} /></div>}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 4 }}>
              <button className="icon-btn" disabled={i === 0} onClick={() => moveExercise(dayId, ex.id, -1)}><ArrowUp size={13} /></button>
              <button className="icon-btn" disabled={i === day.exercises.length - 1} onClick={() => moveExercise(dayId, ex.id, 1)}><ArrowDown size={13} /></button>
            </div>
            <button className="icon-btn" onClick={() => removeExerciseFromProgram(dayId, ex.id)}><X size={13} /></button>
          </div>
        </div>
      ))}

      {showAdd ? (
        <div className="card" style={{ marginBottom: 10 }}>
          <div className="card-bd">
            <input className="gu-input" style={{ textAlign: "left", padding: 8, marginBottom: 8 }} placeholder="Exercise name" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} />
            <select className="rir-select" style={{ marginBottom: 8 }} value={addForm.primary} onChange={(e) => setAddForm((f) => ({ ...f, primary: e.target.value }))}>
              {Object.entries(MUSCLES).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
            </select>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input className="gu-input" type="number" placeholder="sets" value={addForm.sets} onChange={(e) => setAddForm((f) => ({ ...f, sets: e.target.value }))} />
              <input className="gu-input" type="number" placeholder="reps lo" value={addForm.repLo} onChange={(e) => setAddForm((f) => ({ ...f, repLo: e.target.value }))} />
              <input className="gu-input" type="number" placeholder="reps hi" value={addForm.repHi} onChange={(e) => setAddForm((f) => ({ ...f, repHi: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ghost-btn" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="gold-btn" onClick={submitAdd}><Plus size={16} /> Add</button>
            </div>
          </div>
        </div>
      ) : (
        <button className="ghost-btn" style={{ marginBottom: 14 }} onClick={() => setShowAdd(true)}><Plus size={14} /> Add Exercise to Day {dayId}</button>
      )}

      {confirmReset ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11.5, color: "var(--dim)", flex: 1 }}>Reset every day back to the original plan?</span>
          <button className="ghost-btn" style={{ flex: "0 0 auto", padding: "8px 12px" }} onClick={() => setConfirmReset(false)}>Cancel</button>
          <button className="pill-btn" style={{ flex: "0 0 auto", background: "var(--red)", color: "#fff", borderColor: "var(--red)" }} onClick={() => { resetProgram(); setConfirmReset(false); }}>Reset</button>
        </div>
      ) : (
        <button className="ghost-btn" style={{ fontSize: 11.5, color: "var(--dim)" }} onClick={() => setConfirmReset(true)}>Reset to Default Program</button>
      )}
    </div>
  );
}

function BackupSection({ exportData, importData }) {
  const fileRef = useRef(null);
  const [pending, setPending] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || typeof data !== "object" || !Array.isArray(data.sessions)) throw new Error("bad shape");
      setPending(data);
    } catch {
      setError("That file doesn't look like a Gotham Unbound export.");
    }
  };
  const confirmImport = async () => {
    setImporting(true);
    await importData(pending);
    setImporting(false);
    setPending(null);
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="application/json" style={{ display: "none" }} onChange={onFile} />
      <button className="gold-btn" style={{ marginBottom: 8 }} onClick={exportData}><Download size={16} /> Export Data</button>
      <button className="ghost-btn" onClick={() => fileRef.current?.click()}><Upload size={14} /> Import Data</button>
      {error && <div style={{ fontSize: 11.5, color: "var(--red)", marginTop: 8 }}>{error}</div>}
      {pending && (
        <div className="alert-banner" style={{ marginTop: 12, alignItems: "flex-start" }}>
          <AlertTriangle size={14} style={{ marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            This replaces everything currently in the app with the backup from {pending.exportedAt ? new Date(pending.exportedAt).toLocaleDateString() : "this file"}. This can't be undone.
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="ghost-btn" onClick={() => setPending(null)}>Cancel</button>
              <button className="pill-btn" style={{ background: "var(--red)", borderColor: "var(--red)", color: "#fff" }} onClick={confirmImport} disabled={importing}>{importing ? "Restoring…" : "Replace & Restore"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MoreView({ profile, updateProfile, nutrition, updateNutritionSettings, sessions, measurements, photoIndex, exportData, importData, program, updateExercise, addExerciseToProgram, removeExerciseFromProgram, moveExercise, resetProgram }) {
  const [open, setOpen] = useState(null);
  const toggle = (k) => setOpen((o) => (o === k ? null : k));
  const units = profile.units;

  const trainingSessions = sessions.filter((s) => program[s.dayId] && program[s.dayId].exercises);
  const totalVolume = trainingSessions.reduce((sum, s) => {
    let vl = 0;
    Object.values(s.entries || {}).forEach((d) => (d.sets || []).forEach((set) => { if (set.type !== "W" && set.weight) vl += volumeLoad(set.weight, set.reps); }));
    return sum + vl;
  }, 0);
  const streak = useMemo(() => {
    const dates = new Set(sessions.map((s) => dateKey(new Date(s.date))));
    let cursor = new Date(); cursor.setHours(0, 0, 0, 0);
    if (!dates.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let n = 0; while (dates.has(dateKey(cursor))) { n++; cursor.setDate(cursor.getDate() - 1); }
    return n;
  }, [sessions]);
  const longestStreak = useMemo(() => {
    const dates = Array.from(new Set(sessions.map((s) => dateKey(new Date(s.date))))).sort();
    let best = 0, cur = 0, prev = null;
    dates.forEach((k) => {
      const d = keyToDate(k);
      if (prev && (d - prev) / 86400000 === 1) cur++; else cur = 1;
      best = Math.max(best, cur); prev = d;
    });
    return best;
  }, [sessions]);
  const monthsWithPhotos = new Set(photoIndex.map((p) => p.monthKey)).size;

  return (
    <>
      <div className="profile-hd">
        <div className="avatar"><User size={26} /></div>
        <div><div className="nm">Your Journey</div><div className="sub">Discipline. Progress. Freedom.</div></div>
      </div>

      <div className="card">
        <MoreRow icon={<Target size={17} />} name="Goals" sub="Set your training & nutrition targets" onClick={() => toggle("goals")} open={open === "goals"} />
        {open === "goals" && (
          <div className="card-bd" style={{ borderTop: "1px solid var(--line)" }}>
            <div className="measure-grid">
              <div className="cell"><label>HEIGHT ({lengthUnitLabel(units)})</label>
                <input className="gu-input" type="number" value={profile.heightIn != null ? fmtLength(profile.heightIn, units) : ""} onChange={(e) => updateProfile({ heightIn: e.target.value === "" ? null : parseLengthInput(e.target.value, units) })} />
              </div>
              <div className="cell"><label>AGE</label>
                <input className="gu-input" type="number" value={profile.ageYears ?? ""} onChange={(e) => updateProfile({ ageYears: e.target.value === "" ? null : Number(e.target.value) })} />
              </div>
            </div>
            <div className="field-lbl">GOAL</div>
            <div className="chip-row" style={{ marginBottom: 12 }}>{GOALS.map((g) => <button key={g} className={`seg-chip ${profile.goal === g ? "on" : ""}`} onClick={() => updateProfile({ goal: profile.goal === g ? "" : g })}>{g}</button>)}</div>
            <div className="field-lbl">ACTIVITY LEVEL</div>
            <div className="chip-row" style={{ marginBottom: 12 }}>{ACTIVITIES.map((a) => <button key={a} className={`seg-chip ${profile.activity === a ? "on" : ""}`} onClick={() => updateProfile({ activity: profile.activity === a ? "" : a })}>{a}</button>)}</div>
            <div className="field-lbl">UNITS</div>
            <div className="units-toggle" style={{ marginBottom: 14 }}>
              <button className={units === "imperial" ? "on" : ""} onClick={() => updateProfile({ units: "imperial" })}>LB / IN</button>
              <button className={units === "metric" ? "on" : ""} onClick={() => updateProfile({ units: "metric" })}>KG / CM</button>
            </div>
            <div className="field-lbl">DAILY TARGETS</div>
            <div className="goal-row"><label>Calories (kcal)</label><input className="gu-input" type="number" value={profile.calorieGoal} onChange={(e) => updateProfile({ calorieGoal: Number(e.target.value) || 0 })} /></div>
            <div className="goal-row"><label>Protein (g)</label><input className="gu-input" type="number" value={profile.proteinGoal} onChange={(e) => updateProfile({ proteinGoal: Number(e.target.value) || 0 })} /></div>
            <div className="goal-row"><label>Carbs (g)</label><input className="gu-input" type="number" value={profile.carbsGoal} onChange={(e) => updateProfile({ carbsGoal: Number(e.target.value) || 0 })} /></div>
            <div className="goal-row"><label>Fat (g)</label><input className="gu-input" type="number" value={profile.fatGoal} onChange={(e) => updateProfile({ fatGoal: Number(e.target.value) || 0 })} /></div>
            <div className="goal-row">
              <label>Water ({units === "metric" ? "L" : "oz"})</label>
              <input className="gu-input" type="number" value={fmtWaterTotal(profile.waterGoalOz, units).value} onChange={(e) => updateProfile({ waterGoalOz: units === "metric" ? ozFromLiters(Number(e.target.value) || 0) : Number(e.target.value) || 0 })} />
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <MoreRow icon={<Dumbbell size={17} />} name="Edit Program" sub="Customize exercises, sets & reps" onClick={() => toggle("prog")} open={open === "prog"} />
        {open === "prog" && (
          <div className="card-bd" style={{ borderTop: "1px solid var(--line)" }}>
            <ProgramEditor program={program} updateExercise={updateExercise} addExerciseToProgram={addExerciseToProgram} removeExerciseFromProgram={removeExerciseFromProgram} moveExercise={moveExercise} resetProgram={resetProgram} />
          </div>
        )}
      </div>

      <div className="card">
        <MoreRow icon={<Award size={17} />} name="Achievements" sub="View your milestones" onClick={() => toggle("ach")} open={open === "ach"} />
        {open === "ach" && (
          <div className="card-bd" style={{ borderTop: "1px solid var(--line)" }}>
            <div className="measure-row"><div className="info">Workouts logged</div><div className="val">{trainingSessions.length}</div></div>
            <div className="measure-row"><div className="info">Current streak</div><div className="val">{streak} day{streak === 1 ? "" : "s"}</div></div>
            <div className="measure-row"><div className="info">Longest streak</div><div className="val">{longestStreak} day{longestStreak === 1 ? "" : "s"}</div></div>
            <div className="measure-row"><div className="info">Total weight lifted</div><div className="val">{Math.round(totalVolume).toLocaleString()} lb</div></div>
            <div className="measure-row"><div className="info">Body measurements logged</div><div className="val">{measurements.length}</div></div>
            <div className="measure-row"><div className="info">Months with progress photos</div><div className="val">{monthsWithPhotos}</div></div>
          </div>
        )}
      </div>

      <div className="card">
        <MoreRow icon={<Download size={17} />} name="Backup & Restore" sub="Export or import everything as JSON" onClick={() => toggle("backup")} open={open === "backup"} />
        {open === "backup" && (
          <div className="card-bd" style={{ borderTop: "1px solid var(--line)" }}>
            <BackupSection exportData={exportData} importData={importData} />
          </div>
        )}
      </div>

      <div className="card">
        <MoreRow icon={<HelpCircle size={17} />} name="Help & Support" sub="FAQs and contact" onClick={() => toggle("help")} open={open === "help"} />
        {open === "help" && (
          <div className="card-bd" style={{ borderTop: "1px solid var(--line)", fontSize: 12.5, color: "var(--dim)", lineHeight: 1.7 }}>
            <p style={{ marginTop: 0 }}><b style={{ color: "var(--text)" }}>How is my data stored?</b><br />Everything you log stays in this app's private storage — workouts, measurements, photos, and nutrition. Nothing is shared or uploaded anywhere else.</p>
            <p><b style={{ color: "var(--text)" }}>What triggers a Recovery Protocol?</b><br />Two or more of: stalled exercises, high recent soreness, poor recent sleep, or frequent failure sets.</p>
            <p><b style={{ color: "var(--text)" }}>Can I swap an exercise?</b><br />Open it from your workout and tap the swap icon next to "Exercise Detail" — it relabels that slot for today without touching the program template.</p>
            <p style={{ marginBottom: 0 }}><b style={{ color: "var(--text)" }}>Can I get my data out?</b><br />Yes — use Backup & Restore above to download everything, including photos, as a JSON file, and to restore from one later.</p>
            <p style={{ marginBottom: 0, marginTop: 12, fontSize: 10.5, color: "var(--dim2)" }}>Exercise demo animations courtesy of the free ExerciseDB dataset (oss.exercisedb.dev), used non-commercially.</p>
          </div>
        )}
      </div>

      <div className="card">
        <MoreRow icon={<Settings size={17} />} name="Settings" sub="App preferences" onClick={() => toggle("settings")} open={open === "settings"} />
        {open === "settings" && (
          <div className="card-bd" style={{ borderTop: "1px solid var(--line)" }}>
            <div className="goal-row">
              <label>Hydration reminders</label>
              <button className="icon-btn" style={{ width: 40 }} onClick={() => updateNutritionSettings({ reminderEnabled: !nutrition.settings.reminderEnabled })}>
                {nutrition.settings.reminderEnabled ? <BellIcon size={15} color="var(--gold)" /> : <BellOff size={15} />}
              </button>
            </div>
            {nutrition.settings.reminderEnabled && (
              <div className="chip-row">
                {[30, 45, 60, 90, 120].map((m) => <button key={m} className={`seg-chip ${nutrition.settings.reminderMinutes === m ? "on" : ""}`} onClick={() => updateNutritionSettings({ reminderMinutes: m })}>{m}m</button>)}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="quote-card">
        <GothamSkyline opacityBuildings={0.7} />
        <div className="bar" style={{ width: "38%" }} />
        <p>Progress isn't always loud. Sometimes it's just you showing up again.</p>
      </div>
    </>
  );
}
