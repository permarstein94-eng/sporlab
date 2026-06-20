// @ts-check
/* UI-laget: visninger, hendelser, overlays og oppstart (init). */
import {
  diagrams,
  focusForModule,
  focusOrder,
  moduleForFocus,
  moduleForLog,
  modules,
  planBlueprints,
  protocols,
  quizQuestions,
  references,
  reflectionLibrary,
  renderGettingStarted,
  theoryDeepDives,
  theoryForFocus,
} from "../content.js";
import {
  MAX_LOGS,
  MAX_PLANS,
  SCHEMA_VERSION,
  resetAllData,
  saveState,
  state,
} from "./state.js";
import {
  $,
  $all,
  downloadBlob,
  emptyState,
  escapeHtml,
  highlight,
  localIsoDate,
  makeId,
  readableAge,
  readableExperience,
  readableIntensity,
  readableTerrain,
  shuffle,
} from "./utils.js";
import { importSnapshot, logsToCsv, readFileAsText, shareSnapshot } from "./snapshot.js";
import { buildQuizSession, ensureQuizSession, getWeakestQuestionId, questionsById } from "./quiz.js";

const viewMeta = {
  dashboard: ["Din læringsplattform · E8 / E9", "Hjem"],
  training: ["Feltmodus · planlegg og loggfør", "Felt"],
  learn: ["Læringsmodus · løype og kontrollspørsmål", "Lær"],
  planner: ["Feltmodus · øktplanlegger", "Planlegg økt"],
  log: ["Feltmodus · treningslogg", "Loggskjema"],
  reference: ["Fagkort med sidehenvisninger", "Oppslag"],
  quiz: ["Læringsmodus · kontrollspørsmål", "Quiz"],
  progress: ["Samlet progresjon · teori og praksis", "Progresjon"],
  settings: ["Data og utseende", "Innstillinger"],
};

const ALL_VIEWS = ["dashboard", "training", "learn", "planner", "log", "reference", "quiz", "progress", "settings"];

// Hvilken av de to modulene en visning hører til. «Oversikt» er broen og er
// bevisst nøytral. Brukes til å vise tydelig om du er i lærings- eller feltmodus.
const viewDomain = {
  learn: "learning",
  quiz: "learning",
  training: "field",
  planner: "field",
  log: "field",
};

// Sammenhengende læringsplattform: bunnmenyen har fem faner —
// Hjem · Lær · Felt (sentrert FAB) · Fremgang · Oppslag. Hver visning markerer
// fanen den hører hjemme i, så brukeren alltid vet hvor i appen de er.
// Felt-FAB-en («training») dekker planlegger og hurtiglogg.
const navTabForView = {
  dashboard: "dashboard",
  progress: "progress",
  training: "training",
  planner: "training",
  log: "training",
  learn: "learn",
  quiz: "learn",
  reference: "reference",
  settings: "",
};

/* ---------- Felles overlay-håndtering (welcome, tour, feltmodus, QR) ---------- */

const OVERLAY_SELECTOR = "#welcomeOverlay, #fieldOverlay, #qrOverlay, #quickLogOverlay, #refSheet, #ceremonyOverlay, #bridgeOverlay, #feedbackOverlay";

// Sporer en ev. ventende skjul-timer per overlay, slik at en rask lukk-så-
// åpne-igjen ikke ender med at den gamle timeren tvangsgjemmer overlayet
// rett etter at det ble åpnet på nytt.
const pendingHideTimers = new WeakMap();

function openOverlay(overlay) {
  if (!overlay) return;
  const pendingHide = pendingHideTimers.get(overlay);
  if (pendingHide) {
    clearTimeout(pendingHide);
    pendingHideTimers.delete(overlay);
  }
  overlay.hidden = false;
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
  requestAnimationFrame(() => overlay.classList.add("is-open"));
}

function closeOverlay(overlay) {
  if (!overlay) return;
  overlay.classList.remove("is-open");
  const anyOpen = $all(OVERLAY_SELECTOR).some((el) => el.classList.contains("is-open"));
  if (!anyOpen) document.body.classList.remove("overlay-open");
  const previousHide = pendingHideTimers.get(overlay);
  if (previousHide) clearTimeout(previousHide);
  pendingHideTimers.set(
    overlay,
    setTimeout(() => {
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
      pendingHideTimers.delete(overlay);
    }, 200)
  );
}

/* ---------- Fullføring-seremoni og bro-bekreftelse (fase 1b) ----------
   Belønningsøyeblikkene som binder teori og praksis sammen. Begge respekterer
   prefers-reduced-motion (ingen ring-/burst-bevegelse, bare en rolig innfade). */

const shortTitleOf = (m) => (m && m.title ? m.title.replace(/^\d+\.\s*/, "") : "");

let ceremonyTimer = null;

function showCeremony(moduleId) {
  const overlay = $("#ceremonyOverlay");
  const module = modules.find((m) => m.id === moduleId);
  if (!overlay || !module) return;
  const idx = modules.findIndex((m) => m.id === moduleId);
  const nextModule = idx >= 0 && idx < modules.length - 1 ? modules[idx + 1] : null;
  $("#ceremonyEyebrow").textContent = `Tema ${idx + 1} av ${modules.length} fullført`;
  $("#ceremonyTitle").textContent = shortTitleOf(module);
  const action = $("#ceremonyAction");
  if (nextModule) {
    $("#ceremonyNext").textContent = `Neste tema er nå tilgjengelig: ${shortTitleOf(nextModule)}.`;
    action.textContent = `Gå til ${shortTitleOf(nextModule)} →`;
    action.dataset.next = nextModule.id;
  } else {
    $("#ceremonyNext").textContent = "Du har gått hele løypa — bruk det i felt og hold kunnskapen skarp.";
    action.textContent = "Fortsett";
    delete action.dataset.next;
  }
  overlay.classList.remove("is-animating");
  openOverlay(overlay);
  haptic([10, 40, 10]);
  if (!prefersReducedMotion()) {
    // Tving reflow før klassen settes, så ring/burst spilles fra start hver gang.
    void overlay.offsetWidth;
    overlay.classList.add("is-animating");
  }
  clearTimeout(ceremonyTimer);
  ceremonyTimer = setTimeout(() => closeCeremony(false), 3000);
}

function closeCeremony(goNext = false) {
  clearTimeout(ceremonyTimer);
  const overlay = $("#ceremonyOverlay");
  const nextId = $("#ceremonyAction")?.dataset.next;
  closeOverlay(overlay);
  overlay?.classList.remove("is-animating");
  if (goNext && nextId) {
    state.activeModule = nextId;
    state.activeGuide = null;
    state.learnAccordion = "learn";
    saveState();
    setView("learn");
  }
}

function showBridge(moduleId, dogName) {
  const overlay = $("#bridgeOverlay");
  const module = modules.find((m) => m.id === moduleId);
  if (!overlay || !module) return;
  const idx = modules.findIndex((m) => m.id === moduleId);
  const dog = (dogName || "").trim();
  $("#bridgeSub").textContent = dog
    ? `Tema ${idx + 1} «${shortTitleOf(module)}» er nå trent på med ${dog}.`
    : `Tema ${idx + 1} «${shortTitleOf(module)}» er nå trent på.`;
  openOverlay(overlay);
  haptic([10, 40, 10]);
}

// Vurder bro-bekreftelse: fyrer når en logget økt krediterer et tema som var
// lest, men ikke trent fra før. Kalles ETTER at loggen er lagt til state.
function maybeShowBridge(moduleId, wasUntrained, dogName) {
  if (moduleId && wasUntrained) showBridge(moduleId, dogName);
}

// Var temaet lest men utrent rett før en ny logg ble lagret? (Sjekkes på
// state slik den er FØR den nye loggen legges inn.)
function moduleWasLearnedUntrained(moduleId) {
  if (!moduleId || !state.completed.includes(moduleId)) return false;
  return (computeModuleLogCredit()[moduleId] || 0) === 0;
}

function initCeremony() {
  $("#ceremonyOverlay")?.addEventListener("click", (event) => {
    closeCeremony(!!event.target.closest("#ceremonyAction"));
  });
  $("#bridgeOverlay")?.addEventListener("click", () => closeOverlay($("#bridgeOverlay")));
}

/* ---------- Native finpuss: standalone-deteksjon, haptikk, bevegelse ---------- */

// Kjører appen som installert app (ikke i en nettleserfane)?
function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: window-controls-overlay)").matches ||
    // iOS Safari bruker en egen, ikke-standardisert flagg.
    /** @type {any} */ (window.navigator).standalone === true
  );
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

// Lett haptisk respons der enheten støtter det. Holdes kort og diskret, og
// hoppes over når brukeren har bedt om mindre bevegelse.
/** @param {number | number[]} [pattern] */
function haptic(pattern = 8) {
  if (prefersReducedMotion()) return;
  try {
    navigator.vibrate?.(pattern);
  } catch (error) {
    // vibrate kan kaste i enkelte innebygde nettlesere — trygt å ignorere.
  }
}

function setView(view) {
  if (!ALL_VIEWS.includes(view)) view = "dashboard";
  state.view = view;
  saveState();
  $all(".view").forEach((item) => item.classList.remove("is-visible"));
  const target = $(`#${view}View`);
  if (target) target.classList.add("is-visible");
  const activeTab = navTabForView[view] ?? view;
  $all(".bottom-nav-item").forEach((item) => {
    if (!item.dataset.view) return;
    const isActive = item.dataset.view === activeTab;
    item.classList.toggle("is-active", isActive);
    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });
  // Felt-FAB-en er en egen knapp (ikke .bottom-nav-item) og markeres separat.
  const fab = $("#navActionButton");
  if (fab) {
    const fabActive = fab.dataset.view === activeTab;
    fab.classList.toggle("is-active", fabActive);
    if (fabActive) fab.setAttribute("aria-current", "page");
    else fab.removeAttribute("aria-current");
  }
  const [eyebrow, title] = viewMeta[view] || ["", view];
  $("#viewEyebrow").textContent = eyebrow;
  $("#viewTitle").textContent = title;
  ALL_VIEWS.forEach((v) => {
    document.body.classList.toggle(`view-${v}`, view === v);
  });
  // Tydelig modus-identitet: lærings- vs feltmodul (Oversikt er broen, nøytral).
  document.body.dataset.domain = viewDomain[view] || "bridge";
  renderView(view);
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }
}

function renderView(view = state.view) {
  try {
    if (view === "dashboard") renderDashboard();
    if (view === "training") renderTraining();
    if (view === "learn") renderLearn();
    if (view === "planner") renderPlanner();
    if (view === "log") renderLog();
    if (view === "reference") renderReference();
    if (view === "quiz") renderQuiz();
    if (view === "progress") renderProgress();
    if (view === "settings") renderSettings();
  } catch (error) {
    // Én ødelagt visning skal ikke ta med seg hele appen (f.eks. korrupt
    // persistert tilstand). Fall tilbake til dashboardet og logg feilen.
    console.error(`SporLab: klarte ikke å vise «${view}».`, error);
    if (view !== "dashboard") setView("dashboard");
  }
}

function renderDashboard() {
  // Hjem er progresjons-huben: kursvei-stripe øverst, neste-steg-kort i midten
  // og siste aktivitet nederst. Sammen viser de hvor i løypa du er og hva som
  // er det naturlige neste trykket.
  renderHome();
  renderBackupNudge();
}

const shortModuleTitle = (m) => (m && m.title ? m.title.replace(/^\d+\.\s*/, "") : "");

// Et tema er fullført når alle tre lysene er grønne: teori lest, quiz bestått
// og trent i felt. Moduler uten quizspørsmål regnes som quiz-OK, ellers ville
// de aldri kunne fullføres. Ren utledning fra eksisterende state — ingen
// skjemaendring.
function homeModuleStatuses() {
  const logsByModule = computeModuleLogCredit();
  return modules.map((module) => {
    const c = moduleChecks(module, logsByModule);
    const quizOk = c.totalQs === 0 ? true : c.quizOk;
    const complete = c.isRead && quizOk && c.hasLog;
    return { module, ...c, quizOk, complete };
  });
}

function renderHome() {
  const shell = $("#homeShell");
  if (!shell) return;
  const statuses = homeModuleStatuses();
  const doneCount = statuses.filter((s) => s.complete).length;
  const pct = Math.round((doneCount / modules.length) * 100);
  // Aktivt tema = første som ennå ikke er fullført. -1 betyr at alt er fullført.
  const activeIndex = statuses.findIndex((s) => !s.complete);
  const fmtDay = (ts) => new Date(ts).toLocaleDateString("no-NO", { day: "numeric", month: "short" });

  shell.innerHTML = `
    ${renderKursvei(statuses, activeIndex, doneCount, pct)}
    ${renderNextStep(statuses, activeIndex)}
    ${renderHomeActivity(statuses, fmtDay)}
    <div class="home-foot">
      <button class="text-button" data-view-jump="progress" type="button">Se full fremgang →</button>
    </div>`;
  // Tegn ikonene som nettopp ble injisert (data-icon males ikke automatisk
  // for dynamisk innhold — bare for statisk markup ved oppstart).
  paintIcons(shell);
  // Kursvei-inngang: tegn linjen og pop punktene inn én gang ved app-åpning.
  if (!kursveiEntered && !prefersReducedMotion()) {
    shell.querySelector(".kursvei")?.classList.add("is-entering");
  }
  kursveiEntered = true;
}

// Inn-animasjonen for kursveien spilles bare på den første Hjem-visningen per
// app-åpning, ikke ved hver re-render.
let kursveiEntered = false;

/* Delt låse-modell: et tema er "done" så snart det er fullført (alle tre
   lysene), uavhengig av rekkefølge; det første ufullførte temaet er "active";
   resten forblir "locked" til de nås. Brukes av både Hjem-kursveien og
   Lær-moduloversikten, så de to alltid viser samme låsetilstand. */
function moduleProgressState(s, i, activeIndex) {
  if (s.complete) return "done";
  if (i === activeIndex) return "active";
  if (activeIndex === -1) return "done";
  return "locked";
}

// Brukes som vakt før modul-til-modul-navigasjon (stepper-pilene, "fortsett der
// du var") som ikke selv har en disabled-knapp å lene seg på, slik
// modul-grid-kortene og kursvei-prikkene har.
function isModuleLocked(moduleId) {
  const statuses = homeModuleStatuses();
  const activeIndex = statuses.findIndex((s) => !s.complete);
  const i = statuses.findIndex((s) => s.module.id === moduleId);
  if (i === -1) return false;
  return moduleProgressState(statuses[i], i, activeIndex) === "locked";
}

/* Zone 1 — Kursvei-stripe: ett punkt per modul på mørk NRH-bakgrunn.
   Koblende linjer mellom punktene fargelegges blå fram til aktivt tema. */
