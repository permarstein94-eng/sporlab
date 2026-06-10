// @ts-check
/* Quizlogikk: øktbygging, validering av lagret økt og mestringsoppslag. */
import { modules, quizQuestions } from "../content.js";
import { saveState, state } from "./state.js";
import { shuffle } from "./utils.js";

/** @typedef {import("./state.js").QuizQuestion} QuizQuestion */

// Oppslag på stabil spørsmåls-id (definert i content.js). Mestring og quiz-økter
// nøkles på id, ikke array-indeks, så innholdet kan endres uten å knekke historikken.
/** @type {Map<string, QuizQuestion>} */
export const questionsById = new Map(quizQuestions.map((q) => /** @type {[string, QuizQuestion]} */ ([q.id, q])));
export function getWeakestQuestionId(skipIds = new Set()) {
  const completed = new Set(state.completed || []);
  if (completed.size === 0) return null;
  const candidates = quizQuestions.filter((q) => completed.has(q.module) && !skipIds.has(q.id));
  if (!candidates.length) return null;
  candidates.sort((a, b) => {
    const ma = state.mastery[a.id] || { correct: 0, wrong: 0, lastSeen: 0 };
    const mb = state.mastery[b.id] || { correct: 0, wrong: 0, lastSeen: 0 };
    const scoreA = (ma.correct || 0) - (ma.wrong || 0);
    const scoreB = (mb.correct || 0) - (mb.wrong || 0);
    if (scoreA !== scoreB) return scoreA - scoreB;
    return (ma.lastSeen || 0) - (mb.lastSeen || 0);
  });
  return candidates[0].id;
}
/** @param {string} [mode] "all", "weak" eller "module:<id>". */
export function buildQuizSession(mode = "all") {
  let pool;
  let label;
  if (mode === "all") {
    pool = quizQuestions.map((q) => q.id);
    label = "Alle moduler";
  } else if (mode === "weak") {
    const scored = quizQuestions
      .map((q) => {
        const m = state.mastery[q.id] || { correct: 0, wrong: 0, lastSeen: 0 };
        const masteryScore = (m.correct || 0) - (m.wrong || 0);
        return { id: q.id, masteryScore, lastSeen: m.lastSeen || 0 };
      })
      .sort((a, b) => a.masteryScore - b.masteryScore || a.lastSeen - b.lastSeen);
    pool = scored.slice(0, Math.min(10, scored.length)).map((item) => item.id);
    label = "Repeter svake";
  } else {
    const moduleId = mode.replace(/^module:/, "");
    pool = quizQuestions.filter((q) => q.module === moduleId).map((q) => q.id);
    const moduleDef = modules.find((m) => m.id === moduleId);
    label = moduleDef ? `Modul: ${moduleDef.title.replace(/^\d+\.\s*/, "")}` : "Modul";
  }

  if (pool.length === 0) pool = quizQuestions.map((q) => q.id);

  const questionIds = shuffle(pool);
  const optionMaps = questionIds.map((id) => {
    const question = questionsById.get(id);
    return shuffle(question.options.map((_, i) => i));
  });

  state.quiz = {
    questionIds,
    optionMaps,
    index: 0,
    score: 0,
    answered: {},
    mode,
    modeLabel: label,
    finished: false,
  };
  saveState();
}

export function ensureQuizSession() {
  // Validerer hele den persisterte økten: id-er som ikke lenger finnes i
  // innholdet, eller optionMaps som ikke matcher antall svaralternativer,
  // betyr at innholdet er oppdatert siden sist — da bygger vi ny runde.
  const quiz = state.quiz;
  const valid =
    quiz &&
    Array.isArray(quiz.questionIds) &&
    quiz.questionIds.length > 0 &&
    Array.isArray(quiz.optionMaps) &&
    quiz.optionMaps.length === quiz.questionIds.length &&
    quiz.questionIds.every((id, i) => {
      const question = questionsById.get(id);
      return question && Array.isArray(quiz.optionMaps[i]) && quiz.optionMaps[i].length === question.options.length;
    });
  if (!valid) buildQuizSession("all");
}
