# Port origin/main features into redesign main — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the additive features that landed on `origin/main` while `redesign/fase-1a` was in progress — interactive kartlegging questions, automated service-worker cache versioning, and the feedback mechanism — onto our `main` (which already carries the full Fase 1a/1b/1c navigation redesign), without adopting origin's competing "buktende læringssti" / generic card-carousel module browser.

**Architecture:** `main` is the base (already has the 5-tab nav, Hjem-hub, locked module-grid, Felt mørk modus — all verified, 27/27 tests). Each task below ports one self-contained origin feature by inserting the *final* state of that feature's code (not the incremental diffs) at concrete anchors in our current files. No merge/rebase of the diverged branches is performed — this is manual, reviewed re-application.

**Tech Stack:** Static HTML/CSS/JS ES modules, `node --test`, `npx -p typescript tsc -p jsconfig.json`.

## Global Constraints

- Branch: create `port/origin-features` from `main`. Do not work on `main` directly.
- Do not touch `js/quiz.js`, `js/snapshot.js`, `content.js` outside the exact `gettingStartedGuide`/`renderGsQuestion`/`renderGettingStarted` scope named below.
- Do not adopt origin's `renderLearnIntro`/`renderLearnModule`/"buktende sti"/`renderCardCarousel`-for-modules — those are explicitly out of scope; our locked module-grid and 4-step stepper stay as-is.
- `node --test tests/app.test.js` (explicit path — `ruflo/` in repo root breaks bare `node --test`) and `npx -p typescript tsc -p jsconfig.json` must pass after every task.
- Norwegian comments/strings throughout, matching existing file style — copy origin's wording verbatim, it already matches house style.
- Commit after each task.

---

### Task 0: Create work branch

**Files:** none (git only)

- [ ] **Step 1: Create and switch to branch**

```bash
git checkout main
git checkout -b port/origin-features
```

- [ ] **Step 2: Verify baseline**

Run: `node --test tests/app.test.js`
Expected: `27 pass, 0 fail`

---

### Task 1: State schema — `gettingStartedAnswers` field

**Files:**
- Modify: `js/state.js`

**Interfaces:**
- Produces: `state.gettingStartedAnswers` — `Object<string, {options?: string[], note?: string}>`, keyed by kartlegging question id. Consumed by Task 3 (`renderGettingStarted`) and Task 5 (`initGettingStartedStepper`).

- [ ] **Step 1: Add JSDoc property**

Find the `State` typedef block (search for `@property {number} lastExportLogCount`) and add directly after it:

```js
 * @property {Object<string, {options?: string[], note?: string}>} gettingStartedAnswers Svar på kartleggingsspørsmålene i «Aller første sporøkt», nøklet på spørsmåls-id.
```

- [ ] **Step 2: Add default value**

Find `export const defaultState = () => ({` and, right after the `lastExportLogCount: 0,` line, add:

```js
  gettingStartedAnswers: {},
```

- [ ] **Step 3: Add migration guard**

Find `migrateState(stored)`, locate the block that defaults `base.mastery`:

```js
  if (typeof base.mastery !== "object" || base.mastery === null) {
    base.mastery = {};
  }
```

Immediately after it, add:

```js
  if (typeof base.gettingStartedAnswers !== "object" || base.gettingStartedAnswers === null) {
    base.gettingStartedAnswers = {};
  }
```

No `SCHEMA_VERSION` bump needed — this mirrors origin's own commit (`4a17be9`'s predecessor `59c4fd5`), which shipped this as a defensive default without bumping the version constant, since `migrateState` always spreads `{...defaultState(), ...stored}` first.

- [ ] **Step 4: Verify**

Run: `node --test tests/app.test.js`
Expected: `27 pass, 0 fail` (no test covers this field directly; this just confirms nothing broke)

- [ ] **Step 5: Commit**

```bash
git add js/state.js
git commit -m "Legg til gettingStartedAnswers i state-skjemaet"
```

