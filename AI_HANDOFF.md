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

**Last known good branch:** `fix/stepper-next-locked-disable` (avgreinet fra `main` @ `9b7b508`, etter PR #11-merge — se siste handoff)  
**Last known good commit:** 9b7b508 (main, etter merge av PR #11 `fix/pilot-readiness-juni2026`)  
**Last successful test:** 2026-06-20 — `node --test tests/app.test.js` — 39/39 pass  
**Last successful typecheck:** 2026-06-20 — `tsc -p jsconfig.json` — exit 0  
**Last successful build:** 2026-06-20 — `bash build.sh` — 22 filer, SW-cache `sporlab-e8-e9-bc331926f284`  
**Deployment URL:** https://sporlab.per-marstein-94.workers.dev/ (live-cache pr. forrige sesjon: `sporlab-e8-e9-7bd1e9174420` — IKKE oppdatert med PR #11 eller denne sesjonens endringer; ingen deploy kjørt)  

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

**Task title:** Fiks kontrast/lesbarhet for "Kjernepunkter" på planner-siden  
**Owner/agent:** Claude Code  
**Branch:** `fix/planner-kjernepunkter-contrast`  
**Started:** 2026-06-20  
**Status:** DONE og verifisert, klar for PR-review

### Scope

Produksjonstilbakemelding: tekst inni "Kjernepunkter"-boksen på planner-siden
var nesten ulselig (lys tekst på lys bakgrunn). Kun `styles.css` endret, ingen
app-logikk.

### Out of scope

Redesign, nye funksjoner, endring av faginnhold, `service-worker.js`, deploy.

---

## Latest handoff

**Date/time:** 2026-06-20  
**Agent:** Claude Code  
**Branch:** `fix/planner-kjernepunkter-contrast`

### Task

Produksjonsfeil meldt: "Kjernepunkter" på planner-siden var nesten ulesbar —
lys tekst på lys bakgrunn.

### Root cause

`.callout` (brukt av `.wizard-key-points`, dvs. "Kjernepunkter") hadde en
hardkodet, ikke-temabevisst bakgrunnsfarge `background: #f0f8fe`, mens
tekstfargen er `body { color: var(--ink) }`. Planner-siden kjører i
`body[data-domain="field"]`-konteksten (`.main-panel`-scopet i styles.css),
som re-definerer `--ink` til en LYS farge (`#eaf3fc`) for den mørke
felt-flaten. Resultatet: lys `--ink`-tekst direkte på den hardkodede lyse
`#f0f8fe`-boksen → svært lav kontrast. Samme bug-mønster gjaldt i prinsippet
også appens globale dark-theme (`html[data-theme="dark"]`), som også setter
`--ink` lyst.

`.wizard-key-points .eyebrow` (selve "Kjernepunkter"-overskriften) brukte
`var(--blue)`/`var(--green-2)`-aktige faste fargetokens som ikke er garantert
å kontrastere mot `--surface-strong` i felt-domenet (testet og forkastet
underveis — ga kun ~1.4:1 kontrast i planner-kontekst).

### What changed (`styles.css`)

- `.callout`: bakgrunn endret fra hardkodet `#f0f8fe` til `var(--surface-strong)`,
  og fikk explicit `color: var(--ink)`. `--ink`/`--surface-strong` er alltid
  definert som et kontrasterende par (lys/mørk eller mørk/lys) i alle tre
  kontekster: standard lys-tema, `html[data-theme="dark"]`, og
  `body[data-domain="field"] .main-panel`.
- Ny regel `.wizard-key-points .eyebrow { color: var(--ink); }` — overskriften
  "Kjernepunkter" arver nå samme garantert-kontrasterende farge som
  brødteksten, i stedet for en fast blåfarge.

### Verification

- `preview_eval`/`preview_screenshot` mot lokal `npx serve`-server (port 3000),
  testet "Kjernepunkter" i tre kontekster:
  - Planner (`body[data-domain="field"]`, mørk feltflate): bakgrunn
    `rgb(17,74,126)`, tekst `rgb(234,243,252)` — svært høy kontrast. Skjermbilde
    bekrefter klart lesbar hvit tekst på mørk blå boks.
  - Lær-modul, lyst tema: bakgrunn `rgb(227,240,251)`, tekst `rgb(10,34,54)` —
    høy kontrast.
  - Lær-modul, mørkt tema: bakgrunn `rgb(22,41,63)`, tekst `rgb(232,241,251)` —
    høy kontrast.
- `node --test tests/app.test.js` — 39/39 pass
- `npx -p typescript tsc -p jsconfig.json` — exit 0
- `bash build.sh` — 22 filer, SW-cache `sporlab-e8-e9-ce6c7908e859`

### Files changed

- `styles.css` (kun `.callout` og ny `.wizard-key-points .eyebrow`-regel)

### Known issues

Ingen kjente. Endringen er rent additiv på fargetoken-nivå og påvirker alle
steder `.callout` brukes (ikke bare "Kjernepunkter") — det er vurdert som
ønskelig siden den gamle hardkodede fargen var en generell bug, ikke spesifikk
for denne ene komponenten.

### Recommended next step

Review og merge av `fix/planner-kjernepunkter-contrast`. Ingen deploy kjørt.

---

## Tidligere handoff

**Date/time:** 2026-06-20  
**Agent:** Claude Code  
**Branch:** `fix/stepper-next-locked-disable`  

### Task

Follow-up fix etter PR #11-merge til `main`. Review fant ett ikke-blokkerende
funn: «Neste ▶»-knappen i Lær-stepperen kunne se klikkbar ut selv når det neste
temaet var låst, selv om selve navigasjonen allerede var korrekt blokkert av
`isModuleLocked()`-vakten i klikk-handleren.

### What changed

- `renderLearnModule()` beregner nå `nextLocked = isModuleLocked(nextModule.id)`
  og bruker den til å sette `disabled` + et forklarende `aria-label` på
  «Neste ▶»-knappen, på samme måte som kursvei-prikkene og modul-grid-kortene
  allerede viser låst tilstand.
- `prevModule` er IKKE endret: du kan kun stå i stepperen for et ulåst tema, og
  `moduleProgressState` garanterer at alle temaer før et ulåst tema er «done»
  eller «active» — aldri «locked». Forrige kan derfor aldri peke på et låst
  tema by design.

### Files changed

- `js/app.js` (kun `renderLearnModule()`-funksjonen, linje ~1163–1318)

### Commands run

```bash
node --test tests/app.test.js        # 39/39 pass
npx -p typescript tsc -p jsconfig.json  # exit 0
bash build.sh                        # OK, SW-cache sporlab-e8-e9-bc331926f284
```

Verifisert visuelt i preview (npx serve, port 3000): åpnet «Grunnlaget»
(tema 1, aktivt, tema 2 låst) — «Neste ▶» er nå disabled med
aria-label «Neste modul (låst til dette temaet er mestret)». «◀ Forrige» er
disabled fordi det er første tema i listen (uendret oppførsel).

### Results

- Alle tester passerer (39/39). Typecheck ren. Build OK.
- Stepper-knappene reflekterer nå samme låsetilstand som kursvei og modul-grid.

### Known issues / scope-grenser

- Ingen nye. Endringen er isolert til de to ARIA/disabled-attributtene på
  stepper-navigasjonen; ingen endring i `isModuleLocked()`, state eller schema.

### Risks

- Lav risiko: gjenbruker eksisterende, allerede testet låse-funksjon
  (`isModuleLocked`); ingen ny logikk, ingen state-/schemaendring.

### Recommended next step

- Per ser gjennom PR for `fix/stepper-next-locked-disable` og merger ved ok.
- Ingen deploy gjort eller nødvendig for denne endringen alene.

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

### 2026-06-20 — Per (manuell) — Produksjons-smoketest etter Cloudflare-deploy — branch `main`

**Task:** Manuell interaktiv smoketest av `https://sporlab.per-marstein-94.workers.dev`
etter forrige sesjons deploy (Pakke G), siden Claude-in-Chrome-extensionen ikke
var tilkoblet og automatisk browserverifisering derfor ikke kunne gjøres.

**Resultat: bestått.** Hjem, Lær, Felt, Fremgang og Oppslag fungerer. Modul-grid
i Lær rendrer riktig, låste moduler er ikke-klikkbare. Første tilgjengelige
modul kan åpnes, og «Neste ▶»-stepperen oppfører seg riktig ved låst progresjon
(disabled, jf. `nextLocked`-fix fra 6f0fb15). Felt-logg kan opprettes, og
Fremgang reflekterer loggdata. Data overlever refresh/reload (localStorage-
persistens bekreftet).

**Konklusjon:** Produksjonsdeployen er nå verifisert både statisk (forrige
sesjon) og interaktivt (denne notatet). Anses som ferdig.

### 2026-06-20 — Claude Code — Cloudflare deploy (Pakke G) — branch `main`

**Task:** Fullføre Cloudflare-deploy av `main` (82b0b44) som var blokkert i
forrige sesjon kun pga. manglende Cloudflare-credentials (Pakke G, bevisst
utelatt da). Per kjørte `npx wrangler login` lokalt før denne sesjonen, men
`wrangler whoami` viste fortsatt «not authenticated» i dette shell-et —
re-kjørte `npx wrangler login` (OAuth) i sesjonen, som lyktes
(`per.marstein.94@gmail.com`).

**Verifisert før deploy:** Repo-identitet (alle nøkkelfiler funnet), branch
`main`, `main`...`origin/main` 0/0 (oppdatert), `bash build.sh` produserte
forventet SW-cache `sporlab-e8-e9-bc331926f284`.

**Deploy:** `npx wrangler deploy` feilet først med «More than one account
available but unable to select one in non-interactive mode» (kontoene
`Attractive Robin` og `Per.marstein.94@gmail.com's Account`). Løst med
`CLOUDFLARE_ACCOUNT_ID=99b1593ac7c0c8900c80a4d6ddf3d4e2` (kontoen som matcher
`*.per-marstein-94.workers.dev`-subdomenet) som engangs env-var — `wrangler.jsonc`
ble **ikke** endret. Deploy lyktes: 11 filer lastet opp,
Version ID `3921ecd6-6b24-4e29-be5f-666ba7b1e513`,
URL `https://sporlab.per-marstein-94.workers.dev`.

**Post-deploy-verifisering:** `curl` av live `service-worker.js` bekrefter
`CACHE_NAME = "sporlab-e8-e9-bc331926f284"`. Live `index.html` inneholder alle
fem bunnnav-faner (Hjem, Lær, Felt, Fremgang, Oppslag). Live `js/app.js` er
byte-for-byte identisk med lokal `js/app.js` (diff tom), inkl. lås-logikken
(`isModuleLocked`, `disabled aria-disabled` på låste modulkort, og
`nextLocked`-sjekken på «Neste ▶»-knappen fra forrige sesjons fix). Kunne
**ikke** kjøre en faktisk klikk-gjennom i nettleser denne sesjonen —
Claude-in-Chrome-extension var ikke tilkoblet, så lås/stepper-oppførsel er
verifisert statisk (kildekode-likhet), ikke interaktivt i DOM. Anbefaler en
rask manuell sjekk i nettleser ved neste anledning.

`.claude/settings.local.json` og `skills-lock.json` rørt ikke (kun lest
`git status`). Ingen nye commits opprettet, ingen push.

### 2026-06-20 — Claude Code — Merge PR #11 + stepper-fix — branch `main` / `fix/stepper-next-locked-disable`

**Task 1:** Merget PR #11 (`fix/pilot-readiness-juni2026`, godkjent «Approve with
notes») til `main` via `git merge --no-ff` + push. Merge-commit `9b7b508`,
hode-SHA matchet reviewet PR-hode (`be92b0d`) eksakt. Ingen deploy.

**Task 2:** Follow-up-fix på samme branch-mønster: «Neste ▶»-knappen i
Lær-stepperen kunne se klikkbar ut når neste tema var låst (navigasjonen var
allerede korrekt blokkert av `isModuleLocked()`, kun visningen manglet). Fikset
i `js/app.js` (`renderLearnModule()`): knappen disables nå + får forklarende
aria-label når neste tema er låst. «◀ Forrige» urørt — kan by design aldri
peke på et låst tema. Se «Latest handoff» over for detaljer. Branch:
`fix/stepper-next-locked-disable`. `node --test` 39/39, `tsc` exit 0,
`build.sh` OK. Ikke deployet.

### 2026-06-20 — Claude Code — HF-pilot-klargjøring (Pakke B–F) — branch `fix/pilot-readiness-juni2026`

**Task:** Fortsettelse av forrige sesjons gjennomgang (PRD + Codex read-only QA,
begge kun lokalt hos Per, ikke i repoet). Alle funn under var allerede verifisert
direkte mot koden/live-URL i forrige sesjon og godkjent av Per for implementering,
i pakker B→G. Denne sesjonen utførte B–F. **Pakke G (deploy) er bevisst ikke
startet** — krever egen, ny eksplisitt godkjenning fra Per per oppgavebeskrivelsen.

**Pakke B — Progresjon/låsing (`js/app.js`):**
1. `renderLearnIntro()`s toppheader viste `state.completed.length` («lest»-tallet)
   merket «X av 8 temaer mestret». Byttet til `gridDoneCount`/`gridPct` (fra
   `homeModuleStatuses()`, samme tre-lys-modell som resten av skjermen).
2. Modul-stepperens «◀ Forrige»/«Neste ▶»-knapper (`data-module-nav`) hadde ingen
   låse-guard — kunne navigere forbi låste temaer. Lagt til ny helper
   `isModuleLocked(moduleId)` (gjenbruker `homeModuleStatuses()` +
   `moduleProgressState()`) og en guard i klikk-handleren.
3. «Fortsett der du var» (`action === "continue-learning"`) valgte neste modul via
   `state.completed.includes` (lest-only). Rettet til å bruke
   `homeModuleStatuses()`s `complete`-flagg (tre-lys).
4. **Funnet under verifisering, ikke i opprinnelig funnliste — flagget til Per,
   fikset etter godkjenning:** «Neste steg i løypa»-kortet i samme funksjon
   beregnet `nextModule` med samme lest-only-logikk som punkt 3, og rendret en
   ikke-låst `data-module-open`-knapp som kunne åpne et faktisk låst tema direkte
   (bekreftet reproduserbart i browser — modul-gridet under viste samme tema som
   låst/disabled samtidig). Rettet til å bruke det faktiske aktive temaet fra
   `gridStatuses`/`gridActiveIndex`.

Alle fire verifisert direkte i browser (port 3000, localStorage manipulert til
«tema 1 lest, ikke quizet/trent») — håndteringen er nå konsekvent låst på tvers
av Hjem-kursveien, modul-gridet, stepper-navigasjonen, «Neste steg i løypa»-kortet
og «Fortsett der du var». **Ikke unit-testbar:** `js/app.js` eksporterer ingenting
og kjører `init()` (DOM/window/navigator-avhengig) ved import, så testharnessen i
`tests/helpers/load-app.js` laster aldri `app.js` (kun `state.js`/`utils.js`/
`snapshot.js`/`quiz.js`/`content.js`) — samme begrensning som forrige sesjons
`#refSheet`-race-fiks. Å gjøre `app.js`s rendering-/handler-logikk testbar krever
egen test-infrastruktur (DOM-mocking) og ble vurdert som utenfor denne pakkens
narrow scope; verifisert manuelt i browser i stedet, som dokumentert presedens.

**Pakke C — Pilotinstruks/disclaimer:**
- `testinstruks.md`: rettet testoppgavene til faktisk navigasjon (Hjem · Lær ·
  Felt · Fremgang · Oppslag) — de pekte på faner som ikke finnes («Quiz»,
  «Planlegg», «Logg», «I dag», «Slå opp»). Også rettet modulnavn-eksempelet
  («Sporoppsøk grunnlag» → «Grunnlaget», tema 1). Rettet personvern-avsnittet
  («sletter du cache» → presisert til localStorage/nettleserdata, med konkrete
  eksempler på hva som faktisk sletter dataen).
- `index.html`: lagt til en kort instruktør/hefte-disclaimer på siste intro-slide
  («SporLab er et hjelpeverktøy og erstatter ikke instruktør eller leseheftet»),
  i tillegg til den som allerede fantes i Innstillinger. Verifisert i browser.

**Pakke D — Ambient-video/404:**
- Bekreftet 404 på `/assets/video/ambient.mp4` lokalt (filen finnes ikke).
  Fjernet `<video id="introVideo">` fra `index.html`, `play()`/`pause()`-kallene
  i `js/app.js` (`openWelcome`/`closeWelcome`), og hele `.intro-ambient-video`
  CSS-blokken (inkl. `prefers-reduced-motion`-regelen) i `styles.css`. Mørk
  gradient-fallback (`.welcome-overlay:has(.welcome-intro)`) er urørt og
  fortsatt aktiv. Verifisert i browser: ingen `ambient.mp4`-request etter fiksen,
  ingen `#introVideo` i DOM.

**Pakke E — Schema-dokumentasjon + eksport:**
- `js/state.js`: JSDoc rettet fra «schemaVersion 6» til «schemaVersion 7»
  (matcher `SCHEMA_VERSION = 7`). Ingen faktisk skjemaendring.
- `js/snapshot.js`: `shareSnapshot()` eksporterer nå `gettingStartedAnswers`.
  `importSnapshot()` importerer feltet defensivt — dropper stille hvis feltet
  mangler (eldre eksporter), saniterer typer, og lar lokalt svar vinne ved
  nøkkel-kollisjon (samme «lokal vinner»-prinsipp som ellers i funksjonen),
  innkommende fyller bare nye nøkler.
- 4 nye tester i `tests/app.test.js` (rundtur, eldre-eksport-uten-felt kaster
  ikke, lokal-vinner-ved-kollisjon) — alle TDD RED→GREEN.

**Pakke F — Verifikasjon:** `node --test tests/app.test.js` → **39/39 pass** (4
nye). `tsc -p jsconfig.json` → exit 0. `bash build.sh` → exit 0, 22 filer,
SW-cache `sporlab-e8-e9-49a67821f381`.

**Pakke G — IKKE startet.** Venter på Pers eksplisitte nye godkjenning før
deploy-sjekkliste/`wrangler deploy`, per oppgavebeskrivelsen.

**Files changed:** `js/app.js`, `js/snapshot.js`, `js/state.js`, `index.html`,
`styles.css`, `testinstruks.md`, `tests/app.test.js`.

**Known issues / gjenstående:**
- Ingenting committet ennå — alt står uncommitted på `fix/pilot-readiness-juni2026`.
  Per må bestemme commit-strategi (én commit per pakke, eller samlet) før videre.
- Live deploy-cache (`sporlab-e8-e9-7bd1e9174420`) reflekterer ikke denne
  sesjonens endringer — uendret fra forrige sesjons kjente issue.
- `js/app.js`s manglende test-eksport (se Pakke B over) gjelder generelt for all
  fremtidig logikk i den filen, ikke bare denne sesjonens endringer — vurder om
  en egen, separat oppgave bør gjøre nøkkelfunksjoner testbare.

**Next step:** Per gjennomgår diffen (8 filer, +127/−67), velger commit-strategi,
og gir eventuelt ny eksplisitt godkjenning for Pakke G (deploy).

### 2026-06-19 — Claude Code — Grundig feilretting og gjennomgang — branch `fix/grundig-feilretting-juni2026`

**Task:** Per ba om en grundig, kontrollert feilretting av hele appen: finn og fiks
faktiske feil, regressions, state-/import-/quiz-/PWA-problemer. Startet med å løse
det uløste kjente problemet fra forrige sesjon (intro-modal-knapper som ikke
responderte).

**Root cause på kjent bug (systematic-debugging, ikke en JS-event-bug som antatt):**
`.ceremony-overlay`/`.bridge-overlay` (innført i Fase 1b, commit `0d8dd9e`) manglet
en `[hidden]{display:none}`-regel (i motsetning til `.welcome-overlay`/
`.feedback-overlay`, som allerede har dette). Uten den vinner author-CSS-ens
`display:grid` alltid over UA-stilarkets `[hidden]`-regel uavhengig av
spesifisitet — så `#ceremonyOverlay`/`#bridgeOverlay` lå usynlig
(`opacity:0`) men fullskjerm (`position:fixed;inset:0;z-index:200;
pointer-events:auto`) over **hele appen** til enhver tid, og fanget opp ALLE
klikk før de nådde sine mål. Dette var ikke begrenset til intro-modalen — det
var en app-bred klikkblokkering siden Fase 1b (2026-06-19 morgen). Forrige
sesjons "direkte knapp-handler"-fiks var et feilspor (CSS-bug, ikke JS-bug) og
er fjernet som virkningsløs død kode. Bekreftet via `elementFromPoint` og reelle
klikk i browser, både i og utenfor intro-modalen.

**Full code-review-pass** (5 parallelle reviewer-agenter per kjernefil + 9
uavhengige verifikasjonsagenter, alle CONFIRMED/PLAUSIBLE) avdekket og disse ble
fikset, med TDD (feilende test → fiks → grønn test) der logikken er dekket av
`tests/app.test.js`:

1. **`js/state.js`** — `migrateState()` kastet på ikke-array `plans`/`logs`
   (f.eks. korrupt/hånd-redigert localStorage), og `loadState()`s catch-all
   slukte feilen og nullstilte **hele** brukerens historikk uten varsel.
   Fikset: `Array.isArray`-guard på hvert `.map()`-kall + en siste
   normaliseringssjekk for `completed`/`logs`/`plans` (samme mønster som
   eksisterende quiz/mastery-sjekker).
2. **`js/snapshot.js`** — tre relaterte importfeil:
   a) Trunkering ved `MAX_PLANS`/`MAX_LOGS` kunne slette brukerens egne nyeste
      planer/logger i favør av eldre importerte data nær taket (ingen sortering
      før `.slice`). Fikset: sorter på `createdAt` (nyest først) før trunkering.
   b) Import beholdt alltid lokal logg ved id-kollisjon, selv om innkommende
      hadde nyere `updatedAt` (ekte redigering forsvant stille ved
      multi-enhet-bruk). Fikset: sammenlign `updatedAt`/`createdAt`, innkommende
      vinner kun hvis faktisk nyere. (Planer er bevisst ikke endret — ingen
      `updatedAt`-felt finnes der; egen vurdering om ønsket utenfor denne
      feilrettingens scope.)
   c) `completed`-merge revaliderte ikke forhåndseksisterende lokale id-er mot
      gyldige moduler (kun innkommende ble validert) — fjernet/omdøpte
      modul-id-er kunne ligge igjen for alltid. Fikset: filtrer lokal seed også.