function renderKursvei(statuses, activeIndex, doneCount, pct) {
  const nodes = statuses
    .map((s, i) => {
      const nodeState = moduleProgressState(s, i, activeIndex);
      const locked = nodeState === "locked";
      const title = escapeHtml(shortModuleTitle(s.module));
      const suffix = s.complete ? "fullført" : nodeState === "active" ? "aktiv" : "låst";
      const inner = s.complete ? "✓" : i + 1;
      return `
        <li class="kursvei-node" data-state="${nodeState}" style="--i:${i}">
          <button class="kursvei-dot" type="button"
            ${locked ? 'disabled aria-disabled="true"' : `data-module-open="${s.module.id}"`}
            aria-label="Tema ${i + 1}: ${title} (${suffix})">
            <span aria-hidden="true">${inner}</span>
          </button>
        </li>`;
    })
    .join("");
  return `
    <section class="kursvei" aria-label="Kursvei — ${doneCount} av ${statuses.length} temaer fullført">
      <div class="kursvei-head">
        <p class="eyebrow">Din kursvei</p>
        <p class="kursvei-count"><strong>${doneCount}</strong> av ${statuses.length} fullført · ${pct}%</p>
      </div>
      <ol class="kursvei-nodes">${nodes}</ol>
    </section>`;
}

/* Zone 2 — Neste steg-kort: aktivt tema med tre statuslinjer og en primærknapp
   som peker på det som mangler (les → quiz → planlegg). */
function renderNextStep(statuses, activeIndex) {
  if (activeIndex === -1) {
    return `
      <section class="next-step next-step-done">
        <span class="next-step-badge" aria-hidden="true">★</span>
        <p class="eyebrow">Hele løypa fullført</p>
        <h3>Alle ${statuses.length} temaer er lest, quizet og trent 🎉</h3>
        <p class="small">Hold kunnskapen skarp — repeter svake spørsmål eller planlegg en ny økt.</p>
        <div class="button-row">
          <button class="primary-button" data-next-action="open-planner" type="button">Planlegg en økt</button>
          <button class="ghost-button" data-learn-quiz="weak" type="button">Repeter svake spørsmål</button>
        </div>
      </section>`;
  }
  const s = statuses[activeIndex];
  const lines = [
    { ok: s.isRead, label: "Teori lest" },
    { ok: s.quizOk, label: "Quiz bestått" },
    { ok: s.hasLog, label: "Trent i felt" },
  ]
    .map(
      (l) => `
        <li class="next-step-line ${l.ok ? "is-ok" : ""}">
          <span class="next-step-tick" data-icon="${l.ok ? "check" : "minus"}" aria-hidden="true"></span>
          ${escapeHtml(l.label)}
        </li>`,
    )
    .join("");
  let cta;
  if (!s.isRead) {
    cta = `<button class="primary-button" data-module-open="${s.module.id}" type="button">Les teori →</button>`;
  } else if (!s.quizOk) {
    cta = `<button class="primary-button" data-start-module-quiz="${s.module.id}" type="button">Ta quiz →</button>`;
  } else {
    const focus = focusForModule(s.module.id);
    cta = focus
      ? `<button class="primary-button" data-drill-plan="${escapeHtml(focus)}" type="button">Planlegg økt →</button>`
      : `<button class="primary-button" data-next-action="open-planner" type="button">Planlegg økt →</button>`;
  }
  return `
    <section class="next-step">
      <p class="eyebrow">Neste steg · Tema ${activeIndex + 1} av ${statuses.length}</p>
      <h3>${escapeHtml(shortModuleTitle(s.module))}</h3>
      <ul class="next-step-status">${lines}</ul>
      <div class="next-step-cta">${cta}</div>
    </section>`;
}

/* Zone 3 — Siste aktivitet: nyeste loggede økter pluss en bro-snarvei for et
   tema som er lest men ikke trent ennå. */
function renderHomeActivity(statuses, fmtDay) {
  const items = [];
  const recentLogs = [...state.logs]
    .sort((a, b) => logTimestamp(b) - logTimestamp(a))
    .slice(0, 3);
  recentLogs.forEach((log) => {
    const modId = moduleForLog(log);
    const found = modId ? modules.find((m) => m.id === modId) : null;
    const modTitle = found ? ` · ${escapeHtml(shortModuleTitle(found))}` : "";
    const dog = log.dog ? ` · ${escapeHtml(log.dog)}` : "";
    const rating = Number(log.rating) > 0 ? ` · ${"★".repeat(Number(log.rating))}` : "";
    items.push(`
      <li class="activity-row">
        <span class="activity-icon" data-icon="log" aria-hidden="true"></span>
        <span class="activity-body">
          <strong>${escapeHtml(log.type || "Økt")}${modTitle}</strong>
          <span class="small">${escapeHtml(fmtDay(logTimestamp(log)))}${dog}${rating}</span>
        </span>
      </li>`);
  });
  const learnedUntrained = statuses.find((s) => s.isRead && !s.hasLog);
  if (learnedUntrained) {
    const focus = focusForModule(learnedUntrained.module.id);
    items.push(`
      <li class="activity-row activity-row-nudge">
        <span class="activity-icon activity-icon-amber" data-icon="trees" aria-hidden="true"></span>
        <span class="activity-body">
          <strong>${escapeHtml(shortModuleTitle(learnedUntrained.module))} — lest, ikke trent</strong>
          <span class="small">Ta teorien med ut i skogen.</span>
        </span>
        <button class="text-button" ${focus ? `data-drill-plan="${escapeHtml(focus)}"` : 'data-next-action="open-planner"'} type="button">Planlegg →</button>
      </li>`);
  }
  const body = items.length
    ? `<ul class="activity-list">${items.slice(0, 3).join("")}</ul>`
    : `<div class="empty-state"><p>Ingen aktivitet ennå. Les et tema eller logg en økt, så dukker det opp her.</p></div>`;
  return `
    <section class="home-activity">
      <p class="eyebrow">Siste aktivitet</p>
      ${body}
    </section>`;
}

// Diskret påminnelse om sikkerhetskopi: all data bor i localStorage, som kan
// ryke ved nettleser-opprydding. Vises når mange økter mangler i siste eksport.
const BACKUP_NUDGE_THRESHOLD = 15;

function renderBackupNudge() {
  const nudge = $("#backupNudge");
  if (!nudge) return;
  const unsaved = state.logs.length - (state.lastExportLogCount || 0);
  if (unsaved < BACKUP_NUDGE_THRESHOLD) {
    nudge.hidden = true;
    return;
  }
  nudge.hidden = false;
  nudge.innerHTML = `${unsaved} økter er ikke sikkerhetskopiert. <button class="text-button" type="button" data-view-jump="settings">Eksporter nå</button>`;
}

/* Logger krediteres ett tema via `moduleForLog` (lagret felt → plan/fokus →
   økt-type). «Momenttrening» er tvetydig (fire mulige moduler) og krediteres
   derfor bare via plan/fokus. Grunnlaget trenes i enhver loggført økt. */
function computeModuleLogCredit() {
  const logsByModule = {};
  state.logs.forEach((l) => {
    const mod = moduleForLog(l);
    if (mod) logsByModule[mod] = (logsByModule[mod] || 0) + 1;
  });
  if (state.logs.length && !logsByModule.grunnlag) logsByModule.grunnlag = 1;
  return logsByModule;
}

/* Sist trent på et tema — datostempel fra nyeste logg som krediterer temaet.
   Brukes til å vise praksis-koblingen rett i læringsløypa. */
function lastTrainedByModule() {
  const byModule = {};
  state.logs.forEach((l) => {
    const mod = moduleForLog(l);
    if (!mod) return;
    const ts = logTimestamp(l);
    if (ts > (byModule[mod] || 0)) byModule[mod] = ts;
  });
  return byModule;
}

/* De tre trinnene som gjør en modul prøveklar: lest, 60 % av quizspørsmålene
   mestret, og minst én loggført økt på modulens tema. */
function moduleChecks(module, logsByModule) {
  const isRead = state.completed.includes(module.id);
  const moduleQs = quizQuestions.filter((q) => q.module === module.id);
  const totalQs = moduleQs.length;
  const masteredQs = moduleQs.filter((q) => {
    const m = state.mastery[q.id];
    return m && m.correct > m.wrong;
  }).length;
  const quizOk = totalQs > 0 && masteredQs >= Math.ceil(totalQs * 0.6);
  const hasLog = (logsByModule[module.id] || 0) > 0;
  return { isRead, quizOk, masteredQs, totalQs, hasLog };
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

  const logsByModule = computeModuleLogCredit();

  const rows = modules.map((module) => {
    const c = moduleChecks(module, logsByModule);
    const checks = [
      { ok: c.isRead, label: "Lest" },
      { ok: c.quizOk, label: `Quiz (${c.masteredQs}/${c.totalQs})` },
      { ok: c.hasLog, label: "Loggført" },
    ];
    const score = checks.filter((item) => item.ok).length;
    const checksHtml = checks.map((item) =>
      `<span class="exam-check ${item.ok ? "is-ok" : ""}" aria-label="${item.label}: ${item.ok ? "ok" : "mangler"}">${item.ok ? "✓" : "○"} ${escapeHtml(item.label)}</span>`
    ).join("");

    return `<div class="exam-row" data-score="${score}">
      <span class="exam-module">${escapeHtml(module.title.replace(/^\d+\.\s*/, ""))}</span>
      <div class="exam-checks">${checksHtml}</div>
    </div>`;
  }).join("");

  const totalReady = modules.filter((m) => {
    const c = moduleChecks(m, logsByModule);
    return c.isRead && c.quizOk && c.hasLog;
  }).length;

  body.innerHTML = `
    <p class="small exam-legend">Lest + 60 % quiz mestret + loggført økt = prøveklar modul.</p>
    <div class="exam-rows">${rows}</div>
    <p class="small exam-summary">${totalReady} av ${modules.length} moduler prøveklare.</p>`;
}

function renderProgress() {
  const progress = Math.round((state.completed.length / modules.length) * 100);
  const progressNumber = $("#progressNumber");
  if (progressNumber) progressNumber.textContent = `${progress}%`;
  const logNumber = $("#logNumber");
  if (logNumber) logNumber.textContent = String(state.logs.length);
  const planNumber = $("#planNumber");
  if (planNumber) planNumber.textContent = String(state.plans.length);
  renderExamReadiness();
  renderProgressCharts();
}

/* ---------- Trening: planer og loggførte økter ---------- */

function renderTraining() {
  renderPlanList();
  renderLogList();
}

function planRow(plan) {
  const date = plan.createdAt
    ? new Date(plan.createdAt).toLocaleDateString("no-NO", { day: "numeric", month: "short" })
    : "";
  const subtitle = [date, plan.dog].filter(Boolean).join(" · ");
  return `<details class="plan-row">
    <summary>
      <span class="plan-row-info"><strong>${escapeHtml(plan.title)}</strong>${subtitle ? `<span class="small">${escapeHtml(subtitle)}</span>` : ""}</span>
      <span class="plan-row-chevron" aria-hidden="true">▾</span>
    </summary>
    <div class="plan-row-actions">
      <button class="primary-button small-button" data-field-mode="${escapeHtml(plan.id)}" type="button">Start feltmodus</button>
      <button class="ghost-button small-button" data-log-from-plan="${escapeHtml(plan.id)}" type="button">Loggfør</button>
      <button class="ghost-button small-button" data-print-plan="${escapeHtml(plan.id)}" type="button">Skriv ut</button>
      <button class="ghost-button small-button" data-share-qr="${escapeHtml(plan.id)}" type="button">Del med QR</button>
      <button class="ghost-button small-button" data-load-plan="${escapeHtml(plan.id)}" type="button">Gjenbruk</button>
      <button class="text-button small-button" data-delete-plan="${escapeHtml(plan.id)}" type="button">Slett</button>
    </div>
  </details>`;
}

function renderPlanList() {
  const el = $("#planList");
  if (!el) return;
  const plans = state.plans || [];
  if (!plans.length) {
    el.innerHTML = emptyState("Ingen planer ennå. Trykk «Planlegg ny» for å lage en øktplan.");
    return;
  }
  const [first, ...rest] = plans;
  el.innerHTML = planCard(first, true) + (rest.length ? `<div class="plan-row-list">${rest.map(planRow).join("")}</div>` : "");
}

function logDayKey(log) {
  if (log && typeof log.date === "string" && log.date) return log.date.slice(0, 10);
  return localIsoDate(new Date(log?.createdAt || 0));
}

/* Hundenavn er fritekst — grupper case-insensitivt slik at «Rex» og «rex»
   telles som samme hund. Etiketten blir den hyppigst brukte skrivemåten.
   Lagrede logger røres ikke; nøkkelen finnes bare ved visning. */
function dogKey(name) {
  return (name || "").trim().toLocaleLowerCase("no");
}