---

### Task 2: Content data — structured kartlegging questions

**Files:**
- Modify: `content.js`

**Interfaces:**
- Produces: `gettingStartedGuide.kartlegging.questions` becomes `Array<{id, text, options?, multi?, scale?, note?}>` instead of `Array<string>`. Consumed by Task 3.

- [ ] **Step 1: Replace the questions array**

Find in `content.js` (inside `gettingStartedGuide.kartlegging`):

```js
    questions: [
      "Hva er den beste forsterkeren? Ball/Kong, godbiter, eller det å finne folk?",
      "Er hunden selvstendig eller veldig avhengig av deg som fører?",
      "Er hunden svært nysgjerrig, moderat eller lite nysgjerrig?",
      "Hvilken intensitet viser den når den leter etter leken sin?",
      "Er det andre forhold (helse, alder, tidligere erfaring) du må ta hensyn til?",
    ],
```

Replace with:

```js
    questions: [
      {
        id: "forsterker",
        text: "Hva er den beste forsterkeren? Ball/Kong, godbiter, eller det å finne folk?",
        options: ["Ball/Kong", "Godbiter", "Finne folk"],
        multi: true,
      },
      {
        id: "selvstendighet",
        text: "Er hunden selvstendig eller veldig avhengig av deg som fører?",
        options: ["Selvstendig", "Litt av begge", "Avhengig av fører"],
        scale: true,
      },
      {
        id: "nysgjerrighet",
        text: "Er hunden svært nysgjerrig, moderat eller lite nysgjerrig?",
        options: ["Svært nysgjerrig", "Moderat nysgjerrig", "Lite nysgjerrig"],
        scale: true,
      },
      {
        id: "intensitet",
        text: "Hvilken intensitet viser den når den leter etter leken sin?",
        options: ["Høy intensitet", "Middels intensitet", "Lav intensitet"],
        scale: true,
      },
      {
        id: "andre-forhold",
        text: "Er det andre forhold (helse, alder, tidligere erfaring) du må ta hensyn til?",
        note: true,
      },
    ],
```

This is the exact final-state data from origin (`59c4fd5` + `eb73620` combined), same wording as our existing plain-string list, just restructured.

- [ ] **Step 2: Verify it's still valid JS / nothing else references the old shape**

Run: `npx -p typescript tsc -p jsconfig.json`
Expected: exit 0 (no other code reads `kartlegging.questions` yet until Task 3 changes the renderer — if tsc fails here because the renderer in Task 3 hasn't shipped, that's fine, do Task 2+3 as one combined check at the end of Task 3 instead)

- [ ] **Step 3: Commit (combined with Task 3 — see Task 3 Step 5)**

Hold off on committing until Task 3's renderer change lands, since the old renderer (`q => escapeHtml(q)`) would break on objects. Proceed directly to Task 3.

---

### Task 3: Content render — `renderGsQuestion()` + interactive `renderGettingStarted(answers)`

**Files:**
- Modify: `content.js`