3. **`js/quiz.js`** — modul-quiz med tom spørsmålspool falt tilbake til hele
   banken, men viste fortsatt modul-spesifikk label/mode (sovende bug, ikke
   utløsbar i dag siden alle 8 moduler har spørsmål — men reachable via
   "kjør samme økt igjen"-knappen hvis innhold endres). Fikset: korrigerer
   `mode`/`label` til "all"/"Alle moduler" når fallback trigges.
4. **`js/app.js`** — `closeOverlay()`s usporbare 200ms skjul-timer kunne
   tvangsgjemme et overlay som ble gjenåpnet innen 200ms (bekreftet
   reproduserbart via `#refSheet` — lukk kort 1, åpne kort 2 raskt). Fikset:
   `WeakMap` som sporer ventende timer per overlay, ryddet i både
   `openOverlay`/`closeOverlay`. Verifisert i browser (ikke unit-testbar —
   ingen DOM/timer-testinfrastruktur i `tests/app.test.js`).

**Bevisst IKKE fikset (dokumentert, ikke endring):**
- `assets/video/ambient.mp4` mangler på disk og i `service-worker.js`s
  `APP_SHELL` — krever at Per legger til selve videofilen; allerede notert i
  tidligere handoff.
- `service-worker.js`s `cache.addAll()` er alt-eller-ingenting (sårbar ved
  fremtidig filomdøping) — arkitekturrisiko, ikke en aktiv bug i dag. Rørt ikke
  per CLAUDE.md-regelen om å ikke gjøre tilfeldige SW-cache-endringer.
