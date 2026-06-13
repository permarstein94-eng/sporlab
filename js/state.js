// @ts-check
/* Tilstand og persistens: standardverdier, localStorage og schema-migrering.
   Eier den globale app-tilstanden (`state`). */
import { moduleForLog, planBlueprints, planFocusByTitle, quizQuestions } from "../content.js";

export const STORAGE_KEY = "sporlab-e8-e9-v1";
export const SCHEMA_VERSION = 7;

// Tak for lagrede elementer. Romslige med vilje: localStorage tåler flere MB,
// og å kaste brukerens treningshistorikk i stillhet er verre enn en full kvote
// (kvotefeil fanges i saveState og varsles).
export const MAX_PLANS = 40;
export const MAX_LOGS = 2000;
/* ---------- JSDoc-typer (sjekkes med `npx tsc -p jsconfig.json`) ---------- */

/**
 * En lagret øktplan — kanonisk form som produsert av makePlan()/sanitizePlan().
 * @typedef {Object} Plan
 * @property {string} id
 * @property {number} createdAt
 * @property {string} title
 * @property {string} pages
 * @property {string} focus Nøkkel i planBlueprints, eller "" hvis ukjent.
 * @property {string[]} meta Linjer som "Fører: Kari".
 * @property {string[]} steps
 * @property {string} success
 * @property {string} note
 * @property {string[]} observations Alltid tre observasjonsspørsmål.
 * @property {string} handler
 * @property {string} dog
 * @property {string} experience
 * @property {string} intensity
 * @property {string} age
 * @property {string} terrain
 */

/**
 * @typedef {Object} LogObservation
 * @property {string} prompt
 * @property {string} answer
 */

/**
 * En loggført treningsøkt — kanonisk form som produsert av sanitizeLog().
 * @typedef {Object} Log
 * @property {string} id
 * @property {number} createdAt
 * @property {string} date Lokal ISO-dato (YYYY-MM-DD).
 * @property {string} type
 * @property {string} handler
 * @property {string} dog
 * @property {string} age
 * @property {string} length
 * @property {string} terrain
 * @property {string} wind
 * @property {string} weather
 * @property {string} rating "0"–"5".
 * @property {string} next
 * @property {string} [observation] Eldre fritekstfelt (før tre-spørsmålsformatet).
 * @property {LogObservation[]} observations
 * @property {string} planId
 * @property {string} planTitle
 * @property {string} planPages
 * @property {string} [planFocus] Fokusnøkkel økta ble trent på (kobling til læring).
 * @property {string} [module] Tema-id økta krediterer (kobling til læring).
 * @property {number} [updatedAt]
 * @property {string} [image] Historisk felt — fjernes ved migrering og deling.
 */

/**
 * Et quizspørsmål fra content.js.
 * @typedef {Object} QuizQuestion
 * @property {string} id Stabil id — mestring og økter nøkles på denne.
 * @property {string} module
 * @property {boolean} [examRelevant]
 * @property {string} question
 * @property {string[]} options
 * @property {number} answer Indeks i options.
 * @property {string} explain
 * @property {string} pages
 */

/**
 * @typedef {Object} MasteryEntry
 * @property {number} correct
 * @property {number} wrong
 * @property {number} lastSeen
 */

/**
 * @typedef {Object} QuizAnswer
 * @property {number} display Valgt indeks slik alternativene ble vist.
 * @property {number} original Tilsvarende indeks i spørsmålets options.
 * @property {boolean} correct
 */

/**
 * Pågående/persistert quiz-økt.
 * @typedef {Object} QuizSession
 * @property {string[]} questionIds
 * @property {number[][]} optionMaps Per spørsmål: permutasjon av options-indekser.
 * @property {number} index
 * @property {number} score
 * @property {Object<string, QuizAnswer>} answered Nøklet på posisjon i økten.
 * @property {string} mode "all", "weak" eller "module:<id>".
 * @property {string} modeLabel
 * @property {boolean} finished
 */

/**
 * Hele den persisterte app-tilstanden (localStorage, schemaVersion 6).
 * @typedef {Object} State
 * @property {number} schemaVersion
 * @property {string} view
 * @property {?string} activeModule
 * @property {string} learnAccordion
 * @property {string[]} completed Fullførte modul-id-er.
 * @property {Log[]} logs
 * @property {Plan[]} plans
 * @property {?Plan} currentPlan
 * @property {number} wizardStep
 * @property {boolean} wizardShowDetails
 * @property {string} theme "auto", "light" eller "dark".
 * @property {Object<string, MasteryEntry>} mastery Nøklet på spørsmåls-id.
 * @property {QuizSession} quiz
 * @property {boolean} hasSeenWelcome
 * @property {?string} activeGuide
 * @property {number} lastExportLogCount
 */
/** @returns {QuizSession} */
export const defaultQuizState = () => ({
  questionIds: [],
  optionMaps: [],
  index: 0,
  score: 0,
  answered: {},
  mode: "all",
  modeLabel: "Alle moduler",
  finished: false,
});

/** @returns {State} */
export const defaultState = () => ({
  schemaVersion: SCHEMA_VERSION,
  view: "dashboard",
  activeModule: null,
  learnAccordion: "learn",
  completed: [],
  logs: [],
  plans: [],
  currentPlan: null,
  wizardStep: 0,
  wizardShowDetails: false,
  theme: "auto",
  mastery: {},
  quiz: defaultQuizState(),
  hasSeenWelcome: false,
  activeGuide: null,
  lastExportLogCount: 0,
});

