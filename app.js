const STORAGE_KEY = "sporlab-e8-e9-v1";
const SCHEMA_VERSION = 4;

const viewMeta = {
  dashboard: ["Feltklar læring", "Dagens sporarbeid"],
  learn: ["Strukturert gjennomgang", "Lær"],
  planner: ["Øktplanlegger", "Planlegg neste trening"],
  log: ["Treningslogg", "Laget og progresjonen"],
  reference: ["Søkbar referanse", "Oppslagsverk"],
  quiz: ["Aktiv repetisjon", "Quiz"],
  settings: ["Konto og data", "Innstillinger"],
};

const defaultQuizState = () => ({
  questionIds: [],
  optionMaps: [],
  index: 0,
  score: 0,
  answered: {},
  mode: "all",
  modeLabel: "Alle moduler",
});

const defaultState = () => ({
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
});

let state = loadState();
let storageAvailable = true;

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored || typeof stored !== "object") return defaultState();
    return migrateState(stored);
  } catch {
    return defaultState();
  }
}

function migrateState(stored) {
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

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageAvailable = true;
  } catch (error) {
    storageAvailable = false;
    console.warn("SporLab kunne ikke lagre lokalt i denne nettleservisningen.", error);
  }
}

function makeId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emptyState(text = "Legg inn en økt eller plan, så dukker den opp her.") {
  return `<div class="empty-state"><p class="eyebrow">Tomt foreløpig</p><p>${escapeHtml(text)}</p></div>`;
}

function setView(view) {
  state.view = view;
  saveState();
  $all(".view").forEach((item) => item.classList.remove("is-visible"));
  const target = $(`#${view}View`);
  if (target) target.classList.add("is-visible");
  $all(".nav-item, .mobile-menu-item, .bottom-nav-item").forEach((item) => {
    if (!item.dataset.view) return;
    const isActive = item.dataset.view === view;
    item.classList.toggle("is-active", isActive);
    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });
  const [eyebrow, title] = viewMeta[view] || ["", view];
  $("#viewEyebrow").textContent = eyebrow;
  $("#viewTitle").textContent = title;
  ["dashboard", "learn", "planner", "log", "reference", "quiz", "settings"].forEach((v) => {
    document.body.classList.toggle(`view-${v}`, view === v);
  });
  renderView(view);
  closeMobileMenu();
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }
}

function openMobileMenu() {
  const menu = $("#mobileMenu");
  if (!menu) return;
  menu.hidden = false;
  menu.setAttribute("aria-hidden", "false");
  document.body.classList.add("menu-open");
  const toggle = $("#mobileMenuToggle");
  if (toggle) toggle.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => menu.classList.add("is-open"));
}

function closeMobileMenu() {
  const menu = $("#mobileMenu");
  if (!menu) return;
  if (!menu.classList.contains("is-open") && menu.hidden) return;
  menu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  const toggle = $("#mobileMenuToggle");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
  setTimeout(() => {
    menu.hidden = true;
    menu.setAttribute("aria-hidden", "true");
  }, 200);
}

function renderView(view = state.view) {
  if (view === "dashboard") renderDashboard();
  if (view === "learn") renderLearn();
  if (view === "planner") renderPlanner();
  if (view === "log") renderLog();
  if (view === "reference") renderReference();
  if (view === "quiz") renderQuiz();
  if (view === "settings") renderSettings();
}

function renderDashboard() {
  const progress = Math.round((state.completed.length / modules.length) * 100);
  $("#progressNumber").textContent = `${progress}%`;
  $("#logNumber").textContent = state.logs.length;
  $("#planNumber").textContent = state.plans.length;
  $("#nextPlan").innerHTML = state.plans[0] ? planCard(state.plans[0], true) : emptyState("Lag en øktplan, så ligger neste økt klar her.");
  const recent = [...state.logs].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
  $("#recentLogs").innerHTML = recent.length ? recent.map(logCard).join("") : emptyState("Ingen logg ennå. Start med én enkel observasjon fra neste økt.");

  const hero = $("#nextStepHero");
  if (hero) {
    const next = computeNextStep();
    hero.dataset.tone = next.tone || "primary";
    hero.innerHTML = `
      <p class="eyebrow">${escapeHtml(next.eyebrow)}</p>
      <h3>${escapeHtml(next.title)}</h3>
      <p class="next-step-body">${escapeHtml(next.body)}</p>
      <div class="next-step-actions">
        <button class="primary-button" type="button" ${next.actionData}>${escapeHtml(next.actionLabel)}</button>
        ${next.secondary ? `<button class="text-button" type="button" ${next.secondary.data}>${escapeHtml(next.secondary.label)}</button>` : ""}
      </div>
      ${next.footnote ? `<p class="small next-step-footnote">${escapeHtml(next.footnote)}</p>` : ""}
    `;
  }

  renderProgressCharts();
  renderExamReadiness();
  renderMiniQuiz();
}

function renderExamReadiness() {
  const panel = $("#examReadinessPanel");
  const body = $("#examReadinessBody");
  if (!panel || !body) return;

  const hasAnyActivity = state.completed.length || state.logs.length;
  if (!hasAnyActivity) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;

  const loggedTypes = new Set(state.logs.map((l) => l.planId || l.planTitle || "").filter(Boolean));
  const logsByFocus = {};
  state.logs.forEach((l) => {
    if (l.planTitle) {
      const bp = Object.values(planBlueprints).find((b) => b.title === l.planTitle);
      if (bp) {
        const mod = bp.module;
        logsByFocus[mod] = (logsByFocus[mod] || 0) + 1;
      }
    }
  });

  const rows = modules.map((module) => {
    const isRead = state.completed.includes(module.id);
    const moduleQs = quizQuestions.map((q, idx) => ({ q, idx })).filter(({ q }) => q.module === module.id);
    const totalQs = moduleQs.length;
    const masteredQs = moduleQs.filter(({ idx }) => {
      const m = state.mastery[idx];
      return m && m.correct > m.wrong;
    }).length;
    const quizOk = totalQs > 0 && masteredQs >= Math.ceil(totalQs * 0.6);
    const hasLog = (logsByFocus[module.id] || 0) > 0;

    const checks = [
      { ok: isRead, label: "Lest" },
      { ok: quizOk, label: `Quiz (${masteredQs}/${totalQs})` },
      { ok: hasLog, label: "Loggført" },
    ];
    const score = checks.filter((c) => c.ok).length;
    const checksHtml = checks.map((c) =>
      `<span class="exam-check ${c.ok ? "is-ok" : ""}" aria-label="${c.label}: ${c.ok ? "ok" : "mangler"}">${c.ok ? "✓" : "○"} ${escapeHtml(c.label)}</span>`
    ).join("");

    return `<div class="exam-row" data-score="${score}">
      <span class="exam-module">${escapeHtml(module.title.replace(/^\d+\.\s*/, ""))}</span>
      <div class="exam-checks">${checksHtml}</div>
    </div>`;
  }).join("");

  const totalReady = modules.filter((m) => {
    const isRead = state.completed.includes(m.id);
    const moduleQs = quizQuestions.map((q, idx) => ({ q, idx })).filter(({ q }) => q.module === m.id);
    const masteredQs = moduleQs.filter(({ idx }) => { const mm = state.mastery[idx]; return mm && mm.correct > mm.wrong; }).length;
    const quizOk = moduleQs.length > 0 && masteredQs >= Math.ceil(moduleQs.length * 0.6);
    return isRead && quizOk;
  }).length;

  body.innerHTML = `
    <p class="small exam-legend">Lest + 60 % quiz mestret = klar for prøve per modul.</p>
    <div class="exam-rows">${rows}</div>
    <p class="small exam-summary">${totalReady} av ${modules.length} moduler prøveklare.</p>`;
}