- Den lokale `__BUILD_HASH__`-placeholder-gotchaen (cache busts ikke ved
  `npx serve .` direkte fra repo-roten, kun via `build.sh`/`dist/`) er allerede
  kjent/dokumentert i service-worker.js sin egen kommentar — forårsaket
  forvirring i denne sesjonens debugging også. Husk: bruk hard refresh/SW-
  avregistrering ved lokal PWA-verifisering, eller test mot `dist/`.

**To uavhengige code-review-pass** (requesting-code-review) av hhv. batch 1
(CSS + state.js + snapshot.js) og batch 2 (quiz.js + app.js) — begge
"Ready to merge: Yes", ingen Critical/Important-funn.

**Checks:** `node --test tests/app.test.js` → 35/35 pass (8 nye tester, alle
skrevet RED→GREEN per TDD). `tsc -p jsconfig.json` → exit 0. `bash build.sh` →
exit 0, 22 filer, SW-cache `sporlab-e8-e9-dd3ad5ecd150`.

**Browser-verifisering (port 3000, SW aktiv):** Intro-modal Neste/Tilbake/Lukk
fungerer korrekt (native klikk/dispatchEvent — `preview_click`-MCP-verktøyets
egen klikk-simulering hadde en uavhengig timing-kvirk i denne previewen, ikke en
app-bug). Vanlig Hjem-knapp ("Les teori →") klikkbar igjen. `#refSheet`-race
verifisert løst (hidden/aria-hidden forblir false forbi det gamle 200ms-vinduet).

