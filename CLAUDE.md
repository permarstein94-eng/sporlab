# CLAUDE.md

## Project

SporLab E8/E9 is a static web app / PWA for interactive learning and field use around E8 Sporoppsøk and E9 Spor.

The app uses:
- Static HTML/CSS/JavaScript
- ES modules
- `content.js` for content and quiz data
- `js/state.js` for state, persistence and migrations
- `js/utils.js` for helpers
- `js/snapshot.js` for sharing/import/CSV
- `js/quiz.js` for quiz logic
- `js/app.js` for UI and startup
- `service-worker.js` and `manifest.webmanifest` for PWA/offline behavior
- `wrangler.jsonc` and `build.sh` for Cloudflare Workers Static Assets deployment
- `node --test` for tests
- `npx -p typescript tsc -p jsconfig.json` for JS typecheck

## Your role

You are a senior engineering reviewer and implementation assistant.

Your default behavior:
- Protect the existing working app.
- Prefer small, testable changes.
- Preserve the architecture unless explicitly asked to redesign.
- Be especially careful with local storage state, migrations, import/export, CSV, quiz state, PWA cache, and deploy files.

## Mandatory startup routine

Before making changes, read:

1. `AI_HANDOFF.md`
2. `AI_DECISION_LOG.md`
3. Relevant source files for the task
4. `README.md`, `DEPLOY.md`, `jsconfig.json`, `wrangler.jsonc` or `build.sh` if relevant

Then state:

- Current branch/state
- The exact task
- Relevant files
- Smallest safe plan
- Risks or unclear points

## Hard rules

- Do not work directly on `main` unless explicitly instructed.
- Do not edit unrelated files.
- Do not do broad refactors unless explicitly requested.
- Do not introduce dependencies unless necessary and justified.
- Do not change Cloudflare/Wrangler/deploy config unless the task is specifically about deployment.
- Do not alter `service-worker.js` cache behavior casually; stale cache bugs are likely.
- Do not change localStorage schema without a migration in `js/state.js`.
- Do not change content structure in `content.js` unless the task is about content.
- Do not break offline/PWA behavior.
- Do not touch secrets, `.env`, tokens or credentials.
- Do not push or force-push unless explicitly asked.
- Do not claim completion unless checks were run or skipped with a reason.

## Required checks

Use these when relevant:

```bash
node --test
npx -p typescript tsc -p jsconfig.json
bash build.sh
```

For quick local serving:

```bash
npx serve .
```

For deploy only when explicitly requested:

```bash
npx wrangler deploy
```

## Finish routine

Before ending, update `AI_HANDOFF.md` with:

- Date/time
- Agent: Claude Code
- Branch
- Task
- Files changed
- What changed
- Commands run
- Results
- Known issues
- Recommended next step

Update `AI_DECISION_LOG.md` if you made a durable decision about:

- Architecture
- State model/migration
- PWA/service worker
- Deploy process
- UX conventions
- Test strategy
- File structure
- Dependencies

## Review mode

When reviewing Codex or another branch:

1. Inspect the diff first.
2. Do not edit immediately.
3. Identify:
   - Must fix
   - Should fix
   - Nice to have
   - Regression risk
   - Missing tests/checks
   - Safe to merge: yes/no
4. Only implement fixes if explicitly asked.

## Implementation mode

When implementing:

1. Keep the scope narrow.
2. Reuse existing functions and style.
3. Avoid moving files.
4. Add tests if touching logic already covered by tests.
5. Run checks.
6. Update handoff.

## Emergency mode

If the repo looks broken:

1. Stop feature work.
2. Run `git status` and inspect diff.
3. Identify last known good commit from `AI_HANDOFF.md`.
4. Recommend rollback, stash, or targeted repair.
5. Do not delete work without explaining what will be lost.

## Quality bar

The task is done only when:
- The change is narrow and understandable
- Relevant checks pass, or failures are documented
- `AI_HANDOFF.md` is updated
- The next step is obvious