function logDayKey(log) {
  if (log && typeof log.date === "string" && log.date) return log.date.slice(0, 10);
  const ts = log?.createdAt || 0;
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function renderProgressCharts() {
  const panel = $("#progressChartsPanel");
  if (!panel) return;
  if (!state.logs.length) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  renderMasteryChart($("#masteryChart"));
  renderFrequencyHeatmap($("#frequencyChart"));
}

function renderMasteryChart(container) {
  if (!container) return;
  const rated = state.logs
    .map((l) => ({ t: l.createdAt || Date.parse(l.date) || 0, v: Number(l.rating) || 0 }))
    .filter((p) => p.v > 0)
    .sort((a, b) => a.t - b.t);

  if (rated.length < 2) {
    container.innerHTML = '<p class="small chart-empty">Loggfør minst to økter med mestringsscore (stjerner) for å se kurven.</p>';
    return;
  }

  const W = 320;
  const H = 130;
  const padX = 24;
  const padTop = 12;
  const padBottom = 20;
  const n = rated.length;
  const xFor = (i) => padX + (n === 1 ? 0 : (i * (W - 2 * padX)) / (n - 1));
  const yFor = (v) => padTop + (1 - v / 5) * (H - padTop - padBottom);

  const gridY = [0, 1, 2, 3, 4, 5]
    .map((v) => {
      const y = yFor(v).toFixed(1);
      return `<line x1="${padX}" y1="${y}" x2="${W - padX}" y2="${y}" class="chart-grid" /><text x="${padX - 6}" y="${(yFor(v) + 3).toFixed(1)}" class="chart-axis-label" text-anchor="end">${v}</text>`;
    })
    .join("");

  const linePts = rated.map((p, i) => `${xFor(i).toFixed(1)},${yFor(p.v).toFixed(1)}`).join(" ");
  const areaPts = `${padX},${yFor(0).toFixed(1)} ${linePts} ${(W - padX).toFixed(1)},${yFor(0).toFixed(1)}`;
  const dots = rated
    .map((p, i) => `<circle cx="${xFor(i).toFixed(1)}" cy="${yFor(p.v).toFixed(1)}" r="3" class="chart-dot" />`)
    .join("");

  const avg = (rated.reduce((s, p) => s + p.v, 0) / n).toFixed(1);

  const fmtDate = (ts) => new Date(ts).toLocaleDateString("no-NO", { day: "numeric", month: "short" });
  const xAxisBottom = (H - padBottom + 13).toFixed(1);
  const xLabels = `
    <text x="${padX}" y="${xAxisBottom}" class="chart-axis-label">${escapeHtml(fmtDate(rated[0].t))}</text>
    <text x="${(W - padX).toFixed(1)}" y="${xAxisBottom}" class="chart-axis-label" text-anchor="end">${escapeHtml(fmtDate(rated[n - 1].t))}</text>
    <text x="${(W / 2).toFixed(1)}" y="${xAxisBottom}" class="chart-axis-label" text-anchor="middle">Tid →</text>`;

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" class="chart-svg" role="img" aria-label="Mestringsscore over tid, snitt ${avg} av 5">
      ${gridY}
      ${xLabels}
      <polygon points="${areaPts}" class="chart-area" />
      <polyline points="${linePts}" class="chart-line" fill="none" />
      ${dots}
    </svg>
    <p class="small chart-caption">${n} økter med score · snitt ${avg} av 5</p>`;
}

function renderFrequencyHeatmap(container) {
  if (!container) return;
  const counts = {};
  state.logs.forEach((l) => {
    const k = logDayKey(l);
    counts[k] = (counts[k] || 0) + 1;
  });

  const weeks = 18;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Mandag = 0
  const dow = (today.getDay() + 6) % 7;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - dow);
  const start = new Date(lastMonday);
  start.setDate(lastMonday.getDate() - (weeks - 1) * 7);

  const pad = (n) => String(n).padStart(2, "0");
  const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const level = (c) => (c <= 0 ? 0 : c === 1 ? 1 : c === 2 ? 2 : 3);

  const cell = 13;
  const gap = 3;
  const labelW = 22;
  const topLabel = 12;
  const W = labelW + weeks * (cell + gap);
  const H = topLabel + 7 * (cell + gap);
  const dayLabels = ["", "Tir", "", "Tor", "", "Lør", ""];

  let rects = "";
  let monthLabels = "";
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      if (date > today) continue;
      const k = keyOf(date);
      const c = counts[k] || 0;
      const x = labelW + w * (cell + gap);
      const y = topLabel + d * (cell + gap);
      const title = `${date.toLocaleDateString("no-NO", { day: "numeric", month: "short" })}: ${c} ${c === 1 ? "økt" : "økter"}`;
      rects += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" class="heat heat-${level(c)}"><title>${escapeHtml(title)}</title></rect>`;
      if (d === 0) {
        const m = date.getMonth();
        if (m !== lastMonth) {
          lastMonth = m;
          const name = date.toLocaleDateString("no-NO", { month: "short" });
          monthLabels += `<text x="${x}" y="${topLabel - 3}" class="chart-axis-label">${escapeHtml(name)}</text>`;
        }
      }
    }
  }

  const dayLabelText = dayLabels
    .map((lbl, d) => (lbl ? `<text x="0" y="${topLabel + d * (cell + gap) + cell - 2}" class="chart-axis-label">${lbl}</text>` : ""))
    .join("");

  const total = state.logs.length;
  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" class="chart-svg heatmap-svg" role="img" aria-label="Treningsfrekvens siste ${weeks} uker">
      ${monthLabels}
      ${dayLabelText}
      ${rects}
    </svg>
    <div class="heat-legend"><span class="small">Mindre</span><span class="heat heat-0"></span><span class="heat heat-1"></span><span class="heat heat-2"></span><span class="heat heat-3"></span><span class="small">Mer</span><span class="small heat-total">· ${total} totalt</span></div>`;
}

function getWeakestQuestionIndex(skipIndices = new Set()) {
  const completed = new Set(state.completed || []);
  if (completed.size === 0) return null;
  const candidates = quizQuestions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q, idx }) => completed.has(q.module) && !skipIndices.has(idx));
  if (!candidates.length) return null;
  candidates.sort((a, b) => {
    const ma = state.mastery[a.idx] || { correct: 0, wrong: 0, lastSeen: 0 };
    const mb = state.mastery[b.idx] || { correct: 0, wrong: 0, lastSeen: 0 };
    const scoreA = (ma.correct || 0) - (ma.wrong || 0);
    const scoreB = (mb.correct || 0) - (mb.wrong || 0);
    if (scoreA !== scoreB) return scoreA - scoreB;
    return (ma.lastSeen || 0) - (mb.lastSeen || 0);
  });
  return candidates[0].idx;
}

let miniQuizState = null;

function renderMiniQuiz() {
  const card = $("#miniQuizCard");
  if (!card) return;
  if (!state.completed.length) {
    card.hidden = true;
    miniQuizState = null;
    return;
  }

  if (!miniQuizState) {
    const idx = getWeakestQuestionIndex();
    if (idx === null) {
      card.hidden = true;
      return;
    }
    const question = quizQuestions[idx];
    miniQuizState = {
      questionIndex: idx,
      answered: false,
      lastCorrect: null,
      optionMap: shuffle(question.options.map((_, i) => i)),
      seenIndices: new Set([idx]),
      askedCount: 0,
    };
  }

  card.hidden = false;
  const idx = miniQuizState.questionIndex;
  const question = quizQuestions[idx];
  const moduleDef = modules.find((m) => m.id === question.module);
  const moduleLabel = moduleDef ? moduleDef.title.replace(/^\d+\.\s*/, "") : question.module;

  const optionsHtml = miniQuizState.optionMap
    .map((originalIndex, displayIndex) => {
      let klass = "";
      if (miniQuizState.answered) {
        if (originalIndex === question.answer) klass = "is-correct";
        if (miniQuizState.lastChoice === displayIndex && originalIndex !== question.answer) klass = "is-wrong";
      }
      return `<button class="quiz-option ${klass}" data-mini-quiz-choice="${displayIndex}" type="button" ${miniQuizState.answered ? "disabled" : ""}>${escapeHtml(question.options[originalIndex])}</button>`;
    })
    .join("");

  card.innerHTML = `
    <div class="mini-quiz-head">
      <div>
        <p class="eyebrow">Rask sjekk</p>
        <h3>Repeter ett spørsmål</h3>
      </div>
      <button class="text-button" type="button" data-mini-quiz-dismiss>Skjul i dag</button>
    </div>
    <div class="quiz-meta">
      <span class="tag">${escapeHtml(moduleLabel)}</span>
      <span class="tag">${escapeHtml(question.pages)}</span>
      ${question.examRelevant ? '<span class="tag tag-exam" title="Sentralt prøvetema">Prøvetema</span>' : ""}
    </div>
    <p class="quiz-question mini-quiz-question">${escapeHtml(question.question)}</p>
    <div class="quiz-options mini-quiz-options" role="radiogroup" aria-label="Svaralternativer">${optionsHtml}</div>
    ${miniQuizState.answered
      ? `<div class="quiz-feedback"><strong>${miniQuizState.lastCorrect ? "Riktig." : "Ikke helt."}</strong> ${escapeHtml(question.explain)}</div>
        <div class="mini-quiz-actions">
          <button class="primary-button" type="button" data-mini-quiz-next>Nytt spørsmål</button>
          <button class="text-button" type="button" data-next-action="weak-quiz">Full quiz-runde</button>
        </div>`
      : `<p class="small">Velg et svar — forklaringen kommer med en gang.</p>`}
  `;
}

function answerMiniQuiz(displayChoice) {
  if (!miniQuizState || miniQuizState.answered) return;
  const idx = miniQuizState.questionIndex;
  const question = quizQuestions[idx];
  const originalIndex = miniQuizState.optionMap[displayChoice];
  const correct = originalIndex === question.answer;
  miniQuizState.answered = true;
  miniQuizState.lastChoice = displayChoice;
  miniQuizState.lastCorrect = correct;
  const mastery = state.mastery[idx] || { correct: 0, wrong: 0, lastSeen: 0 };
  if (correct) mastery.correct += 1;
  else mastery.wrong += 1;
  mastery.lastSeen = Date.now();
  state.mastery[idx] = mastery;
  saveState();
  renderMiniQuiz();
}

function nextMiniQuiz() {
  if (!miniQuizState) return;
  const nextIdx = getWeakestQuestionIndex(miniQuizState.seenIndices);
  if (nextIdx === null) {
    miniQuizState = null;
    const card = $("#miniQuizCard");
    if (card) card.hidden = true;
    return;
  }
  const question = quizQuestions[nextIdx];
  miniQuizState.seenIndices.add(nextIdx);
  miniQuizState.questionIndex = nextIdx;
  miniQuizState.answered = false;
  miniQuizState.lastCorrect = null;
  miniQuizState.lastChoice = null;
  miniQuizState.optionMap = shuffle(question.options.map((_, i) => i));
  miniQuizState.askedCount += 1;
  renderMiniQuiz();
}

function computeNextStep() {
  const completed = state.completed || [];
  const plans = state.plans || [];
  const logs = state.logs || [];
  const firstUnreadModule = modules.find((m) => !completed.includes(m.id));
  const newestLog = logs.length ? [...logs].sort((a, b) => b.createdAt - a.createdAt)[0] : null;
  const daysSinceLog = newestLog ? Math.floor((Date.now() - newestLog.createdAt) / (1000 * 60 * 60 * 24)) : null;

  // Resume: aktiv modul som ikke er fullført — kun hvis ikke ny bruker
  const activeMod = state.activeModule ? modules.find((m) => m.id === state.activeModule) : null;
  const hasActiveResume = activeMod && !completed.includes(activeMod.id) && (completed.length || logs.length || plans.length);

  // Helt ny bruker
  if (!completed.length && !plans.length && !logs.length) {
    return {
      tone: "welcome",
      eyebrow: "Velkommen til SporLab",
      title: "Aldri gått spor med hunden før?",
      body: "Start med en kort guide som tar deg gjennom kartlegging av hunden, valg av startmetode og hvordan en helt første sporøkt kan se ut. Hentet rett fra leseheftet.",
      actionLabel: "Åpne «Før første spor»",
      actionData: 'data-next-action="open-getstarted"',
      secondary: { label: "Jeg har trent spor før — start Modul 1", data: 'data-next-action="start-module"' },
      footnote: "Du kan komme tilbake hit når som helst.",
    };
  }

  // Resume — kommer før andre forslag hvis bruker satt midt i en modul
  if (hasActiveResume) {
    const shortTitle = activeMod.title.replace(/^\d+\.\s*/, "");
    return {
      tone: "primary",
      eyebrow: "Fortsett der du var",
      title: `Du leste ${shortTitle} sist`,
      body: activeMod.summary,
      actionLabel: "Fortsett modulen",
      actionData: 'data-next-action="resume-module"',
      secondary: plans.length
        ? { label: "Eller loggfør en gjennomført økt", data: `data-next-action="log-from-plan" data-plan-id="${escapeHtml(plans[0].id)}"` }
        : { label: "Eller planlegg en økt", data: 'data-next-action="open-planner"' },
      footnote: `${activeMod.minutes} min · ${activeMod.pages}`,
    };
  }

  // Har lest noe, ingen plan ennå
  if (completed.length && !plans.length) {
    const nextModuleHint = firstUnreadModule ? ` Når dere kommer tilbake fra felt: ${firstUnreadModule.title.replace(/^\d+\.\s*/, "")} står for tur.` : "";
    return {
      tone: "primary",
      eyebrow: "Klar for første økt?",
      title: "Planlegg en økt — det tar 10 minutter",
      body: `Du har fullført ${completed.length} ${completed.length === 1 ? "modul" : "moduler"}. Nå er det på tide å bygge en konkret økt og prøve det ute.${nextModuleHint}`,
      actionLabel: "Start planleggeren",
      actionData: 'data-next-action="open-planner"',
      secondary: firstUnreadModule ? { label: `Les videre i løypa først`, data: 'data-next-action="continue-learning"' } : null,
    };
  }

  // Har plan, ingen logg
  if (plans.length && !logs.length) {
    return {
      tone: "primary",
      eyebrow: "Planen ligger klar",
      title: "Tren med planen og logg det dere så",
      body: `Du har «${plans[0].title}» klar. Når dere har trent, loggfør de tre observasjonspunktene — det er der læringen festes.`,
      actionLabel: "Loggfør gjennomført",
      actionData: `data-next-action="log-from-plan" data-plan-id="${escapeHtml(plans[0].id)}"`,
      secondary: { label: "Vis planen", data: 'data-next-action="open-planner"' },
    };
  }

  // Inaktivitet (siste logg > 7 dager)
  if (daysSinceLog !== null && daysSinceLog >= 7) {
    return {
      tone: "primary",
      eyebrow: "Tid for ny økt",
      title: `Det er ${daysSinceLog} dager siden sist`,
      body: firstUnreadModule
        ? `Repetisjon holder hunden skarp. Planlegg en ny økt — eller fortsett læringsløypa med ${firstUnreadModule.title.replace(/^\d+\.\s*/, "")}.`
        : "Repetisjon holder hunden skarp. Planlegg en ny økt.",
      actionLabel: "Planlegg ny økt",
      actionData: 'data-next-action="open-planner"',
      secondary: firstUnreadModule ? { label: "Les neste modul", data: 'data-next-action="continue-learning"' } : null,
    };
  }

  // Har logg, fortsatt moduler igjen
  if (firstUnreadModule) {
    return {
      tone: "primary",
      eyebrow: "Neste i løypa",
      title: firstUnreadModule.title,
      body: firstUnreadModule.summary,
      actionLabel: "Åpne modulen",
      actionData: 'data-next-action="continue-learning"',
      secondary: { label: "Planlegg en økt", data: 'data-next-action="open-planner"' },
      footnote: `${firstUnreadModule.minutes} min lesing · ${firstUnreadModule.pages}`,
    };
  }

  // Alle moduler er fullført
  return {
    tone: "success",
    eyebrow: "Du har gått hele løypa",
    title: "Hold formen — planlegg neste økt",
    body: "Alle åtte moduler er fullført. Nå handler det om å bruke det i felt og loggføre observasjonene.",
    actionLabel: "Planlegg ny økt",
    actionData: 'data-next-action="open-planner"',
    secondary: { label: "Repeter svake quiz-spørsmål", data: 'data-next-action="weak-quiz"' },
  };
}

function renderLearn() {
  const shell = $("#learnShell");
  if (!shell) return;
  if (state.activeGuide === "getting-started") {
    shell.innerHTML = renderGettingStarted();
  } else if (state.activeModule) {
    shell.innerHTML = renderLearnModule(state.activeModule);
  } else {
    shell.innerHTML = renderLearnIntro();
  }
}

function renderLearnIntro() {
  const progress = Math.round((state.completed.length / modules.length) * 100);
  const doneCount = state.completed.length;
  const cards = modules
    .map((module) => {
      const done = state.completed.includes(module.id);
      const moduleQs = quizQuestions
        .map((q, idx) => ({ q, idx }))
        .filter(({ q }) => q.module === module.id);
      const totalQs = moduleQs.length;
      const masteredQs = moduleQs.filter(({ idx }) => {
        const m = state.mastery[idx];
        return m && m.correct > m.wrong;
      }).length;
      const quizTag = totalQs > 0
        ? `<span class="tag tag-quiz" title="Quiz: ${masteredQs} av ${totalQs} mestret">Quiz ${masteredQs}/${totalQs}</span>`
        : "";
      return `
        <button class="learn-menu-card" data-module-open="${module.id}" data-done="${done}" type="button">
          <h4>
            <span>${escapeHtml(module.title)}</span>
            ${done ? '<span class="done-mark" aria-label="Fullført">✓</span>' : ""}
          </h4>
          <p>${escapeHtml(module.summary)}</p>
          <div class="tag-row">
            <span class="tag">${escapeHtml(module.pages)}</span>
            <span class="tag">${module.minutes} min</span>
            <span class="tag">${done ? "Fullført" : "Ikke startet"}</span>
            ${quizTag}
          </div>
        </button>`;
    })
    .join("");
  return `
    <button class="getting-started-card" type="button" data-open-getstarted>
      <div class="gs-card-icon" aria-hidden="true">▶</div>
      <div class="gs-card-body">
        <p class="eyebrow">Før du starter</p>
        <h4>Aldri gått spor med hunden før?</h4>
        <p>Les en kort guide som tar deg gjennom kartlegging, valg av startmetode og hvordan en helt første sporøkt kan se ut. Hentet fra leseheftet s. 7-11.</p>
      </div>
      <span class="gs-card-arrow" aria-hidden="true">→</span>
    </button>
    <section class="learn-intro">
      <p class="eyebrow">Læringsløype · E8 Sporoppsøk og E9 Spor</p>
      <h3>Slik henger heftet sammen</h3>
      <p>
        Læringsløypa følger den røde tråden fra E8/E9-heftet: først forstår vi <strong>grunnlaget</strong>
        (motivasjon, utfordring, hjelp), så bygger vi <strong>sporet</strong> som ferdighet, deretter
        <strong>sporoppsøket</strong> og <strong>gamle spor</strong>. Til slutt kommer momentene som løser
        de praktiske problemene: <strong>retning</strong>, <strong>sportap</strong>,
        <strong>kryssende spor</strong> og <strong>sirkelspor</strong>.
      </p>
      <div class="learn-thread">
        <p><strong>Slik bruker du løypa:</strong></p>
        <ol>
          <li>Les én modul av gangen — innholdet er kort, men dypt.</li>
          <li>Hver modul har <em>Kjernen</em>, <em>Teoridykk</em>, <em>Ute i felt</em> og <em>Refleksjon for laget</em>. Bare én er åpen om gangen.</li>
          <li>Marker som fullført når dere har snakket gjennom modulen på laget.</li>
          <li>Bruk «Quiz denne modulen» til å sikre at det sitter.</li>
        </ol>
      </div>
      <div class="learn-progress">
        <p class="small">Fullført: <strong>${doneCount} av ${modules.length} moduler</strong> (${progress}%).</p>
        <div class="progress-bar" aria-label="Progresjon i læringsløypa"><span style="width:${progress}%"></span></div>
      </div>
    </section>
    <section>
      <p class="eyebrow">Innhold</p>
      <h3 class="visually-hidden">Modulene i løypa</h3>
      <div class="learn-menu">${cards}</div>
    </section>`;
}

function renderLearnModule(moduleId) {
  const module = modules.find((item) => item.id === moduleId) || modules[0];
  const done = state.completed.includes(module.id);
  const deepDive = theoryDeepDives[module.id] || [];
  const reflections = reflectionLibrary[module.id] || [module.reflection];
  const moduleIndex = modules.findIndex((m) => m.id === module.id);
  const prevModule = moduleIndex > 0 ? modules[moduleIndex - 1] : null;
  const nextModule = moduleIndex < modules.length - 1 ? modules[moduleIndex + 1] : null;
  const open = state.learnAccordion || "learn";

  const accordionItem = (id, title, contentHtml) => `
    <article class="accordion-item" data-open="${open === id}" data-accordion="${id}">
      <button class="accordion-trigger" type="button" data-accordion-toggle="${id}" aria-expanded="${open === id}">
        <span>${escapeHtml(title)}</span>
        <span class="accordion-chevron" aria-hidden="true">▾</span>
      </button>
      <div class="accordion-panel">${contentHtml}</div>
    </article>`;

  const learnHtml = `<ul>${module.learn.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  const deepHtml = deepDive.length
    ? `
        <div class="theory-search">
          <label class="visually-hidden" for="theorySearch">Søk i teoridykk</label>
          <input id="theorySearch" type="search" placeholder="Søk i teoridykk for denne modulen…" autocomplete="off" />
          <p class="small theory-search-hint">Klikk på en bolk for å lese hele teksten fra leseheftet (E8/E9).</p>
        </div>
        <div class="theory-stack" id="theoryStack">${deepDive
          .map((item) => {
            const paragraphs = (item.full || item.text)
              .split(/\n\n+/)
              .map((p) => `<p>${escapeHtml(p)}</p>`)
              .join("");
            const pageBadge = item.pages
              ? `<span class="theory-pages">${escapeHtml(item.pages)}</span>`
              : "";
            return `<details class="theory-card" data-theory-card>
              <summary>
                <div class="theory-card-head">
                  <h5>${escapeHtml(item.title)}</h5>
                  ${pageBadge}
                </div>
                <p class="theory-preview">${escapeHtml(item.text)}</p>
                <span class="theory-expand-cue">Les hele <span aria-hidden="true">▾</span></span>
              </summary>
              <div class="theory-body">${paragraphs}</div>
            </details>`;
          })
          .join("")}</div>
        <p class="small theory-empty" id="theorySearchEmpty" hidden>Ingen bolker matchet søket.</p>`
    : `<p class="small">Ingen ekstra teori for denne modulen.</p>`;
  const moduleDiagram = diagrams.find((d) => d.module === module.id);
  const diagramHtml = moduleDiagram
    ? `<article class="diagram-card">
        ${moduleDiagram.svg}
        <h4>${escapeHtml(moduleDiagram.title)}</h4>
        <p>${escapeHtml(moduleDiagram.text)}</p>
      </article>`
    : "";
  const fieldHtml = `<div class="callout"><p>${escapeHtml(module.field)}</p></div>${diagramHtml}`;
  const reflectionHtml = `
    <ul class="reflection-list">${reflections.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>
    <p class="small">Velg ett spørsmål per økt, eller la treningsgruppa svare på ett hver.</p>`;

  return `
    <div class="learn-module">
      <header class="learn-module-head">
        <button class="learn-back-button" type="button" data-learn-back>← Til oversikt</button>
        <div>
          <p class="eyebrow">${escapeHtml(module.pages)} · ${module.minutes} min</p>
          <h3>${escapeHtml(module.title)}</h3>
          <div class="lesson-meta">
            ${module.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </div>
      </header>

      <p>${escapeHtml(module.summary)}</p>

      <div class="learn-accordion">
        ${accordionItem("learn", "Kjernen", learnHtml)}
        ${accordionItem("deep", "Teoridykk", deepHtml)}
        ${accordionItem("field", "Ute i felt", fieldHtml)}
        ${accordionItem("reflection", "Refleksjon for laget", reflectionHtml)}
      </div>

      ${module.drill ? `<section class="module-drill">
        <p class="eyebrow">Prøv dette i felt</p>
        <h4>${escapeHtml(module.drill.title)} <span class="drill-duration">· ${escapeHtml(module.drill.duration)}</span></h4>
        <p>${escapeHtml(module.drill.description)}</p>
        <button class="primary-button" type="button" data-drill-plan="${escapeHtml(module.drill.focus)}">Planlegg denne økta nå →</button>
      </section>` : ""}

      <div class="learn-actions">
        <button class="primary-button" id="toggleComplete" type="button">${done ? "Marker som åpen" : "Marker som fullført"}</button>
        <button class="ghost-button" data-start-module-quiz="${module.id}" type="button">Quiz denne modulen</button>
        <span class="nav-pill">
          <button type="button" data-module-nav="${prevModule ? prevModule.id : ""}" ${prevModule ? "" : "disabled"} aria-label="Forrige modul">◀ Forrige</button>
          <button type="button" data-module-nav="${nextModule ? nextModule.id : ""}" ${nextModule ? "" : "disabled"} aria-label="Neste modul">Neste ▶</button>
        </span>
      </div>
    </div>`;
}

