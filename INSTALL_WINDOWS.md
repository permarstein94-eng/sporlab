# Installering på Windows

## 1. Pakk ut filene

Pakk ut innholdet i zip-filen direkte i roten av SporLab-repoet.

Riktig mappe er den som inneholder:

```text
index.html
content.js
README.md
DEPLOY.md
wrangler.jsonc
js
tests
```

## 2. Sjekk status

Åpne terminal i repoet og kjør:

```powershell
git status
powershell -ExecutionPolicy Bypass -File .\scripts\ai-status.ps1
```

## 3. Kjør tester/typecheck/build

```powershell
node --test
npx -p typescript tsc -p jsconfig.json
bash build.sh
```

Hvis `bash build.sh` ikke fungerer i PowerShell, kjør kommandoen i Git Bash.

## 4. Commit systemet

```powershell
git add CLAUDE.md AGENTS.md AI_HANDOFF.md AI_DECISION_LOG.md AI_TASK_TEMPLATE.md README_AI_SYSTEM.md INSTALL_WINDOWS.md scripts .github
git commit -m "Add AI agent handoff system"
git push
```

## 5. Start første AI-oppgave

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ai-new-task.ps1 -Agent codex -Task "describe first narrow task here"
```

## 6. Før bytte mellom Claude og Codex

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ai-checkpoint.ps1 -Message "Checkpoint before switching agent"
```

## 7. Review Codex med Claude

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\ai-review.ps1 -BaseBranch main
```

Lim deretter review-prompten som skriptet skriver ut inn i Claude Code.
