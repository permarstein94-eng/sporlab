# AGENTS.md

## Project

SporLab E8/E9 is a static JavaScript PWA for learning and field use around E8 Sporoppsøk and E9 Spor.

The repository appears to use:
- Static HTML/CSS/JS
- ES modules
- `content.js` for learning/quiz content
- `js/state.js` for state, persistence and migrations
- `js/utils.js`
- `js/snapshot.js`
- `js/quiz.js`
- `js/app.js`
- `service-worker.js`
- `manifest.webmanifest`
- `wrangler.jsonc`
- `build.sh`
- Tests in `tests/` using Node's built-in test runner
- JS typecheck via `jsconfig.json`

## Required startup routine

Before editing anything:

1. Read `AI_HANDOFF.md`
2. Read `AI_DECISION_LOG.md`
3. Inspect relevant files
4. Inspect `README.md`, `DEPLOY.md`, `jsconfig.json`, `wrangler.jsonc`, or `build.sh` if relevant

Then state:

- What you believe the task is
- Which files are likely involved
- The smallest safe plan
- Any risk or uncertainty

## Hard rules

- One task at a time.
- Keep changes small.
- Do not work directly on `main` unless explicitly told.
- Do not edit unrelated files.
- Do not perform broad refactors.
- Do not introduce dependencies unless strictly necessary.
- Do not change deploy config unless the task is about deploy.
- Do not touch secrets, `.env`, tokens or credentials.
- Do not push or force-push.
- Do not change localStorage schema without a migration.
- Do not casually alter service worker cache behavior.
- Update `AI_HANDOFF.md` before finishing.

## Preferred implementation approach

1. Understand existing patterns.
2. Reuse current modules and naming.
3. Make the smallest safe change.
4. Add/update tests when touching tested logic.
5. Run relevant checks.
6. Document results.

## Required checks

Run these when relevant:

```bash
node --test
npx -p typescript tsc -p jsconfig.json
bash build.sh
```

If a command fails, report the exact failure and whether it appears related to your change.

If a command does not exist or cannot run in the environment, document that in `AI_HANDOFF.md`.

## Review behavior

If asked to review:

1. Inspect the diff.
2. Categorize findings:
   - Must fix
   - Should fix
   - Nice to have
3. Say whether it is safe to merge.
4. Do not rewrite unless asked.

## Finish routine

Update `AI_HANDOFF.md` with:

- Date/time
- Agent: Codex
- Branch
- Task
- Files changed
- What changed
- Commands run
- Results
- Known issues
- Recommended next step

Update `AI_DECISION_LOG.md` if a durable decision was made.

## Stop conditions

Stop and ask for direction if:

- The task requires a large rewrite
- There are uncommitted changes from another agent
- The branch contains unrelated changes
- A check fails for unclear reasons
- You find possible secrets or credentials
- You need to change deployment behavior but the task did not request it