function renderSettings() {
  const status = $("#settingsThemeStatus");
  const theme = state.theme || "auto";
  const labels = { auto: "Auto", light: "Lys", dark: "Mørk" };
  if (status) status.textContent = `Nåværende: ${labels[theme] || "Auto"}.`;
  ["Auto", "Light", "Dark"].forEach((variant) => {
    const btn = $(`#settingsTheme${variant}`);
    if (!btn) return;
    const expected = variant.toLowerCase();
    btn.classList.toggle("theme-button-active", theme === expected);
    btn.setAttribute("aria-pressed", theme === expected ? "true" : "false");
  });
}


const wizardSteps = [
  { id: "focus", title: "Hva trener vi?", short: "Velg" },
  { id: "theory", title: "Det du må huske", short: "Les" },
  { id: "plan", title: "Planen din", short: "Plan" },
  { id: "observe", title: "Tre ting å se etter", short: "Observer" },
];

function renderPlanner() {
  const progress = $("#wizardProgress");
  const body = $("#wizardBody");
  if (!progress || !body) return;

  const step = Math.max(0, Math.min(state.wizardStep || 0, wizardSteps.length - 1));
  state.wizardStep = step;

  progress.innerHTML = wizardSteps
    .map((s, i) => {
      const status = i < step ? "done" : i === step ? "active" : "upcoming";
      const clickable = i <= step || (i === step + 1 && state.currentPlan);
      return `<button class="wizard-step" data-step="${status}" data-go-step="${i}" type="button" ${clickable ? "" : "disabled"} aria-current="${i === step ? "step" : "false"}">
        <span class="wizard-step-num">${i + 1}</span>
        <span class="wizard-step-label">${escapeHtml(s.short)}</span>
      </button>`;
    })
    .join("");

  if (step === 0) body.innerHTML = renderWizardFocus();
  else if (step === 1) body.innerHTML = renderWizardTheory();
  else if (step === 2) body.innerHTML = renderWizardPlan();
  else if (step === 3) body.innerHTML = renderWizardObserve();
}

function renderWizardFocus() {
  const cards = focusOrder
    .map((focusId) => {
      const bp = planBlueprints[focusId];
      const moduleDef = moduleForFocus(focusId);
      const selected = state.currentPlan?.focus === focusId;
      return `<button class="focus-card ${selected ? "is-selected" : ""}" data-pick-focus="${focusId}" type="button">
        <span class="focus-card-title">${escapeHtml(bp.title)}</span>
        <span class="focus-card-pages">${escapeHtml(bp.pages)}</span>
        <span class="focus-card-intro">${escapeHtml(bp.intro || "")}</span>
        ${moduleDef ? `<span class="focus-card-module">Modul: ${escapeHtml(moduleDef.title.replace(/^\d+\.\s*/, ""))}</span>` : ""}
      </button>`;
    })
    .join("");

  // Forrige økt-hint: vis "neste steg"-notat fra siste logg
  const newestLog = state.logs.length
    ? [...state.logs].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0]
    : null;
  const nextStepHint = newestLog?.next?.trim()
    ? `<div class="callout wizard-nextstep-hint">
        <p class="eyebrow">Forrige økt anbefalte</p>
        <p>${escapeHtml(newestLog.next)}</p>
        <p class="small">${escapeHtml(newestLog.date || "")}${newestLog.dog ? ` · ${escapeHtml(newestLog.dog)}` : ""}</p>
      </div>`
    : "";

  // Plan-historikk: vis lagrede planer øverst
  const recentPlans = (state.plans || []).slice(0, 4);
  const planHistoryHtml = recentPlans.length
    ? `<section class="wizard-plan-history">
        <p class="eyebrow">Mine planer</p>
        <div class="plan-history-list">
          ${recentPlans.map((p) => {
            const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString("no-NO", { day: "numeric", month: "short" }) : "";
            return `<div class="plan-history-item">
              <div class="plan-history-info">
                <strong>${escapeHtml(p.title)}</strong>
                <span class="small">${escapeHtml(date)}${p.dog ? ` · ${escapeHtml(p.dog)}` : ""}</span>
              </div>
              <div class="plan-history-actions">
                <button class="ghost-button small-button" data-load-plan="${escapeHtml(p.id)}" type="button">Gjenbruk</button>
                <button class="text-button small-button" data-delete-plan="${escapeHtml(p.id)}" type="button">Slett</button>
              </div>
            </div>`;
          }).join("")}
        </div>
      </section>`
    : "";

  return `
    <section class="wizard-step-panel">
      ${planHistoryHtml}
      ${nextStepHint}
      <header class="wizard-head">
        <p class="eyebrow">Steg 1 av 4 · ca. 1 min</p>
        <h3>Hva skal dere trene på i dag?</h3>
        <p class="wizard-lede">Velg ett fokus. Du kan endre detaljene senere — det viktigste er å låse hva økta handler om.</p>
      </header>
      <div class="focus-grid">${cards}</div>
    </section>`;
}