**Files changed:** `styles.css`, `js/app.js`, `js/state.js`, `js/snapshot.js`,
`js/quiz.js`, `tests/app.test.js`.

**Known issues / gjenstående:**
- Ingenting committet ennå — alt står i arbeidskopien på
  `fix/grundig-feilretting-juni2026`. Per må se gjennom og bestemme
  commit/merge/PR (se `finishing-a-development-branch`-vurdering nedenfor).
- Plan-import har fortsatt ingen "nyeste vinner"-logikk ved id-kollisjon (kun
  logger fikk denne, siden bare logger har `updatedAt`) — egen vurdering om
  ønsket senere.
- `service-worker.js`/`assets/video/ambient.mp4` urørt, se over.

**Next step:** Per gjennomgår diffen og velger commit/merge-strategi.

### 2026-06-19 — Claude Code — Debug intro modal click issue — branch `main`

**Task:** User reported intro modal buttons don't respond to clicks (Neste, Hopp over, X buttons).

**Investigation:**
- Diagnosed via systematic debugging (Phase 1 root cause investigation)
- Confirmed modal opens correctly and displays
- Confirmed click events reach buttons
- Confirmed HTML structure is correct, `closest()` selectors work as expected
- Discovered: delegated click event listener on #welcomeOverlay is NOT firing
- Verified: direct click handlers on buttons work when attached manually
- Verified: service worker cache cleared, issue persists
- Root cause: Event listener in `initWelcome()` is not being attached or not working

