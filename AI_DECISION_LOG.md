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