function renderWizardTheory() {
  const focus = state.currentPlan?.focus;
  if (!focus) {
    state.wizardStep = 0;
    return renderWizardFocus();
  }
  const bp = planBlueprints[focus];
  const moduleDef = moduleForFocus(focus);
  const theoryCards = theoryForFocus(focus);
  const learnBullets = moduleDef?.learn || [];

  const theoryHtml = theoryCards
    .map(
      (item) => `<details class="theory-card wizard-theory-card">
        <summary>
          <div class="theory-card-head">
            <h5>${escapeHtml(item.title)}</h5>
            ${item.pages ? `<span class="theory-pages">${escapeHtml(item.pages)}</span>` : ""}
          </div>
          <p class="theory-preview">${escapeHtml(item.text)}</p>
          <span class="theory-expand-cue">Les hele <span aria-hidden="true">▾</span></span>
        </summary>
        <div class="theory-body">${(item.full || item.text)
          .split(/\n\n+/)
          .map((p) => `<p>${escapeHtml(p)}</p>`)
          .join("")}</div>
      </details>`
    )
    .join("");

  return `
    <section class="wizard-step-panel">
      <header class="wizard-head">
        <p class="eyebrow">Steg 2 av 4 · ca. 2-3 min</p>
        <h3>${escapeHtml(bp.title)} — det du må huske</h3>
        <p class="wizard-lede">${escapeHtml(bp.intro || "Tre korte teoripunkter fra leseheftet før dere går ut.")}</p>
      </header>

      ${learnBullets.length ? `<div class="callout wizard-key-points">
        <p class="eyebrow">Kjernepunkter ${moduleDef ? `· ${escapeHtml(moduleDef.pages)}` : ""}</p>
        <ul>${learnBullets.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>
      </div>` : ""}

      ${theoryHtml ? `<div class="wizard-theory-stack">
        <p class="small">Klikk på en bolk for å lese hele teksten fra leseheftet.</p>
        ${theoryHtml}
      </div>` : ""}

      <div class="wizard-nav">
        <button class="ghost-button" data-wizard-back type="button">◀ Tilbake</button>
        <button class="primary-button" data-wizard-next type="button">Til planen ▶</button>
      </div>
    </section>`;
}

function renderWizardPlan() {
  const plan = state.currentPlan;
  if (!plan) {
    state.wizardStep = 0;
    return renderWizardFocus();
  }
  const showDetails = !!state.wizardShowDetails;

  const stepsHtml = (plan.steps || [])
    .map((step, i) => `<li><span class="step-index">${i + 1}</span><span>${escapeHtml(step)}</span></li>`)
    .join("");

  const detailsHtml = `
    <form class="wizard-details" id="wizardDetailsForm" ${showDetails ? "" : "hidden"}>
      <p class="small">Disse er valgfrie. De forfiner planen, men trengs ikke for at den skal funke.</p>
      <div class="form-row">
        <label>Hundefører
          <input name="handler" value="${escapeHtml(plan.handler || "")}" autocomplete="name" autocapitalize="words" placeholder="Navn" />
        </label>
        <label>Hund
          <input name="dog" value="${escapeHtml(plan.dog || "")}" autocomplete="off" autocapitalize="words" placeholder="Hundens navn" />
        </label>
      </div>
      <div class="form-row">
        <label>Erfaring
          <select name="experience">
            <option value="" ${!plan.experience ? "selected" : ""}>— velg —</option>
            <option value="start" ${plan.experience === "start" ? "selected" : ""}>Startfase</option>
            <option value="trygg" ${plan.experience === "trygg" ? "selected" : ""}>Trygg på grunnspor</option>
            <option value="videre" ${plan.experience === "videre" ? "selected" : ""}>Viderekommen</option>
          </select>
        </label>
        <label>Intensitet
          <select name="intensity">
            <option value="" ${!plan.intensity ? "selected" : ""}>— velg —</option>
            <option value="rolig" ${plan.intensity === "rolig" ? "selected" : ""}>Rolig/metodisk</option>
            <option value="balansert" ${plan.intensity === "balansert" ? "selected" : ""}>Balansert</option>
            <option value="hoy" ${plan.intensity === "hoy" ? "selected" : ""}>Høy intensitet</option>
          </select>
        </label>
      </div>
      <div class="form-row">
        <label>Liggetid
          <select name="age">
            <option value="" ${!plan.age ? "selected" : ""}>— velg —</option>
            <option value="fersk" ${plan.age === "fersk" ? "selected" : ""}>Ferskt</option>
            <option value="6-12" ${plan.age === "6-12" ? "selected" : ""}>6-12 timer</option>
            <option value="12-24" ${plan.age === "12-24" ? "selected" : ""}>12-24 timer</option>
            <option value="24+" ${plan.age === "24+" ? "selected" : ""}>Over ett døgn</option>
          </select>
        </label>
        <label>Underlag
          <select name="terrain">
            <option value="" ${!plan.terrain ? "selected" : ""}>— velg —</option>
            <option value="skog" ${plan.terrain === "skog" ? "selected" : ""}>Skog/vegetasjon</option>
            <option value="vei" ${plan.terrain === "vei" ? "selected" : ""}>Vei/sti</option>
            <option value="hardt" ${plan.terrain === "hardt" ? "selected" : ""}>Hardt underlag</option>
            <option value="blandet" ${plan.terrain === "blandet" ? "selected" : ""}>Blandet</option>
          </select>
        </label>
      </div>
      <label>Særlig hensyn
        <textarea name="note" rows="2" autocapitalize="sentences" placeholder="Vind, forstyrrelser, gruppeoppsett, belønning, sikkerhet">${escapeHtml(plan.note || "")}</textarea>
      </label>
      <button class="ghost-button" type="button" data-wizard-apply-details>Bruk tilpasningene</button>
    </form>`;

  const metaHtml = plan.meta && plan.meta.length
    ? `<p class="small plan-meta">${plan.meta.map(escapeHtml).join(" · ")}</p>`
    : "";

  return `
    <section class="wizard-step-panel">
      <header class="wizard-head">
        <p class="eyebrow">Steg 3 av 4 · ${escapeHtml(plan.pages || "")}</p>
        <h3>${escapeHtml(plan.title)}</h3>
        ${metaHtml}
        <div class="callout"><p><strong>Målbilde:</strong> ${escapeHtml(plan.success || "")}</p></div>
      </header>

      <ol class="plan-steps wizard-plan-steps">${stepsHtml}</ol>

      ${plan.note ? `<p class="plan-note"><strong>Eget notat:</strong> ${escapeHtml(plan.note)}</p>` : ""}

      <div class="wizard-details-toggle">
        <button class="text-button" type="button" data-wizard-toggle-details aria-expanded="${showDetails}">
          ${showDetails ? "▾ Skjul tilpasninger" : "▸ Tilpass planen (fører, hund, terreng, m.m.)"}
        </button>
      </div>
      ${detailsHtml}

      <div class="wizard-nav">
        <button class="ghost-button" data-wizard-back type="button">◀ Tilbake</button>
        <button class="primary-button" data-wizard-next type="button">Til observasjonspunkter ▶</button>
      </div>
    </section>`;
}

function renderWizardObserve() {
  const plan = state.currentPlan;
  if (!plan) {
    state.wizardStep = 0;
    return renderWizardFocus();
  }
  const obs = Array.isArray(plan.observations) && plan.observations.length === 3
    ? plan.observations
    : ["", "", ""];

  const existingPlan = state.plans.find((p) => p.id === plan.id);
  const saveLabel = existingPlan ? "Oppdater plan" : "Lagre planen";

  const checklistHtml = protocols
    .map(
      (protocol) => `<section class="checklist-block">
        <h5>${escapeHtml(protocol.title)}</h5>
        <ul class="checklist-items">
          ${protocol.items
            .map(([_id, title, text]) => `<li>
              <strong>${escapeHtml(title)}</strong>
              <span>${escapeHtml(text)}</span>
            </li>`)
            .join("")}
        </ul>
      </section>`
    )
    .join("");

  return `
    <section class="wizard-step-panel">
      <header class="wizard-head">
        <p class="eyebrow">Steg 4 av 4 · ca. 2 min</p>
        <h3>Tre ting å se etter</h3>
        <p class="wizard-lede">Disse blir strukturen i loggen etter økta. Forslagene er trukket ut fra teorien — tilpass dem til din hund.</p>
      </header>

      <form id="observationForm" class="observation-form">
        ${obs
          .map(
            (text, i) => `<label class="observation-input">
              <span class="observation-num">${i + 1}</span>
              <textarea name="obs-${i}" rows="2" autocapitalize="sentences" placeholder="Hva skal dere se etter?">${escapeHtml(text)}</textarea>
            </label>`
          )
          .join("")}
      </form>

      <details class="wizard-checklist">
        <summary>
          <span><strong>Huskeliste i felt</strong></span>
          <span class="small">15 punkter — utvid for å lese eller skrive ut sammen med planen</span>
        </summary>
        <div class="wizard-checklist-body">${checklistHtml}</div>
      </details>

      <div class="callout wizard-finish-callout">
        <p><strong>Klar.</strong> Når du lagrer planen kan du printe den, ta den med ut, og loggføre observasjonene etterpå.</p>
      </div>

      <div class="wizard-nav">
        <button class="ghost-button" data-wizard-back type="button">◀ Tilbake</button>
        <button class="primary-button" data-wizard-save type="button">${escapeHtml(saveLabel)}</button>
      </div>

      ${existingPlan ? `<div class="wizard-saved-actions">
        <button class="primary-button" data-field-mode="${escapeHtml(plan.id)}" type="button">Start feltmodus</button>
        <button class="ghost-button" data-log-from-plan="${escapeHtml(plan.id)}" type="button">Loggfør gjennomført</button>
        <button class="ghost-button" data-print-plan="${escapeHtml(plan.id)}" type="button">Skriv ut øktkort</button>
        <button class="ghost-button" data-print-plan="${escapeHtml(plan.id)}" data-print-checklist="true" type="button">Øktkort + huskeliste</button>
        <button class="ghost-button" data-share-qr="${escapeHtml(plan.id)}" type="button">Del med QR</button>
        <button class="text-button" data-wizard-restart type="button">Lag en ny plan</button>
      </div>` : ""}
    </section>`;
}

function makePlan(input, previous) {
  const focus = input.focus || "gamle-spor";
  const blueprint = planBlueprints[focus] || planBlueprints["gamle-spor"];
  const adjustments = [];

  if (input.experience === "start") {
    adjustments.push("Hold terreng og sporlegger kjent. Prioriter mestring før variasjon.");
  }
  if (input.intensity === "hoy") {
    adjustments.push("Legg inn analysepunkt og nok vanskelighet til at fart ikke løser oppgaven alene.");
  }
  if (input.terrain === "hardt") {
    adjustments.push("Pass på at belønning og gjenstander ikke blir synsfunn som trekker hunden ut av sporet.");
  }
  if (input.age === "24+") {
    adjustments.push("Bruk kort læringsspor først og legg inn hvile før hovedoppgaven.");
  }

  const meta = [
    input.handler ? `Fører: ${input.handler}` : null,
    input.dog ? `Hund: ${input.dog}` : null,
    input.age ? `Liggetid: ${readableAge(input.age)}` : null,
    input.terrain ? `Underlag: ${readableTerrain(input.terrain)}` : null,
  ].filter(Boolean);

  const observations = previous?.observations && previous.observations.length === 3
    ? previous.observations
    : [...(blueprint.observations || ["", "", ""])];

  return {
    id: previous?.id || makeId(),
    createdAt: previous?.createdAt || Date.now(),
    title: blueprint.title,
    pages: blueprint.pages,
    focus,
    meta,
    steps: [...blueprint.steps, ...adjustments],
    success: blueprint.success,
    note: input.note || "",
    observations,
    handler: input.handler || previous?.handler || "",
    dog: input.dog || previous?.dog || "",
    experience: input.experience || previous?.experience || "",
    intensity: input.intensity || previous?.intensity || "",
    age: input.age || previous?.age || "",
    terrain: input.terrain || previous?.terrain || "",
  };
}

function planSignature(plan) {
  if (!plan) return "";
  return [plan.focus, plan.meta?.join("|") || "", plan.note || ""].join("§");
}

function readableAge(value) {
  return {
    fersk: "Ferskt",
    "6-12": "6-12 timer",
    "12-24": "12-24 timer",
    "24+": "Over ett døgn",
  }[value] || value;
}

function readableTerrain(value) {
  return {
    skog: "Skog/vegetasjon",
    vei: "Vei/sti",
    hardt: "Hardt underlag",
    blandet: "Blandet",
  }[value] || value;
}

function planCard(plan, compact = false) {
  const observations = Array.isArray(plan.observations) ? plan.observations.filter(Boolean) : [];
  const steps = Array.isArray(plan.steps) ? plan.steps : [];
  const stepsHtml = !compact && steps.length
    ? `<ol class="plan-steps">${steps.map((step, i) => `<li><span class="step-index">${i + 1}</span><span>${escapeHtml(step)}</span></li>`).join("")}</ol>`
    : "";
  const observationsHtml = observations.length
    ? `<div class="observation-block">
        <p class="eyebrow">Tre ting å se etter</p>
        <ol class="observation-list">${observations.map((o) => `<li>${escapeHtml(o)}</li>`).join("")}</ol>
      </div>`
    : "";
  const metaHtml = plan.meta && plan.meta.length
    ? `<p class="small plan-meta">${plan.meta.map(escapeHtml).join(" · ")}</p>`
    : "";
  return `
    <article class="plan-card">
      <p class="page-ref">${escapeHtml(plan.pages || "")}</p>
      <h4>${escapeHtml(plan.title)}</h4>
      ${metaHtml}
      <div class="callout"><p><strong>Målbilde:</strong> ${escapeHtml(plan.success || "Tydeligere og mer selvstendig sporarbeid.")}</p></div>
      ${stepsHtml}
      ${observationsHtml}
      ${plan.note ? `<p class="plan-note"><strong>Eget notat:</strong> ${escapeHtml(plan.note)}</p>` : ""}
      <div class="button-row plan-actions no-print">
        ${plan.id ? `<button class="primary-button" data-field-mode="${plan.id}" type="button">Start feltmodus</button>` : ""}
        ${plan.id ? `<button class="ghost-button" data-log-from-plan="${plan.id}" type="button">Loggfør gjennomført</button>` : ""}
        <button class="ghost-button" data-print-plan="${plan.id || ""}" type="button">Skriv ut øktkort</button>
      </div>
    </article>`;
}

function readableExperience(value) {
  return {
    start: "Startfase",
    trygg: "Trygg på grunnspor",
    videre: "Viderekommen",
  }[value] || "";
}

function readableIntensity(value) {
  return {
    rolig: "Rolig/metodisk",
    balansert: "Balansert",
    hoy: "Høy intensitet",
  }[value] || "";
}

/* ---------- QR-kode for én øktplan ---------- */

function buildPlanShareUrl(plan) {
  const snapshot = { schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), plans: [plan], logs: [] };
  const json = JSON.stringify(snapshot);
  const encoded = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_");
  return {
    url: `${window.location.origin}${window.location.pathname}?import=${encodeURIComponent(encoded)}`,
    length: encoded.length,
  };
}

function renderPlanQr(plan, container, pxSize = 132) {
  if (!container) return false;
  if (typeof qrcode === "undefined") {
    container.innerHTML = '<p class="small">QR utilgjengelig</p>';
    return false;
  }
  const { url, length } = buildPlanShareUrl(plan);
  // QR-kapasitet på nivå M ~ 2300 tegn. Planer er små, men vi sikrer oss.
  if (length > 2200) {
    container.innerHTML = '<p class="small">Planen er for stor for QR — bruk delingslenke.</p>';
    return false;
  }
  try {
    const qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();
    container.style.width = `${pxSize}px`;
    container.style.height = `${pxSize}px`;
    container.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true, title: "QR — del øktplan" });
    return true;
  } catch (error) {
    container.innerHTML = '<p class="small">Kunne ikke lage QR.</p>';
    return false;
  }
}

let currentQrShareUrl = "";

function openPlanQr(planId) {
  const plan = findPlanById(planId);
  if (!plan) return;
  const overlay = $("#qrOverlay");
  const canvas = $("#qrCanvas");
  if (!overlay || !canvas) return;
  const ok = renderPlanQr(plan, canvas, 220);
  currentQrShareUrl = ok ? buildPlanShareUrl(plan).url : "";
  const titleEl = $("#qrPlanTitle");
  if (titleEl) titleEl.textContent = plan.title || "";
  const status = $("#qrStatus");
  if (status) status.textContent = "";
  overlay.hidden = false;
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
  requestAnimationFrame(() => overlay.classList.add("is-open"));
}

function closeQr() {
  const overlay = $("#qrOverlay");
  if (!overlay) return;
  overlay.classList.remove("is-open");
  if (!$("#welcomeOverlay")?.classList.contains("is-open") && !$("#fieldOverlay")?.classList.contains("is-open")) {
    document.body.classList.remove("overlay-open");
  }
  setTimeout(() => {
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
  }, 200);
}

function initShare() {
  $("#qrOverlay")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-qr]")) closeQr();
  });
  $("#qrCopyLink")?.addEventListener("click", async () => {
    const status = $("#qrStatus");
    if (!currentQrShareUrl) return;
    try {
      await navigator.clipboard.writeText(currentQrShareUrl);
      if (status) status.textContent = "Lenken er kopiert.";
    } catch {
      if (status) status.textContent = currentQrShareUrl;
    }
  });
}

/* ---------- Feltmodus (distraksjonsfri) ---------- */

let fieldPlanId = null;
let fieldChecks = [false, false, false];

