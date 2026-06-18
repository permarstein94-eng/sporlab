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

**Task title:** TODO  
**Owner/agent:** TODO  
**Branch:** TODO  
**Started:** TODO  
**Status:** Not started  

### Scope

TODO: What should be changed?

### Out of scope

TODO: What must not be touched?

---

## Latest handoff

**Date/time:** 2026-06-18  
**Agent:** ChatGPT setup  
**Branch:** TODO  

### What changed

- Created AI handoff system for Claude Code and Codex.
- System is customized for SporLab's static JS/PWA structure.
- Added strict rules for branches, checks, handoff, review and deployment safety.

### Files changed

- `CLAUDE.md`
- `AGENTS.md`
- `AI_HANDOFF.md`
- `AI_DECISION_LOG.md`
- `AI_TASK_TEMPLATE.md`
- `README_AI_SYSTEM.md`
- `scripts/ai-status.ps1`
- `scripts/ai-new-task.ps1`
- `scripts/ai-checkpoint.ps1`
- `scripts/ai-review.ps1`
- `scripts/ai-finish-task.ps1`
- `.github/pull_request_template.md`

### Commands run

```bash
# After installing, run:
node --test
npx -p typescript tsc -p jsconfig.json
bash build.sh
```

### Results

- TODO: Fill after first local run.

### Known issues

- TODO: Fill after first local run.

### Risks

- Service worker/cache changes can create stale deployed behavior.
- Local storage schema changes can break existing user data unless migrated.
- Content structure changes can break quiz/progression logic.
- Cloudflare deploy config should not be touched unless the task is specifically deployment.

### Recommended next step

- Install these files in repo root.
- Run `powershell -ExecutionPolicy Bypass -File .\scripts\ai-status.ps1`.
- Commit as `Add AI agent handoff system`.
- Start all future AI tasks from task branches.

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
