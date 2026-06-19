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

**Task title:** Redesign Fase 1a + 1b + 1c — struktur, animasjoner og visuelle detaljer  
**Owner/agent:** Claude Code  
**Branch:** `redesign/fase-1a`  
**Started:** 2026-06-18  
**Status:** Fase 1a (5/5) + Fase 1b (seremoni, bro, kursvei-animasjon) + Fase 1c (glassmorfisme, ambient-video, modul-ikoner, mikrointeraksjoner, låst modul-grid i Lær) — KOMPLETT.

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

### 2026-06-19 — Claude Code — Fase 1c oppfølging (låst modul-grid) — branch `redesign/fase-1a`

**Task:** Lukke det kjente gapet fra forrige handoff: bygge om Lær-moduloversikten
(`renderLearnIntro`) til det låste modul-grid-et, samkjørt med Hjem-kursveien.
Jobben var allerede påbegynt uncommitted i arbeidskopien da sesjonen startet —
fullført, verifisert og committet her.

**Summary:**
- Ny delt helper `moduleProgressState(s, i, activeIndex)` brukes av både
  `renderKursvei` (Hjem) og `renderLearnIntro` (Lær), så låsetilstanden er
  identisk på tvers av de to visningene.
- `renderLearnIntro` rendrer nå `.module-grid` med `.module-grid-card`: aktivt/
  fullført tema er klikkbart (`data-module-open`), låste temaer er
  `disabled` med lås-ikon og uten lys-rad. Ny `lock`-ikon i `ICONS`.
- Ryddet inert kode markert som «kjent issue» i forrige handoff:
  `#actionSheet`/`.action-sheet-*` (handlingsark, ubrukt siden Felt-FAB
  begynte å navigere direkte) og `.intro-door`/`.door-field` (gammel
  dør-velger-CSS fra før 5-fanes bunnmenyen).
- **NB:** `node --test` uten argument plukker nå opp `.test.ts`-filer fra det
  urelaterte `ruflo/`-verktøyet (uinstallert tredjeparts-katalog, untracked,
  ikke del av SporLab) og feiler på dem. Kjør `node --test tests/app.test.js`
  eksplisitt til `ruflo/` er ryddet bort.

**Checks:** `node --test tests/app.test.js` → 27/27 pass. `tsc -p jsconfig.json`
→ exit 0. Verifisert i preview (port 3000): Tema 1 vises «Aktiv» med tre lys,
Tema 2-8 låst (disabled, lås-ikon, ingen lys), klikk på aktivt kort åpner
stepper-visningen, klikk på låst kort gjør ingenting. Ingen konsollfeil.

**Files changed:** `js/app.js`, `index.html`, `styles.css`

**Known issues:**
- `ruflo/` (claude-flow/ruflo multi-agent-verktøy) ligger untracked i repo-roten
  fra et tidligere `npx ruflo`-forsøk, med egen `CLAUDE.md` som strider mot
  dette prosjektets regler (swarm-spawning, npm-publisering, IPFS-nøkler).
  Urelatert til SporLab — IKKE brukt i denne sesjonen. Bør ryddes bort av Per
  (`rm -rf ruflo ruflo-plugins.gif .claude/skills skills-lock.json claude`)
  eller eksplisitt `.gitignore`-es; forstyrrer også `node --test` og evt. andre
  rekursive verktøy i repo-roten.

**Next step:** Review i preview, deretter merge `redesign/fase-1a` (nå 10
commits) til main. Bump service-worker-versjon som egen deploy-oppgave ved
merge. Rydd `ruflo/`-katalogen fra repo-roten (se Known issues).

### 2026-06-19 — Claude Code — Fase 1c — branch `redesign/fase-1a`

**Task:** Visuelle detaljer (fase 1c): glassmorfisme, ambient-video, modul-ikoner, mikrointeraksjoner.

**Summary:**
- **Glassmorfisme** (commit d0c595e): `.welcome-overlay:has(.welcome-intro)` → mørk navy
  gradient bak intro-dialogen. `.welcome-intro`: `backdrop-filter: blur(14px)`, rgba-bakgrunn,
  CSS-vars re-scopet til lyse verdier (--ink, --muted, --surface, --line). Fallback: #0c3a63.
  `.ceremony-dialog`/`.bridge-dialog`: backdrop-filter: blur(16px) + rgba-bakgrunn + border.
  prefers-reduced-motion: blur fjernes, solid mørk bakgrunn brukes.
- **Ambient video** (commit d19048c): `<video id="introVideo">` med `src=assets/video/ambient.mp4`
  satt inn i `#welcomeOverlay`. play()/pause() i openWelcome/closeWelcome. Opacity 0.35.
  Graceful fallback — mørk gradient vises uten videofilen. NB: Per må legge
  `assets/video/ambient.mp4` (<500 KB, skog/spor, muted loop) i repoet for full effekt.
- **Modul-ikoner** (commit c6a732a): 8 SVG-ikoner lagt til i ICONS-mapet (mod-grunnlag, mod-spor,
  mod-oppsok, mod-gamle, mod-retning, mod-sportap, mod-kryssende, mod-sirkel). Brukes i
  `.loype-step-num` på uleste moduler — lest viser fremdeles ✓.
- **Mikrointeraksjoner** (commit d740058): `quiz-correct-flash` (blå→grønn-tint, 350ms),
  `quiz-wrong-shake` (horisontal shake, 300ms), `step-badge-pop` (bounce-pop ved done, 350ms).
  Alt vaktet av prefers-reduced-motion.

**Checks:** `node --test` 27/27 etter alle commits. Verifisert i preview: glassmorfisme
(backdropFilter, rgba-bg, lys tekst), modul-ikoner (SVG i alle 8 loype-step-num),
quiz-animasjoner (keyframes i CSS). Ingen console-feil.

**Files changed:** `styles.css`, `index.html`, `js/app.js`

**Next step:** Review redesign/fase-1a (nå 9 commits) og merge til main, eller
legge til `assets/video/ambient.mp4` for full splash-effekt. SW bør bumpes ved deploy.

### 2026-06-18 — Claude Code — Fase 1b — branch `redesign/fase-1a`

**Task:** Animasjoner og polish (fase 1b) oppå fase 1a.

**Summary:**
- Fullføring-seremoni (animert NRH-blå ring + burst) trigget fra Trinn 4
  «Marker som mestret»; auto-lukker 3s/trykk, kan ta deg til neste tema.
- Bro-bekreftelse (grønn check-ring, «Teori møter praksis») når en logget økt
  krediterer et lest-men-utrent tema; hooket i både hurtiglogg og loggskjema.
- Kursvei inn-animasjon (linje tegner seg + punkt-pop) én gang per app-åpning.
- Alt vaktet av prefers-reduced-motion. haptic() utvidet til number|number[].
- Ryddet en foreldreløs duplisert «celebrate-*»-overlay i index.html.
- 2 commits (0d8dd9e seremoni+bro, 3ace80f kursvei-animasjon).

**Checks:** `node --test` 27/27; `tsc` ren. Verifisert i preview via
getComputedStyle (preview-screenshot fanger ikke rAF-/overlay-opacity).

**Next step:** Fase 1c, eller review/merge.

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