function renderFieldMode() {
  const plan = findPlanById(fieldPlanId);
  const body = $("#fieldBody");
  const titleEl = $("#fieldTitle");
  if (!plan || !body) return;
  if (titleEl) titleEl.textContent = plan.title || "Treningsøkt";

  const steps = Array.isArray(plan.steps) ? plan.steps : [];
  const obs = (Array.isArray(plan.observations) ? plan.observations : []).filter(Boolean);
  const metaHtml = plan.meta && plan.meta.length
    ? `<p class="field-meta">${plan.meta.map(escapeHtml).join(" · ")}</p>`
    : "";

  const stepsHtml = steps.length
    ? `<details class="field-steps">
        <summary><span>Slik legger du opp økta</span><span class="field-steps-count">${steps.length} steg</span></summary>
        <ol>${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
      </details>`
    : "";

  const obsHtml = obs.length
    ? obs
        .map(
          (text, i) => `<button class="field-obs ${fieldChecks[i] ? "is-checked" : ""}" data-field-check="${i}" type="button" aria-pressed="${fieldChecks[i]}">
            <span class="field-obs-box" aria-hidden="true">${fieldChecks[i] ? "✓" : ""}</span>
            <span class="field-obs-text"><span class="field-obs-num">Punkt ${i + 1}</span>${escapeHtml(text)}</span>
          </button>`
        )
        .join("")
    : `<p class="field-empty">Ingen observasjonspunkter på denne planen.</p>`;

  body.innerHTML = `
    ${metaHtml}
    ${plan.success ? `<div class="field-goal"><span class="eyebrow">Målbilde</span><p>${escapeHtml(plan.success)}</p></div>` : ""}
    ${stepsHtml}
    <p class="eyebrow field-obs-label">Tre ting å se etter — trykk for å huke av underveis</p>
    <div class="field-obs-list">${obsHtml}</div>
    <div class="field-actions">
      <button class="primary-button" data-field-log="${escapeHtml(plan.id)}" type="button">Loggfør gjennomført</button>
      <button class="ghost-button" data-share-qr="${escapeHtml(plan.id)}" type="button">Del med QR</button>
    </div>`;
}

function openFieldMode(planId) {
  const plan = findPlanById(planId);
  if (!plan) return;
  fieldPlanId = plan.id || planId;
  fieldChecks = [false, false, false];
  renderFieldMode();
  const overlay = $("#fieldOverlay");
  if (!overlay) return;
  overlay.hidden = false;
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
  requestAnimationFrame(() => overlay.classList.add("is-open"));
}

function closeFieldMode() {
  const overlay = $("#fieldOverlay");
  if (!overlay) return;
  overlay.classList.remove("is-open");
  if (!$("#qrOverlay")?.classList.contains("is-open")) {
    document.body.classList.remove("overlay-open");
  }
  setTimeout(() => {
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
  }, 200);
}

function initFieldMode() {
  $("#fieldOverlay")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-field]")) {
      closeFieldMode();
      return;
    }
    const check = event.target.closest("[data-field-check]");
    if (check) {
      const i = Number(check.dataset.fieldCheck);
      fieldChecks[i] = !fieldChecks[i];
      renderFieldMode();
      return;
    }
    const fieldLog = event.target.closest("[data-field-log]");
    if (fieldLog) {
      const plan = findPlanById(fieldLog.dataset.fieldLog);
      closeFieldMode();
      if (plan) prefillLogFromPlan(plan);
    }
  });
}

/* ---------- Komplett øktkort for utskrift ---------- */

function buildOktkortHtml(plan, options = {}) {
  const withChecklist = !!options.withChecklist;
  const steps = Array.isArray(plan.steps) ? plan.steps : [];
  const observations = Array.isArray(plan.observations) ? plan.observations.filter(Boolean) : [];
  const today = new Date().toLocaleDateString("no-NO", { day: "numeric", month: "long", year: "numeric" });

  const detailRows = [
    ["Hundefører", plan.handler],
    ["Hund", plan.dog],
    ["Erfaring", readableExperience(plan.experience)],
    ["Intensitet", readableIntensity(plan.intensity)],
    ["Liggetid", plan.age ? readableAge(plan.age) : ""],
    ["Underlag", plan.terrain ? readableTerrain(plan.terrain) : ""],
  ].filter(([, value]) => value);

  const detailsHtml = detailRows.length
    ? `<dl class="oktkort-details">${detailRows
        .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
        .join("")}</dl>`
    : "";

  const stepsHtml = steps.length
    ? `<ol class="oktkort-steps">${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>`
    : "";

  const obsHtml = observations.length
    ? `<ol class="oktkort-obs">${observations
        .map((o) => `<li><span class="oktkort-obs-check" aria-hidden="true"></span><span>${escapeHtml(o)}</span></li>`)
        .join("")}</ol>`
    : "";

  const checklistHtml = withChecklist
    ? `<section class="oktkort-section oktkort-checklist">
        <h2>Huskeliste i felt</h2>
        ${protocols
          .map(
            (protocol) => `<div class="oktkort-checklist-block">
              <h3>${escapeHtml(protocol.title)}</h3>
              <ul>${protocol.items
                .map(([, title, text]) => `<li><span class="oktkort-box" aria-hidden="true"></span><strong>${escapeHtml(title)}:</strong> ${escapeHtml(text)}</li>`)
                .join("")}</ul>
            </div>`
          )
          .join("")}
      </section>`
    : "";

  const qrHtml = '<div class="oktkort-qr" data-oktkort-qr></div>';

  return `
    <article class="oktkort">
      <header class="oktkort-header">
        <div class="oktkort-brand">
          <img src="assets/nrh-logo-romerike.png" alt="Norske Redningshunder Romerike" />
          <div>
            <p class="oktkort-eyebrow">Øktkort · SporLab E8/E9</p>
            <h1>${escapeHtml(plan.title || "Treningsøkt")}</h1>
            <p class="oktkort-sub">${escapeHtml(plan.pages || "")}${plan.pages ? " · " : ""}Skrevet ut ${escapeHtml(today)}</p>
          </div>
        </div>
        ${qrHtml}
      </header>

      ${plan.success ? `<p class="oktkort-goal"><strong>Målbilde:</strong> ${escapeHtml(plan.success)}</p>` : ""}

      ${detailsHtml}

      ${stepsHtml ? `<section class="oktkort-section">
        <h2>Slik legger du opp økta</h2>
        ${stepsHtml}
      </section>` : ""}

      ${plan.note ? `<section class="oktkort-section"><h2>Særlig hensyn</h2><p>${escapeHtml(plan.note)}</p></section>` : ""}

      ${obsHtml ? `<section class="oktkort-section">
        <h2>Tre ting å se etter</h2>
        ${obsHtml}
      </section>` : ""}

      ${checklistHtml}

      <footer class="oktkort-footer">
        <p>Kilde: Lesehefte ettersøkning — E8 Sporoppsøk og E9 Spor (NRH Fagteknisk utvalg). SporLab er et hjelpeverktøy og erstatter ikke instruktør eller heftet.</p>
      </footer>
    </article>`;
}

function findPlanById(planId) {
  return (
    state.plans.find((p) => p.id === planId) ||
    (state.currentPlan && state.currentPlan.id === planId ? state.currentPlan : null) ||
    state.currentPlan ||
    null
  );
}

function printPlanCard(planId, options = {}) {
  const plan = findPlanById(planId);
  if (!plan) return;
  const area = $("#printArea");
  if (!area) return;
  area.innerHTML = buildOktkortHtml(plan, options);
  const qrSlot = area.querySelector("[data-oktkort-qr]");
  if (qrSlot) renderPlanQr(plan, qrSlot, 132);
  document.body.classList.add("printing-card");
  const cleanup = () => {
    document.body.classList.remove("printing-card");
    area.innerHTML = "";
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  // Fallback hvis afterprint ikke fyres (eldre nettlesere)
  setTimeout(() => {
    if (document.body.classList.contains("printing-card")) cleanup();
  }, 60000);
  window.print();
}

const defaultReflectionPrompts = [
  "Hva overrasket deg?",
  "Hva traff hunden best på?",
  "Hva ville du gjort annerledes neste gang?",
];

function refreshAutocomplete() {
  const handlers = [...new Set(state.logs.map((l) => (l.handler || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "no"));
  const dogs = [...new Set(state.logs.map((l) => (l.dog || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "no"));
  const handlerList = $("#handlerList");
  const dogList = $("#dogList");
  if (handlerList) handlerList.innerHTML = handlers.map((h) => `<option value="${escapeHtml(h)}">`).join("");
  if (dogList) dogList.innerHTML = dogs.map((d) => `<option value="${escapeHtml(d)}">`).join("");
}

function renderLog() {
  const form = $("#logForm");
  const dateInput = $('#logForm input[name="date"]');
  if (dateInput && !dateInput.value) dateInput.valueAsDate = new Date();
  if (form && !form.dataset.planId) {
    defaultReflectionPrompts.forEach((prompt, i) => {
      const promptEl = form.querySelector(`[data-obs-prompt="${i}"]`);
      if (promptEl && !promptEl.textContent.trim()) {
        promptEl.textContent = prompt;
      }
    });
    const hint = $("#logObservationHint");
    if (hint && !form.dataset.planId) {
      hint.textContent = "Tre korte refleksjonsspørsmål. Bytt ut med egne hvis dere kom fra en plan.";
    }
  }
  refreshAutocomplete();
  syncLogFormUI();
  renderLogList();
}

const logFilters = { type: "all", dog: "all", sort: "new" };

function logTimestamp(log) {
  return log.createdAt || Date.parse(log.date) || 0;
}

function renderLogList() {
  const listEl = $("#logList");
  if (!listEl) return;
  const filterRow = $("#logFilterRow");
  const hasLogs = state.logs.length > 0;
  if (filterRow) filterRow.hidden = !hasLogs;

  if (!hasLogs) {
    listEl.innerHTML = emptyState("Loggfør første økt med fakta, observasjon og neste steg.");
    return;
  }

  // Hunde-filter: fyll alternativer fra loggene
  const dogSelect = $("#logFilterDog");
  if (dogSelect) {
    const dogs = [...new Set(state.logs.map((l) => (l.dog || "").trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "no")
    );
    const current = logFilters.dog;
    dogSelect.innerHTML =
      '<option value="all">Alle hunder</option>' +
      dogs.map((d) => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("");
    dogSelect.value = dogs.includes(current) ? current : "all";
    logFilters.dog = dogSelect.value;
  }

  let logs = state.logs.filter((l) => {
    if (logFilters.type !== "all" && l.type !== logFilters.type) return false;
    if (logFilters.dog !== "all" && (l.dog || "").trim() !== logFilters.dog) return false;
    return true;
  });

  if (logFilters.sort === "rating") {
    logs = [...logs].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0) || logTimestamp(b) - logTimestamp(a));
  } else if (logFilters.sort === "old") {
    logs = [...logs].sort((a, b) => logTimestamp(a) - logTimestamp(b));
  } else {
    logs = [...logs].sort((a, b) => logTimestamp(b) - logTimestamp(a));
  }

  if (!logs.length) {
    listEl.innerHTML = emptyState("Ingen økter passer filteret. Prøv «Alle typer» eller «Alle hunder».");
    return;
  }

  // Gruppér per måned (kun ved tids-sortering — ved mestrings-sortering vises flat liste)
  if (logFilters.sort === "rating") {
    listEl.innerHTML = logs.map(logCard).join("");
    return;
  }

  const groups = [];
  const indexByKey = new Map();
  logs.forEach((log) => {
    const d = new Date(logTimestamp(log));
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!indexByKey.has(key)) {
      indexByKey.set(key, groups.length);
      groups.push({
        label: d.toLocaleDateString("no-NO", { month: "long", year: "numeric" }),
        items: [],
      });
    }
    groups[indexByKey.get(key)].items.push(log);
  });

  listEl.innerHTML = groups
    .map(
      (g) => `<div class="log-month-group">
        <h4 class="log-month-head">${escapeHtml(g.label.charAt(0).toUpperCase() + g.label.slice(1))} <span class="log-month-count">${g.items.length}</span></h4>
        ${g.items.map(logCard).join("")}
      </div>`
    )
    .join("");
}

function syncLogFormUI() {
  const form = $("#logForm");
  if (!form) return;
  const ratingValue = form.querySelector('input[name="rating"]')?.value || "0";
  form.querySelectorAll("[data-rating-star]").forEach((star) => {
    const value = Number(star.dataset.ratingStar);
    star.classList.toggle("is-on", value <= Number(ratingValue));
    star.setAttribute("aria-checked", value === Number(ratingValue) ? "true" : "false");
  });
  const weatherValue = form.querySelector('input[name="weather"]')?.value || "";
  form.querySelectorAll("[data-weather]").forEach((chip) => {
    const isOn = chip.dataset.weather === weatherValue;
    chip.classList.toggle("is-selected", isOn);
    chip.setAttribute("aria-pressed", isOn ? "true" : "false");
  });
}

function logCard(log) {
  const stars = log.rating ? "★".repeat(Number(log.rating)) + "☆".repeat(Math.max(0, 5 - Number(log.rating))) : "";
  const conditions = [
    log.weather,
    log.wind,
    log.terrain && readableTerrain(log.terrain),
  ].filter(Boolean).join(" · ");
  const observations = Array.isArray(log.observations) ? log.observations : [];
  const obsHtml = observations.some((o) => o && (o.answer || o.prompt))
    ? `<div class="log-observations">
        ${observations
          .map((o, i) => {
            if (!o || (!o.answer && !o.prompt)) return "";
            return `<div class="log-observation">
              <span class="observation-num small">${i + 1}</span>
              <div>
                ${o.prompt ? `<p class="small log-observation-prompt">${escapeHtml(o.prompt)}</p>` : ""}
                ${o.answer ? `<p>${escapeHtml(o.answer)}</p>` : `<p class="small log-observation-empty">— ikke besvart —</p>`}
              </div>
            </div>`;
          })
          .join("")}
      </div>`
    : (log.observation ? `<p><strong>Observasjon:</strong> ${escapeHtml(log.observation)}</p>` : "");
  const planRef = log.planTitle ? `<p class="small log-plan-ref">Fra plan: ${escapeHtml(log.planTitle)}${log.planPages ? ` (${escapeHtml(log.planPages)})` : ""}</p>` : "";
  return `
    <article class="log-card">
      <time>${escapeHtml(log.date || "Uten dato")}</time>
      <h4>${escapeHtml(log.type || "Økt")}${log.dog ? ` · ${escapeHtml(log.dog)}` : ""}</h4>
      ${stars ? `<p class="rating-row" aria-label="Mestring ${log.rating} av 5">${stars}</p>` : ""}
      <p>${escapeHtml([log.handler, log.age, log.length].filter(Boolean).join(" · "))}</p>
      ${conditions ? `<p class="small">${escapeHtml(conditions)}</p>` : ""}
      ${planRef}
      ${obsHtml}
      ${log.next ? `<p><strong>Neste:</strong> ${escapeHtml(log.next)}</p>` : ""}
      <button class="text-button" data-delete-log="${log.id}" type="button">Slett</button>
    </article>`;
}

function logsToCsv(logs) {
  const fields = ["date", "type", "handler", "dog", "rating", "age", "length", "weather", "wind", "terrain", "planTitle", "obs1", "obs2", "obs3", "next"];
  const header = fields.join(",");
  const rows = logs.map((log) => {
    const obs = Array.isArray(log.observations) ? log.observations : [];
    const flat = {
      ...log,
      obs1: obs[0] ? `${obs[0].prompt || ""} → ${obs[0].answer || ""}`.trim() : log.observation || "",
      obs2: obs[1] ? `${obs[1].prompt || ""} → ${obs[1].answer || ""}`.trim() : "",
      obs3: obs[2] ? `${obs[2].prompt || ""} → ${obs[2].answer || ""}`.trim() : "",
    };
    return fields
      .map((f) => {
        const value = String(flat[f] ?? "");
        if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
          return `"${value.replaceAll("\"", "\"\"")}"`;
        }
        return value;
      })
      .join(",");
  });
  return [header, ...rows].join("\n");
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function prefillLogFromPlan(plan) {
  const form = $("#logForm");
  if (!form || !plan) return;
  const get = (name) => form.querySelector(`[name="${name}"]`);
  const findMeta = (label) => {
    const item = (plan.meta || []).find((m) => m.startsWith(`${label}:`));
    return item ? item.split(":").slice(1).join(":").trim() : "";
  };
  if (get("date") && !get("date").value) get("date").valueAsDate = new Date();
  if (get("type")) {
    const typeMap = {
      "gamle-spor": "Spor",
      "oppsok-gjenstand": "Sporoppsøk",
      "oppsok-bil": "Sporoppsøk",
      frisok: "Frisøk med sporopptak",
      retning: "Momenttrening",
      sportap: "Momenttrening",
      kryssende: "Momenttrening",
      sirkelspor: "Momenttrening",
    };
    get("type").value = typeMap[plan.focus] || "Momenttrening";
  }
  if (get("handler")) get("handler").value = findMeta("Fører") || get("handler").value;
  if (get("dog")) get("dog").value = findMeta("Hund") || get("dog").value;
  if (get("age")) get("age").value = findMeta("Liggetid") || get("age").value;
  const terrainReverse = { "Skog/vegetasjon": "skog", "Vei/sti": "vei", "Hardt underlag": "hardt", "Blandet": "blandet" };
  const terrainReadable = findMeta("Underlag");
  if (get("terrain") && terrainReadable) get("terrain").value = terrainReverse[terrainReadable] || "";
  if (get("next") && plan.success) get("next").value = `Vurder mot målbilde: ${plan.success}`;

  const observations = Array.isArray(plan.observations) ? plan.observations : [];
  form.dataset.planId = plan.id || "";
  form.dataset.planTitle = plan.title || "";
  form.dataset.planPages = plan.pages || "";
  [0, 1, 2].forEach((i) => {
    const promptEl = form.querySelector(`[data-obs-prompt="${i}"]`);
    if (promptEl) promptEl.textContent = observations[i] || "";
    const input = form.querySelector(`[name="obs${i}"]`);
    if (input && !input.value) input.value = "";
  });
  const hint = $("#logObservationHint");
  if (hint) {
    hint.textContent = `Fra planen «${plan.title}»${plan.pages ? ` (${plan.pages})` : ""}. Svar på hvert punkt med det dere så.`;
  }

  setView("log");
  syncLogFormUI();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  $("#logStatus").textContent = "Skjemaet er forhåndsfylt fra planen. Svar på de tre observasjonspunktene og lagre.";
}

function shareSnapshot() {
  const snapshot = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    plans: state.plans,
    logs: state.logs.map(({ image, ...rest }) => rest),
    completed: state.completed,
  };
  return snapshot;
}

async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsText(file);
  });
}

function importSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") throw new Error("Ugyldig fil");
  const incomingPlans = Array.isArray(snapshot.plans) ? snapshot.plans : [];
  const incomingLogs = Array.isArray(snapshot.logs) ? snapshot.logs : [];
  const existingPlanIds = new Set(state.plans.map((p) => p.id));
  const existingLogIds = new Set(state.logs.map((l) => l.id));
  const newPlans = incomingPlans.filter((p) => p && p.id && !existingPlanIds.has(p.id));
  const newLogs = incomingLogs.filter((l) => l && l.id && !existingLogIds.has(l.id));
  state.plans = [...newPlans, ...state.plans].slice(0, 24);
  state.logs = [...newLogs, ...state.logs].slice(0, 160);
  saveState();
  return { plans: newPlans.length, logs: newLogs.length };
}

function renderReference() {
  const query = ($("#referenceSearch").value || "").trim().toLowerCase();
  const filter = $("#referenceFilter").value;
  const filtered = references.filter((item) => {
    const categoryOk = filter === "all" || item.category === filter;
    const haystack = `${item.title} ${item.text} ${item.pages}`.toLowerCase();
    return categoryOk && (!query || haystack.includes(query));
  });
  $("#referenceResults").innerHTML = filtered.length
    ? filtered.map((item) => referenceCard(item, query)).join("")
    : emptyState("Ingen fagkort traff søket. Prøv et annet ord, for eksempel liggetid, bil, retning eller tap.");
}

function referenceCard(item, query) {
  return `
    <article class="reference-card">
      <p class="page-ref">${escapeHtml(item.pages)}</p>
      <h4>${highlight(item.title, query)}</h4>
      <p>${highlight(item.text, query)}</p>
      <span class="tag">${escapeHtml(categoryLabel(item.category))}</span>
    </article>`;
}

function highlight(text, query) {
  const safe = escapeHtml(text);
  if (!query) return safe;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(`(${escapedQuery})`, "gi"), "<mark>$1</mark>");
}

