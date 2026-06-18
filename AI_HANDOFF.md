# AI_HANDOFF.md

This is the shared working memory between Per, Claude Code and Codex.

Every agent must read this before starting and update it before finishing.

---

## Current project state

**Project name:** SporLab E8/E9  
**Repository:** https://github.com/permarstein94-eng/sporlab  
**Project type:** Static PWA / Cloudflare Workers Static Assets  
**Primary stack:** HTML, CSS, JavaScript ES modules  
**Package manager:** No fixed package manager detected; use `npx` where needed  
**Local dev command:** `npx serve .`  
**Test command:** `node --test`  
**Typecheck command:** `npx -p typescript tsc -p jsconfig.json`  
**Build command:** `bash build.sh`  
**Deploy command:** `npx wrangler deploy` only when explicitly requested  

---

## Main objective

SporLab should be a stable, practical, field-ready web app for E8/E9 learning, planning and logging.

Priority order:

1. Reliability
2. Simple UX in field conditions
3. Correct learning/progression logic
4. Offline/PWA behavior
5. Maintainable code
6. Visual polish

Avoid clever rewrites that do not improve practical use.

---

## Current stable baseline

**Last known good branch:** main  
**Last known good commit:** TODO: fill after installing system  
**Last successful test:** TODO  
**Last successful typecheck:** TODO  
**Last successful build:** TODO  
**Deployment URL:** TODO  

---

## Architecture map

| Area | Files | Notes |
|---|---|---|
| App shell | `index.html`, `styles.css` | Main UI structure and styling |
| Content | `content.js` | Learning content, quiz/content data |
| State/persistence | `js/state.js` | Local state, localStorage, migrations |
| Utilities | `js/utils.js` | Shared helpers |
| Sharing/export | `js/snapshot.js` | Import/export, sharing, CSV |
| Quiz logic | `js/quiz.js` | Quiz behavior and scoring |
| UI/startup | `js/app.js` | Main app behavior |
| PWA/offline | `service-worker.js`, `manifest.webmanifest`, `assets/` | Cache/offline/install behavior |
| Tests | `tests/` | Node built-in test runner |
| Deploy | `build.sh`, `wrangler.jsonc`, `DEPLOY.md`, `_headers` | Cloudflare deployment |

---

## Current task

**Task title:** Redesign Fase 1a — struktur for læringsplattform  
**Owner/agent:** Claude Code  
**Branch:** `redesign/fase-1a`  
**Started:** 2026-06-18  
**Status:** Komplett (5/5 leveranser, verifisert). Klar for review/merge.  

### Scope

5-fanes bunnmeny, Hjem-hub (kursvei + neste-steg + aktivitet), Lær-stepper,
Felt mørk modus, ny intro. Rent presentasjonslag.

### Out of scope

`content.js`, `js/state.js`, `js/quiz.js`, `js/snapshot.js`, `service-worker.js`,
`wrangler.jsonc`, `build.sh`. Ingen localStorage-skjemaendring. Fase 1b/1c.

---

## Latest handoff

**Date/time:** 2026-06-18  
**Agent:** Claude Code  
**Branch:** `redesign/fase-1a`  

### Task

Redesign-spec Fase 1a — strukturen for læringsplattformen. Spec:
`docs/superpowers/specs/2026-06-18-sporlab-redesign-design.md`.

### What changed

5 leveranser, hver i sin commit på `redesign/fase-1a`:

1. **Ny 5-fanes bunnmeny** (Hjem · Lær · Felt-FAB · Fremgang · Oppslag). Droppet
   `bottom-nav-doors`; CSS-en hadde allerede 5-kolonners grid. Felt-FAB navigerer
   til Felt-fanen (training). `navTabForView` remappet. Nye ikoner trees/chart.
2. **Hjem som progresjons-hub**: kursvei-stripe (8 punkter, fullført/aktiv/låst),
   neste-steg-kort (tre statuslinjer + evoluerende CTA), siste-aktivitet.
3. **Lær-modul som 4-trinns stepper** (Les → Quiz → Til skogen → Mester), bygd på
   eksisterende accordion-infra. Nye ikoner check/minus.