**Solution Applied:**
- Refactored `initWelcome()` to explicitly assign overlay element
- Added direct click handlers to buttons as fallback (wrapped functions to avoid event parameter issues)
- Code changes: `js/app.js` lines 3859-3877

**Testing:**
- All 27 unit tests pass
- Manual testing shows direct handlers still don't trigger properly (mysterious)
- Issue requires further investigation - may be related to module scope, event context, or something specific to Fase 1a redesign

**Known Issues:**
- Buttons appear to have handlers attached but clicks aren't advancing intro slides
- The delegated event listener on overlay element isn't working as expected
- Direct button handlers also not working despite manual verification that click events reach handlers
- Requires deeper investigation into app initialization order or event handling

**Recommended Next Step:**
- Check if Fase 1a refactoring changed something about the welcome overlay initialization  
- Verify if maybe buttons are being recreated dynamically after init
- Add console.log statements directly in the handler functions to verify they're being called
- Check for any CSS pointer-events restrictions or z-index issues
- May need to run in a full browser dev tools to step through the event flow
- Consider if there's a timing issue with when handlers are attached vs when modal opens

**Note:** Changes committed to main. Direct button handlers added as temporary fix attempt, but issue persists. Requires deeper investigation by next agent.

### 2026-06-19 — Claude Code — Lukk gjenstående punkter + push til origin/main — branch `main`