function categoryLabel(category) {
  return {
    grunnlag: "Grunnlag",
    spor: "Spor",
    oppsok: "Sporoppsøk",
    problem: "Problemløsning",
    plan: "Planlegging",
  }[category];
}

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildQuizSession(mode = "all") {
  let pool;
  let label;
  if (mode === "all") {
    pool = quizQuestions.map((_, index) => index);
    label = "Alle moduler";
  } else if (mode === "weak") {
    const scored = quizQuestions
      .map((_, index) => index)
      .map((index) => {
        const m = state.mastery[index] || { correct: 0, wrong: 0, lastSeen: 0 };
        const masteryScore = (m.correct || 0) - (m.wrong || 0);
        return { index, masteryScore, lastSeen: m.lastSeen || 0 };
      })
      .sort((a, b) => a.masteryScore - b.masteryScore || a.lastSeen - b.lastSeen);
    pool = scored.slice(0, Math.min(10, scored.length)).map((item) => item.index);
    label = "Repeter svake";
  } else {
    const moduleId = mode.replace(/^module:/, "");
    pool = quizQuestions
      .map((q, index) => ({ q, index }))
      .filter(({ q }) => q.module === moduleId)
      .map(({ index }) => index);
    const moduleDef = modules.find((m) => m.id === moduleId);
    label = moduleDef ? `Modul: ${moduleDef.title.replace(/^\d+\.\s*/, "")}` : "Modul";
  }

  if (pool.length === 0) pool = quizQuestions.map((_, index) => index);

  const questionIds = shuffle(pool);
  const optionMaps = questionIds.map((questionIndex) => {
    const question = quizQuestions[questionIndex];
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
  };
  saveState();
}

function ensureQuizSession() {
  if (!state.quiz || !Array.isArray(state.quiz.questionIds) || state.quiz.questionIds.length === 0) {
    buildQuizSession("all");
  }
}

function renderQuiz() {
  ensureQuizSession();
  const quiz = state.quiz;
  const sessionLength = quiz.questionIds.length;
  const safeIndex = Math.min(quiz.index, sessionLength - 1);
  const questionId = quiz.questionIds[safeIndex];
  const question = quizQuestions[questionId];
  const optionMap = quiz.optionMaps[safeIndex] || question.options.map((_, i) => i);
  const answered = quiz.answered[safeIndex];

  const moduleDef = modules.find((m) => m.id === question.module);
  const moduleLabel = moduleDef ? moduleDef.title.replace(/^\d+\.\s*/, "") : question.module;
  const mastery = state.mastery[questionId] || { correct: 0, wrong: 0 };

  $("#quizPanel").innerHTML = `
    <div class="quiz-meta">
      <span class="tag">${escapeHtml(quiz.modeLabel || "Quiz")}</span>
      <span class="tag">${escapeHtml(moduleLabel)}</span>
      <span class="tag">${escapeHtml(question.pages)}</span>
      ${question.examRelevant ? '<span class="tag tag-exam" title="Sentralt prøvetema">Prøvetema</span>' : ""}
      <span class="tag">Spørsmål ${safeIndex + 1} av ${sessionLength}</span>
      ${mastery.correct + mastery.wrong > 0
        ? `<span class="tag" title="Historikk på dette spørsmålet">Mestring: ${mastery.correct}✓ / ${mastery.wrong}✗</span>`
        : ""}
    </div>
    <h3 class="quiz-question">${escapeHtml(question.question)}</h3>
    <div class="quiz-options" role="radiogroup" aria-label="Svaralternativer">
      ${optionMap
        .map((originalIndex, displayIndex) => {
          const optionText = question.options[originalIndex];
          let klass = "";
          if (answered) {
            if (originalIndex === question.answer) klass = "is-correct";
            if (originalIndex === answered.original && originalIndex !== question.answer) klass = "is-wrong";
          }
          return `<button class="quiz-option ${klass}" data-quiz-choice="${displayIndex}" type="button" role="radio" aria-checked="${answered && answered.display === displayIndex ? "true" : "false"}">${escapeHtml(optionText)}</button>`;
        })
        .join("")}
    </div>
    <div class="quiz-feedback" role="status" aria-live="polite">
      ${answered ? `<strong>${answered.correct ? "Riktig." : "Ikke helt."}</strong> ${escapeHtml(question.explain)}` : "Velg et svar. Forklaringen kommer med en gang."}
    </div>
    <div class="button-row">
      <button class="primary-button" id="nextQuestion" type="button">${safeIndex >= sessionLength - 1 ? "Avslutt og se resultat" : "Neste spørsmål"}</button>
      <button class="ghost-button" id="resetQuiz" type="button">Ny runde (alle)</button>
      <button class="ghost-button" id="weakQuiz" type="button">Repeter svake</button>
    </div>
  `;

  const answeredCount = Object.keys(quiz.answered).length;
  const percent = sessionLength ? Math.round((quiz.score / sessionLength) * 100) : 0;

  const masteryRows = modules.map((module) => {
    const moduleQuestions = quizQuestions
      .map((_, idx) => idx)
      .filter((idx) => quizQuestions[idx].module === module.id);
    const sum = moduleQuestions.reduce(
      (acc, idx) => {
        const m = state.mastery[idx] || { correct: 0, wrong: 0 };
        acc.correct += m.correct;
        acc.wrong += m.wrong;
        return acc;
      },
      { correct: 0, wrong: 0 }
    );
    const total = sum.correct + sum.wrong;
    const rate = total > 0 ? Math.round((sum.correct / total) * 100) : null;
    return `
      <li class="mastery-row">
        <button class="text-button mastery-link" data-module-quiz="${module.id}" type="button">${escapeHtml(module.title)}</button>
        <span class="mastery-bar" aria-hidden="true"><span style="width:${rate ?? 0}%"></span></span>
        <span class="small">${rate === null ? "—" : `${rate}%`} (${sum.correct}/${total})</span>
      </li>`;
  }).join("");

  $("#quizStats").innerHTML = `
    <p class="eyebrow">Denne runden</p>
    <h3>${quiz.score} av ${sessionLength}</h3>
    <div class="score-ring" style="--score:${percent}%"><span>${percent}%</span></div>
    <p class="small">${answeredCount} av ${sessionLength} besvart i denne runden. <strong>Repeter svake</strong> bygger en runde fra spørsmålene du har minst kontroll på.</p>
    <p class="eyebrow">Mestring per modul</p>
    <ul class="mastery-list">${masteryRows}</ul>
  `;
}

function answerQuiz(displayChoice) {
  ensureQuizSession();
  const position = state.quiz.index;
  if (state.quiz.answered[position]) return;
  const questionId = state.quiz.questionIds[position];
  const question = quizQuestions[questionId];
  const optionMap = state.quiz.optionMaps[position] || question.options.map((_, i) => i);
  const originalIndex = optionMap[displayChoice];
  const correct = originalIndex === question.answer;
  state.quiz.answered[position] = { display: displayChoice, original: originalIndex, correct };
  if (correct) state.quiz.score += 1;
  const mastery = state.mastery[questionId] || { correct: 0, wrong: 0, lastSeen: 0 };
  if (correct) mastery.correct += 1;
  else mastery.wrong += 1;
  mastery.lastSeen = Date.now();
  state.mastery[questionId] = mastery;
  saveState();
  renderQuiz();
}

function resetQuiz(mode = "all") {
  buildQuizSession(mode);
  setView("quiz");
}

function nextQuestion() {
  ensureQuizSession();
  if (state.quiz.index >= state.quiz.questionIds.length - 1) {
    const finishedScore = state.quiz.score;
    const finishedTotal = state.quiz.questionIds.length;
    buildQuizSession(state.quiz.mode || "all");
    renderQuiz();
    if ($("#logStatus")) {
      $("#logStatus").textContent = `Quiz fullført: ${finishedScore} av ${finishedTotal}. Ny runde startet.`;
    }
    return;
  }
  state.quiz.index += 1;
  saveState();
  renderQuiz();
}

function collectForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function initEvents() {
  $("#navList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (button) setView(button.dataset.view);
  });

  $("#bottomNav")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (button) setView(button.dataset.view);
  });

  $("#mobileMenuToggle")?.addEventListener("click", () => {
    const menu = $("#mobileMenu");
    if (menu && menu.classList.contains("is-open")) closeMobileMenu();
    else openMobileMenu();
  });

  $("#mobileMenu")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-menu]")) {
      closeMobileMenu();
      return;
    }
    const item = event.target.closest(".mobile-menu-item[data-view]");
    if (item) {
      setView(item.dataset.view);
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });

  document.addEventListener("click", (event) => {
    const jump = event.target.closest("[data-view-jump]");
    if (jump) setView(jump.dataset.viewJump);

    const nextAction = event.target.closest("[data-next-action]");
    if (nextAction) {
      const action = nextAction.dataset.nextAction;
      if (action === "start-module") {
        state.activeModule = modules[0].id;
        state.activeGuide = null;
        state.learnAccordion = "learn";
        saveState();
        setView("learn");
        return;
      }
      if (action === "open-getstarted") {
        state.activeGuide = "getting-started";
        state.activeModule = null;
        saveState();
        setView("learn");
        return;
      }
      if (action === "continue-learning") {
        const firstUnread = modules.find((m) => !state.completed.includes(m.id));
        state.activeModule = firstUnread ? firstUnread.id : modules[0].id;
        state.learnAccordion = "learn";
        saveState();
        setView("learn");
        return;
      }
      if (action === "resume-module") {
        saveState();
        setView("learn");
        return;
      }
      if (action === "open-planner") {
        state.wizardStep = state.currentPlan ? state.wizardStep || 0 : 0;
        saveState();
        setView("planner");
        return;
      }
      if (action === "log-from-plan") {
        const planId = nextAction.dataset.planId;
        const plan = state.plans.find((p) => p.id === planId);
        if (plan) prefillLogFromPlan(plan);
        return;
      }
      if (action === "weak-quiz") {
        resetQuiz("weak");
        return;
      }
    }

    const moduleOpen = event.target.closest("[data-module-open]");
    if (moduleOpen) {
      state.activeModule = moduleOpen.dataset.moduleOpen;
      state.activeGuide = null;
      state.learnAccordion = "learn";
      saveState();
      renderLearn();
    }

    if (event.target.closest("[data-learn-back]")) {
      state.activeModule = null;
      state.activeGuide = null;
      saveState();
      renderLearn();
    }

    if (event.target.closest("[data-open-getstarted]")) {
      state.activeGuide = "getting-started";
      state.activeModule = null;
      saveState();
      setView("learn");
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (event.target.closest("[data-close-getstarted]")) {
      state.activeGuide = null;
      saveState();
      renderLearn();
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const moduleNav = event.target.closest("[data-module-nav]");
    if (moduleNav && moduleNav.dataset.moduleNav) {
      state.activeModule = moduleNav.dataset.moduleNav;
      state.learnAccordion = "learn";
      saveState();
      renderLearn();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const accToggle = event.target.closest("[data-accordion-toggle]");
    if (accToggle) {
      const id = accToggle.dataset.accordionToggle;
      state.learnAccordion = state.learnAccordion === id ? null : id;
      saveState();
      // Bare oppdater accordion-tilstand uten å re-rendre alt
      $all(".accordion-item").forEach((item) => {
        const isOpen = item.dataset.accordion === state.learnAccordion;
        item.dataset.open = String(isOpen);
        const trigger = item.querySelector(".accordion-trigger");
        if (trigger) trigger.setAttribute("aria-expanded", String(isOpen));
      });
    }

    if (event.target.id === "toggleComplete") {
      const id = state.activeModule;
      if (!id) return;
      state.completed = state.completed.includes(id)
        ? state.completed.filter((item) => item !== id)
        : [...state.completed, id];
      saveState();
      renderLearn();
      renderDashboard();
    }

    const moduleQuiz = event.target.closest("[data-start-module-quiz]");
    if (moduleQuiz) resetQuiz(`module:${moduleQuiz.dataset.startModuleQuiz}`);

    const moduleStatLink = event.target.closest("[data-module-quiz]");
    if (moduleStatLink) resetQuiz(`module:${moduleStatLink.dataset.moduleQuiz}`);

    if (event.target.id === "weakQuiz") resetQuiz("weak");

    const miniChoice = event.target.closest("[data-mini-quiz-choice]");
    if (miniChoice) {
      answerMiniQuiz(Number(miniChoice.dataset.miniQuizChoice));
      return;
    }
    if (event.target.closest("[data-mini-quiz-next]")) {
      nextMiniQuiz();
      return;
    }
    if (event.target.closest("[data-mini-quiz-dismiss]")) {
      miniQuizState = null;
      const card = $("#miniQuizCard");
      if (card) card.hidden = true;
      return;
    }

    const pickFocus = event.target.closest("[data-pick-focus]");
    if (pickFocus) {
      const focus = pickFocus.dataset.pickFocus;
      const prev = state.currentPlan && state.currentPlan.focus === focus ? state.currentPlan : null;
      state.currentPlan = makePlan({ focus }, prev);
      state.wizardStep = 1;
      state.wizardShowDetails = false;
      saveState();
      renderPlanner();
      return;
    }

    const drillPlan = event.target.closest("[data-drill-plan]");
    if (drillPlan) {
      const focus = drillPlan.dataset.drillPlan;
      const prev = state.currentPlan && state.currentPlan.focus === focus ? state.currentPlan : null;
      state.currentPlan = makePlan({ focus }, prev);
      state.wizardStep = 1;
      state.wizardShowDetails = false;
      saveState();
      setView("planner");
      return;
    }

    if (event.target.closest("[data-wizard-next]")) {
      state.wizardStep = Math.min((state.wizardStep || 0) + 1, wizardSteps.length - 1);
      saveState();
      renderPlanner();
      return;
    }

    if (event.target.closest("[data-wizard-back]")) {
      state.wizardStep = Math.max((state.wizardStep || 0) - 1, 0);
      saveState();
      renderPlanner();
      return;
    }

    const stepJump = event.target.closest("[data-go-step]");
    if (stepJump) {
      const target = Number(stepJump.dataset.goStep);
      if (!Number.isNaN(target)) {
        if (target > 0 && !state.currentPlan) return;
        state.wizardStep = Math.max(0, Math.min(target, wizardSteps.length - 1));
        saveState();
        renderPlanner();
      }
      return;
    }

    if (event.target.closest("[data-wizard-toggle-details]")) {
      state.wizardShowDetails = !state.wizardShowDetails;
      saveState();
      renderPlanner();
      return;
    }

    if (event.target.closest("[data-wizard-apply-details]")) {
      const form = $("#wizardDetailsForm");
      if (form && state.currentPlan) {
        const input = { ...collectForm(form), focus: state.currentPlan.focus };
        state.currentPlan = makePlan(input, state.currentPlan);
        saveState();
        renderPlanner();
      }
      return;
    }

    if (event.target.closest("[data-wizard-save]")) {
      if (!state.currentPlan) return;
      const form = $("#observationForm");
      if (form) {
        const obs = [0, 1, 2].map((i) => (form.querySelector(`[name="obs-${i}"]`)?.value || "").trim());
        state.currentPlan.observations = obs;
      }
      const existing = state.plans.find((p) => p.id === state.currentPlan.id);
      if (existing) {
        state.plans = state.plans.map((p) => (p.id === state.currentPlan.id ? { ...state.currentPlan } : p));
        saveState();
        renderPlanner();
        renderDashboard();
        return;
      }
      const signature = planSignature(state.currentPlan);
      const isDuplicate = state.plans.some((p) => planSignature(p) === signature);
      if (isDuplicate) {
        const dup = state.plans.find((p) => planSignature(p) === signature);
        if (dup) {
          state.plans = state.plans.map((p) => (p.id === dup.id ? { ...state.currentPlan, id: dup.id, createdAt: dup.createdAt } : p));
          state.currentPlan = { ...state.currentPlan, id: dup.id, createdAt: dup.createdAt };
        }
      } else {
        const saved = { ...state.currentPlan, id: makeId(), createdAt: Date.now() };
        state.plans = [saved, ...state.plans].slice(0, 12);
        state.currentPlan = saved;
      }
      saveState();
      renderPlanner();
      renderDashboard();
      return;
    }

    if (event.target.closest("[data-wizard-restart]")) {
      state.currentPlan = null;
      state.wizardStep = 0;
      state.wizardShowDetails = false;
      saveState();
      renderPlanner();
      return;
    }

    const loadPlan = event.target.closest("[data-load-plan]");
    if (loadPlan) {
      const plan = state.plans.find((p) => p.id === loadPlan.dataset.loadPlan);
      if (plan) {
        state.currentPlan = { ...plan, id: makeId(), createdAt: Date.now() };
        state.wizardStep = 3;
        state.wizardShowDetails = false;
        saveState();
        renderPlanner();
      }
      return;
    }

    const deletePlan = event.target.closest("[data-delete-plan]");
    if (deletePlan) {
      state.plans = state.plans.filter((p) => p.id !== deletePlan.dataset.deletePlan);
      if (state.currentPlan?.id === deletePlan.dataset.deletePlan) state.currentPlan = null;
      saveState();
      renderPlanner();
      renderDashboard();
      return;
    }

    const deleteLog = event.target.closest("[data-delete-log]");
    if (deleteLog) {
      state.logs = state.logs.filter((log) => log.id !== deleteLog.dataset.deleteLog);
      saveState();
      renderLog();
      renderDashboard();
    }

    const quizChoice = event.target.closest("[data-quiz-choice]");
    if (quizChoice) answerQuiz(Number(quizChoice.dataset.quizChoice));

    if (event.target.id === "nextQuestion") nextQuestion();
    if (event.target.id === "resetQuiz") resetQuiz();

    if (event.target.id === "settingsResetData") {
      const counts = `${state.logs.length} logger, ${state.plans.length} planer, ${state.completed.length} fullførte moduler`;
      const confirmed = window.confirm(
        `Dette sletter ALLE lokale data i denne nettleseren (${counts}). Eksporter loggen først hvis du vil ta vare på den. Vil du fortsette?`
      );
      if (!confirmed) return;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        storageAvailable = false;
      }
      state = defaultState();
      setDefaults();
      applyTheme();
      setView("dashboard");
      const status = $("#settingsDataStatus");
      if (status) status.textContent = "Lokale data er nullstilt.";
    }

    const themeBtn = event.target.closest("#settingsThemeAuto, #settingsThemeLight, #settingsThemeDark");
    if (themeBtn) {
      const themeMap = { settingsThemeAuto: "auto", settingsThemeLight: "light", settingsThemeDark: "dark" };
      state.theme = themeMap[themeBtn.id] || "auto";
      saveState();
      applyTheme();
      renderSettings();
    }
  });

  $("#logForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = collectForm(form);
    const observations = [0, 1, 2].map((i) => {
      const prompt = (form.querySelector(`[data-obs-prompt="${i}"]`)?.textContent || "").trim();
      const answer = (data[`obs${i}`] || "").trim();
      return { prompt, answer };
    });
    const planMeta = {
      planId: form.dataset.planId || "",
      planTitle: form.dataset.planTitle || "",
      planPages: form.dataset.planPages || "",
    };
    const log = {
      id: makeId(),
      createdAt: Date.now(),
      date: data.date,
      type: data.type,
      handler: data.handler,
      dog: data.dog,
      age: data.age,
      length: data.length,
      terrain: data.terrain,
      wind: data.wind,
      weather: data.weather,
      rating: data.rating,
      next: data.next,
      observations,
      ...planMeta,
    };
    state.logs = [log, ...state.logs].slice(0, 160);
    saveState();
    form.reset();
    form.removeAttribute("data-plan-id");
    form.removeAttribute("data-plan-title");
    form.removeAttribute("data-plan-pages");
    [0, 1, 2].forEach((i) => {
      const promptEl = form.querySelector(`[data-obs-prompt="${i}"]`);
      if (promptEl) promptEl.textContent = "";
    });
    const hint = $("#logObservationHint");
    if (hint) hint.textContent = "Når du loggfører fra en plan, prefylles disse fra observasjonspunktene i planen.";
    setDefaults();
    syncLogFormUI();
    $("#logStatus").textContent = "Loggen er lagret.";
    renderLog();
    renderDashboard();
  });

  // Kopier lagsammendrag — nå kun i Settings
  $("#settingsCopySummary")?.addEventListener("click", async () => {
    const summary = makeTeamSummary();
    const status = $("#settingsDataStatus");
    try {
      await navigator.clipboard.writeText(summary);
      if (status) status.textContent = "Lagsammendrag kopiert — lim inn i chat eller e-post.";
    } catch {
      if (status) status.textContent = summary;
    }
  });

  $("#referenceSearch").addEventListener("input", renderReference);
  $("#referenceFilter").addEventListener("change", renderReference);

  $("#logFilterType")?.addEventListener("change", (event) => {
    logFilters.type = event.target.value;
    renderLogList();
  });
  $("#logFilterDog")?.addEventListener("change", (event) => {
    logFilters.dog = event.target.value;
    renderLogList();
  });
  $("#logSort")?.addEventListener("change", (event) => {
    logFilters.sort = event.target.value;
    renderLogList();
  });

  // Settings: eksport/import/deling
  $("#settingsExportJson")?.addEventListener("click", () => {
    const today = todayIso();
    downloadBlob(JSON.stringify(shareSnapshot(), null, 2), `sporlab-eksport-${today}.json`, "application/json");
    const status = $("#settingsDataStatus");
    if (status) status.textContent = "Eksport JSON er lastet ned.";
  });

  $("#settingsExportCsv")?.addEventListener("click", () => {
    const status = $("#settingsDataStatus");
    if (!state.logs.length) {
      if (status) status.textContent = "Ingen logger å eksportere.";
      return;
    }
    const today = todayIso();
    downloadBlob(logsToCsv(state.logs), `sporlab-logg-${today}.csv`, "text/csv;charset=utf-8");
    if (status) status.textContent = "Eksport CSV er lastet ned.";
  });

  $("#settingsShareLink")?.addEventListener("click", async () => {
    const status = $("#settingsDataStatus");
    try {
      const json = JSON.stringify(shareSnapshot());
      const encoded = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_");
      if (encoded.length > 6000) {
        if (status) status.textContent = "Dataene er for store til delingslenke. Bruk JSON-eksport i stedet.";
        return;
      }
      const url = `${window.location.origin}${window.location.pathname}?import=${encodeURIComponent(encoded)}`;
      try {
        await navigator.clipboard.writeText(url);
        if (status) status.textContent = "Delingslenken er kopiert. Send til lagkamerat — de får valg om å importere.";
      } catch {
        if (status) status.textContent = url;
      }
    } catch (error) {
      if (status) status.textContent = `Kunne ikke lage delingslenke: ${error.message}`;
    }
  });

  $("#settingsImportFile")?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    const status = $("#settingsDataStatus");
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const data = JSON.parse(text);
      const result = importSnapshot(data);
      if (status) status.textContent = `Importert: ${result.plans} nye planer, ${result.logs} nye logger.`;
      renderLog();
      renderPlanner();
      renderDashboard();
    } catch (error) {
      if (status) status.textContent = `Kunne ikke importere: ${error.message}`;
    } finally {
      event.target.value = "";
    }
  });

  document.addEventListener("click", (event) => {
    const logFromPlan = event.target.closest("[data-log-from-plan]");
    if (logFromPlan) {
      const id = logFromPlan.dataset.logFromPlan;
      const plan = state.plans.find((p) => p.id === id) || (state.currentPlan && state.currentPlan.id === id ? state.currentPlan : null);
      if (plan) prefillLogFromPlan(plan);
    }

    const printPlan = event.target.closest("[data-print-plan]");
    if (printPlan) {
      printPlanCard(printPlan.dataset.printPlan, {
        withChecklist: printPlan.dataset.printChecklist === "true",
      });
      return;
    }

    const shareQr = event.target.closest("[data-share-qr]");
    if (shareQr) {
      openPlanQr(shareQr.dataset.shareQr);
      return;
    }

    const fieldMode = event.target.closest("[data-field-mode]");
    if (fieldMode) {
      openFieldMode(fieldMode.dataset.fieldMode);
      return;
    }

    const starButton = event.target.closest("[data-rating-star]");
    if (starButton) {
      const value = Number(starButton.dataset.ratingStar);
      const input = $('#logForm input[name="rating"]');
      if (input) {
        input.value = value === Number(input.value) ? "0" : String(value);
        syncLogFormUI();
      }
    }

    const weatherChip = event.target.closest("[data-weather]");
    if (weatherChip) {
      const value = weatherChip.dataset.weather;
      const input = $('#logForm input[name="weather"]');
      if (input) {
        input.value = input.value === value ? "" : value;
        syncLogFormUI();
      }
    }

    if (event.target.id === "sourceBoxToggle") {
      const box = $(".source-box");
      if (box) box.classList.toggle("is-open");
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target && event.target.id === "theorySearch") {
      const query = event.target.value.trim().toLowerCase();
      const stack = document.getElementById("theoryStack");
      const empty = document.getElementById("theorySearchEmpty");
      if (!stack) return;
      let visible = 0;
      stack.querySelectorAll("[data-theory-card]").forEach((card) => {
        const haystack = card.textContent.toLowerCase();
        const match = !query || haystack.includes(query);
        card.hidden = !match;
        if (match) visible += 1;
      });
      if (empty) empty.hidden = visible > 0 || !query;
    }
  });
}

