// @ts-check
/* Eksport/import av brukerdata: deling, sanitering og CSV. */
import { modules, planBlueprints } from "../content.js";
import { MAX_LOGS, MAX_PLANS, SCHEMA_VERSION, saveState, state } from "./state.js";
import { makeId, readableAge } from "./utils.js";
import { questionsById } from "./quiz.js";

/** @typedef {import("./state.js").Plan} Plan */
/** @typedef {import("./state.js").Log} Log */

/**
 * @param {Log[]} logs
 * @returns {string}
 */
export function logsToCsv(logs) {
  const fields = ["date", "type", "handler", "dog", "rating", "age", "length", "weather", "wind", "terrain", "planTitle", "obs1", "obs2", "obs3", "next"];
  const header = fields.join(",");
  const rows = logs.map((log) => {
    const obs = Array.isArray(log.observations) ? log.observations : [];
    const flat = {
      ...log,
      age: log.age ? readableAge(log.age) : "",
      obs1: obs[0] ? `${obs[0].prompt || ""} → ${obs[0].answer || ""}`.trim() : log.observation || "",
      obs2: obs[1] ? `${obs[1].prompt || ""} → ${obs[1].answer || ""}`.trim() : "",
      obs3: obs[2] ? `${obs[2].prompt || ""} → ${obs[2].answer || ""}`.trim() : "",
    };
    return fields
      .map((f) => {
        let value = String(flat[f] ?? "");
        // Vern mot formelinjeksjon når CSV-en åpnes i Excel/Sheets.
        if (/^[=+\-@\t]/.test(value)) value = `'${value}`;
        if (value.includes(",") || value.includes("\"") || value.includes("\n") || value.includes("\r")) {
          return `"${value.replaceAll("\"", "\"\"")}"`;
        }
        return value;
      })
      .join(",");
  });
  return [header, ...rows].join("\n");
}
export function shareSnapshot() {
  const snapshot = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    plans: state.plans,
    logs: state.logs.map(({ image, ...rest }) => rest),
    completed: state.completed,
    mastery: state.mastery,
    gettingStartedAnswers: state.gettingStartedAnswers,
  };
  return snapshot;
}

export async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsText(file);
  });
}

/* Sanitering av importerte data: ukjente felter droppes, typer tvinges,
   og id-er som ikke er trygge for HTML-attributter regenereres. */
export const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function asText(value, max = 2000) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

export function asStringArray(value, maxItems = 40, maxLen = 1000) {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === "string").slice(0, maxItems).map((v) => v.slice(0, maxLen));
}

export function sanitizeId(value) {
  return typeof value === "string" && SAFE_ID_PATTERN.test(value) ? value : makeId();
}

/**
 * @param {any} raw
 * @returns {?Plan}
 */
export function sanitizePlan(raw) {
  if (!raw || typeof raw !== "object") return null;
  const obs = asStringArray(raw.observations, 3);
  while (obs.length < 3) obs.push("");
  return {
    id: sanitizeId(raw.id),
    createdAt: Number(raw.createdAt) || Date.now(),
    title: asText(raw.title, 200),
    pages: asText(raw.pages, 100),
    focus: planBlueprints[raw.focus] ? raw.focus : "",
    meta: asStringArray(raw.meta, 12, 200),
    steps: asStringArray(raw.steps, 30),
    success: asText(raw.success, 500),
    note: asText(raw.note, 1000),
    observations: obs,
    handler: asText(raw.handler, 100),
    dog: asText(raw.dog, 100),
    experience: asText(raw.experience, 40),
    intensity: asText(raw.intensity, 40),
    age: asText(raw.age, 40),
    terrain: asText(raw.terrain, 40),
  };
}

/**
 * @param {any} raw
 * @returns {?Log}
 */
export function sanitizeLog(raw) {
  if (!raw || typeof raw !== "object") return null;
  const observations = Array.isArray(raw.observations)
    ? raw.observations.slice(0, 3).map((o) => ({
        prompt: asText(o?.prompt, 500),
        answer: asText(o?.answer, 2000),
      }))
    : [];
  return {
    id: sanitizeId(raw.id),
    createdAt: Number(raw.createdAt) || Date.parse(raw.date) || Date.now(),
    date: asText(raw.date, 40),
    type: asText(raw.type, 60),
    handler: asText(raw.handler, 100),
    dog: asText(raw.dog, 100),
    age: asText(raw.age, 100),
    length: asText(raw.length, 200),
    terrain: asText(raw.terrain, 40),
    wind: asText(raw.wind, 40),
    weather: asText(raw.weather, 40),
    rating: String(Math.min(5, Math.max(0, Math.floor(Number(raw.rating)) || 0))),
    next: asText(raw.next, 2000),
    observation: asText(raw.observation, 2000),
    observations,
    planId: asText(raw.planId, 64),
    planTitle: asText(raw.planTitle, 200),
    planPages: asText(raw.planPages, 100),
    ...(raw.planFocus ? { planFocus: asText(raw.planFocus, 64) } : {}),
    ...(raw.module ? { module: asText(raw.module, 64) } : {}),
    ...(Number(raw.updatedAt) ? { updatedAt: Number(raw.updatedAt) } : {}),
  };
}