**Task:** Per ba om å fikse alt som gjensto fra forrige sesjons handoff og deploye
til slutt.

**Summary:**
- Fast-forward-merget `merge/origin-main` (`dda95b2`) inn i `main` — løser
  divergensen mot `origin/main` som ble flagget i forrige handoff. Ingen nytt
  innhold utover det som allerede var verifisert på den branchen.
- Stoppet en gjenglemt `claude-flow`-daemon-prosess (PID, startet fra et
  tidligere `npx ruflo`-forsøk) som holdt `ruflo/`-mappa låst, og slettet
  mappa. Repo-roten er nå ren for det urelaterte verktøyet.
- Committet `docs/superpowers/plans/2026-06-19-port-origin-features.md`
  (var untracked, men referert fra handoff-loggen) og samlede
  `.claude/settings.local.json`-tillatelser fra de siste sesjonene.
- Spurte Per om push mot `origin/main` skulle gjøres — fikk ja. `gh` CLI er
  ikke installert i dette miljøet, så det ble en direkte `git push` (bekreftet
  fast-forward, `origin/main` er forfar til ny `main`) i stedet for PR.
  Pushet `880b617..f9cc0f1` til `origin/main`.
- `npx wrangler deploy` feilet: ikke autentisert (`CLOUDFLARE_API_TOKEN`
  mangler, ikke-interaktivt miljø). Rørte ikke credentials/secrets (utenfor
  mandat). `DEPLOY.md` indikerer at Cloudflare har egen Git-integrasjon som
  bygger `main` automatisk — pushen til `origin/main` kan ha trigget et
  auto-deploy der, men dette er ikke bekreftet fra denne sesjonen.