**Interfaces:**
- Consumes: `gettingStartedGuide.kartlegging.questions` (Task 2's new shape), `state.gettingStartedAnswers` (Task 1).
- Produces: `export function renderGettingStarted(answers = {})` — signature changes from no-arg to `(answers = {})`. Consumed by Task 5 (`renderLearn()` call site).

- [ ] **Step 1: Add `renderGsQuestion` helper**

Directly above `export function renderGettingStarted() {` in `content.js`, insert:

```js
// Render ett spørsmål i kartleggingskortet: avkrysningsbokser/radioknapper for
// faste alternativer, og/eller et fritekstfelt. `saved` er brukerens lagrede
// svar for dette spørsmålet (eller undefined hvis ubesvart).
function renderGsQuestion(q, saved) {
  const savedOptions = saved?.options || [];
  let controlHtml = "";

  if (q.scale && q.options && q.options.length) {
    // Ordinale skalaspørsmål vises som en spak: tydeligere enn radioknapper og
    // unngår at lange etiketter brytes over to linjer.
    const n = q.options.length;
    const selIdx = q.options.indexOf(savedOptions[0]);
    const answered = selIdx >= 0;
    const value = answered ? selIdx : Math.floor((n - 1) / 2);
    const valueLabel = answered ? escapeHtml(q.options[value]) : "Dra spaken for å vurdere";
    controlHtml = `
      <div class="gs-scale${answered ? " is-answered" : ""}" data-gs-options="${escapeHtml(JSON.stringify(q.options))}">
        <p class="gs-scale-value">${valueLabel}</p>
        <input type="range" class="gs-scale-input" min="0" max="${n - 1}" step="1" value="${value}" data-gs-question="${escapeHtml(q.id)}" aria-label="${escapeHtml(q.text)}"${answered ? ` aria-valuetext="${escapeHtml(q.options[value])}"` : ""} />
        <div class="gs-scale-ends">
          <span>${escapeHtml(q.options[0])}</span>
          <span>${escapeHtml(q.options[n - 1])}</span>
        </div>
      </div>`;
  } else if (q.options && q.options.length) {
    const optionsHtml = q.options
      .map((opt) => {
        const type = q.multi ? "checkbox" : "radio";
        const checked = savedOptions.includes(opt) ? " checked" : "";
        return `<label class="gs-option">
          <input type="${type}" name="gsq-${escapeHtml(q.id)}" data-gs-question="${escapeHtml(q.id)}" data-gs-option="${escapeHtml(opt)}" data-gs-multi="${q.multi ? "1" : "0"}"${checked} />
          <span>${escapeHtml(opt)}</span>
        </label>`;
      })
      .join("");
    controlHtml = `<div class="gs-options">${optionsHtml}</div>`;
  }

  const noteHtml = q.note
    ? `<textarea class="gs-note" data-gs-note="${escapeHtml(q.id)}" rows="2" placeholder="Skriv inn notater …">${escapeHtml(saved?.note || "")}</textarea>`
    : "";
  return `
    <div class="gs-question">
      <p class="gs-question-text">→ ${escapeHtml(q.text)}</p>
      ${controlHtml}
      ${noteHtml}
    </div>`;
}
```

- [ ] **Step 2: Change `renderGettingStarted` signature**

Find:

```js
export function renderGettingStarted() {
```

Replace with:

```js
export function renderGettingStarted(answers = {}) {
```

- [ ] **Step 3: Replace the static question list with the interactive renderer**

Find (inside `renderGettingStarted`, the kartlegging slide):

```js
      <ul class="gs-questions">${g.kartlegging.questions.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>
    </div>`);
```

Replace with:

```js
      <div class="gs-question-list">${g.kartlegging.questions.map((q) => renderGsQuestion(q, answers[q.id])).join("")}</div>
      <p class="small gs-hint">Svarene lagres på denne enheten.</p>
    </div>`);
```

- [ ] **Step 4: Verify**

Run: `npx -p typescript tsc -p jsconfig.json`
Expected: exit 0

Run: `node --test tests/app.test.js`
Expected: `27 pass, 0 fail`

- [ ] **Step 5: Commit (Task 2 + 3 together)**

```bash
git add content.js
git commit -m "Gjør kartleggingsspørsmål interaktive (avkryssing/skala-glidebryter)"
```

---

### Task 4: CSS — interactive kartlegging styles

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Remove the dead static-list rule**

Find and delete (lines ~4148–4159 currently):

```css
.gs-questions {
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 6px;
  line-height: 1.5;
}

.gs-questions li {
  list-style: "→  ";
}
```

- [ ] **Step 2: Insert the interactive question styles in its place**