/**
 * @param {any} snapshot
 * @returns {{ plans: number, logs: number }} Antall nye elementer som ble flettet inn.
 */
export function importSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") throw new Error("Ugyldig fil");
  const incomingPlans = (Array.isArray(snapshot.plans) ? snapshot.plans : []).map(sanitizePlan).filter(Boolean);
  const incomingLogs = (Array.isArray(snapshot.logs) ? snapshot.logs : []).map(sanitizeLog).filter(Boolean);
  const byCreatedAtDesc = (a, b) => (b.createdAt || 0) - (a.createdAt || 0);
  const existingPlanIds = new Set(state.plans.map((p) => p.id));
  const existingLogById = new Map(state.logs.map((l) => [l.id, l]));
  const incomingLogById = new Map(incomingLogs.map((l) => [l.id, l]));
  const newPlans = incomingPlans.filter((p) => !existingPlanIds.has(p.id));
  const newLogs = incomingLogs.filter((l) => !existingLogById.has(l.id));
  // En innkommende logg med samme id erstatter den lokale bare hvis den er
  // faktisk nyere redigert (updatedAt/createdAt) — ellers vinner lokal som før.
  const mergedExistingLogs = state.logs.map((log) => {
    const incoming = incomingLogById.get(log.id);
    if (!incoming) return log;
    const incomingTime = incoming.updatedAt || incoming.createdAt || 0;
    const existingTime = log.updatedAt || log.createdAt || 0;
    return incomingTime > existingTime ? incoming : log;
  });
  // Sorter på createdAt før trunkering, slik at de eldste fremmede importerte
  // elementene ikke fortrenger brukerens egne, faktisk nyere elementer.
  state.plans = [...newPlans, ...state.plans].sort(byCreatedAtDesc).slice(0, MAX_PLANS);
  state.logs = [...newLogs, ...mergedExistingLogs].sort(byCreatedAtDesc).slice(0, MAX_LOGS);

  // Læringsdata: fullførte moduler flettes som union, mestring per spørsmål
  // beholder den oppføringen som har mest historikk (gjør re-import idempotent).
  const validModuleIds = new Set(modules.map((m) => m.id));
  if (Array.isArray(snapshot.completed)) {
    const merged = new Set(state.completed.filter((id) => validModuleIds.has(id)));
    snapshot.completed.forEach((id) => {
      if (validModuleIds.has(id)) merged.add(id);
    });
    state.completed = [...merged];
  }
  // Kartleggingssvar («Aller første sporøkt»): finnes ikke i eksporter fra før
  // denne feltet ble lagt til — droppes stille i stedet for å kaste på
  // undefined. Lokalt svar vinner ved kollisjon, som ellers i denne funksjonen.
  if (
    snapshot.gettingStartedAnswers &&
    typeof snapshot.gettingStartedAnswers === "object" &&
    !Array.isArray(snapshot.gettingStartedAnswers)
  ) {
    Object.entries(snapshot.gettingStartedAnswers).forEach(([id, value]) => {
      if (!value || typeof value !== "object" || state.gettingStartedAnswers[id]) return;
      state.gettingStartedAnswers[id] = {
        ...(Array.isArray(value.options) ? { options: asStringArray(value.options, 20, 200) } : {}),
        ...(typeof value.note === "string" ? { note: asText(value.note, 2000) } : {}),
      };
    });
  }
  if (snapshot.mastery && typeof snapshot.mastery === "object" && !Array.isArray(snapshot.mastery)) {
    Object.entries(snapshot.mastery).forEach(([id, value]) => {
      if (!questionsById.has(id) || !value || typeof value !== "object") return;
      const incoming = {
        correct: Math.max(0, Math.floor(Number(value.correct)) || 0),
        wrong: Math.max(0, Math.floor(Number(value.wrong)) || 0),
        lastSeen: Math.max(0, Number(value.lastSeen) || 0),
      };
      const current = state.mastery[id];
      const currentTotal = current ? (current.correct || 0) + (current.wrong || 0) : -1;
      if (incoming.correct + incoming.wrong > currentTotal) state.mastery[id] = incoming;
    });
  }

  saveState();
  return { plans: newPlans.length, logs: newLogs.length };
}
