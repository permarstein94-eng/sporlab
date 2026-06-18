# AI_TASK_TEMPLATE.md

Use these prompts when starting Claude Code or Codex.

Replace text inside `[brackets]`.

---

## Start Codex after Claude usage is empty

```text
Read AGENTS.md, AI_HANDOFF.md and AI_DECISION_LOG.md first.

Claude Code usage is currently unavailable. Continue safely from the latest handoff.

Your task is only:
[one narrow task]

Important:
- Do not assume hidden Claude context.
- Trust only repo files and git state.
- Inspect relevant files before editing.
- Keep the change narrow.
- Do not refactor unrelated code.
- Do not introduce dependencies unless strictly necessary.
- Run relevant checks:
  - node --test
  - npx -p typescript tsc -p jsconfig.json
  - bash build.sh
- Update AI_HANDOFF.md before finishing.
- Suggest a commit message.
```

---

## Start Claude Code — planning/review

```text
Read CLAUDE.md, AI_HANDOFF.md and AI_DECISION_LOG.md first.

You are in planning/review mode.

Task:
[describe the task]

Before editing anything:
1. Inspect the relevant files.
2. Explain the current state.
3. Identify risks.
4. Give me the smallest safe plan.

Do not make broad refactors.
Do not edit unrelated files.
Do not update dependencies unless necessary.
Do not push.
```

---

## Start Claude Code — implementation

```text
Read CLAUDE.md, AI_HANDOFF.md and AI_DECISION_LOG.md first.

You are in implementation mode.

Task:
[one narrow task]

Scope:
[what should be changed]

Out of scope:
[what must not be touched]

Rules:
- Make the smallest safe change.
- Preserve existing style.
- Do not refactor unrelated code.
- Do not introduce dependencies unless necessary.
- Be careful with localStorage, migrations, quiz/progression logic and service worker cache.
- Run relevant checks:
  - node --test
  - npx -p typescript tsc -p jsconfig.json
  - bash build.sh
- Update AI_HANDOFF.md before finishing.
- Suggest a commit message.
```

---

## Start Codex — implementation

```text
Read AGENTS.md, AI_HANDOFF.md and AI_DECISION_LOG.md first.

Your task is only:
[one narrow implementation task]

Before editing:
1. Inspect the relevant files.
2. State the current situation.
3. Propose the smallest safe implementation plan.

Then implement only that plan.

Rules:
- Do not refactor unrelated code.
- Do not introduce new dependencies unless strictly necessary.
- Do not touch secrets, deployment credentials or .env files.
- Do not change Cloudflare/Wrangler config unless this task is about deployment.
- Do not change localStorage schema without migration.
- Run relevant checks when possible:
  - node --test
  - npx -p typescript tsc -p jsconfig.json
  - bash build.sh
- Update AI_HANDOFF.md before finishing.
- Suggest a commit message.
```

---

## Claude reviews Codex branch

```text
Read CLAUDE.md, AI_HANDOFF.md and AI_DECISION_LOG.md first.

Review the current branch changes against main.

Do not edit yet.

Check for:
- Regressions
- Unrelated changes
- Overengineering
- Bad architecture
- Missing tests/checks
- Style inconsistencies
- Risky dependency/config changes
- PWA/service-worker risks
- localStorage migration risks
- Cloudflare deploy risks

Return:
1. Must fix
2. Should fix
3. Nice to have
4. Safe to merge: yes/no
5. Recommended next command
```

---

## Emergency repair

```text
Read CLAUDE.md or AGENTS.md, AI_HANDOFF.md and AI_DECISION_LOG.md first.

The repo may be in an unstable state.

Do not implement new features.

First:
1. Run git status.
2. Inspect recent diff.
3. Identify last known good commit from AI_HANDOFF.md.
4. Identify what is broken.
5. Recommend rollback, stash, targeted repair or branch isolation.

Do not delete work without explaining exactly what will be lost.
```

---

## End-of-session handoff instruction

```text
Before ending, update AI_HANDOFF.md with:
- Date/time
- Agent
- Branch
- Task
- Files changed
- What changed
- Commands run
- Results
- Known issues
- Recommended next step

Also update AI_DECISION_LOG.md if any durable project decision was made.
```
