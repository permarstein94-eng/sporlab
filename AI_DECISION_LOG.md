# AI_DECISION_LOG.md

Use this file for decisions that should survive individual AI sessions.

Do not log every small code edit here. Log decisions about architecture, state, deployment, dependencies, UX conventions, naming and project direction.

---

## Decision template

### YYYY-MM-DD — Decision title

**Decision:**  
TODO

**Reason:**  
TODO

**Alternatives considered:**  
- TODO

**Consequences:**  
- TODO

**Owner:**  
TODO

---

## Decisions

### 2026-06-18 — «Fullført tema» = lest + quiz + trent (utledet, ingen skjemaendring)

**Decision:**
I redesignet (Fase 1a) regnes et tema som *fullført/mestret* når alle tre lysene
er grønne: teori lest, quiz bestått (≥60 %, eller ingen spørsmål), og minst én
loggført økt på temaet. Dette utledes rent fra eksisterende state — det eneste
persisterte flagget `state.completed` brukes som «Teori lest»-signalet (settes via
Trinn 1 «Marker teori som lest» i stepperen). Quiz og trent utledes som før fra
`state.mastery` og loggene. Ingen endring i localStorage-skjemaet (v6).

**Reason:**
Spec-en definerer neste-steg-kortet med tre statuslinjer og «alle tre grønne →
neste tema låses opp». Skjemaet har bare ett flagg per modul, så de tre del-
tilstandene utledes i stedet for å lagres. Holder Fase 1a som et rent
presentasjonslag uten migrasjonsrisiko.

**Alternatives considered:**
- La `state.completed` bety «mestret» (eksplisitt) og vise tre lys kun rådgivende.
- Innføre separate flagg for lest/quiz/trent (krever skjema-migrasjon — avvist i 1a).

**Consequences:**
- Hjem-kursvei, neste-steg-kort og Lær-stepper deler samme avledede modell.
- Moduler uten quizspørsmål regnes som quiz-OK, ellers blir de aldri fullførbare.
- Kursvei-låsing på Hjem er visuell; modulene kan fortsatt åpnes fra Lær-løypa
  (den er ikke bygd om til låst grid i 1a).

**Owner:** Per (implementert av Claude Code)

---

### 2026-06-18 — Felt mørk modus via re-scopet palett, ikke egen temaklasse

**Decision:**
Felt-fanens mørke modus (#042C53) implementeres ved å overstyre palett-CSS-
variablene (`--surface`, `--ink`, `--line`, `--muted` m.fl.) på `.main-panel` under
`body[data-domain="field"]`, slik at var-baserte komponenter automatisk leses mot
den mørke flaten. Hardkodede lyse flater (skjemafelt, tom-tilstander) overstyres
eksplisitt. 250ms cross-fade, slått av ved `prefers-reduced-motion: reduce`.

**Reason:**
Gjenbruker samme mekanisme som `html[data-theme="dark"]`, minimerer ny CSS og
unngår å duplisere komponentstiler. `data-domain="field"` settes allerede av
`setView` for training/planner/log.

**Consequences:**
- Bunnmenyen holdes lys/konsistent (ligger utenfor `.main-panel`).
- Nye hardkodede `#fff`-flater i felt-visningene må overstyres eksplisitt framover.

**Owner:** Per (implementert av Claude Code)

---

### 2026-06-18 — Use repo-based AI handoff system

**Decision:**  
Use `CLAUDE.md`, `AGENTS.md`, `AI_HANDOFF.md`, `AI_DECISION_LOG.md`, task branches and checkpoint commits to coordinate Claude Code and Codex work.

**Reason:**  
Switching between AI coding agents without shared repo state increases the risk of lost context, conflicting changes and unstable code.

**Alternatives considered:**  
- Free switching between sessions
- One long-running Claude session only
- Manual notes outside the repo
- Relying on hidden chat memory

**Consequences:**  
- Slightly more process overhead
- Better traceability
- Easier rollback
- Safer review between agents

**Owner:**  
Per

---

### 2026-06-18 — Keep SporLab dependency-light

**Decision:**  
Default to no new dependencies. Use existing static JS structure unless a task explicitly justifies otherwise.

**Reason:**  
SporLab is currently a static PWA with simple deployment and tests. Extra dependencies increase maintenance, deploy risk and complexity.

**Alternatives considered:**  
- Introduce framework
- Introduce package manager workflow
- Keep current static ES-module structure

**Consequences:**  
- Some manual JS remains
- Lower operational complexity
- Simpler Cloudflare/static deployment

**Owner:**  
Per
