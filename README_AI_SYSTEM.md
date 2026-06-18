# SporLab AI Agent System

Dette er et ferdig system for å kunne veksle trygt mellom **Claude Code** og **Codex** i SporLab-repoet.

Kjernen:

> **Git er sannheten. Agentene er arbeidere. `AI_HANDOFF.md` er felles hukommelse.**

Repoet er en statisk PWA med ES-moduler, tester med `node --test`, typesjekk via `jsconfig.json`, og deploy til Cloudflare Workers Static Assets.

---

## Filer

| Fil | Formål |
|---|---|
| `CLAUDE.md` | Prosjektinstruksjoner for Claude Code |
| `AGENTS.md` | Prosjektinstruksjoner for Codex |
| `AI_HANDOFF.md` | Felles arbeidslogg mellom deg, Claude og Codex |
| `AI_DECISION_LOG.md` | Varige beslutninger om arkitektur, UX, deploy og struktur |
| `AI_TASK_TEMPLATE.md` | Ferdige prompts du limer inn i Claude/Codex |
| `scripts/ai-status.ps1` | Sjekker branch, git-status, filer og anbefalt neste steg |
| `scripts/ai-new-task.ps1` | Lager trygg task-branch |
| `scripts/ai-checkpoint.ps1` | Lager checkpoint-commit før bytte av agent |
| `scripts/ai-review.ps1` | Viser diff og status før review |
| `scripts/ai-finish-task.ps1` | Sjekkliste for å avslutte en oppgave |
| `.github/pull_request_template.md` | PR-mal med AI-sjekkpunkter |

---

## Installasjon i repoet

Pakk ut innholdet i denne pakken i roten av repoet:

```powershell
C:\Users\PerMarstein\Documents\Codex\2026-05-20\sporlab
```

eller den lokale mappen du bruker for SporLab.

Kontroller at du står i repo-roten:

```powershell
git status
dir
```

Du skal se blant annet:

```text
index.html
content.js
js
tests
README.md
DEPLOY.md
wrangler.jsonc
```

Deretter kjører du:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ai-status.ps1
```

---

## Daglig bruk

### 1. Før du starter Claude eller Codex

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ai-status.ps1
```

Hvis working tree er dirty: commit eller stash før du bytter agent.

---

### 2. Lag branch for ny oppgave

Codex-oppgave:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ai-new-task.ps1 -Agent codex -Task "fix quiz progress bug"
```

Claude-oppgave:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ai-new-task.ps1 -Agent claude -Task "review field logging flow"
```

Dette lager branch-navn som:

```text
codex/2026-06-18-fix-quiz-progress-bug
claude/2026-06-18-review-field-logging-flow
```

---

### 3. Gi agenten en smal oppgave

Bruk malene i `AI_TASK_TEMPLATE.md`.

Ikke skriv:

```text
Fortsett der vi slapp.
```

Skriv heller:

```text
Read AGENTS.md, AI_HANDOFF.md and AI_DECISION_LOG.md first.

Your task is only:
Fix the bug where quiz progress is not persisted after refresh.

Do not refactor unrelated code.
Run node --test and the typecheck command if possible.
Update AI_HANDOFF.md before finishing.
```

---

### 4. Før du bytter agent

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ai-checkpoint.ps1 -Message "Checkpoint after quiz progress fix"
```

Dette nekter å committe hvis det ikke finnes endringer.

---

### 5. Når Claude skal reviewe Codex

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ai-review.ps1 -BaseBranch main
```

Lim deretter inn review-prompten fra `AI_TASK_TEMPLATE.md`.

---

## Den strenge regelen

Ingen agent får starte uten å lese:

```text
AI_HANDOFF.md
AI_DECISION_LOG.md
CLAUDE.md eller AGENTS.md
```

Ingen agent får avslutte uten å oppdatere:

```text
AI_HANDOFF.md
```

Hvis varig beslutning er tatt:

```text
AI_DECISION_LOG.md
```

---

## Anbefalt rollefordeling

| Arbeid | Anbefalt agent |
|---|---|
| Bugfix | Codex |
| Skrive tester | Codex |
| Rydde typecheck/build-feil | Codex |
| Arkitekturvurdering | Claude Code |
| UX-/produktvurdering | Claude Code |
| Review av Codex-endringer | Claude Code |
| Større refaktor | Claude planlegger, Codex gjør én del om gangen |

---

## Merge-regel

En branch er ikke merge-klar før:

```powershell
node --test
npx -p typescript tsc -p jsconfig.json
bash build.sh
```

er kjørt, eller det er tydelig dokumentert hvorfor en kommando ikke kunne kjøres.

---

## Praktisk anbefaling for deg

Bruk denne rytmen:

```text
1. Claude planlegger eller reviewer.
2. Codex implementerer én konkret endring.
3. Codex oppdaterer AI_HANDOFF.md.
4. Du kjører checkpoint.
5. Claude reviewer diff.
6. Du merger først når test/typecheck/build er ryddig.
```

Det virker litt rigid. Bra. Det er poenget.