**Checks:** `node --test tests/app.test.js` → 27/27 pass. `tsc -p
jsconfig.json` → exit 0. `bash build.sh` → exit 0, 22 filer.

**Files changed:** `docs/superpowers/plans/2026-06-19-port-origin-features.md`
(ny), `.claude/settings.local.json`, denne handoff-oppdateringen.

**Known issues:**
- Manuell `npx wrangler deploy` er ikke fullført. Per må enten køyre
  `wrangler login` interaktivt selv, eller sette `CLOUDFLARE_API_TOKEN` i
  miljøet, eller bekrefte at Cloudflares auto-deploy fra `origin/main` har
  tatt seg av det.
- Origins alternative «velg metode»-layout (kollapsbare `<details>`) i Aller
  første sporøkt ble ikke tatt med (presentasjonsvalg, ikke arkitektonisk) —
  uendret fra forrige sesjons notat.

**Next step:**
- Bekreft i Cloudflare-dashbordet om auto-deploy fra `origin/main` kjørte, ev.
  fullfør manuell deploy med gyldig token.
- Fyll inn `Deployment URL` i denne filen når deploy er bekreftet.

### 2026-06-19 — Claude Code — Merge origin/main — branch `merge/origin-main`

**Task:** Løse divergensen mellom lokal `main` og `origin/main` (30 vs. 16 commits)
med en reell `git merge` + konfliktløsning, og åpne PR mot `origin/main`. Oppfølging
av «Next step» fra forrige sesjons handoff (port/origin-features).

**Summary:**
- Branchet `merge/origin-main` fra `main` (ikke jobbet direkte på `main`).
- `git merge origin/main` ga konflikt i 4 filer: `content.js`, `index.html`,
  `js/app.js`, `styles.css` (22 konfliktblokker totalt). Alle gjaldt samme
  strukturelle motsetning: origins «buktende læringssti» + kortkarusell for
  Lær-modulen (`4c82396`, `b1c7977`, `eb73620`) mot vårt låste modul-grid +
  4-trinns stepper (Fase 1a/1b/1c).
- Løsning, jf. beslutningen fra forrige sesjon: `git checkout --ours` på alle
  4 filene. Verifiserte etterpå at `git diff main -- content.js index.html
  js/app.js styles.css` er **tom** — resultatet er byte-identisk med
  pre-merge `main` for disse filene. Origins kortkarusell/sti-kode er ikke
  med i historien videre.
- `js/state.js`, `service-worker.js`, `build.sh` hadde **ingen konflikt** og
  endret seg ikke i merge — bekrefter at forrige sesjons port
  (`port/origin-features`) allerede er identisk med origins implementasjon
  av disse filene.
- Origins rene dokumentasjonsfikser (Netlify→Cloudflare-referanser) ble tatt
  med automatisk (ingen konflikt): `README.md`, `testinstruks.md`,
  `ai-opplegg-notebooklm-sporlab.md`, `.claude/launch.json`.
- Merge-commit: `fe07b1f`.

**Checks:** `node --test tests/app.test.js` → 27/27 pass. `tsc -p
jsconfig.json` → exit 0. `bash build.sh` → exit 0, 22 filer bygget.

**Files changed:** Merge-commit (ingen nye innholdsendringer utover selve
mergen) + denne handoff-oppdateringen.

**Known issues / notert, ikke løst her:**
- Origin har en alternativ layout for «velg metode»-steget i Aller første
  sporøkt: kollapsbare `<details>`-elementer i ett kort, i stedet for våre
  separate kort per metode (`content.js`, rundt `renderGettingStarted`
  steg 2). Dette er et rent presentasjonsvalg, ikke en arkitektonisk
  konflikt — vurder om Per vil ta det som en egen, liten oppgave senere.
- `.claude/settings.local.json` har en uncommitted lokal endring (verktøy-
  tillatelser) som ikke er del av denne mergen — urørt med vilje.
- `ruflo/` fremdeles untracked i repo-roten, urelatert til SporLab.

**Next step:** Push `merge/origin-main` og åpne PR mot `origin/main`. Etter
merge til `origin/main`: bump service-worker-versjon ved neste deploy
(automatisert hash-versjonering tar normalt hånd om dette, men sjekk at
det reflekteres på Cloudflare).

### 2026-06-19 — Claude Code — Port av origin-funksjoner — branch `port/origin-features`

**Task:** Mens `redesign/fase-1a` var under arbeid, fikk `origin/main` 16 egne commits
(fra andre claude.ai/mobil-sesjoner) som lokal `main` ikke hadde. De to linjene hadde
divergert 16 commits hver vei med reelle strukturelle konflikter (begge siden skrev om
Lær-modul-visningen uavhengig av hverandre — vår låste modul-grid/stepper vs. origins
«buktende læringssti» + generisk kortkarusell). Etter gjennomgang valgte Per å beholde
vår `main` (med komplett, verifisert Fase 1a/1b/1c-navigasjon) som grunnmur, og heller
porte inn origins additive funksjoner separat — ikke en git-merge av de to historiene.

