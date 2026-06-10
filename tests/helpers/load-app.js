"use strict";

/* Testharness for node:test.

   Etter T5 er appen ES-moduler, så funksjonene importeres direkte fra js/.
   state.js leser localStorage ved import, og saveState() rører document —
   begge stubbes på globalThis FØR første import.

   NB: ES-modul-cachen gjør at alle tester deler samme state-instans.
   Tester som bruker tilstand må derfor starte med setState(defaultState()). */

const path = require("node:path");
const { pathToFileURL } = require("node:url");

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
const documentStub = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
};

let apiPromise = null;

async function loadApp() {
  if (!apiPromise) {
    globalThis.localStorage = createLocalStorageStub();
    globalThis.document = documentStub;
    const root = path.join(__dirname, "..", "..");
    const mod = (rel) => import(pathToFileURL(path.join(root, rel)).href);
    apiPromise = Promise.all([
      mod("js/state.js"),
      mod("js/utils.js"),
      mod("js/snapshot.js"),
      mod("js/quiz.js"),
      mod("content.js"),
    ]).then(([stateMod, utils, snapshot, quiz, content]) => ({
      migrateState: stateMod.migrateState,
      importSnapshot: snapshot.importSnapshot,
      shareSnapshot: snapshot.shareSnapshot,
      logsToCsv: snapshot.logsToCsv,
      buildQuizSession: quiz.buildQuizSession,
      escapeHtml: utils.escapeHtml,
      defaultState: stateMod.defaultState,
      SCHEMA_VERSION: stateMod.SCHEMA_VERSION,
      MAX_PLANS: stateMod.MAX_PLANS,
      MAX_LOGS: stateMod.MAX_LOGS,
      quizQuestions: content.quizQuestions,
      modules: content.modules,
      getState: () => stateMod.state,
      setState: stateMod.replaceState,
    }));
  }
  return apiPromise;
}

module.exports = { loadApp };