export let state = loadState();
export let storageAvailable = true;

/** @returns {State} */
export function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored || typeof stored !== "object") return defaultState();
    return migrateState(stored);
  } catch {
    return defaultState();
  }
}

/**
 * Løfter en lagret tilstand (enhver tidligere schemaVersion) til gjeldende.
 * @param {any} stored
 * @returns {State}
 */
export function migrateState(stored) {
  const base = { ...defaultState(), ...stored };
  const fromVersion = stored.schemaVersion || 1;
  if (fromVersion < 2) {
    base.quiz = defaultQuizState();
    base.mastery = {};
    base.theme = "auto";
  }
  if (fromVersion < 3) {
    base.activeModule = null;
    base.learnAccordion = "learn";
  }
  if (fromVersion < 4) {
    base.plans = (base.plans || []).map((plan) => {
      if (plan && Array.isArray(plan.observations) && plan.observations.length === 3) return plan;
      const blueprint = planBlueprints[plan?.focus];
      const observations = blueprint?.observations ? [...blueprint.observations] : ["", "", ""];
      return { ...plan, observations };
    });
    base.logs = (base.logs || []).map((log) => {
      if (!log) return log;
      const { image, ...rest } = log;
      return rest;
    });
  }
  if (fromVersion < 5) {
    // Mestring og quiz-økter var nøklet på array-indeks i quizQuestions.
    // Indeksene stemmer fortsatt på migreringstidspunktet, så vi kan oversette tapsfritt.
    const oldMastery = base.mastery && typeof base.mastery === "object" ? base.mastery : {};
    const remapped = {};
    Object.entries(oldMastery).forEach(([key, value]) => {
      const q = quizQuestions[Number(key)];
      if (q && value && typeof value === "object") remapped[q.id] = value;
    });
    base.mastery = remapped;
    const oldQuiz = base.quiz;
    if (oldQuiz && Array.isArray(oldQuiz.questionIds) && oldQuiz.questionIds.every((n) => typeof n === "number")) {
      const ids = oldQuiz.questionIds.map((n) => quizQuestions[n]?.id).filter(Boolean);
      base.quiz = ids.length === oldQuiz.questionIds.length
        ? { ...defaultQuizState(), ...oldQuiz, questionIds: ids }
        : defaultQuizState();
    } else {
      base.quiz = defaultQuizState();
    }
  }
  if (fromVersion < 6) {
    // Redesign juni 2026: «quiz», «planner» og «log» er ikke lenger faner.
    // Lagret visning oversettes til fanen som eier innholdet nå.
    const viewMap = { quiz: "learn", planner: "training", log: "training" };
    if (viewMap[base.view]) base.view = viewMap[base.view];
  }
  if (fromVersion < 7) {
    // Todelt redesign: en logg kobles nå eksplisitt til et læringstema via
    // `module`/`planFocus`. Backfyll fra plantittel/økt-type så eldre logger
    // krediterer riktig tema med den nye, robuste logikken. Ingenting slettes.
    base.logs = (base.logs || []).map((log) => {
      if (!log || typeof log !== "object") return log;
      const next = { ...log };
      if (!next.planFocus) {
        const focus = planFocusByTitle(next.planTitle);
        if (focus) next.planFocus = focus;
      }
      if (!next.module) {
        const mod = moduleForLog(next);
        if (mod) next.module = mod;
      }
      return next;
    });
  }
  if (!base.quiz || !Array.isArray(base.quiz.questionIds)) {
    base.quiz = defaultQuizState();
  }
  if (typeof base.mastery !== "object" || base.mastery === null) {
    base.mastery = {};
  }
  if (!base.learnAccordion) base.learnAccordion = "learn";
  // Eksisterende brukere med data skal ikke avbrytes av startmenyen — kun nye/tomme installasjoner.
  if (typeof stored.hasSeenWelcome !== "boolean") {
    const hasData = (base.completed?.length || 0) + (base.logs?.length || 0) + (base.plans?.length || 0) > 0;
    base.hasSeenWelcome = hasData;
  }
  base.schemaVersion = SCHEMA_VERSION;
  return base;
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageAvailable = true;
  } catch (error) {
    storageAvailable = false;
    console.warn("SporLab kunne ikke lagre lokalt i denne nettleservisningen.", error);
  }
  updateStorageWarning();
}

export function updateStorageWarning() {
  const existing = document.getElementById("storageWarning");
  if (storageAvailable) {
    existing?.remove();
    return;
  }
  if (existing) return;
  const banner = document.createElement("div");
  banner.id = "storageWarning";
  banner.className = "storage-warning";
  banner.setAttribute("role", "alert");
  banner.innerHTML = `
    <strong>Lagring feilet.</strong>
    <span>Endringene dine blir ikke husket i denne nettleseren (full kvote eller privat modus). Eksporter dataene dine nå.</span>
    <button class="storage-warning-btn" type="button" data-view-jump="settings">Til eksport</button>`;
  document.body.appendChild(banner);
}

/**
 * Erstatt hele tilstanden. Brukes av «slett alle data» og av testene.
 * @param {State} next
 */
export function replaceState(next) {
  state = next;
}

/**
 * Nullstill alt: fjern lagringen og erstatt tilstanden med standardverdier.
 */
export function resetAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    storageAvailable = false;
  }
  state = defaultState();
}