```css
.gs-question-list {
  display: grid;
  gap: 16px;
}

.gs-question {
  display: grid;
  gap: 8px;
}

.gs-question-text {
  margin: 0;
  line-height: 1.5;
}

.gs-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gs-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface-strong);
  font-size: 0.92rem;
  cursor: pointer;
}

.gs-option input {
  flex: none;
  align-self: center;
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--blue);
}

.gs-option:has(input:checked) {
  border-color: var(--blue);
  background: var(--light-blue);
  color: var(--blue);
  font-weight: 700;
}

/* Skalaspak for ordinale kartleggingsspørsmål (selvstendighet, nysgjerrighet,
   intensitet) — tydeligere enn radioknapper og tåler lange etiketter. */
.gs-scale {
  display: grid;
  gap: 6px;
  padding: 2px 2px 0;
}
.gs-scale-value {
  margin: 0;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--muted);
}
.gs-scale.is-answered .gs-scale-value {
  color: var(--blue);
}
.gs-scale-input {
  width: 100%;
  margin: 2px 0;
  accent-color: var(--line);
  cursor: pointer;
}
.gs-scale.is-answered .gs-scale-input {
  accent-color: var(--blue);
}
.gs-scale-input:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 4px;
  border-radius: 4px;
}
.gs-scale-ends {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.78rem;
  color: var(--muted);
}
.gs-scale-ends span:last-child {
  text-align: right;
}

.gs-note {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-strong);
  color: var(--ink);
  font: inherit;
  line-height: 1.5;
  resize: vertical;
}

.gs-note:focus {
  outline: 2px solid var(--blue);
  outline-offset: 1px;
}
```

- [ ] **Step 3: Verify visually**