function dogGroups(logs) {
  const groups = new Map();
  logs.forEach((l) => {
    const key = dogKey(l.dog);
    if (!key) return;
    const label = l.dog.trim();
    if (!groups.has(key)) groups.set(key, { key, labels: new Map() });
    const g = groups.get(key);
    g.labels.set(label, (g.labels.get(label) || 0) + 1);
  });
  return [...groups.values()]
    .map((g) => ({
      key: g.key,
      label: [...g.labels.entries()].sort((a, b) => b[1] - a[1])[0][0],
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "no"));
}

// Hundefilteret for dashbordgrafene lever bare i minnet, likt logFilters.
let chartDogFilter = "all";

function renderProgressCharts() {
  const panel = $("#progressChartsPanel");
  if (!panel) return;
  if (!state.logs.length) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;

  const groups = dogGroups(state.logs);
  if (chartDogFilter !== "all" && !groups.some((g) => g.key === chartDogFilter)) chartDogFilter = "all";

  // Filteret vises først når loggene inneholder mer enn én hund.
  const filterEl = $("#chartDogFilter");
  if (filterEl) {
    filterEl.hidden = groups.length < 2;
    filterEl.innerHTML = groups.length < 2
      ? ""
      : [{ key: "all", label: "Alle hunder" }, ...groups]
          .map((g) => {
            const selected = g.key === chartDogFilter;
            return `<button class="chip-button${selected ? " is-selected" : ""}" type="button" data-chart-dog="${escapeHtml(g.key)}" aria-pressed="${selected}">${escapeHtml(g.label)}</button>`;
          })
          .join("");
  }

  const selected = chartDogFilter === "all" ? null : groups.find((g) => g.key === chartDogFilter);
  const logs = selected ? state.logs.filter((l) => dogKey(l.dog) === selected.key) : state.logs;

  renderDogStats($("#dogStatRow"), logs);
  renderMasteryChart($("#masteryChart"), logs, selected);
  renderAgeChart($("#ageChart"), logs);
  renderFrequencyHeatmap($("#frequencyChart"), logs);
}

const fmtScore = (n) => n.toLocaleString("no-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/* Nøkkeltall for utvalget: økter, snitt mestring, trend og dager siden siste
   økt. Trenden sammenligner snittet av de fem siste øktene med score mot de
   fem før, og vises først når begge vinduene er fulle. */
function renderDogStats(container, logs) {
  if (!container) return;
  const rated = logs.filter((l) => Number(l.rating) > 0);
  const avg = rated.length ? rated.reduce((s, l) => s + Number(l.rating), 0) / rated.length : null;

  let trend = null;
  if (rated.length >= 10) {
    const byTime = [...rated].sort((a, b) => logTimestamp(a) - logTimestamp(b));
    const mean = (arr) => arr.reduce((s, l) => s + Number(l.rating), 0) / arr.length;
    trend = mean(byTime.slice(-5)) - mean(byTime.slice(-10, -5));
  }

  const newest = logs.reduce((max, l) => Math.max(max, logTimestamp(l)), 0);
  const daysSince = newest ? Math.max(0, Math.floor((Date.now() - newest) / 86400000)) : null;

  const stats = [
    { label: "økter", value: String(logs.length) },
    { label: "snitt mestring", value: avg === null ? "–" : fmtScore(avg) },
    {
      label: "trend (5 økter)",
      value: trend === null ? "–" : `${trend < 0 ? "−" : "+"}${fmtScore(Math.abs(trend))}`,
      tone: trend === null || Math.abs(trend) < 0.05 ? "" : trend > 0 ? "is-up" : "is-down",
    },
    { label: "dager siden økt", value: daysSince === null ? "–" : String(daysSince) },
  ];
  container.innerHTML = stats
    .map((s) => `<div class="dog-stat"><span class="stat-number ${s.tone || ""}">${escapeHtml(s.value)}</span><span class="stat-label">${escapeHtml(s.label)}</span></div>`)
    .join("");
}

/* Liggetidsfordeling: hvor mye trenes hver liggetid, og hvordan holder
   mestringen seg når sporet blir eldre? Tomme kategorier vises med vilje —
   hullet er selve treningsinnsikten. */
const AGE_BUCKETS = ["fersk", "6-12", "12-24", "24+"];

function renderAgeChart(container, logs) {
  if (!container) return;
  const buckets = new Map([...AGE_BUCKETS, ""].map((k) => [k, { count: 0, sum: 0, ratedCount: 0 }]));
  logs.forEach((l) => {
    const b = buckets.get(AGE_BUCKETS.includes(l.age) ? l.age : "");
    b.count += 1;
    const r = Number(l.rating) || 0;
    if (r > 0) {
      b.sum += r;
      b.ratedCount += 1;
    }
  });
  const max = Math.max(1, ...[...buckets.values()].map((b) => b.count));
  const rows = [...buckets.entries()]
    .filter(([key, b]) => key !== "" || b.count > 0)
    .map(([key, b]) => {
      const label = key ? readableAge(key) : "Uten liggetid";
      const pct = Math.round((b.count / max) * 100);
      const score = b.ratedCount ? ` · ★ ${fmtScore(b.sum / b.ratedCount)}` : "";
      return `<div class="age-row${b.count ? "" : " age-row-empty"}">
        <span class="age-label">${escapeHtml(label)}</span>
        <span class="age-track"><span class="age-bar" style="width:${pct}%"></span></span>
        <span class="age-value">${escapeHtml(`${b.count}${score}`)}</span>
      </div>`;
    })
    .join("");
  container.innerHTML = `
    <div class="age-chart">${rows}</div>
    <p class="small chart-caption">Antall økter per liggetid · ★ = snitt mestring (1–5)</p>`;
}

function renderMasteryChart(container, logs, selectedDog) {
  if (!container) return;
  const rated = logs
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
    <p class="small chart-caption">${n} økter med score · snitt ${avg} av 5${selectedDog ? ` · ${escapeHtml(selectedDog.label)}` : ""}</p>`;
}

function renderFrequencyHeatmap(container, logs) {
  if (!container) return;
  const counts = {};
  logs.forEach((l) => {
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

  const total = logs.length;
  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" class="chart-svg heatmap-svg" role="img" aria-label="Treningsfrekvens siste ${weeks} uker">
      ${monthLabels}
      ${dayLabelText}
      ${rects}
    </svg>
    <div class="heat-legend"><span class="small">Mindre</span><span class="heat heat-0"></span><span class="heat heat-1"></span><span class="heat heat-2"></span><span class="heat heat-3"></span><span class="small">Mer</span><span class="small heat-total">· ${total} totalt</span></div>`;
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
    const id = getWeakestQuestionId();
    if (id === null) {
      card.hidden = true;
      return;
    }
    const question = questionsById.get(id);
    miniQuizState = {
      questionId: id,
      answered: false,
      lastCorrect: null,
      optionMap: shuffle(question.options.map((_, i) => i)),
      seenIds: new Set([id]),
      askedCount: 0,
    };
  }

  const question = questionsById.get(miniQuizState.questionId);
  if (!question) {
    miniQuizState = null;
    card.hidden = true;
    return;
  }
  card.hidden = false;
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
        <p class="eyebrow">Dagens spørsmål</p>
        <h3>Ett spørsmål før du leser videre</h3>
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
  const question = questionsById.get(miniQuizState.questionId);
  if (!question) return;
  const originalIndex = miniQuizState.optionMap[displayChoice];
  const correct = originalIndex === question.answer;
  miniQuizState.answered = true;
  miniQuizState.lastChoice = displayChoice;
  miniQuizState.lastCorrect = correct;
  const mastery = state.mastery[question.id] || { correct: 0, wrong: 0, lastSeen: 0 };
  if (correct) mastery.correct += 1;
  else mastery.wrong += 1;
  mastery.lastSeen = Date.now();
  state.mastery[question.id] = mastery;
  saveState();
  renderMiniQuiz();
}

function nextMiniQuiz() {
  if (!miniQuizState) return;
  const nextId = getWeakestQuestionId(miniQuizState.seenIds);
  if (nextId === null) {
    miniQuizState = null;
    const card = $("#miniQuizCard");
    if (card) card.hidden = true;
    return;
  }
  const question = questionsById.get(nextId);
  miniQuizState.seenIds.add(nextId);
  miniQuizState.questionId = nextId;
  miniQuizState.answered = false;
  miniQuizState.lastCorrect = null;
  miniQuizState.lastChoice = null;
  miniQuizState.optionMap = shuffle(question.options.map((_, i) => i));
  miniQuizState.askedCount += 1;
  renderMiniQuiz();
}

function renderLearn() {
  const shell = $("#learnShell");
  if (!shell) return;
  if (state.activeGuide === "getting-started") {
    shell.innerHTML = renderGettingStarted(state.gettingStartedAnswers);
    initGettingStartedStepper();
  } else if (state.activeModule) {
    shell.innerHTML = renderLearnModule(state.activeModule);
  } else {
    shell.innerHTML = renderLearnIntro();
    renderMiniQuiz();
  }
}

function renderLearnIntro() {
  const logsByModule = computeModuleLogCredit();
  const trainedCount = modules.filter((m) => (logsByModule[m.id] || 0) > 0).length;
  const shortTitle = (m) => m.title.replace(/^\d+\.\s*/, "");

  // Moduloversikten bruker samme låste-grid-modell som Hjem-kursveien: et
  // tema er "fullført" når alle tre lysene er grønne (lest+quiz+trent), og
  // bare det aktive (eller et allerede fullført) temaet kan åpnes — resten
  // er låst til de nås. Samkjører løype-låsingen mot kursveien på Hjem.
  const gridStatuses = homeModuleStatuses();
  const gridActiveIndex = gridStatuses.findIndex((s) => !s.complete);
  const gridDoneCount = gridStatuses.filter((s) => s.complete).length;
  // Neste steg i løypa = det aktive (ulåste) temaet, ikke bare "første uleste"
  // — ellers kan kortet peke på et tema som faktisk er låst (lest, men ikke
  // quizet/trent ennå på det forrige).
  const nextModule = gridActiveIndex === -1 ? null : gridStatuses[gridActiveIndex].module;
  const gridPct = Math.round((gridDoneCount / modules.length) * 100);

  const cards = gridStatuses
    .map((s, i) => {
      const cardState = moduleProgressState(s, i, gridActiveIndex);
      const locked = cardState === "locked";
      const moduleIconKey = `mod-${s.module.id}`;
      const iconContent = cardState === "done" ? ICONS.check : ICONS[moduleIconKey] || String(i + 1);
      const pill = cardState === "active" ? '<span class="module-grid-pill">Aktiv</span>' : "";
      const lockBadge = locked ? `<span class="module-grid-lock" aria-hidden="true">${ICONS.lock}</span>` : "";
      const lights = locked
        ? ""
        : `<span class="loype-lights">${[
            { ok: s.isRead, label: "Lest" },
            { ok: s.quizOk, label: "Quiz" },
            { ok: s.hasLog, label: "Trent" },
          ]
            .map((l) => `<span class="loype-light ${l.ok ? "is-ok" : ""}">${l.ok ? "✓" : "○"} ${escapeHtml(l.label)}</span>`)
            .join("")}</span>`;
      return `
        <button class="module-grid-card" data-state="${cardState}" type="button"
          ${locked ? 'disabled aria-disabled="true"' : `data-module-open="${s.module.id}"`}>
          ${lockBadge}${pill}
          <span class="module-grid-icon" aria-hidden="true">${iconContent}</span>
          <h4>${escapeHtml(s.module.title)}</h4>
          <p>${escapeHtml(s.module.summary)}</p>
          ${lights}
        </button>`;
    })
    .join("");

  const nextStepHtml = nextModule
    ? `<section class="loype-next">
        <p class="eyebrow">Neste steg i løypa</p>
        <h4>${escapeHtml(nextModule.title)}</h4>
        <p class="small">${escapeHtml(nextModule.summary)}</p>
        <button class="primary-button" data-module-open="${nextModule.id}" type="button">Åpne ${escapeHtml(shortTitle(nextModule))} →</button>
      </section>`
    : `<section class="loype-next">
        <p class="eyebrow">Du har gått hele løypa</p>
        <h4>Alle åtte temaer er mestret 🎉</h4>
        <p class="small">Nå handler det om å bruke det i felt og holde kunnskapen skarp.</p>
        <div class="button-row">
          <button class="primary-button" data-next-action="open-planner" type="button">Planlegg en økt</button>
          <button class="ghost-button" data-learn-quiz="weak" type="button">Repeter svake spørsmål</button>
        </div>
      </section>`;

  return `
    <button class="view-back" data-view-jump="dashboard" type="button">← Hjem</button>
    <article class="panel mini-quiz-card" id="miniQuizCard" hidden></article>

    <header class="loype-header">
      <span class="domain-pill domain-pill-learning">Læringsmodul</span>
      <p class="eyebrow">Læringsløype · E8 Sporoppsøk og E9 Spor</p>
      <h3>Et kurs du jobber deg gjennom — fra grunnlag til mål</h3>
      <div class="loype-progress-ring">
        <div class="loype-ring" style="--pct:${gridPct}"><span>${gridPct}%</span></div>
        <div>
          <p class="loype-position"><strong>${gridDoneCount} av ${modules.length}</strong> temaer mestret</p>
          <p class="small">${trainedCount} av ${modules.length} også trent i felt — koblingen til feltmodulen.</p>
        </div>
      </div>
    </header>

    <button class="getting-started-card" type="button" data-open-getstarted>
      <div class="gs-card-icon" aria-hidden="true">▶</div>
      <div class="gs-card-body">
        <p class="eyebrow">Før du starter</p>
        <h4>Aldri gått spor med hunden før?</h4>
        <p>Les en kort guide som tar deg gjennom kartlegging, valg av startmetode og hvordan en helt første sporøkt kan se ut. Hentet fra leseheftet s. 7-11.</p>
      </div>
      <span class="gs-card-arrow" aria-hidden="true">→</span>
    </button>

    ${nextStepHtml}

    <section>
      <div class="module-grid-head">
        <p class="eyebrow">Hele løypa</p>
        <p class="module-grid-count"><strong>${gridDoneCount}</strong> av ${modules.length} fullført · ${gridPct}%</p>
      </div>
      <h3 class="visually-hidden">Temaene i løypa</h3>
      <div class="progress-bar"><span style="width:${gridPct}%"></span></div>
      <p class="small">Hvert tema viser tre lys: <strong>Lest</strong> (teori), <strong>Quiz</strong> (kontroll) og <strong>Trent</strong> (felt). Fullfør alle tre for å låse opp neste tema.</p>
      <div class="module-grid">${cards}</div>
    </section>

    <section class="panel learn-quiz-panel">
      <p class="eyebrow">Aktiv repetisjon</p>
      <h3>Quiz</h3>
      <p class="small">Korte runder med forklaring på hvert svar. «Repeter svake» bygger en runde fra spørsmålene du har minst kontroll på.</p>
      <div class="button-row">
        <button class="primary-button" data-learn-quiz="all" type="button">Start quiz — alle moduler</button>
        <button class="ghost-button" data-learn-quiz="weak" type="button">Repeter svake</button>
      </div>
    </section>`;
}

function renderLearnModule(moduleId) {
  const module = modules.find((item) => item.id === moduleId) || modules[0];
  // Koblingen til feltmodulen: er dette temaet trent på, og hvordan planlegges det?
  const couplingFocus = focusForModule(module.id);
  const trainedCount = computeModuleLogCredit()[module.id] || 0;
  const trainedTs = lastTrainedByModule()[module.id];
  const fmtTrained = (ts) => new Date(ts).toLocaleDateString("no-NO", { day: "numeric", month: "short" });
  const deepDive = theoryDeepDives[module.id] || [];
  const reflections = reflectionLibrary[module.id] || [module.reflection];
  const moduleIndex = modules.findIndex((m) => m.id === module.id);
  const prevModule = moduleIndex > 0 ? modules[moduleIndex - 1] : null;
  const nextModule = moduleIndex < modules.length - 1 ? modules[moduleIndex + 1] : null;
  // prevModule peker aldri på et låst tema: du kan bare stå i stepperen for et
  // ulåst tema, og alle temaer før det er da ferdige eller aktive (se
  // moduleProgressState). Bare "Neste" trenger en lås-sjekk.
  const nextLocked = nextModule ? isModuleLocked(nextModule.id) : false;
  const open = state.learnAccordion || "learn";

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
  const diagramHtmlBlock = diagramHtml;

  // ---- Status per trinn (samme modell som Hjem: lest + quiz + trent → mestret) ----
  const logsByModule = computeModuleLogCredit();
  const checks = moduleChecks(module, logsByModule);
  const quizOk = checks.totalQs === 0 ? true : checks.quizOk;
  const mastered = checks.isRead && quizOk && checks.hasLog;
  const planFocus = (module.drill && module.drill.focus) || couplingFocus;

  // Stepper bygd på den eksisterende accordion-infrastrukturen: hvert trinn er
  // ett accordion-item med statusbadge. data-accordion-toggle / state.learnAccordion
  // styrer åpning som før — bare strukturen og innholdet er nytt.
  const step = (id, n, title, statusText, ok, contentHtml) => {
    const stepState = ok ? "done" : open === id ? "active" : "todo";
    return `
      <article class="accordion-item step-item" data-open="${open === id}" data-accordion="${id}" data-step-state="${stepState}">
        <button class="accordion-trigger step-trigger" type="button" data-accordion-toggle="${id}" aria-expanded="${open === id}">
          <span class="step-badge" aria-hidden="true">${ok ? "✓" : n}</span>
          <span class="step-head-text">
            <span class="step-title">${escapeHtml(title)}</span>
            <span class="step-status small">${escapeHtml(statusText)}</span>
          </span>
          <span class="accordion-chevron" aria-hidden="true">▾</span>
        </button>
        <div class="accordion-panel">${contentHtml}</div>
      </article>`;
  };

  // Trinn 1 — Les (kjernepunkter + teoridykk + marker som lest)
  const trinn1 = `
    <ul class="lesson-core">${module.learn.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    ${deepDive.length ? `<p class="eyebrow step-subhead">Teoridykk — for den som vil dypere</p>${deepHtml}` : ""}
    <div class="step-action">
      <button class="primary-button" id="toggleComplete" type="button">${checks.isRead ? "Marker som ulest" : "Marker teori som lest ✓"}</button>
    </div>`;

  // Trinn 2 — Quiz (lenker til modulens kontrollspørsmål; logikk uendret)
  const quizStatusLine = checks.totalQs
    ? `${checks.masteredQs} av ${checks.totalQs} spørsmål mestret`
    : "Ingen kontrollspørsmål for dette temaet ennå.";
  const trinn2 = `
    <p>Sjekk forståelsen med korte kontrollspørsmål om dette temaet. Du får forklaring på hvert svar, og består ved minst 60 %.</p>
    <p class="step-status-line">${escapeHtml(quizStatusLine)}</p>
    ${checks.totalQs ? `<div class="step-action">
      <button class="primary-button" data-start-module-quiz="${module.id}" type="button">${quizOk ? "Repeter quiz" : "Ta quiz"} →</button>
    </div>` : ""}`;

  // Trinn 3 — Til skogen (pre-brief, øvelse, refleksjon, planlegg)
  const trainedLine = trainedCount
    ? `<p class="coupling-inline is-trained"><span class="domain-pill domain-pill-field">Felt</span> Trent på ✓ — sist ${escapeHtml(fmtTrained(trainedTs))} · ${trainedCount} ${trainedCount === 1 ? "økt" : "økter"} på dette temaet.</p>`
    : `<p class="coupling-inline"><span class="domain-pill domain-pill-field">Felt</span> Ikke trent i felt ennå. Når teorien sitter: prøv det ute, så markeres trinnet som trent.</p>`;
  const trinn3 = `
    <p class="step-prebrief">Dette skal du se etter ute:</p>
    <div class="callout"><p>${escapeHtml(module.field)}</p></div>
    ${diagramHtmlBlock}
    ${module.drill ? `<section class="module-drill">
      <p class="eyebrow">Prøv dette i felt</p>
      <h4>${escapeHtml(module.drill.title)} <span class="drill-duration">· ${escapeHtml(module.drill.duration)}</span></h4>
      <p>${escapeHtml(module.drill.description)}</p>
    </section>` : ""}
    <details class="reflection-expander">
      <summary>Refleksjon for laget</summary>
      <ul class="reflection-list">${reflections.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>
      <p class="small">Velg ett spørsmål per økt, eller la treningsgruppa svare på ett hver.</p>
    </details>
    ${trainedLine}
    <div class="step-action">
      <button class="primary-button" type="button" ${planFocus ? `data-drill-plan="${escapeHtml(planFocus)}"` : 'data-next-action="open-planner"'}>Planlegg økt for dette temaet →</button>
    </div>`;

  // Trinn 4 — Mester (oppsummering av de tre lysene; seremoni kommer i fase 1b)
  const recap = [
    { ok: checks.isRead, label: "Teori lest" },
    { ok: quizOk, label: "Quiz bestått" },
    { ok: checks.hasLog, label: "Trent i felt" },
  ]
    .map((r) => `<li class="${r.ok ? "is-ok" : ""}">${r.ok ? "✓" : "○"} ${escapeHtml(r.label)}</li>`)
    .join("");
  const trinn4 = `
    <ul class="mester-recap">${recap}</ul>
    ${mastered
      ? `<p class="mester-done">Alle tre trinnene er fullført.</p>
         <div class="step-action"><button class="primary-button" data-celebrate-module="${module.id}" type="button">Marker som mestret 🎉</button></div>`
      : `<p class="small">Fullfør de tre trinnene over, så er temaet mestret og neste tema låses opp.</p>`}`;

  return `
    <div class="learn-module learn-stepper">
      <header class="learn-module-head">
        <button class="learn-back-button" type="button" data-learn-back>← Løypa</button>
        <div>
          <p class="eyebrow">${escapeHtml(module.pages)} · ca. ${module.minutes} min lesing</p>
          <h3>${escapeHtml(module.title)}</h3>
          <div class="lesson-meta">
            ${module.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </div>
      </header>

      <p>${escapeHtml(module.summary)}</p>

      <div class="learn-accordion stepper-list">
        ${step("learn", 1, "Les", checks.isRead ? "Lest" : "Ikke lest ennå", checks.isRead, trinn1)}
        ${step("quiz", 2, "Quiz", checks.totalQs ? (quizOk ? "Bestått" : "Ikke bestått ennå") : "Ingen spørsmål", quizOk && checks.totalQs > 0, trinn2)}
        ${step("field", 3, "Til skogen", checks.hasLog ? "Trent" : "Ikke trent ennå", checks.hasLog, trinn3)}
        ${step("mester", 4, "Mester", mastered ? "Mestret" : "Gjenstår", mastered, trinn4)}
      </div>

      <div class="learn-actions stepper-nav">
        <span class="nav-pill">
          <button type="button" data-module-nav="${prevModule ? prevModule.id : ""}" ${prevModule ? "" : "disabled"} aria-label="Forrige modul">◀ Forrige</button>
          <button type="button" data-module-nav="${nextModule && !nextLocked ? nextModule.id : ""}" ${nextModule && !nextLocked ? "" : "disabled"} aria-label="${nextLocked ? "Neste modul (låst til dette temaet er mestret)" : "Neste modul"}">Neste ▶</button>
        </span>
      </div>
    </div>`;
}

function renderSettings() {
  syncThemeUI();
}

function syncThemeUI() {
  const theme = state.theme || "auto";
  const labels = { auto: "Auto", light: "Lys", dark: "Mørk" };
  const status = $("#settingsThemeStatus");
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
  // Koblingen læring → praksis: temaer du har lest, men ikke trent på, foreslås
  // øverst som fokus for økta. Det lukker sirkelen fra teori til felt.
  const logsByModule = computeModuleLogCredit();
  const isSuggested = (focusId) => {
    const moduleId = planBlueprints[focusId]?.module;
    return Boolean(moduleId && state.completed.includes(moduleId) && !(logsByModule[moduleId] > 0));
  };
  const orderedFocus = [...focusOrder].sort((a, b) => Number(isSuggested(b)) - Number(isSuggested(a)));

  const cards = orderedFocus
    .map((focusId) => {
      const bp = planBlueprints[focusId];
      const moduleDef = moduleForFocus(focusId);
      const selected = state.currentPlan?.focus === focusId;
      const suggested = isSuggested(focusId);
      return `<button class="focus-card ${selected ? "is-selected" : ""} ${suggested ? "is-suggested" : ""}" data-pick-focus="${focusId}" type="button">
        <span class="focus-card-title">${escapeHtml(bp.title)}</span>
        <span class="focus-card-pages">${escapeHtml(bp.pages)}</span>
        <span class="focus-card-intro">${escapeHtml(bp.intro || "")}</span>
        ${moduleDef ? `<span class="focus-card-module">Modul: ${escapeHtml(moduleDef.title.replace(/^\d+\.\s*/, ""))}</span>` : ""}
        ${suggested ? `<span class="focus-suggest-tag">Nylig lært · ikke trent ennå</span>` : ""}
      </button>`;
    })
    .join("");

  const suggestedCount = focusOrder.filter(isSuggested).length;
  const suggestLede = suggestedCount
    ? `<p class="small">Øverst ligger ${suggestedCount === 1 ? "temaet du" : `de ${suggestedCount} temaene du`} nettopp har lært, men ikke trent på ennå.</p>`
    : "";

  // Forrige økt-hint: vis "neste steg"-notat fra siste logg
  const newestLog = state.logs.length
    ? [...state.logs].sort((a, b) => logTimestamp(b) - logTimestamp(a))[0]
    : null;
  const nextStepHint = newestLog?.next?.trim()
    ? `<div class="callout wizard-nextstep-hint">
        <p class="eyebrow">Forrige økt anbefalte</p>
        <p>${escapeHtml(newestLog.next)}</p>
        <p class="small">${escapeHtml(newestLog.date || "")}${newestLog.dog ? ` · ${escapeHtml(newestLog.dog)}` : ""}</p>
      </div>`
    : "";

  return `
    <section class="wizard-step-panel">
      ${nextStepHint}
      <header class="wizard-head">
        <p class="eyebrow">Steg 1 av 4 · ca. 1 min</p>
        <h3>Hva skal dere trene på i dag?</h3>
        <p class="wizard-lede">Velg ett fokus. Du kan endre detaljene senere — det viktigste er å låse hva økta handler om.</p>
        ${suggestLede}
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

  const metaHtml = Array.isArray(plan.meta) && plan.meta.length
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
  const metaHtml = Array.isArray(plan.meta) && plan.meta.length
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
        ${plan.id ? `<button class="primary-button" data-field-mode="${escapeHtml(plan.id)}" type="button">Start feltmodus</button>` : ""}
        ${plan.id ? `<button class="ghost-button" data-log-from-plan="${escapeHtml(plan.id)}" type="button">Loggfør gjennomført</button>` : ""}
        <button class="ghost-button" data-print-plan="${escapeHtml(plan.id || "")}" type="button">Skriv ut øktkort</button>
      </div>
    </article>`;
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
  const { url } = buildPlanShareUrl(plan);
  // QR-kapasitet på nivå M ~ 2300 tegn. Hele URL-en telles (origin + payload).
  if (url.length > 2200) {
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
  openOverlay(overlay);
}

function closeQr() {
  closeOverlay($("#qrOverlay"));
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
let fieldWakeLock = null;

// Holder skjermen våken i feltmodus — i felt med hansker er gjenopplåsing
// reell friksjon. Wake Lock slippes av nettleseren ved fanebytte, derfor
// re-aktiveres den på visibilitychange så lenge feltmodus er åpen.
async function requestFieldWakeLock() {
  try {
    if (!navigator.wakeLock) return;
    if (!$("#fieldOverlay")?.classList.contains("is-open")) return;
    fieldWakeLock = await navigator.wakeLock.request("screen");
  } catch {
    fieldWakeLock = null;
  }
}

function releaseFieldWakeLock() {
  try {
    fieldWakeLock?.release();
  } catch {
    // Allerede sluppet — uproblematisk.
  }
  fieldWakeLock = null;
}

function renderFieldMode() {
  const plan = findPlanById(fieldPlanId);
  const body = $("#fieldBody");
  const titleEl = $("#fieldTitle");
  if (!plan || !body) return;
  if (titleEl) titleEl.textContent = plan.title || "Treningsøkt";

  const steps = Array.isArray(plan.steps) ? plan.steps : [];
  const obs = (Array.isArray(plan.observations) ? plan.observations : []).filter(Boolean);
  const metaHtml = Array.isArray(plan.meta) && plan.meta.length
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
  openOverlay(overlay);
  requestAnimationFrame(() => requestFieldWakeLock());
}

function closeFieldMode() {
  releaseFieldWakeLock();
  closeOverlay($("#fieldOverlay"));
}

function initFieldMode() {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") requestFieldWakeLock();
  });

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
      if (plan) openQuickLog(plan);
    }
  });
}