4. **Felt-fane mørk modus** (#042C53): palett-variabler re-scopet på `.main-panel`
   ved `body[data-domain="field"]`, 250ms cross-fade, 56px treffflater.
5. **Intro skrevet om** til læringsplattform-modellen (kjerneløkken + bro).

Modell-beslutning: «fullført» = lest + quiz + trent (alle tre lysene), utledet
rent fra eksisterende state. `state.completed` = «Teori lest»-flagget. Ingen
skjemaendring. Se AI_DECISION_LOG.

### Files changed

- `index.html` (bunnmeny, Hjem-shell, intro-slides)
- `js/app.js` (nav, renderHome + zoner, stepper, ikoner, data-module-open→setView)
- `styles.css` (Hjem-hub, stepper, Felt mørk modus, intro-loop)

Ikke rørt (per spec): `content.js`, `js/state.js`, `js/quiz.js`,
`js/snapshot.js`, `service-worker.js`, `wrangler.jsonc`, `build.sh`.

### Commands run

```bash
node --test                                 # 27 pass (før og etter hver leveranse)
npx -p typescript tsc -p jsconfig.json      # ren (exit 0)
```

Verifisert visuelt i preview (npx serve, port 3000, mobil-viewport): alle 5
faner ruter riktig, Hjem-hub med done/active/locked, stepper, Felt mørk modus
(training + planlegger), ny intro slide 1+2. Ingen console-feil.

### Results

- Alle eksisterende tester passerer (27/27). Typecheck ren.
- Fase 1a komplett og verifisert. Ingen regresjoner observert på tvers av visninger.

### Known issues / scope-grenser

- **Lær-moduloversikten** (`renderLearnIntro`-løypa) er IKKE bygd om til det
  låste modul-grid-et fra spec Seksjon 2 — den bruker fortsatt den eksisterende
  «alt åpent»-løypelista. Kursvei-låsing på Hjem er derfor visuell veiledning;
  modulene kan fortsatt åpnes via Lær-fanen. Vurder å samkjøre i neste runde.
- **Død CSS/markup**: gammel `.door`/`.home-chooser`/`.intro-door`-CSS og
  handlingsarket (`#actionSheet`) er inerte men gjenstår — rydd i fase 1c.
- **Fase 1b/1c gjenstår**: fullføring-seremoni, bro-overlay, kursvei-inn-animasjon
  (1b); glassmorfisme, ambient-video, mikrointeraksjoner (1c).
- **PWA-cache**: service-worker (v25) cacher aggressivt. Under lokal preview måtte
  SW avregistreres + cache tømmes for å se endringer. Ved deploy må SW-versjon
  bumpes (egen deploy-oppgave, ikke rørt her).

### Risks

- Service worker/cache changes can create stale deployed behavior.
- Local storage schema changes can break existing user data unless migrated.
- Content structure changes can break quiz/progression logic.
- Cloudflare deploy config should not be touched unless the task is specifically deployment.

### Recommended next step

- Få Per til å se gjennom `redesign/fase-1a` (5 commits) i preview.
- Deretter: enten fase 1b (animasjoner/seremoni) eller bygge om Lær-moduloversikten
  til det låste grid-et for full konsistens med kursvei-låsingen.
- Ved merge til main: bump service-worker-versjon som egen deploy-oppgave.

---

## Open issues

| Priority | Issue | Notes |
|---|---|---|
| High | Fill in last known good commit/test/typecheck/build | Do this immediately after installation |
| Medium | Confirm all scripts work on your local Windows setup | Especially if using Git Bash for `bash build.sh` |
| Low | Add deployment URL | Useful for review/handoff |

---

## Do not touch without explicit approval

- Secrets, `.env` files, API keys or deployment credentials
- `wrangler.jsonc` unless working on deployment
- `service-worker.js` unless working on PWA/offline/cache
- Local storage schema/migrations unless the task requires it
- Large app-wide refactors
- Framework/package-manager migration
- Full content rewrite in `content.js`
- Production deployment settings

---

## Useful commands

```bash
npx serve .
node --test
npx -p typescript tsc -p jsconfig.json
bash build.sh
npx wrangler deploy
```

Use deploy only when explicitly requested.

---

## Session log

Add newest entries at the top.

### 2026-06-18 — Claude Code — branch `redesign/fase-1a`

**Task:** Implementer redesign Fase 1a (5 leveranser) fra godkjent spec.

**Summary:**
- 5-fanes bunnmeny, Hjem-progresjons-hub, Lær-stepper, Felt mørk modus, ny intro.
- Rent presentasjonslag — ingen endring i state-skjema, quiz, content, SW, deploy.
- «Fullført» definert som lest + quiz + trent (utledet); se DECISION_LOG.
- 5 commits (0c872ce, 62aac55, 08d53d9, 5319b41, f65a61a).

**Checks:** `node --test` 27/27 pass; `tsc` ren. Verifisert i preview.

**Next step:** Review i preview; deretter fase 1b eller låst modul-grid i Lær.

### 2026-06-18 — ChatGPT setup — branch unknown

**Task:** Create AI agent handoff system for SporLab.

**Summary:**
- Built repo-specific handoff system for Claude Code and Codex.
- Added strict branching/checkpoint/review process.
- Customized commands and risk areas for static JS PWA + Cloudflare.

**Files touched:**
- See latest handoff above.

**Checks:**
- Not run inside the repo by ChatGPT. Must be run locally after installation.

**Next step:**
- Copy files into repo root.
- Run status script.
- Commit the system.