Start preview (`npx serve .` on port 3000 or via the preview tool), navigate to Lær → an unstarted module's "Aller første sporøkt" guide (`data-open-getstarted` link on the locked module-grid page), confirm:
- Question 1 shows checkbox chips
- Questions 2–4 show a slider with live value label
- Question 5 shows a textarea
- No oversized checkboxes

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "Style interaktive kartleggingsspørsmål (chips, skala-glidebryter, notatfelt)"
```

---

### Task 5: App wiring — pass `answers`, save on change/input/toggle

**Files:**
- Modify: `js/app.js`

**Interfaces:**
- Consumes: `renderGettingStarted(answers)` (Task 3), `state.gettingStartedAnswers` (Task 1).

- [ ] **Step 1: Pass answers into the renderer**

Find in `renderLearn()`:

```js
  if (state.activeGuide === "getting-started") {
    shell.innerHTML = renderGettingStarted();
    initGettingStartedStepper();
```

Replace with:

```js
  if (state.activeGuide === "getting-started") {
    shell.innerHTML = renderGettingStarted(state.gettingStartedAnswers);
    initGettingStartedStepper();
```

- [ ] **Step 2: Extend `initGettingStartedStepper` with save-on-change listeners**

Find:

```js
function initGettingStartedStepper() {
  const track = $("#gsTrack");
  if (!track) return;
  // Mål kortet etter at det er lagt ut, ellers blir høyden 0 ved første tegning.
  requestAnimationFrame(() => setGsStep(gsStep));
  initGsSwipe();
}
```

Replace with:

```js
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
```

- [ ] **Step 3: Verify**

Run: `node --test tests/app.test.js`
Expected: `27 pass, 0 fail`

Run: `npx -p typescript tsc -p jsconfig.json`
Expected: exit 0

Manual: in preview, open "Aller første sporøkt", check a checkbox, drag a slider, type a note, navigate away and back — answers must persist (read from `localStorage` via `state.gettingStartedAnswers`).

- [ ] **Step 4: Commit**

```bash
git add js/app.js
git commit -m "Lagre svar på kartleggingsspørsmål i state.gettingStartedAnswers"
```

---

### Task 6: Automated service-worker cache versioning

**Files:**
- Modify: `service-worker.js`
- Modify: `build.sh`

This replaces the manual `v25`/`v26` bump (current `main` has `v26` from an earlier session) with origin's content-hash automation, so nobody has to remember to bump a version number on deploy again.

- [ ] **Step 1: Replace the manual CACHE_NAME with a placeholder**

Find in `service-worker.js`:

```js
const CACHE_NAME = "sporlab-e8-e9-v26";
```

Replace with:

```js
// Settes til en innholdshash av app-filene av build.sh. Lokalt (uten build)
// står placeholderen igjen — det er fortsatt en gyldig cache-nøkkel, bare
// uten automatisk versjonering.
const CACHE_NAME = "sporlab-e8-e9-__BUILD_HASH__";
```

- [ ] **Step 2: Read current `build.sh` to find the exact insertion point**

Run: `cat build.sh` (or read the file) — locate the final `echo "dist/ bygget med ..."` line near the end.

- [ ] **Step 3: Add the hash-and-replace step before the final echo**

Find the line (exact wording may differ slightly — match on the `echo "dist/ bygget`):

```bash
echo "dist/ bygget med $(find dist -type f | wc -l | tr -d ' ') filer."
```

Replace with:

```bash
# Cache-versjonering: erstatt placeholderen i service-worker.js med en hash av
# app-innholdet (alt unntatt service-worker.js selv). Da endrer SW-filens
# bytes seg automatisk når noe annet endres, og brukerne får "ny versjon"-
# varselet uten at noen må huske å bumpe et versjonsnummer manuelt.
HASH=$(find dist -type f ! -name service-worker.js -print0 | sort -z | xargs -0 cat | sha256sum | cut -c1-12)
sed -i.bak "s/__BUILD_HASH__/${HASH}/" dist/service-worker.js
rm -f dist/service-worker.js.bak

echo "dist/ bygget med $(find dist -type f | wc -l | tr -d ' ') filer. SW-cache: sporlab-e8-e9-${HASH}"
```

- [ ] **Step 4: Verify the build script runs**

Run: `bash build.sh`
Expected: exit 0, output ends with `SW-cache: sporlab-e8-e9-<12 hex chars>`, and `dist/service-worker.js` contains that same hash (no `__BUILD_HASH__` placeholder left).

Run: `grep BUILD_HASH dist/service-worker.js` — expected: no match (placeholder was replaced).

- [ ] **Step 5: Commit**

```bash
git add service-worker.js build.sh
git commit -m "Automatiser SW-cache-versjonering med innholdshash (erstatter manuell versjon)"
```

---

### Task 7: Feedback mechanism

**Files:**
- Modify: `index.html`
- Modify: `js/app.js`
- Modify: `styles.css`

Fully additive — a new overlay dialog reachable from the topbar (`?`-button area) and Settings, sending feedback via `mailto:` (app is static, no backend).

- [ ] **Step 1: Add the topbar feedback button**

Find in `index.html`:

```html
            <button class="topbar-help" id="openWelcome" type="button" aria-label="Om appen og hvordan du bruker den" title="Om SporLab">?</button>
            <button class="topbar-help topbar-settings" data-view-jump="settings" type="button" aria-label="Innstillinger" title="Innstillinger"><span class="nav-icon" data-icon="settings" aria-hidden="true"></span></button>
```

Replace with:

```html
            <button class="topbar-help" id="openWelcome" type="button" aria-label="Om appen og hvordan du bruker den" title="Om SporLab">?</button>
            <button class="topbar-help" id="openFeedback" type="button" aria-label="Gi tilbakemelding" title="Gi tilbakemelding"><span class="nav-icon" data-icon="feedback" aria-hidden="true"></span></button>
            <button class="topbar-help topbar-settings" data-view-jump="settings" type="button" aria-label="Innstillinger" title="Innstillinger"><span class="nav-icon" data-icon="settings" aria-hidden="true"></span></button>
```

- [ ] **Step 2: Add the Settings-panel button**

Find in `index.html`:

```html
              <div class="button-row">
                <button class="ghost-button" id="settingsShowIntro" type="button">Vis introduksjonen</button>
              </div>
```

Replace with:

```html
              <div class="button-row">
                <button class="ghost-button" id="settingsShowIntro" type="button">Vis introduksjonen</button>
                <button class="ghost-button" id="settingsShowFeedback" type="button">Send tilbakemelding</button>
              </div>
```

- [ ] **Step 3: Add the feedback dialog markup**

Find the closing of the bridge-overlay block in `index.html`:

```html
    <div class="bridge-overlay" id="bridgeOverlay" hidden aria-hidden="true">
      <div class="bridge-dialog" role="dialog" aria-modal="true" aria-labelledby="bridgeTitle">
        <span class="bridge-check" data-icon="check" aria-hidden="true"></span>
        <p class="eyebrow">Bro mellom teori og praksis</p>
        <h2 id="bridgeTitle">Teori møter praksis</h2>
        <p class="bridge-sub" id="bridgeSub"></p>
        <button class="primary-button" data-close-bridge type="button">Fortsett</button>
      </div>
    </div>

    <script src="assets/qrcode.js"></script>
```

Replace with:

```html
    <div class="bridge-overlay" id="bridgeOverlay" hidden aria-hidden="true">
      <div class="bridge-dialog" role="dialog" aria-modal="true" aria-labelledby="bridgeTitle">
        <span class="bridge-check" data-icon="check" aria-hidden="true"></span>
        <p class="eyebrow">Bro mellom teori og praksis</p>
        <h2 id="bridgeTitle">Teori møter praksis</h2>
        <p class="bridge-sub" id="bridgeSub"></p>
        <button class="primary-button" data-close-bridge type="button">Fortsett</button>
      </div>
    </div>

    <div class="feedback-overlay" id="feedbackOverlay" hidden aria-hidden="true">
      <div class="feedback-backdrop" data-close-feedback></div>
      <div class="feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="feedbackTitle">
        <button class="welcome-close" data-close-feedback type="button" aria-label="Lukk">✕</button>
        <p class="eyebrow">Gi oss en tilbakemelding</p>
        <h2 id="feedbackTitle">Hva gjelder det?</h2>
        <form id="feedbackForm">
          <div class="chip-row" id="feedbackTypeRow" role="group" aria-label="Hva gjelder tilbakemeldingen">
            <button type="button" class="chip-button is-selected" data-feedback-type="Generell henvendelse" aria-pressed="true">Generell henvendelse</button>
            <button type="button" class="chip-button" data-feedback-type="Teknisk feil" aria-pressed="false">Teknisk feil</button>
            <button type="button" class="chip-button" data-feedback-type="Forslag til forbedring" aria-pressed="false">Forslag til forbedring</button>
            <button type="button" class="chip-button" data-feedback-type="Faglig innhold" aria-pressed="false">Faglig innhold</button>
          </div>
          <label class="feedback-message-label">
            Beskriv kort hva det gjelder
            <textarea id="feedbackMessage" rows="5" placeholder="Hva skjedde, hva forventet du, og hvor i appen var du? Ikke skriv navn eller annen sensitiv informasjon."></textarea>
          </label>
          <p class="small">Tilbakemeldingen åpnes som en e-post til utvikler. Ingenting sendes automatisk fra appen.</p>
          <div class="button-row">
            <button class="primary-button" id="feedbackSend" type="submit">Send tilbakemelding</button>
          </div>
        </form>
      </div>
    </div>

    <script src="assets/qrcode.js"></script>
```

- [ ] **Step 4: Add `OVERLAY_SELECTOR` entry**

Find in `js/app.js`:

```js
const OVERLAY_SELECTOR = "#welcomeOverlay, #fieldOverlay, #qrOverlay, #quickLogOverlay, #refSheet, #ceremonyOverlay, #bridgeOverlay";
```

Replace with:

```js
const OVERLAY_SELECTOR = "#welcomeOverlay, #fieldOverlay, #qrOverlay, #quickLogOverlay, #refSheet, #ceremonyOverlay, #bridgeOverlay, #feedbackOverlay";
```

- [ ] **Step 5: Add `feedback` ICON**

Find in `js/app.js` (the `settings:` entry inside `const ICONS = {`):

```js
  settings:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></svg>',
```

Add directly after it (before the `/* ── Modul-ikoner` comment):

```js
  feedback:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-4 4v-4H4Z"/><path d="M8 9h8M8 12.5h5"/></svg>',
```

- [ ] **Step 6: Add feedback open/close/send functions**

Directly above `// Lett horisontal sveip mellom kortene` (end of `initWelcome`'s file region, i.e. right after `initWelcome()`'s closing brace and before `initIntroSwipe`), insert:

```js
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

```

Note: uses the existing `openOverlay`/`closeOverlay` helpers already defined near `OVERLAY_SELECTOR` — confirm they exist (`grep -n "function openOverlay\|function closeOverlay" js/app.js`) before relying on them; if our main's helper names differ, adjust the two calls in `openFeedback`/`closeFeedback` accordingly.

- [ ] **Step 7: Add Escape-key handling**

Find in `initWelcome()`:

```js
    } else if (welcomeOpen) {
      closeWelcome();
    }
  });
}
```

Replace with:

```js
    } else if (welcomeOpen) {
      closeWelcome();
    } else if ($("#feedbackOverlay")?.classList.contains("is-open")) {
      closeFeedback();
    }
  });
}
```

- [ ] **Step 8: Call `initFeedback()` from `init()`**

Find in `init()`:

```js
  initEvents();
  initWelcome();
  initGettingStartedGlobal();
```

Replace with:

```js
  initEvents();
  initWelcome();
  initFeedback();
  initGettingStartedGlobal();
```

(If `initGettingStartedGlobal` does not exist under that exact name on our `main`, insert `initFeedback();` directly after `initWelcome();` regardless — the ordering relative to other `init*` calls doesn't matter, only that it runs once at startup.)

- [ ] **Step 9: Add feedback dialog CSS**

Append to `styles.css` (after the existing overlay-related rules — search for `.bridge-dialog` or `body.overlay-open` and add nearby for locality):

```css
/* ---------- Tilbakemelding ---------- */
.feedback-overlay {
  position: fixed;
  inset: 0;
  z-index: 130;
  display: grid;
  place-items: center;
  padding: 16px;
}

.feedback-overlay[hidden] {
  display: none;
}

.feedback-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(7, 26, 51, 0.55);
  opacity: 0;
  transition: opacity 180ms ease;
}

.feedback-overlay.is-open .feedback-backdrop {
  opacity: 1;
}

.feedback-dialog {
  position: relative;
  width: min(440px, 100%);
  max-height: 85vh;
  overflow-y: auto;
  background: var(--surface);
  border-radius: var(--radius-lg, 16px);
  padding: 24px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  transform: translateY(12px) scale(0.98);
  opacity: 0;
  transition: transform 220ms ease, opacity 220ms ease;
}

.feedback-overlay.is-open .feedback-dialog {
  transform: translateY(0) scale(1);
  opacity: 1;
}

#feedbackForm {
  display: grid;
  gap: 14px;
  margin-top: 12px;
}

.feedback-message-label {
  display: grid;
  gap: 6px;
  font-size: 0.92rem;
  color: var(--muted);
}

.feedback-message-label textarea {
  font: inherit;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-strong);
  color: var(--ink);
  resize: vertical;
}
```

If `.chip-row`/`.chip-button` classes do not already exist in `styles.css` from earlier work, add minimal styling for them too:

```css
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-button {
  padding: 6px 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface-strong);
  color: var(--ink);
  font-size: 0.88rem;
  cursor: pointer;
}

.chip-button.is-selected {
  border-color: var(--blue);
  background: var(--light-blue);
  color: var(--blue);
  font-weight: 700;
}
```

(Check first with `grep -n "\.chip-row\|\.chip-button" styles.css` — only add if missing.)

- [ ] **Step 10: Verify**

Run: `node --test tests/app.test.js`
Expected: `27 pass, 0 fail`

Run: `npx -p typescript tsc -p jsconfig.json`
Expected: exit 0

Manual in preview: click the new `?`-adjacent feedback icon in the topbar → dialog opens, chips toggle, typing in textarea works, submit opens a `mailto:` link (browser will likely show a "open mail app?" prompt or no-op in headless preview — confirm the `href` was set correctly via `preview_console_logs`/inspecting `window.location` if it doesn't actually navigate away in the sandboxed preview). Also test via Settings → "Send tilbakemelding".

- [ ] **Step 11: Commit**

```bash
git add index.html js/app.js styles.css
git commit -m "Legg til tilbakemeldingsmekanisme (mailto, topbar + innstillinger)"
```

---

### Task 8: Final verification and handoff

**Files:**
- Modify: `AI_HANDOFF.md`

- [ ] **Step 1: Full test + typecheck pass**

```bash
node --test tests/app.test.js
npx -p typescript tsc -p jsconfig.json
```

Expected: 27/27 pass, exit 0.

- [ ] **Step 2: Full manual preview pass**

In preview (port 3000): verify Hjem-hub, Lær locked grid + stepper, Felt mørk modus, intro all still work unaffected (Task 1–7 should not have touched any of this code), then specifically re-verify:
- Kartlegging interactivity + persistence (Task 1–5)
- `bash build.sh` produces a hashed `dist/service-worker.js` (Task 6)
- Feedback dialog (Task 7)

- [ ] **Step 3: Update `AI_HANDOFF.md`**

Add a new session-log entry at the top of the `## Session log` section documenting: branch `port/origin-features`, what was ported (interactive kartlegging, SW hash automation, feedback mechanism), what was deliberately NOT ported (buktende sti, generic card-carousel module browser — superseded by our locked grid/stepper), checks run, and recommended next step (review, merge to `main`, then resolve the `main` vs `origin/main` divergence — push `port/origin-features`'s base `main` or open a PR comparing against `origin/main` once this branch is merged).

- [ ] **Step 4: Commit**

```bash
git add AI_HANDOFF.md
git commit -m "Oppdater handoff: port av origin-funksjoner (kartlegging, SW-hash, tilbakemelding)"
```

---

## Self-review notes (for whoever executes this plan)

- **Spec coverage:** All 4 identified origin features (interactive kartlegging incl. its 2 follow-up refinement commits, SW hash automation, feedback mechanism, email address) are covered. The "buktende sti" / generic `renderCardCarousel`-for-modules / `4c82396` / `b1c7977` changes are explicitly excluded per the user's decision to keep our locked module-grid + stepper.
- **Not covered, intentionally:** the `README.md`/`testinstruks.md`/`.claude/launch.json` Netlify→Cloudflare wording fixes from `8827866` — cosmetic doc wording, zero functional risk, safe to skip or do opportunistically; not worth a dedicated task.
- **Type consistency:** `renderGettingStarted(answers = {})` (Task 3) is called with `state.gettingStartedAnswers` (Task 1, Task 5) — names and shapes match throughout. `renderGsQuestion(q, saved)` 's `saved` parameter is always `answers[q.id]`, consistent with the `Object<string, {options?, note?}>` shape from Task 1's JSDoc.
- **Anchor risk:** every insertion point above was located by reading the actual current `main` branch files at plan-writing time (not origin's line numbers). If `main` has moved since, re-locate by the quoted "Find" text rather than trusting any stray line numbers.