/* ---------- Hurtiglogg: stegvis loggføring for felt ----------
   Ett tema per skjerm og store treffflater (hansker, regn, sol).
   Skriver nøyaktig samme loggobjekt som det fulle skjemaet. */

const QUICK_STEPS = [
  { id: "okt", title: "Økta" },
  { id: "mestring", title: "Hvordan gikk det?" },
  { id: "obs", title: "Tre ting å se etter" },
  { id: "forhold", title: "Forholdene" },
  { id: "neste", title: "Neste steg" },
];

const QUICK_LOG_TYPES = ["Spor", "Sporoppsøk", "Frisøk med sporopptak", "Momenttrening"];
const QUICK_AGE_OPTIONS = ["fersk", "6-12", "12-24", "24+"];
const QUICK_TERRAIN_OPTIONS = ["skog", "vei", "hardt", "blandet"];
const QUICK_WIND_OPTIONS = ["Stille", "Lett vind", "Moderat vind", "Kraftig vind"];
const QUICK_WEATHER_OPTIONS = ["☀ Sol", "☁ Skyet", "🌧 Regn", "❄ Snø", "🌫 Tåke"];

let quickLog = null;

function openQuickLog(plan) {
  const prefill = plan ? planPrefillValues(plan) : null;
  const planObs = plan && Array.isArray(plan.observations) ? plan.observations.filter(Boolean) : [];
  const obsPrompts = planObs.length ? [0, 1, 2].map((i) => planObs[i] || "") : [...defaultReflectionPrompts];
  quickLog = {
    plan: plan || null,
    step: 0,
    savedCount: 0,
    data: {
      date: localIsoDate(),
      type: prefill?.type || "Spor",
      handler: prefill?.handler || "",
      dog: prefill?.dog || "",
      rating: 0,
      obsPrompts,
      obs0: "",
      obs1: "",
      obs2: "",
      age: prefill?.age || "",
      terrain: prefill?.terrain || "",
      wind: "",
      weather: "",
      length: "",
      next: prefill?.next || "",
    },
  };
  renderQuickLog();
  openOverlay($("#quickLogOverlay"));
}

function quickLogDirty() {
  if (!quickLog) return false;
  const d = quickLog.data;
  return Boolean(Number(d.rating) > 0 || d.dog.trim() || d.obs0.trim() || d.obs1.trim() || d.obs2.trim() || d.next.trim());
}

function closeQuickLog(skipConfirm = false) {
  if (!quickLog) return;
  const onReceipt = quickLog.step >= QUICK_STEPS.length;
  if (!skipConfirm && !onReceipt && quickLogDirty()
    && !window.confirm("Avbryte hurtigloggen? Det du har fylt ut blir ikke lagret.")) return;
  quickLog = null;
  closeOverlay($("#quickLogOverlay"));
}

// Tekstfelter leses inn i quickLog.data ved hvert stegbytte/lagring.
function readQuickLogFields() {
  const body = $("#quickLogBody");
  if (!body || !quickLog) return;
  body.querySelectorAll("[data-ql-field]").forEach((el) => {
    quickLog.data[el.dataset.qlField] = /** @type {HTMLInputElement} */ (el).value;
  });
}

function quickChipGroup(group, options, current, labelFor = (v) => v) {
  return `<div class="ql-chip-grid" role="group">${options
    .map((value) => {
      const selected = current === value;
      return `<button class="chip-button ql-chip${selected ? " is-selected" : ""}" type="button" data-ql-chip="${escapeHtml(group)}" data-ql-value="${escapeHtml(value)}" aria-pressed="${selected}">${escapeHtml(labelFor(value))}</button>`;
    })
    .join("")}</div>`;
}