function makeTeamSummary() {
  const latest = [...state.logs].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  if (!latest.length) return "Ingen økter er loggført ennå.";
  return latest
    .map((log) => {
      const heading = `${log.date || "Uten dato"} - ${log.dog || "hund"} / ${log.handler || "fører"} (${log.type || "økt"})`;
      const facts = [log.age, log.length].filter(Boolean).join(", ");
      const obs = Array.isArray(log.observations) ? log.observations : [];
      const obsText = obs.length
        ? obs
            .map((o, i) => `  ${i + 1}. ${o.prompt || "Observasjon"}\n     → ${o.answer || "ikke besvart"}`)
            .join("\n")
        : `  ${log.observation || "ikke oppgitt"}`;
      return `${heading}\nFakta: ${facts || "ikke oppgitt"}\nObservasjoner:\n${obsText}\nNeste: ${log.next || "ikke oppgitt"}`;
    })
    .join("\n\n");
}

function setDefaults() {
  const dateInput = $('#logForm input[name="date"]');
  if (dateInput) dateInput.valueAsDate = new Date();
  const ratingInput = $('#logForm input[name="rating"]');
  if (ratingInput) ratingInput.value = "0";
  const weatherInput = $('#logForm input[name="weather"]');
  if (weatherInput) weatherInput.value = "";
}

function applyTheme() {
  const root = document.documentElement;
  const theme = state.theme || "auto";
  root.dataset.theme = theme;
  const labels = { auto: "Auto", light: "Lys", dark: "Mørk" };
  const status = $("#settingsThemeStatus");
  if (status) status.textContent = `Nåværende: ${labels[theme] || "Auto"}.`;
  ["Auto", "Light", "Dark"].forEach((variant) => {
    const btn = $(`#settingsTheme${variant}`);
    if (!btn) return;
    btn.classList.toggle("theme-button-active", theme === variant.toLowerCase());
    btn.setAttribute("aria-pressed", theme === variant.toLowerCase() ? "true" : "false");
  });
}

function handleSharedImport() {
  try {
    const params = new URLSearchParams(window.location.search);
    const payload = params.get("import");
    if (!payload) return;
    const json = atob(decodeURIComponent(payload).replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(json);
    const accept = window.confirm("En SporLab-deling ligger i lenken. Importere planer og logger fra den?");
    if (accept) {
      const result = importSnapshot(data);
      alert(`Importert: ${result.plans} planer og ${result.logs} logger.`);
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("import");
    window.history.replaceState({}, "", url.toString());
  } catch (error) {
    console.warn("Kunne ikke lese delingslenken.", error);
  }
}


/* ---------- Inline SVG-ikoner ---------- */

const ICONS = {
  dashboard:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.6V20h14V9.6"/><path d="M9.5 20v-6h5v6"/></svg>',
  learn:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6.5C10.5 5 8 4.5 4 4.5V18c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2V4.5c-4 0-6.5.5-8 2Z"/><path d="M12 6.5V20"/></svg>',
  planner:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="m8.8 11 1.4 1.4L13 9.6"/><path d="M8.8 16H15"/></svg>',
  log:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1.1"/><circle cx="4" cy="12" r="1.1"/><circle cx="4" cy="18" r="1.1"/></svg>',
  reference:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="6.2"/><path d="m20 20-3.6-3.6"/></svg>',
  quiz:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 1.5-1.5 2-2.5 2.5"/><circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></svg>',
};

function paintIcons(root = document) {
  $all("[data-icon]", root).forEach((el) => {
    const name = el.dataset.icon;
    if (ICONS[name]) el.innerHTML = ICONS[name];
  });
}

/* ---------- Startmeny + pedagogisk steg-for-steg-guide ---------- */

const tourSteps = [
  {
    icon: "👋",
    title: "Velkommen!",
    body: "SporLab tar deg fra heftet og ut i felt. På under ett minutt viser vi deg de fem delene av appen. Trykk «Skjønner» for å bla videre — du kan hoppe over når som helst.",
  },
  {
    icon: "⌂",
    title: "«I dag» — din neste handling",
    body: "Forsiden foreslår alltid det neste lure steget ditt: lese en modul, planlegge en økt eller loggføre. Er du i tvil om hvor du skal begynne, start her.",
  },
  {
    icon: "□",
    title: "«Lær» — læringsløypa",
    body: "Korte moduler bygget rett på leseheftet, med en liten quiz til hver. Les i din egen takt og merk moduler som fullført etter hvert som du kommer gjennom dem.",
  },
  {
    icon: "＋",
    title: "«Planlegg» — bygg en økt",
    body: "En veiviser tar deg steg for steg gjennom å sette opp en konkret spor- eller sporoppsøksøkt — helt ned til tre konkrete ting dere skal se etter ute.",
  },
  {
    icon: "≡",
    title: "«Logg» — fest læringen",
    body: "Etter økta noterer du hva dere så på de tre observasjonspunktene, gir en mestringsscore og skriver neste steg. Det er her framgangen blir synlig over tid.",
  },
  {
    icon: "⌕",
    title: "«Slå opp» — fagkort",
    body: "Søk i praktiske fagkort med sidehenvisninger til heftet når du trenger et raskt svar — også når du står ute i felt.",
  },
  {
    icon: "✓",
    title: "Klar! Dataene er dine",
    body: "Alt lagres lokalt på din enhet. Under Innstillinger kan du eksportere, dele med laget eller bytte tema. Velg nå en vei på startmenyen for å komme i gang.",
  },
];

let tourStep = 0;

function openWelcome() {
  const overlay = $("#welcomeOverlay");
  if (!overlay) return;
  overlay.hidden = false;
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
  requestAnimationFrame(() => overlay.classList.add("is-open"));
}

function closeWelcome() {
  const overlay = $("#welcomeOverlay");
  if (!overlay) return;
  if (!state.hasSeenWelcome) {
    state.hasSeenWelcome = true;
    saveState();
  }
  overlay.classList.remove("is-open");
  if (!$("#tourOverlay")?.classList.contains("is-open")) {
    document.body.classList.remove("overlay-open");
  }
  setTimeout(() => {
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
  }, 200);
}

function renderTourStep() {
  const content = $("#tourContent");
  if (!content) return;
  const step = tourSteps[tourStep];
  const total = tourSteps.length;
  const isLast = tourStep === total - 1;
  const dots = tourSteps
    .map((_, i) => `<span class="tour-dot" data-active="${i === tourStep}"></span>`)
    .join("");
  content.innerHTML = `
    <div class="tour-step">
      <div class="tour-progress" aria-hidden="true">${dots}</div>
      <p class="small tour-count">Steg ${tourStep + 1} av ${total}</p>
      <span class="tour-icon" aria-hidden="true">${step.icon}</span>
      <h2 id="tourTitle">${escapeHtml(step.title)}</h2>
      <p id="tourBody" class="tour-body">${escapeHtml(step.body)}</p>
      <div class="tour-nav">
        <button class="text-button" type="button" data-tour-skip>${isLast ? "Lukk" : "Hopp over"}</button>
        <div class="tour-nav-right">
          ${tourStep > 0 ? '<button class="ghost-button" type="button" data-tour-back>Tilbake</button>' : ""}
          <button class="primary-button" type="button" data-tour-next>${isLast ? "Kom i gang!" : "Skjønner →"}</button>
        </div>
      </div>
    </div>`;
}

function startTour() {
  const overlay = $("#tourOverlay");
  if (!overlay) return;
  tourStep = 0;
  renderTourStep();
  overlay.hidden = false;
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
  requestAnimationFrame(() => {
    overlay.classList.add("is-open");
    $("#tourOverlay [data-tour-next]")?.focus();
  });
}

function endTour() {
  const overlay = $("#tourOverlay");
  if (!overlay) return;
  overlay.classList.remove("is-open");
  if (!$("#welcomeOverlay")?.classList.contains("is-open")) {
    document.body.classList.remove("overlay-open");
  }
  setTimeout(() => {
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
  }, 200);
}

function nextTourStep() {
  if (tourStep >= tourSteps.length - 1) {
    endTour();
    return;
  }
  tourStep += 1;
  renderTourStep();
}

function prevTourStep() {
  if (tourStep === 0) return;
  tourStep -= 1;
  renderTourStep();
}

function initWelcome() {
  $("#openWelcome")?.addEventListener("click", openWelcome);
  $("#settingsShowIntro")?.addEventListener("click", openWelcome);

  $("#welcomeOverlay")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-welcome]")) {
      closeWelcome();
      return;
    }
    if (event.target.closest("#startTour")) {
      startTour();
      return;
    }
    const go = event.target.closest("[data-welcome-go]");
    if (go) {
      const view = go.dataset.welcomeGo;
      closeWelcome();
      if (view) setView(view);
    }
  });

  $("#tourOverlay")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-tour-next]")) {
      nextTourStep();
      return;
    }
    if (event.target.closest("[data-tour-back]")) {
      prevTourStep();
      return;
    }
    if (event.target.closest("[data-tour-skip]")) {
      endTour();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if ($("#qrOverlay")?.classList.contains("is-open")) {
      closeQr();
    } else if ($("#fieldOverlay")?.classList.contains("is-open")) {
      closeFieldMode();
    } else if ($("#tourOverlay")?.classList.contains("is-open")) {
      endTour();
    } else if ($("#welcomeOverlay")?.classList.contains("is-open")) {
      closeWelcome();
    }
  });
}

function init() {
  setDefaults();
  paintIcons();
  applyTheme();
  initEvents();
  initWelcome();
  initShare();
  initFieldMode();
  initSidebarHover();
  handleSharedImport();
  setView(state.view || "dashboard");
  registerServiceWorker();
  // Første gang: vis startmenyen og auto-start den pedagogiske guiden.
  if (!state.hasSeenWelcome) {
    openWelcome();
    startTour();
  }
}

function initSidebarHover() {
  const sidebar = $("#sidebar");
  const shell = $(".app-shell");
  if (!sidebar || !shell) return;
  // Vi bruker data-collapsed for å la CSS styre rail/expanded.
  // På hover/fokus fjerner vi attributtet midlertidig.
  const expand = () => {
    sidebar.dataset.collapsed = "false";
    shell.classList.add("sidebar-expanded");
  };
  const collapse = () => {
    sidebar.dataset.collapsed = "true";
    shell.classList.remove("sidebar-expanded");
  };
  sidebar.addEventListener("mouseenter", expand);
  sidebar.addEventListener("mouseleave", collapse);
  sidebar.addEventListener("focusin", expand);
  sidebar.addEventListener("focusout", (event) => {
    if (!sidebar.contains(event.relatedTarget)) collapse();
  });
}

function showUpdateToast() {
  const existing = $("#updateToast");
  if (existing) return;
  const toast = document.createElement("div");
  toast.id = "updateToast";
  toast.className = "update-toast";
  toast.setAttribute("role", "status");
  toast.innerHTML = `
    <span>Ny versjon av SporLab er klar.</span>
    <button class="update-toast-btn" type="button" id="updateToastReload">Last inn på nytt</button>
    <button class="update-toast-dismiss" type="button" id="updateToastDismiss" aria-label="Lukk">✕</button>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  document.getElementById("updateToastReload")?.addEventListener("click", () => window.location.reload());
  document.getElementById("updateToastDismiss")?.addEventListener("click", () => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 300);
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!["http:", "https:"].includes(window.location.protocol)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").then((reg) => {
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            showUpdateToast();
          }
        });
      });
    }).catch((error) => {
      console.warn("SporLab kunne ikke aktivere offline-modus.", error);
    });
  });
}

init();
