"use strict";

/* Testharness for node:test.

   app.js og content.js er klassiske nettleser-skript uten eksport, lastet via
   <script>-tagger i index.html. For å teste funksjonene i Node uten å endre
   filene (og dermed risikere app-shell/service worker), kjøres kildene i en
   node:vm-kontekst som etterligner nettleserens globale skop: content.js
   først, så app.js. Toppnivå-deklarasjoner (const/let/function) deles mellom
   skript i samme kontekst, akkurat som mellom <script>-tagger.

   Det avsluttende init()-kallet i app.js bygger hele UI-et og fjernes før
   kjøring — resten av filen er definisjoner pluss `let state = loadState()`,
   som klarer seg med localStorage-stubben under. */

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const rootDir = path.join(__dirname, "..", "..");

function createLocalStorageStub() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

// Minimal DOM-stub: saveState() kaller updateStorageWarning(), som bare
// trenger getElementById så lenge lagringen lykkes (og stubben feiler aldri).
function createDocumentStub() {
  return {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
  };
}

function loadApp() {
  const contentSource = fs.readFileSync(path.join(rootDir, "content.js"), "utf8");
  const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");

  const strippedApp = appSource.replace(/\r?\ninit\(\);\s*$/, "\n");
  assert.notStrictEqual(
    strippedApp,
    appSource,
    "Fant ikke init()-kallet på slutten av app.js — oppdater tests/helpers/load-app.js"
  );

  const sandbox = {
    console,
    localStorage: createLocalStorageStub(),
    document: createDocumentStub(),
    window: {},
    navigator: {},
  };
  const context = vm.createContext(sandbox);

  vm.runInContext(contentSource, context, { filename: "content.js" });
  vm.runInContext(strippedApp, context, { filename: "app.js" });

  // Hentes ut i samme kontekst, så uttrykket ser de leksikalske toppnivå-
  // bindingene (state, defaultState, SCHEMA_VERSION m.fl.) i app.js/content.js.
  const raw = vm.runInContext(
    `({
      migrateState,
      importSnapshot,
      shareSnapshot,
      logsToCsv,
      buildQuizSession,
      escapeHtml,
      defaultState,
      SCHEMA_VERSION,
      MAX_PLANS,
      MAX_LOGS,
      quizQuestions,
      modules,
      getState: () => state,
      setState: (next) => { state = next; },
    })`,
    context,
    { filename: "test-api.js" }
  );

  // Objekter laget i vm-konteksten har egne prototyper, så deepStrictEqual i
  // testene ville feilet på realm-ulikhet. Returverdier JSON-normaliseres
  // derfor til testens realm; alt som krysser grensen er ren JSON-data.
  const toPlain = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));

  return {
    migrateState: (stored) => toPlain(raw.migrateState(stored)),
    importSnapshot: (snapshot) => toPlain(raw.importSnapshot(snapshot)),
    shareSnapshot: () => toPlain(raw.shareSnapshot()),
    logsToCsv: raw.logsToCsv,
    buildQuizSession: raw.buildQuizSession,
    escapeHtml: raw.escapeHtml,
    defaultState: () => toPlain(raw.defaultState()),
    SCHEMA_VERSION: raw.SCHEMA_VERSION,
    MAX_PLANS: raw.MAX_PLANS,
    MAX_LOGS: raw.MAX_LOGS,
    quizQuestions: toPlain(raw.quizQuestions),
    modules: toPlain(raw.modules),
    getState: () => toPlain(raw.getState()),
    setState: raw.setState,
  };
}

module.exports = { loadApp };