function renderQuickLog() {
  const body = $("#quickLogBody");
  const titleEl = $("#quickLogTitle");
  if (!body || !quickLog) return;
  const d = quickLog.data;
  if (titleEl) titleEl.textContent = quickLog.plan ? quickLog.plan.title : "Logg økt";

  // Kvittering
  if (quickLog.step >= QUICK_STEPS.length) {
    const moduleDef = quickLog.plan ? moduleForFocus(quickLog.plan.focus) : null;
    const savedFor = d.dog.trim() ? ` for ${d.dog.trim()}` : "";
    body.innerHTML = `
      <div class="ql-receipt">
        <span class="ql-receipt-check" aria-hidden="true">✓</span>
        <h3>Økta er lagret${escapeHtml(savedFor)}</h3>
        <p class="small">${quickLog.savedCount > 1 ? `${quickLog.savedCount} logger i denne omgangen. ` : ""}Du finner loggen igjen under Trening.</p>
        <div class="ql-receipt-actions">
          <button class="primary-button" type="button" data-ql-done>Ferdig</button>
          <button class="ghost-button" type="button" data-ql-next-dog>Logg neste hund</button>
        </div>
        ${moduleDef ? `<button class="text-button ql-receipt-quiz" type="button" data-start-module-quiz="${moduleDef.id}">Fest læringen: quiz om ${escapeHtml(moduleDef.title.replace(/^\d+\.\s*/, ""))} →</button>` : ""}
      </div>`;
    return;
  }

  const step = QUICK_STEPS[quickLog.step];
  const dots = QUICK_STEPS
    .map((s, i) => `<span class="ql-dot" data-state="${i < quickLog.step ? "done" : i === quickLog.step ? "active" : "todo"}"></span>`)
    .join("");

  let content = "";
  if (step.id === "okt") {
    content = `
      <p class="ql-group-label">Type økt</p>
      ${quickChipGroup("type", QUICK_LOG_TYPES, d.type)}
      <div class="ql-field-row">
        <label class="ql-label">Dato
          <input type="date" data-ql-field="date" value="${escapeHtml(d.date)}" />
        </label>
      </div>
      <div class="ql-field-row">
        <label class="ql-label">Hund
          <input data-ql-field="dog" list="dogList" autocomplete="off" autocapitalize="words" placeholder="Hundens navn" value="${escapeHtml(d.dog)}" />
        </label>
        <label class="ql-label">Hundefører
          <input data-ql-field="handler" list="handlerList" autocomplete="off" autocapitalize="words" placeholder="Navn" value="${escapeHtml(d.handler)}" />
        </label>
      </div>`;
  } else if (step.id === "mestring") {
    const rating = Number(d.rating) || 0;
    content = `
      <div class="ql-stars" role="radiogroup" aria-label="Mestring 0 til 5">
        ${[1, 2, 3, 4, 5]
          .map((n) => `<button class="ql-star${n <= rating ? " is-on" : ""}" type="button" data-ql-star="${n}" aria-checked="${n === rating}" aria-label="${n} ${n === 1 ? "stjerne" : "stjerner"}">★</button>`)
          .join("")}
      </div>
      <p class="ql-rating-label" aria-live="polite">${escapeHtml(RATING_LABELS[rating] || "Trykk på stjernene")}</p>
      <p class="small ql-hint">Samme skala for hele laget — trykk samme stjerne igjen for å nullstille.</p>`;
  } else if (step.id === "obs") {
    content = `
      ${quickLog.plan ? `<p class="small ql-hint">Fra planen «${escapeHtml(quickLog.plan.title)}». Skriv kort — stikkord holder.</p>` : `<p class="small ql-hint">Tre korte refleksjonsspørsmål. Skriv kort — stikkord holder.</p>`}
      ${[0, 1, 2]
        .map(
          (i) => `<div class="ql-obs">
            <p class="ql-obs-prompt"><span class="observation-num">${i + 1}</span>${escapeHtml(d.obsPrompts[i] || "")}</p>
            <textarea data-ql-field="obs${i}" rows="2" autocapitalize="sentences" placeholder="Hva så dere?">${escapeHtml(d[`obs${i}`])}</textarea>
          </div>`
        )
        .join("")}`;
  } else if (step.id === "forhold") {
    content = `
      <p class="ql-group-label">Liggetid</p>
      ${quickChipGroup("age", QUICK_AGE_OPTIONS, d.age, readableAge)}
      <p class="ql-group-label">Underlag</p>
      ${quickChipGroup("terrain", QUICK_TERRAIN_OPTIONS, d.terrain, readableTerrain)}
      <p class="ql-group-label">Vind</p>
      ${quickChipGroup("wind", QUICK_WIND_OPTIONS, d.wind)}
      <p class="ql-group-label">Vær</p>
      ${quickChipGroup("weather", QUICK_WEATHER_OPTIONS.map((w) => w.split(" ")[1]), d.weather, (v) => QUICK_WEATHER_OPTIONS.find((w) => w.endsWith(v)) || v)}
      <div class="ql-field-row">
        <label class="ql-label">Lengde/moment
          <input data-ql-field="length" inputmode="text" autocapitalize="none" placeholder="f.eks. 250 m, 2 vinkler" value="${escapeHtml(d.length)}" />
        </label>
      </div>`;
  } else if (step.id === "neste") {
    content = `
      <label class="ql-label">Hva er det første dere skal trene på neste gang?
        <textarea data-ql-field="next" rows="3" autocapitalize="sentences" placeholder="Ett konkret punkt holder">${escapeHtml(d.next)}</textarea>
      </label>
      <p class="small ql-hint">Dette dukker opp som forslag neste gang du planlegger en økt.</p>`;
  }

  const isLast = quickLog.step === QUICK_STEPS.length - 1;
  body.innerHTML = `
    <div class="ql-progress" aria-hidden="true">${dots}</div>
    <p class="small ql-step-count">Steg ${quickLog.step + 1} av ${QUICK_STEPS.length}</p>
    <h3 class="ql-step-title">${escapeHtml(step.title)}</h3>
    <div class="ql-step-content">${content}</div>
    <div class="ql-nav">
      ${quickLog.step > 0 ? '<button class="ghost-button ql-nav-back" type="button" data-ql-back>◀ Tilbake</button>' : ""}
      <button class="primary-button ql-nav-next" type="button" data-ql-next>${isLast ? "Lagre økta" : "Neste ▶"}</button>
    </div>`;
}

function saveQuickLog() {
  if (!quickLog) return;
  readQuickLogFields();
  const d = quickLog.data;
  const observations = [0, 1, 2].map((i) => ({
    prompt: (d.obsPrompts[i] || "").trim(),
    answer: (d[`obs${i}`] || "").trim(),
  }));
  const log = {
    id: makeId(),
    createdAt: Date.now(),
    date: d.date || localIsoDate(),
    type: d.type,
    handler: d.handler.trim(),
    dog: d.dog.trim(),
    age: d.age,
    length: d.length.trim(),
    terrain: d.terrain,
    wind: d.wind,
    weather: d.weather,
    rating: String(Math.min(5, Math.max(0, Number(d.rating) || 0))),
    next: d.next.trim(),
    observations,
    planId: quickLog.plan?.id || "",
    planTitle: quickLog.plan?.title || "",
    planPages: quickLog.plan?.pages || "",
    planFocus: quickLog.plan?.focus || "",
  };
  // Kobling til læring: bind økta til ett tema (via fokus eller økt-type).
  log.module = moduleForLog(log);
  // Bro-øyeblikk: var temaet lest men utrent rett før denne loggen? (sjekk før innlegging)
  const bridgeModule = log.module;
  const wasUntrained = moduleWasLearnedUntrained(bridgeModule);
  state.logs = [log, ...state.logs].slice(0, MAX_LOGS);
  saveState();
  quickLog.savedCount += 1;
  quickLog.step = QUICK_STEPS.length;
  renderQuickLog();
  renderTraining();
  renderDashboard();
  refreshAutocomplete();
  maybeShowBridge(bridgeModule, wasUntrained, log.dog);
}