Utført med subagent-driven-development (skriftlig plan først, så en implementer- +
reviewer-subagent per oppgave). Plan: `docs/superpowers/plans/2026-06-19-port-origin-features.md`.

**Portet inn (7 oppgaver, 7 commits på `port/origin-features`):**
1. `state.js`: nytt felt `gettingStartedAnswers` (ingen SCHEMA_VERSION-bump — defensiv default følger eksisterende mønster).
2-3. `content.js`: kartleggingsspørsmål («Aller første sporøkt») gjort interaktive — avkrysningsbokser, skala-glidebryter, fritekstfelt (`renderGsQuestion`).
4. `styles.css`: styling for det nye spørsmålsoppsettet, gammel statisk `<ul>`-CSS fjernet.
5. `js/app.js`: kobler svarene til `state.gettingStartedAnswers`, lagrer på change/input/toggle.
6. `service-worker.js` + `build.sh`: automatisert cache-versjonering via `__BUILD_HASH__`-placeholder + sha256-hash i `build.sh` — erstatter min tidligere manuelle `v25`→`v26`-bump fra forrige sesjon.
7. Tilbakemeldingsmekanisme: ny dialog (topbar + innstillinger), sender via `mailto:` til `per.marstein@nrh.no`.

**Bevisst IKKE portet** (Per sin beslutning): origins «buktende læringssti»-visualisering,
generisk `renderCardCarousel`-basert modulvisning, og relaterte commits (`4c82396`,
`b1c7977`). Vår låste modul-grid + 4-trinns stepper fra Fase 1a/1c står som de er.

**Checks:** `node --test tests/app.test.js` → 27/27 pass etter hver oppgave. `tsc -p
jsconfig.json` → exit 0. `bash build.sh` → kjørt og verifisert (hash-substitusjon
bekreftet, ingen `__BUILD_HASH__`-rest i `dist/`). Manuell preview-verifisering
(kontroller, ikke subagent): tilbakemeldingsdialog åpner/lukker/chip-veksling/tekstfelt
fungerer; kartleggingssvar (avkryssing+skala+notat) lagres korrekt i
`state.gettingStartedAnswers` og overlever reload. Ingen konsollfeil.

**Files changed:** `js/state.js`, `content.js`, `styles.css`, `js/app.js`,
`service-worker.js`, `build.sh`, `index.html`.

**Known issues:**
- `main` og `origin/main` er fortsatt divergert (22 vs. 16 commits) — denne branchen
  (`port/origin-features`) er bygget fra lokal `main`, IKKE fra `origin/main`. Det betyr
  origins øvrige 16 commits (buktende sti, kortkarusell-modulvisning, m.fl.) er fortsatt
  ikke i denne historien — bevisst, se over. Før push til `origin/main` må Per ta stilling
  til hvordan dette skal håndteres på remote (egen PR som eksplisitt erstatter origins
  Lær-modul-tilnærming, eller annen strategi).
- `ruflo/`-katalogen i repo-roten kunne ikke slettes i forrige sesjon (låst av en prosess)
  — fortsatt der, untracked, urelatert til SporLab.

**Next step:**
- Review `port/origin-features` (7 commits) i preview, deretter merge til `main`.
- Avklar med Per hvordan divergensen mot `origin/main` skal løses før push til remote.
- Vurder å sjekke om `ruflo/` kan slettes nå (prosessen som låste den kan ha avsluttet).

### 2026-06-19 — Claude Code — Merge redesign/fase-1a til main — branch `main`

**Task:** Forberede og utføre merge av komplett redesign (Fase 1a + 1b + 1c) fra `redesign/fase-1a` til `main`.

**Summary:**
- Ryddet untracked `claude/`, `.claude/skills/`, `skills-lock.json` fra repo-roten (ruflo-avfallskoder).
- `ruflo/` kunne ikke slettes (låst av prosess) — kan gjøres manuelt senere.
- Final verifisering: 27/27 tester pass, ren typecheck, git status ren (bortsett fra `.claude/settings.local.json` uncommitted).
- Merged med `git merge --no-ff redesign/fase-1a` til main — bevarer branch-historikk.
- Merge-commit: `49e2ed0`.

**Checks:** Pre-merge tests pass, post-merge integration OK.

**Files changed:** `index.html`, `js/app.js`, `styles.css`, `AI_HANDOFF.md`, `AI_DECISION_LOG.md` — alle gjennom redesign/fase-1a merges.

**Known issues:**
- `ruflo/` fremdeles untracked i repo-roten (låst, kunne ikke slettes). Rydd når mulighet gis.
- `origin/main` ligger 16 commits foran lokal main (ikke sett siden merge). Pull/push kan være nødvendig før deploy.

**Next step:** 
- Bump service-worker-versjon fra v25 → v26 som egen deploy-oppgave (service worker cacher aggressivt).
- Push til origin (hvis ønskelig).
- Test i preview før deploy.

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