function initQuickLog() {
  $("#quickLogOverlay")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-quicklog]")) {
      closeQuickLog();
      return;
    }
    if (!quickLog) return;

    const chip = event.target.closest("[data-ql-chip]");
    if (chip) {
      readQuickLogFields();
      const group = chip.dataset.qlChip;
      const value = chip.dataset.qlValue;
      // Type-feltet har ingen tom tilstand; resten kan slås av igjen.
      quickLog.data[group] = group !== "type" && quickLog.data[group] === value ? "" : value;
      renderQuickLog();
      return;
    }

    const star = event.target.closest("[data-ql-star]");
    if (star) {
      const value = Number(star.dataset.qlStar);
      quickLog.data.rating = value === Number(quickLog.data.rating) ? 0 : value;
      renderQuickLog();
      return;
    }

    if (event.target.closest("[data-ql-back]")) {
      readQuickLogFields();
      quickLog.step = Math.max(0, quickLog.step - 1);
      renderQuickLog();
      return;
    }

    if (event.target.closest("[data-ql-next]")) {
      readQuickLogFields();
      if (quickLog.step === QUICK_STEPS.length - 1) {
        saveQuickLog();
      } else {
        quickLog.step += 1;
        renderQuickLog();
      }
      return;
    }

    if (event.target.closest("[data-ql-done]")) {
      closeQuickLog(true);
      setView("training");
      return;
    }

    if (event.target.closest("[data-ql-next-dog]")) {
      // Lagstrening: behold dato, type, fører og forhold — nullstill det
      // som er per hund.
      const d = quickLog.data;
      d.dog = "";
      d.rating = 0;
      d.obs0 = "";
      d.obs1 = "";
      d.obs2 = "";
      d.next = "";
      quickLog.step = 0;
      renderQuickLog();
      $("#quickLogBody [data-ql-field='dog']")?.focus();
      return;
    }

    if (event.target.closest("[data-start-module-quiz]")) {
      // Quiz-lenken på kvitteringen: lukk hurtigloggen, så tar den
      // delegerte handleren på document seg av å starte quizen.
      closeQuickLog(true);
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
    (state.currentPlan && state.currentPlan.id === planId ? state.currentPlan : null)
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
  if (dateInput && !dateInput.value) dateInput.value = localIsoDate();
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

  // Hunde-filter: fyll alternativer fra loggene. Grupperes case-insensitivt
  // via dogKey(), samme regel som per-hund-analytikken på dashbordet.
  const dogSelect = $("#logFilterDog");
  if (dogSelect) {
    const dogs = dogGroups(state.logs);
    const current = logFilters.dog;
    dogSelect.innerHTML =
      '<option value="all">Alle hunder</option>' +
      dogs.map((d) => `<option value="${escapeHtml(d.key)}">${escapeHtml(d.label)}</option>`).join("");
    dogSelect.value = dogs.some((d) => d.key === current) ? current : "all";
    logFilters.dog = dogSelect.value;
  }

  let logs = state.logs.filter((l) => {
    if (logFilters.type !== "all" && l.type !== logFilters.type) return false;
    if (logFilters.dog !== "all" && dogKey(l.dog) !== logFilters.dog) return false;
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

// Felles tolkning av stjernene, så mestringsscore betyr det samme for hele laget.
const RATING_LABELS = {
  1: "1 — Fikk ikke løst oppgaven",
  2: "2 — Løste med mye hjelp",
  3: "3 — Løste med noe støtte",
  4: "4 — Selvstendig, med små avvik",
  5: "5 — Selvstendig og presis",
};

function renderLogPlanPicker() {
  const wrap = $("#logPlanPickerWrap");
  const picker = $("#logPlanPicker");
  const form = $("#logForm");
  if (!wrap || !picker || !form) return;
  const plans = state.plans || [];
  wrap.hidden = !plans.length;
  if (!plans.length) return;
  const current = form.dataset.planId || "";
  picker.innerHTML =
    '<option value="">— ingen plan —</option>' +
    plans
      .map((p) => {
        const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString("no-NO", { day: "numeric", month: "short" }) : "";
        const label = [p.title, date, p.dog].filter(Boolean).join(" · ");
        return `<option value="${escapeHtml(p.id)}">${escapeHtml(label)}</option>`;
      })
      .join("");
  picker.value = plans.some((p) => p.id === current) ? current : "";
}

function syncLogFormUI() {
  const form = $("#logForm");
  if (!form) return;
  renderLogPlanPicker();
  const ratingValue = form.querySelector('input[name="rating"]')?.value || "0";
  form.querySelectorAll("[data-rating-star]").forEach((star) => {
    const value = Number(star.dataset.ratingStar);
    star.classList.toggle("is-on", value <= Number(ratingValue));
    star.setAttribute("aria-checked", value === Number(ratingValue) ? "true" : "false");
  });
  const ratingLabel = $("#ratingLabel");
  if (ratingLabel) ratingLabel.textContent = RATING_LABELS[Number(ratingValue)] || "";
  const weatherValue = form.querySelector('input[name="weather"]')?.value || "";
  form.querySelectorAll("[data-weather]").forEach((chip) => {
    const isOn = chip.dataset.weather === weatherValue;
    chip.classList.toggle("is-selected", isOn);
    chip.setAttribute("aria-pressed", isOn ? "true" : "false");
  });
}

function logCard(log) {
  const rating = Math.min(5, Math.max(0, Math.floor(Number(log.rating)) || 0));
  const stars = rating ? "★".repeat(rating) + "☆".repeat(5 - rating) : "";
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
      ${stars ? `<p class="rating-row" aria-label="Mestring ${rating} av 5">${stars}</p>` : ""}
      <p>${escapeHtml([log.handler, log.age ? readableAge(log.age) : "", log.length].filter(Boolean).join(" · "))}</p>
      ${conditions ? `<p class="small">${escapeHtml(conditions)}</p>` : ""}
      ${planRef}
      ${obsHtml}
      ${log.next ? `<p><strong>Neste:</strong> ${escapeHtml(log.next)}</p>` : ""}
      <button class="text-button" data-edit-log="${escapeHtml(log.id)}" type="button">Rediger</button>
      <button class="text-button" data-delete-log="${escapeHtml(log.id)}" type="button">Slett</button>
    </article>`;
}

const logTypeByFocus = {
  "gamle-spor": "Spor",
  "oppsok-gjenstand": "Sporoppsøk",
  "oppsok-bil": "Sporoppsøk",
  frisok: "Frisøk med sporopptak",
  retning: "Momenttrening",
  sportap: "Momenttrening",
  kryssende: "Momenttrening",
  sirkelspor: "Momenttrening",
};

const terrainValueByLabel = { "Skog/vegetasjon": "skog", "Vei/sti": "vei", "Hardt underlag": "hardt", "Blandet": "blandet" };

// Feltverdiene en plan gir loggskjemaet — brukes både til å fylle inn og til å
// kjenne igjen (og tømme) verdier som kom fra en tidligere valgt plan.
function planPrefillValues(plan) {
  const findMeta = (label) => {
    const item = (Array.isArray(plan.meta) ? plan.meta : []).find((m) => typeof m === "string" && m.startsWith(`${label}:`));
    return item ? item.split(":").slice(1).join(":").trim() : "";
  };
  return {
    type: logTypeByFocus[plan.focus] || "Momenttrening",
    handler: findMeta("Fører"),
    dog: findMeta("Hund"),
    age: plan.age || "",
    terrain: terrainValueByLabel[findMeta("Underlag")] || "",
    next: plan.success ? `Vurder mot målbilde: ${plan.success}` : "",
  };
}

// Tøm felter som står på akkurat det planen prefylte dem med — de er ikke
// fylt ut av brukeren og skal ikke overleve et planbytte eller en av-kobling.
function clearPlanPrefill(form, plan) {
  if (!form || !plan) return;
  const values = planPrefillValues(plan);
  const get = (name) => form.querySelector(`[name="${name}"]`);
  const typeSelect = get("type");
  if (typeSelect && typeSelect.value === values.type) typeSelect.value = typeSelect.options[0]?.value || "";
  [["handler", values.handler], ["dog", values.dog], ["age", values.age], ["terrain", values.terrain], ["next", values.next]].forEach(([name, value]) => {
    const field = get(name);
    if (field && value && field.value === value) field.value = "";
  });
}

function prefillLogFromPlan(plan, options = {}) {
  // keepUserInput: brukt fra «Fra plan»-velgeren i loggskjemaet — fyll bare
  // felter som fortsatt står tomme/på standardvalg, så det brukeren allerede
  // har skrevet inn ikke overskrives.
  const keepUserInput = options.keepUserInput === true;
  const form = $("#logForm");
  if (!form || !plan) return;
  const get = (name) => form.querySelector(`[name="${name}"]`);
  const values = planPrefillValues(plan);
  if (get("date") && !get("date").value) get("date").value = localIsoDate();
  const typeSelect = get("type");
  // Type-feltet har ingen tom tilstand — regn det som urørt så lenge det
  // står på første alternativ.
  if (typeSelect && (!keepUserInput || typeSelect.value === typeSelect.options[0]?.value)) {
    typeSelect.value = values.type;
  }
  if (get("handler") && (!keepUserInput || !get("handler").value.trim())) get("handler").value = values.handler || get("handler").value;
  if (get("dog") && (!keepUserInput || !get("dog").value.trim())) get("dog").value = values.dog || get("dog").value;
  if (get("age") && values.age && (!keepUserInput || !get("age").value)) get("age").value = values.age;
  if (get("terrain") && values.terrain && (!keepUserInput || !get("terrain").value)) get("terrain").value = values.terrain;
  if (get("next") && values.next && (!keepUserInput || !get("next").value.trim())) get("next").value = values.next;

  const observations = Array.isArray(plan.observations) ? plan.observations : [];
  form.dataset.planId = plan.id || "";
  form.dataset.planTitle = plan.title || "";
  form.dataset.planPages = plan.pages || "";
  form.dataset.planFocus = plan.focus || "";
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

  if (keepUserInput) {
    // Velgeren står i loggskjemaet — brukeren er her allerede.
    syncLogFormUI();
    $("#logStatus").textContent = "Skjemaet er fylt fra planen. Felter du allerede hadde fylt ut er beholdt.";
    return;
  }
  setView("log");
  syncLogFormUI();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  $("#logStatus").textContent = "Skjemaet er forhåndsfylt fra planen. Svar på de tre observasjonspunktene og lagre.";
}

function setLogEditMode(editing) {
  const form = $("#logForm");
  if (!form) return;
  form.classList.toggle("is-editing", editing);
  const heading = $("#logFormHeading");
  if (heading) heading.textContent = editing ? "Rediger økt" : "Registrer økt";
  const submit = $("#logSubmitButton");
  if (submit) submit.textContent = editing ? "Lagre endringer" : "Lagre logg";
  const cancel = $("#logCancelEdit");
  if (cancel) cancel.hidden = !editing;
  const clear = $("#logClearForm");
  if (clear) clear.hidden = editing;
}

function startEditLog(id) {
  const log = state.logs.find((l) => l.id === id);
  if (!log) return;
  setView("log");
  const form = $("#logForm");
  if (!form) return;
  const get = (name) => form.querySelector(`[name="${name}"]`);
  ["date", "type", "handler", "dog", "age", "length", "terrain", "wind", "next"].forEach((name) => {
    const field = get(name);
    if (field) field.value = log[name] || "";
  });
  const weatherInput = get("weather");
  if (weatherInput) weatherInput.value = log.weather || "";
  const ratingInput = get("rating");
  if (ratingInput) ratingInput.value = String(Math.min(5, Math.max(0, Math.floor(Number(log.rating)) || 0)));
  const observations = Array.isArray(log.observations) ? log.observations : [];
  [0, 1, 2].forEach((i) => {
    const promptEl = form.querySelector(`[data-obs-prompt="${i}"]`);
    if (promptEl) promptEl.textContent = observations[i]?.prompt || "";
    const input = get(`obs${i}`);
    if (input) input.value = observations[i]?.answer || "";
  });
  // Eldre logger har én fritekst-observasjon — løft den inn i første felt.
  if (!observations.length && log.observation) {
    const first = get("obs0");
    if (first) first.value = log.observation;
  }
  form.dataset.editId = log.id;
  form.dataset.planId = log.planId || "";
  form.dataset.planTitle = log.planTitle || "";
  form.dataset.planPages = log.planPages || "";
  form.dataset.planFocus = log.planFocus || "";
  const hint = $("#logObservationHint");
  if (hint) {
    hint.textContent = log.planTitle
      ? `Fra planen «${log.planTitle}»${log.planPages ? ` (${log.planPages})` : ""}. Rett svarene og lagre.`
      : "Du redigerer en lagret økt — rett feltene og trykk «Lagre endringer».";
  }
  setLogEditMode(true);
  syncLogFormUI();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  $("#logStatus").textContent = `Du redigerer økten ${[log.date, log.type, log.dog].filter(Boolean).join(" · ")}. Trykk «Avbryt redigering» for å gå tilbake.`;
}

const referenceCategories = [
  ["all", "Alle"],
  ["grunnlag", "Grunnlag"],
  ["spor", "Spor"],
  ["oppsok", "Sporoppsøk"],
  ["problem", "Problemløsning"],
  ["plan", "Planlegging"],
];

// Temafilteret lever i minnet, likt logFilters.
let referenceFilter = "all";

function renderReferenceChips() {
  const el = $("#referenceFilterChips");
  if (!el) return;
  el.innerHTML = referenceCategories
    .map(([value, label]) => {
      const selected = value === referenceFilter;
      return `<button class="chip-button${selected ? " is-selected" : ""}" type="button" data-ref-filter="${value}" aria-pressed="${selected}">${escapeHtml(label)}</button>`;
    })
    .join("");
}

function renderReference() {
  renderReferenceChips();
  const query = ($("#referenceSearch").value || "").trim().toLowerCase();
  const filtered = references.filter((item) => {
    const categoryOk = referenceFilter === "all" || item.category === referenceFilter;
    const haystack = `${item.title} ${item.text} ${item.pages}`.toLowerCase();
    return categoryOk && (!query || haystack.includes(query));
  });
  $("#referenceResults").innerHTML = filtered.length
    ? filtered.map((item) => referenceCard(item, query)).join("")
    : emptyState("Ingen fagkort traff søket. Prøv et annet ord, for eksempel liggetid, bil, retning eller tap.");
}

function referenceCard(item, query) {
  return `
    <button class="reference-card" data-ref-open="${references.indexOf(item)}" type="button">
      <p class="page-ref">${escapeHtml(item.pages)}</p>
      <h4>${highlight(item.title, query)}</h4>
      <p>${highlight(item.text, query)}</p>
      <span class="tag">${escapeHtml(categoryLabel(item.category))}</span>
      <span class="reference-card-cue" aria-hidden="true">Åpne →</span>
    </button>`;
}

/* Fagkort-detaljer i eget ark, med snarvei til modulen der temaet hører hjemme. */
const refCategoryToModule = { grunnlag: "grunnlag", spor: "spor", oppsok: "oppsok" };

function openReferenceSheet(index) {
  const item = references[index];
  if (!item) return;
  const pagesEl = $("#refSheetPages");
  const titleEl = $("#refSheetTitle");
  const bodyEl = $("#refSheetBody");
  const actionsEl = $("#refSheetActions");
  if (pagesEl) pagesEl.textContent = item.pages || "";
  if (titleEl) titleEl.textContent = item.title || "";
  if (bodyEl) {
    bodyEl.innerHTML = `
      <p>${escapeHtml(item.text)}</p>
      <span class="tag">${escapeHtml(categoryLabel(item.category))}</span>`;
  }
  if (actionsEl) {
    const moduleId = refCategoryToModule[item.category];
    const moduleDef = moduleId ? modules.find((m) => m.id === moduleId) : null;
    actionsEl.innerHTML = moduleDef
      ? `<button class="ghost-button" type="button" data-ref-module="${moduleDef.id}">Les modulen: ${escapeHtml(moduleDef.title.replace(/^\d+\.\s*/, ""))}</button>`
      : "";
  }
  openOverlay($("#refSheet"));
}

function closeReferenceSheet() {
  closeOverlay($("#refSheet"));
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

function renderQuiz() {
  ensureQuizSession();
  const quiz = state.quiz;
  const sessionLength = quiz.questionIds.length;

  if (quiz.finished) {
    const percent = sessionLength ? Math.round((quiz.score / sessionLength) * 100) : 0;
    let message;
    if (percent >= 90) message = "Sterkt — dette sitter.";
    else if (percent >= 60) message = "Godt jobbet. Ta en runde til på de du bommet på, så sitter det.";
    else message = "Bra start. Kjør «Repeter svake» og les modulene det gjelder på nytt.";
    $("#quizPanel").innerHTML = `
      <div class="quiz-meta">
        <span class="tag">${escapeHtml(quiz.modeLabel || "Quiz")}</span>
        <span class="tag">Runde fullført</span>
      </div>
      <h3 class="quiz-question">Resultat: ${quiz.score} av ${sessionLength} riktige</h3>
      <div class="score-ring" style="--score:${percent}%"><span>${percent}%</span></div>
      <p>${escapeHtml(message)}</p>
      <div class="button-row">
        <button class="primary-button" id="quizRestartSame" type="button">Ny runde (samme utvalg)</button>
        <button class="ghost-button" id="resetQuiz" type="button">Alle moduler</button>
        <button class="ghost-button" id="weakQuiz" type="button">Repeter svake</button>
      </div>`;
    renderQuizStats();
    return;
  }

  const safeIndex = Math.min(quiz.index, sessionLength - 1);
  const questionId = quiz.questionIds[safeIndex];
  const question = questionsById.get(questionId);
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

  renderQuizStats();
}

function renderQuizStats() {
  const quiz = state.quiz;
  const sessionLength = quiz.questionIds.length;
  const answeredCount = Object.keys(quiz.answered).length;
  const percent = sessionLength ? Math.round((quiz.score / sessionLength) * 100) : 0;

  const masteryRows = modules.map((module) => {
    const moduleQuestions = quizQuestions.filter((q) => q.module === module.id);
    const sum = moduleQuestions.reduce(
      (acc, q) => {
        const m = state.mastery[q.id] || { correct: 0, wrong: 0 };
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
  const question = questionsById.get(questionId);
  if (!question) return;
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
    state.quiz.finished = true;
    saveState();
    renderQuiz();
    return;
  }
  state.quiz.index += 1;
  saveState();
  renderQuiz();
}

/**
 * Skjemaene i appen har bare tekstfelter, så alle verdiene er strenger.
 * @param {HTMLFormElement} form
 * @returns {Object<string, string>}
 */
function collectForm(form) {
  return /** @type {Object<string, string>} */ (Object.fromEntries(new FormData(form).entries()));
}

function initEvents() {
  $("#bottomNav")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (button) {
      haptic();
      setView(button.dataset.view);
    }
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
        gsStep = 0;
        saveState();
        setView("learn");
        return;
      }
      if (action === "continue-learning") {
        const statuses = homeModuleStatuses();
        const nextIncomplete = statuses.find((s) => !s.complete);
        state.activeModule = nextIncomplete ? nextIncomplete.module.id : modules[0].id;
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
        if (plan) openQuickLog(plan);
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
      // setView slik at modulen åpnes uansett hvilken fane vi kom fra
      // (Hjem-kursveien/neste-steg-kortet, ikke bare inne i Lær).
      setView("learn");
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
      gsStep = 0;
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

    if (event.target.closest("#gsNext")) {
      gsNext();
      return;
    }
    if (event.target.closest("#gsPrev")) {
      gsPrev();
      return;
    }
    const gsDot = event.target.closest("#gsDots .gs-dot");
    if (gsDot) {
      const dots = $all("#gsDots .gs-dot");
      const idx = dots.indexOf(gsDot);
      if (idx >= 0) setGsStep(idx);
      return;
    }

    const moduleNav = event.target.closest("[data-module-nav]");
    if (moduleNav && moduleNav.dataset.moduleNav) {
      const targetId = moduleNav.dataset.moduleNav;
      if (!isModuleLocked(targetId)) {
        state.activeModule = targetId;
        state.learnAccordion = "learn";
        saveState();
        renderLearn();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
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

    const celebrate = event.target.closest("[data-celebrate-module]");
    if (celebrate) {
      showCeremony(celebrate.dataset.celebrateModule);
      return;
    }

    const moduleQuiz = event.target.closest("[data-start-module-quiz]");
    if (moduleQuiz) resetQuiz(`module:${moduleQuiz.dataset.startModuleQuiz}`);

    const learnQuiz = event.target.closest("[data-learn-quiz]");
    if (learnQuiz) {
      resetQuiz(learnQuiz.dataset.learnQuiz);
      return;
    }

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
        renderTraining();
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
        state.plans = [saved, ...state.plans].slice(0, MAX_PLANS);
        state.currentPlan = saved;
      }
      saveState();
      renderPlanner();
      renderTraining();
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
        setView("planner");
      }
      return;
    }

    const deletePlan = event.target.closest("[data-delete-plan]");
    if (deletePlan) {
      const plan = state.plans.find((p) => p.id === deletePlan.dataset.deletePlan);
      if (plan && !window.confirm(`Slette planen «${plan.title || "Uten tittel"}»? Dette kan ikke angres.`)) return;
      state.plans = state.plans.filter((p) => p.id !== deletePlan.dataset.deletePlan);
      if (state.currentPlan?.id === deletePlan.dataset.deletePlan) state.currentPlan = null;
      saveState();
      renderPlanner();
      renderTraining();
      renderDashboard();
      return;
    }

    const editLog = event.target.closest("[data-edit-log]");
    if (editLog) {
      startEditLog(editLog.dataset.editLog);
      return;
    }

    const deleteLog = event.target.closest("[data-delete-log]");
    if (deleteLog) {
      const log = state.logs.find((l) => l.id === deleteLog.dataset.deleteLog);
      const label = log ? [log.date, log.type, log.dog].filter(Boolean).join(" · ") : "";
      if (log && !window.confirm(`Slette loggen${label ? ` (${label})` : ""}? Dette kan ikke angres.`)) return;
      state.logs = state.logs.filter((l) => l.id !== deleteLog.dataset.deleteLog);
      saveState();
      renderLog();
      renderTraining();
      renderDashboard();
    }

    const quizChoice = event.target.closest("[data-quiz-choice]");
    if (quizChoice) answerQuiz(Number(quizChoice.dataset.quizChoice));

    if (event.target.id === "nextQuestion") nextQuestion();
    if (event.target.id === "resetQuiz") resetQuiz();
    if (event.target.id === "quizRestartSame") resetQuiz(state.quiz?.mode || "all");
    if (event.target.closest("#logClearForm")) resetLogForm();
    if (event.target.closest("#logCancelEdit")) {
      resetLogForm();
      $("#logStatus").textContent = "Redigeringen er avbrutt. Skjemaet er klart for ny økt.";
    }

    if (event.target.id === "settingsResetData") {
      const counts = `${state.logs.length} logger, ${state.plans.length} planer, ${state.completed.length} fullførte moduler`;
      const confirmed = window.confirm(
        `Dette sletter ALLE lokale data i denne nettleseren (${counts}). Eksporter loggen først hvis du vil ta vare på den. Vil du fortsette?`
      );
      if (!confirmed) return;
      resetAllData();
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
    const planFocus = form.dataset.planFocus || "";
    const planMeta = {
      planId: form.dataset.planId || "",
      planTitle: form.dataset.planTitle || "",
      planPages: form.dataset.planPages || "",
      ...(planFocus ? { planFocus } : {}),
    };
    // Kobling til læring: bind økta til ett tema (fokus → plantittel → type).
    const moduleId = moduleForLog({ ...planMeta, type: data.type });

    const editId = form.dataset.editId || "";
    const editIndex = editId ? state.logs.findIndex((l) => l.id === editId) : -1;
    if (editIndex !== -1) {
      // Oppdater eksisterende oppføring — id og createdAt beholdes.
      // Plan-koblingen følger skjemaet, så «Fra plan»-velgeren kan endre den.
      state.logs[editIndex] = {
        ...state.logs[editIndex],
        ...planMeta,
        module: moduleId,
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
        // Eventuell eldre fritekst-observasjon er løftet inn i observations.
        observation: "",
        updatedAt: Date.now(),
      };
      saveState();
      resetLogForm();
      $("#logStatus").textContent = "Endringene er lagret.";
      renderTraining();
      renderDashboard();
      return;
    }
    if (editId) {
      // Loggen som ble redigert finnes ikke lenger — lagre som ny økt i stedet.
      delete form.dataset.editId;
      setLogEditMode(false);
    }

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
      ...(moduleId ? { module: moduleId } : {}),
    };
    // Bro-øyeblikk: lest men utrent tema som nå trenes? (sjekk før innlegging)
    const wasUntrained = moduleWasLearnedUntrained(moduleId);
    state.logs = [log, ...state.logs].slice(0, MAX_LOGS);
    saveState();
    // Behold dato, type, fører, forhold og plan-kobling — lagstrening logger
    // gjerne flere hunder etter hverandre i samme økt. Nullstill bare det som
    // er per hund: hund, stjerner og fritekstsvar.
    ["dog", "next", "obs0", "obs1", "obs2"].forEach((name) => {
      const field = form.querySelector(`[name="${name}"]`);
      if (field) field.value = "";
    });
    const ratingInput = form.querySelector('input[name="rating"]');
    if (ratingInput) ratingInput.value = "0";
    syncLogFormUI();
    $("#logStatus").textContent = "Loggen er lagret. Dato og forhold står igjen — bytt hund for neste logg, eller trykk «Tøm skjemaet».";
    renderLog();
    renderTraining();
    renderDashboard();
    maybeShowBridge(moduleId, wasUntrained, data.dog);
  });

  // Lagsammendrag og deling finnes både i Innstillinger og i Progresjon
  // (instruktørflaten) — samme logikk, ulik statuslinje.
  const copySummaryTo = (status) => async () => {
    const summary = makeTeamSummary();
    try {
      await navigator.clipboard.writeText(summary);
      if (status) status.textContent = "Lagsammendrag kopiert — lim inn i chat eller e-post.";
    } catch {
      if (status) status.textContent = summary;
    }
  };
  $("#settingsCopySummary")?.addEventListener("click", () => copySummaryTo($("#settingsDataStatus"))());
  $("#progressCopySummary")?.addEventListener("click", () => copySummaryTo($("#progressShareStatus"))());

  const exportCsvTo = (status) => () => {
    if (!state.logs.length) {
      if (status) status.textContent = "Ingen logger å eksportere.";
      return;
    }
    const today = localIsoDate();
    downloadBlob(logsToCsv(state.logs), `sporlab-logg-${today}.csv`, "text/csv;charset=utf-8");
    state.lastExportLogCount = state.logs.length;
    saveState();
    renderBackupNudge();
    if (status) status.textContent = "Eksport CSV er lastet ned.";
  };
  $("#progressExportCsv")?.addEventListener("click", () => exportCsvTo($("#progressShareStatus"))());

  const shareLinkTo = (status) => async () => {
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
  };
  $("#progressShareLink")?.addEventListener("click", () => shareLinkTo($("#progressShareStatus"))());

  $("#referenceSearch").addEventListener("input", renderReference);

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

  // «Fra plan»-velgeren i loggskjemaet: forhåndsfyll uten å røre det brukeren
  // alt har fylt ut, eller fjern plan-koblingen ved tomt valg.
  $("#logPlanPicker")?.addEventListener("change", (event) => {
    const form = $("#logForm");
    if (!form) return;
    const planId = event.target.value;
    // Verdier som kom fra forrige valgte plan skal ikke bli stående som om
    // brukeren hadde skrevet dem inn selv.
    if (form.dataset.planId && form.dataset.planId !== planId) {
      clearPlanPrefill(form, findPlanById(form.dataset.planId));
    }
    if (!planId) {
      form.removeAttribute("data-plan-id");
      form.removeAttribute("data-plan-title");
      form.removeAttribute("data-plan-pages");
      defaultReflectionPrompts.forEach((prompt, i) => {
        const promptEl = form.querySelector(`[data-obs-prompt="${i}"]`);
        if (promptEl) promptEl.textContent = prompt;
      });
      const hint = $("#logObservationHint");
      if (hint) hint.textContent = "Tre korte refleksjonsspørsmål. Bytt ut med egne hvis dere kom fra en plan.";
      syncLogFormUI();
      $("#logStatus").textContent = "Plan-koblingen er fjernet. Det planen fylte inn er tømt — egne felter står urørt.";
      return;
    }
    const plan = findPlanById(planId);
    if (plan) prefillLogFromPlan(plan, { keepUserInput: true });
  });

  // Settings: eksport/import/deling
  $("#settingsExportJson")?.addEventListener("click", () => {
    const today = localIsoDate();
    downloadBlob(JSON.stringify(shareSnapshot(), null, 2), `sporlab-eksport-${today}.json`, "application/json");
    state.lastExportLogCount = state.logs.length;
    saveState();
    renderBackupNudge();
    const status = $("#settingsDataStatus");
    if (status) status.textContent = "Eksport JSON er lastet ned.";
  });

  $("#settingsExportCsv")?.addEventListener("click", () => exportCsvTo($("#settingsDataStatus"))());

  $("#settingsShareLink")?.addEventListener("click", () => shareLinkTo($("#settingsDataStatus"))());

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
      renderTraining();
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
      if (plan) openQuickLog(plan);
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

    const chartDog = event.target.closest("[data-chart-dog]");
    if (chartDog) {
      chartDogFilter = chartDog.dataset.chartDog;
      renderProgressCharts();
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

    const refFilter = event.target.closest("[data-ref-filter]");
    if (refFilter) {
      referenceFilter = refFilter.dataset.refFilter || "all";
      renderReference();
      return;
    }

    const refOpen = event.target.closest("[data-ref-open]");
    if (refOpen) {
      openReferenceSheet(Number(refOpen.dataset.refOpen));
      return;
    }

    if (event.target.closest("[data-close-ref]")) {
      closeReferenceSheet();
      return;
    }

    const refModule = event.target.closest("[data-ref-module]");
    if (refModule) {
      closeReferenceSheet();
      state.activeModule = refModule.dataset.refModule;
      state.activeGuide = null;
      state.learnAccordion = "learn";
      saveState();
      setView("learn");
      return;
    }

    if (event.target.closest("[data-quick-log]")) {
      openQuickLog(null);
      return;
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
        /** @type {HTMLElement} */ (card).hidden = !match;
        if (match) visible += 1;
      });
      if (empty) empty.hidden = visible > 0 || !query;
    }
  });
}

function makeTeamSummary() {
  const latest = [...state.logs].sort((a, b) => logTimestamp(b) - logTimestamp(a)).slice(0, 5);
  if (!latest.length) return "Ingen økter er loggført ennå.";
  return latest
    .map((log) => {
      const heading = `${log.date || "Uten dato"} - ${log.dog || "hund"} / ${log.handler || "fører"} (${log.type || "økt"})`;
      const facts = [log.age ? readableAge(log.age) : "", log.length].filter(Boolean).join(", ");
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
  if (dateInput) dateInput.value = localIsoDate();
  const ratingInput = $('#logForm input[name="rating"]');
  if (ratingInput) ratingInput.value = "0";
  const weatherInput = $('#logForm input[name="weather"]');
  if (weatherInput) weatherInput.value = "";
}

function resetLogForm() {
  const form = $("#logForm");
  if (!form) return;
  form.reset();
  form.removeAttribute("data-edit-id");
  setLogEditMode(false);
  form.removeAttribute("data-plan-id");
  form.removeAttribute("data-plan-title");
  form.removeAttribute("data-plan-pages");
  form.removeAttribute("data-plan-focus");
  [0, 1, 2].forEach((i) => {
    const promptEl = form.querySelector(`[data-obs-prompt="${i}"]`);
    if (promptEl) promptEl.textContent = "";
  });
  const hint = $("#logObservationHint");
  if (hint) hint.textContent = "Når du loggfører fra en plan, prefylles disse fra observasjonspunktene i planen.";
  setDefaults();
  syncLogFormUI();
  renderLog();
  const status = $("#logStatus");
  if (status) status.textContent = "Skjemaet er tømt.";
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme || "auto";
  syncThemeUI();
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
  trees:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3 4.5 10.5h9L9 3Z"/><path d="M9 8 5.5 14h7L9 8Z"/><path d="M9 14v6"/><path d="m16.5 6-3 5h6l-3-5Z"/><path d="M16.5 11v9"/></svg>',
  chart:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4v15a1 1 0 0 0 1 1h15"/><path d="m7.5 14 3-3.5 2.5 2.5 4.5-5"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 6.5"/></svg>',
  minus:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 12h12"/></svg>',
  lock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  quiz:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 1.5-1.5 2-2.5 2.5"/><circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></svg>',
  feedback:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-4 4v-4H4Z"/><path d="M8 9h8M8 12.5h5"/></svg>',
  /* ── Modul-ikoner (Fase 1c): ett ikon per læringstema ── */
  "mod-grunnlag":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="15" width="16" height="5" rx="1"/><rect x="7" y="9" width="10" height="6" rx="1"/><rect x="10" y="4" width="4" height="5" rx="1"/></svg>',
  "mod-spor":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="9" cy="7.5" rx="2.5" ry="3.5" transform="rotate(-15 9 7.5)"/><ellipse cx="15" cy="16.5" rx="2.5" ry="3.5" transform="rotate(15 15 16.5)"/></svg>',
  "mod-oppsok":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="14" r="4"/><circle cx="17" cy="14" r="4"/><path d="M11 14h2M7 10V6h10v4"/></svg>',
  "mod-gamle":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h14M5 21h14"/><path d="M7 3l1 4 4 5-4 5-1 4M17 3l-1 4-4 5 4 5 1 4"/></svg>',
  "mod-retning":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 5.5V8M12 16v2.5M5.5 12H8M16 12h2.5"/><path d="M12 8.5l2 3.5-2 2.5-2-2.5Z" fill="currentColor" stroke="none"/></svg>',
  "mod-sportap":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h5M15 12h5"/><path d="M11 9c0-1.5 3-1.5 3 0s-1.5 2.5-1.5 3.5v.5"/><circle cx="12.5" cy="16.5" r="0.75" fill="currentColor" stroke="none"/></svg>',
  "mod-kryssende":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5L20 18.5M20 5.5L4 18.5"/></svg>',
  "mod-sirkel":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="7.5"/><path d="M8 5A10 10 0 0 1 21.5 12"/><path d="M19 11l2.5 1-1-2.5"/></svg>',
};

function paintIcons(root = document) {
  $all("[data-icon]", root).forEach((el) => {
    const name = el.dataset.icon;
    if (ICONS[name]) el.innerHTML = ICONS[name];
  });
}

/* ---------- Introduksjon (énskjerms velkomst) ---------- */

// Stegvis intro: tre sveipbare kort. Vi husker hvem som åpnet den, så
// fokus kan føres tilbake når den lukkes (tastaturvennlig dialog).
const INTRO_COUNT = 3;
let introStep = 0;
let welcomeOpener = null;

function openWelcome(event) {
  welcomeOpener = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
  setIntroStep(0);
  openOverlay($("#welcomeOverlay"));
  requestAnimationFrame(() => $("#introNext")?.focus());
}

function setIntroStep(index) {
  const track = $("#introTrack");
  if (!track) return;
  introStep = Math.max(0, Math.min(INTRO_COUNT - 1, index));
  track.style.transform = `translateX(-${introStep * 100}%)`;

  $all("#introDots .intro-dot").forEach((dot, i) => {
    dot.classList.toggle("is-active", i === introStep);
  });

  const isLast = introStep === INTRO_COUNT - 1;
  const back = $("#introBack");
  if (back) back.hidden = introStep === 0;
  const next = $("#introNext");
  if (next) next.textContent = isLast ? "Åpne «Før første spor» →" : "Neste";
  const skip = $("#introSkip");
  if (skip) skip.textContent = isLast ? "Hopp inn i appen →" : "Hopp over";
  const progress = $("#introProgress");
  if (progress) progress.textContent = `Steg ${introStep + 1} av ${INTRO_COUNT}`;
}

function introNext() {
  if (introStep >= INTRO_COUNT - 1) {
    startGettingStarted();
    return;
  }
  haptic();
  setIntroStep(introStep + 1);
}

function introPrev() {
  if (introStep === 0) return;
  haptic();
  setIntroStep(introStep - 1);
}

// Siste steg leder rett inn i en konkret handling: «Før første spor».
function startGettingStarted() {
  state.activeGuide = "getting-started";
  state.activeModule = null;
  saveState();
  closeWelcome();
  setView("learn");
}

function closeWelcome() {
  const wasFirstTime = !state.hasSeenWelcome;
  if (wasFirstTime) {
    state.hasSeenWelcome = true;
    saveState();
  }
  closeOverlay($("#welcomeOverlay"));
  welcomeOpener?.focus?.();
  welcomeOpener = null;
  // Rett etter introen er et naturlig tidspunkt å foreslå installasjon.
  if (wasFirstTime) {
    const mode = deferredInstallPrompt ? "prompt" : isIosDevice() ? "ios" : null;
    if (mode) setTimeout(() => maybeShowInstallCoach(mode), 600);
  }
}

function initWelcome() {
  $("#openWelcome")?.addEventListener("click", openWelcome);
  $("#settingsShowIntro")?.addEventListener("click", openWelcome);

  const overlayEl = $("#welcomeOverlay");
  if (overlayEl) {
    overlayEl.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-welcome]")) {
        closeWelcome();
        return;
      }
      if (event.target.closest("#introNext")) {
        introNext();
        return;
      }
      if (event.target.closest("#introBack")) {
        introPrev();
      }
    });
  }

  initIntroSwipe();

  document.addEventListener("keydown", (event) => {
    const welcomeOpen = $("#welcomeOverlay")?.classList.contains("is-open");
    // Piltaster blar mellom kortene mens introen er åpen.
    if (welcomeOpen && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
      event.preventDefault();
      if (event.key === "ArrowRight") setIntroStep(introStep + 1);
      else setIntroStep(introStep - 1);
      return;
    }
    if (event.key !== "Escape") return;
    if ($("#qrOverlay")?.classList.contains("is-open")) {
      closeQr();
    } else if ($("#refSheet")?.classList.contains("is-open")) {
      closeReferenceSheet();
    } else if ($("#quickLogOverlay")?.classList.contains("is-open")) {
      closeQuickLog();
    } else if ($("#fieldOverlay")?.classList.contains("is-open")) {
      closeFieldMode();
    } else if (welcomeOpen) {
      closeWelcome();
    } else if ($("#feedbackOverlay")?.classList.contains("is-open")) {
      closeFeedback();
    }
  });
}

/* ---------- Tilbakemelding ---------- */

// E-postadressen som tilbakemeldinger åpnes mot. Appen er statisk og sender
// aldri noe selv – mailto-lenken bare forhåndsfyller en e-post.
const FEEDBACK_EMAIL = "per.marstein@nrh.no";
let feedbackType = "Generell henvendelse";
let feedbackOpener = null;

function openFeedback(event) {
  feedbackOpener = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
  openOverlay($("#feedbackOverlay"));
  requestAnimationFrame(() => $("#feedbackMessage")?.focus());
}

function closeFeedback() {
  closeOverlay($("#feedbackOverlay"));
  feedbackOpener?.focus?.();
  feedbackOpener = null;
}

function sendFeedback() {
  const message = $("#feedbackMessage")?.value.trim() || "";
  const subject = `SporLab – tilbakemelding: ${feedbackType}`;
  const body = [
    `Type: ${feedbackType}`,
    `Side i appen: ${state.view || "ukjent"}`,
    "",
    message || "(ingen tekst skrevet)",
  ].join("\n");
  window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const textarea = $("#feedbackMessage");
  if (textarea) textarea.value = "";
  closeFeedback();
}

function initFeedback() {
  $("#openFeedback")?.addEventListener("click", openFeedback);
  $("#settingsShowFeedback")?.addEventListener("click", openFeedback);

  $("#feedbackOverlay")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-feedback]")) closeFeedback();
  });

  $("#feedbackTypeRow")?.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-feedback-type]");
    if (!chip) return;
    feedbackType = chip.dataset.feedbackType;
    $all("#feedbackTypeRow .chip-button").forEach((btn) => {
      const isOn = btn === chip;
      btn.classList.toggle("is-selected", isOn);
      btn.setAttribute("aria-pressed", isOn ? "true" : "false");
    });
  });

  $("#feedbackForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    sendFeedback();
  });
}

// Lett horisontal sveip mellom kortene (føles som en native karusell).
function initIntroSwipe() {
  const viewport = $("#introViewport");
  if (!viewport) return;
  let startX = 0;
  let startY = 0;
  let tracking = false;
  viewport.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) return;
      tracking = true;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    },
    { passive: true }
  );
  viewport.addEventListener(
    "touchend",
    (event) => {
      if (!tracking) return;
      tracking = false;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      // Bare reager på tydelig horisontale drag.
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
      haptic();
      setIntroStep(introStep + (dx < 0 ? 1 : -1));
    },
    { passive: true }
  );
}

/* ---------- Læringsmodul som kortbunke («Aller første sporøkt») ---------- */

// Samme prinsipp som velkomstintroen: én fordøyelig bit per kort, med bla-knapper,
// prikker, sveip og piltaster. Steget huskes på tvers av re-render, men nullstilles
// når brukeren åpner modulen på nytt (se åpne-handlerne).
let gsStep = 0;

function gsSlides() {
  return $all("#gsTrack .gs-slide");
}

function initGettingStartedStepper() {
  const track = $("#gsTrack");
  if (!track) return;
  // Mål kortet etter at det er lagt ut, ellers blir høyden 0 ved første tegning.
  requestAnimationFrame(() => setGsStep(gsStep));
  initGsSwipe();

  // Avkryssing/radio for kartleggingsspørsmålene lagres umiddelbart.
  // Skalaspaken har også data-gs-question, men ingen data-gs-option — den
  // håndteres på «input» under, så vi hopper over den her.
  track.addEventListener("change", (event) => {
    const input = event.target.closest("[data-gs-question]");
    if (input && input.dataset.gsOption !== undefined) {
      const id = input.dataset.gsQuestion;
      const option = input.dataset.gsOption;
      const multi = input.dataset.gsMulti === "1";
      const answers = state.gettingStartedAnswers;
      const entry = answers[id] || {};
      const current = entry.options || [];
      const next = multi
        ? input.checked
          ? [...current, option]
          : current.filter((o) => o !== option)
        : [option];
      answers[id] = { ...entry, options: next };
      saveState();
    }
  });

  // Når et metodekort åpnes/lukkes endres kortets høyde. "toggle" bobler ikke
  // i alle nettlesere, så vi lytter med capture på selve treet.
  track.addEventListener(
    "toggle",
    () => {
      setGsStep(gsStep);
    },
    true
  );

  // Fritekstnotater lagres mens brukeren skriver, og høyden måles på nytt
  // siden tekstfeltet kan vokse (resize: vertical). Skalaspaken oppdaterer
  // verdietiketten live mens den dras og lagrer valgt alternativ.
  track.addEventListener("input", (event) => {
    const note = event.target.closest("[data-gs-note]");
    if (note) {
      const id = note.dataset.gsNote;
      const answers = state.gettingStartedAnswers;
      answers[id] = { ...(answers[id] || {}), note: note.value };
      saveState();
      setGsStep(gsStep);
      return;
    }

    const range = event.target.closest(".gs-scale-input[data-gs-question]");
    if (range) {
      const scale = range.closest(".gs-scale");
      const id = range.dataset.gsQuestion;
      let options = [];
      try {
        options = JSON.parse(scale?.dataset.gsOptions || "[]");
      } catch {
        options = [];
      }
      const option = options[Number(range.value)];
      if (option === undefined) return;
      scale.classList.add("is-answered");
      const valueEl = scale.querySelector(".gs-scale-value");
      if (valueEl) valueEl.textContent = option;
      range.setAttribute("aria-valuetext", option);
      const answers = state.gettingStartedAnswers;
      answers[id] = { ...(answers[id] || {}), options: [option] };
      saveState();
    }
  });
}

function setGsStep(index) {
  const track = $("#gsTrack");
  if (!track) return;
  const slides = gsSlides();
  const count = slides.length;
  if (!count) return;
  gsStep = Math.max(0, Math.min(count - 1, index));
  track.style.transform = `translateX(-${gsStep * 100}%)`;

  // Viewporten følger høyden til det aktive kortet, så korte kort ikke etterlater
  // et stort tomrom (slik et «strekk-til-høyeste»-flexoppsett ville gjort).
  const active = slides[gsStep];
  if (active) track.style.height = `${active.offsetHeight}px`;

  $all("#gsDots .gs-dot").forEach((dot, i) => dot.classList.toggle("is-active", i === gsStep));

  const progress = $("#gsProgress");
  if (progress) progress.textContent = `Kort ${gsStep + 1} av ${count}`;

  const prev = $("#gsPrev");
  if (prev) prev.hidden = gsStep === 0;
  const next = $("#gsNext");
  // Siste kort har sin egen handling (lag plan / tilbake), så «Neste» skjules der.
  if (next) next.hidden = gsStep === count - 1;
}

function gsNext() {
  const count = gsSlides().length;
  if (gsStep >= count - 1) return;
  haptic();
  setGsStep(gsStep + 1);
}

function gsPrev() {
  if (gsStep === 0) return;
  haptic();
  setGsStep(gsStep - 1);
}

// Globale lyttere som bare skal settes opp én gang (piltaster + responsiv høyde).
function initGettingStartedGlobal() {
  document.addEventListener("keydown", (event) => {
    if (state.activeGuide !== "getting-started") return;
    if (!$("#gsTrack")) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      gsNext();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      gsPrev();
    }
  });
  // Når bredden endres, må høyden på det aktive kortet måles på nytt.
  window.addEventListener("resize", () => {
    if (state.activeGuide === "getting-started" && $("#gsTrack")) setGsStep(gsStep);
  });
}

// Lett horisontal sveip mellom kortene — føles som en native karusell.
function initGsSwipe() {
  const viewport = $("#gsViewport");
  if (!viewport) return;
  let startX = 0;
  let startY = 0;
  let tracking = false;
  viewport.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) return;
      tracking = true;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    },
    { passive: true }
  );
  viewport.addEventListener(
    "touchend",
    (event) => {
      if (!tracking) return;
      tracking = false;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
      setGsStep(gsStep + (dx < 0 ? 1 : -1));
      haptic();
    },
    { passive: true }
  );
}

/* ---------- Installasjonscoach (legg appen på Hjem-skjerm) ---------- */

// Chrome/Android/desktop gir oss et beforeinstallprompt-event vi kan utløse
// senere via en egen knapp. iOS Safari gir ingenting — der må vi vise tekst.
let deferredInstallPrompt = null;

function isIosDevice() {
  const ua = navigator.userAgent || "";
  const iOSClassic = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ later som macOS, men har berøringsskjerm.
  const iPadOS = /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  return iOSClassic || iPadOS;
}

function dismissInstallCoach() {
  const coach = document.getElementById("installCoach");
  if (coach) {
    coach.classList.remove("is-visible");
    setTimeout(() => coach.remove(), 250);
  }
  state.installCoachDismissed = true;
  saveState();
}

function renderInstallCoach(mode) {
  if (document.getElementById("installCoach")) return;
  const coach = document.createElement("div");
  coach.id = "installCoach";
  coach.className = "install-coach";
  coach.setAttribute("role", "dialog");
  coach.setAttribute("aria-label", "Installer SporLab");

  if (mode === "ios") {
    // iOS har ingen automatisk prompt — vis nøyaktig hvor delingsknappen er.
    coach.innerHTML = `
      <span class="install-coach-icon" aria-hidden="true">＋</span>
      <div class="install-coach-text">
        <strong>Få SporLab som app</strong>
        <span>Trykk <span class="install-coach-share" aria-hidden="true">⎙</span> Del nederst, og velg «Legg til på Hjem-skjerm».</span>
      </div>
      <button class="install-coach-dismiss" type="button" data-install-dismiss aria-label="Lukk">✕</button>`;
  } else {
    coach.innerHTML = `
      <span class="install-coach-icon" aria-hidden="true">＋</span>
      <div class="install-coach-text">
        <strong>Få SporLab som app</strong>
        <span>Installer den på enheten for full skjerm og rask tilgang — uten nettleserlinje.</span>
      </div>
      <button class="install-coach-btn" type="button" data-install-accept>Installer</button>
      <button class="install-coach-dismiss" type="button" data-install-dismiss aria-label="Lukk">✕</button>`;
  }

  coach.addEventListener("click", async (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    if (target.closest("[data-install-dismiss]")) {
      haptic();
      dismissInstallCoach();
      return;
    }
    if (target.closest("[data-install-accept]") && deferredInstallPrompt) {
      haptic();
      const promptEvent = deferredInstallPrompt;
      deferredInstallPrompt = null;
      promptEvent.prompt();
      try {
        await promptEvent.userChoice;
      } catch (error) {
        // Brukeren lukket dialogen — ingenting å gjøre.
      }
      dismissInstallCoach();
    }
  });

  document.body.appendChild(coach);
  requestAnimationFrame(() => coach.classList.add("is-visible"));
}

function maybeShowInstallCoach(mode) {
  if (isStandalone()) return; // allerede installert
  if (state.installCoachDismissed) return; // brukeren har takket nei
  if (!state.hasSeenWelcome) return; // ikke avbryt førstegangs-introen
  renderInstallCoach(mode);
}

function initInstallCoach() {
  if (isStandalone()) return;

  // Allerede installert? Da rydder vi opp og lar være å mase igjen.
  window.addEventListener("appinstalled", () => {
    state.installCoachDismissed = true;
    saveState();
    document.getElementById("installCoach")?.remove();
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    // Vent litt så banneret ikke kolliderer med velkomsten.
    setTimeout(() => maybeShowInstallCoach("prompt"), 1200);
  });

  // iOS får aldri beforeinstallprompt — vis tekstinstruksjonen i stedet.
  if (isIosDevice()) {
    setTimeout(() => maybeShowInstallCoach("ios"), 1600);
  }
}

/* ---------- Snarveier fra app-ikonet (manifest shortcuts) ---------- */

// Langtrykk på app-ikonet kan åpne «Logg» eller «Planlegg» direkte via
// ?handling=... Vi rydder bort parameteren etterpå så den ikke henger igjen.
function handleLaunchShortcut() {
  const params = new URLSearchParams(window.location.search);
  const handling = params.get("handling");
  if (!handling) return;
  params.delete("handling");
  const clean = window.location.pathname + (params.toString() ? `?${params}` : "") + window.location.hash;
  window.history.replaceState({}, "", clean);
  if (handling === "logg") {
    openQuickLog(null);
  } else if (handling === "plan") {
    state.wizardStep = state.currentPlan ? state.wizardStep || 0 : 0;
    saveState();
    setView("planner");
  }
}

function init() {
  setDefaults();
  paintIcons();
  applyTheme();
  initEvents();
  initWelcome();
  initFeedback();
  initGettingStartedGlobal();
  initQuickLog();
  initShare();
  initFieldMode();
  initCeremony();
  handleSharedImport();
  setView(state.view || "dashboard");
  registerServiceWorker();
  initInstallCoach();
  // Første gang: vis den korte introduksjonen.
  if (!state.hasSeenWelcome) openWelcome();
  handleLaunchShortcut();
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
