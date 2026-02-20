# Organizational Pearls of Wisdom

> General principles extracted from real work sessions. These apply to ALL future work regardless of project.
> Maintained by the `wisdom-harvest` skill (see `.agent/skills/wisdom-harvest/SKILL.md`).

---

## How to Log a Pearl Invocation

When a pearl **prevents a mistake or shapes a decision**, log it inline in your response:

```
⚡ Pearl invoked: "[Pearl Title]" — [one sentence on what you were about to do and what you did instead]
```

The harvest process reads these logs and increments the `Uses` counter for that pearl.
**This is how the system learns which pearls earn their keep.**

---

## Pruning Guide (when pearls exceed 40 rows)

Prune in this order — lowest score = first to go:

| Score | Criteria |
|-------|----------|
| 0 pts | Uses = 0 |
| +1 pt | Maturity ≥ Confirmed |
| +2 pts | Maturity = Established |
| +1 pt | Uses ≥ 2 |
| +2 pts | Uses ≥ 5 |

**Never prune:** Established pearls with Uses ≥ 1. **Always prune first:** Seed + Uses = 0 + Added > 90 days ago.

---

## Browser Automation

| Pearl | Rule | Maturity | Added | Uses |
|-------|------|----------|-------|------|
| Verify DOM before selecting | Run a debug probe to dump actual element tags and classes before writing any selector — assumptions about DOM structure are the #1 cause of silent failures | Established | 2026-02-19 | 0 |
| Extract before transform | Read all data from the DOM before clicking buttons that trigger CSS changes, page transitions, or layout shifts — state transforms destroy evidence | Established | 2026-02-19 | 0 |
| Observable waits only | Replace every sleep() or fixed delay with a condition that checks actual observable state — magic numbers are lies that work today and fail tomorrow | Established | 2026-02-19 | 0 |

## Windows Compatibility

| Pearl | Rule | Maturity | Added | Uses |
|-------|------|----------|-------|------|
| ASCII-only subprocess output | Never use Unicode characters (checkmarks, arrows, emoji) in print() statements that run inside subprocesses — Windows charmap encoding will crash | Established | 2026-02-19 | 0 |
| Declare OS and path format | Explicitly state the target OS and path style in every skill or instruction — models default to their training bias (usually Linux) and silently produce wrong commands | Established | 2026-02-19 | 0 |
| PowerShell multi-line -m hangs silently | Never use embedded newlines inside a git commit -m "..." on PowerShell — the shell enters multi-line input mode and the command produces no output while appearing to still run | Seed | 2026-02-20 | 1 |

## Iterative Refinement

| Pearl | Rule | Maturity | Added | Uses |
|-------|------|----------|-------|------|
| Recursive self-critique with a target | Set a numeric satisfaction threshold (e.g., 93%) and iterate until you reach it — open-ended "make it better" loops never converge | Established | 2026-02-19 | 0 |
| Additive enhancement only | After each test or iteration, add what you learned to the documentation — never remove existing rules, only add new ones | Established | 2026-02-19 | 0 |
| Consistency grep after every change | After modifying any code or documentation, grep the entire file for stale references to the old approach — one contradictory line wastes more debugging time than no documentation | Established | 2026-02-19 | 0 |
| Curated knowledge drifts without audits | Any curated knowledge base (pearls, codebase, test suite, docs) slowly accumulates low-quality entries unless a scheduled quality-review pass is built into the process | Seed | 2026-02-19 | 0 |

## General Engineering

| Pearl | Rule | Maturity | Added | Uses |
|-------|------|----------|-------|------|
| Never assume response format | When consuming output from any external system (model API, CLI tool, webhook), parse the structured content out of the raw response before executing — raw output always contains wrapper formatting that will break downstream commands | Confirmed | 2026-02-19 | 0 |
| Dense formats scale better | When designing a living document with a token budget, choose the densest readable format (tables > heading blocks) because format density determines how much knowledge fits before you hit limits | Seed | 2026-02-19 | 0 |
| Append-only for merge safety | Design shared files so edits are row appends rather than in-place modifications — this makes concurrent contributor merge conflicts trivial to resolve | Seed | 2026-02-19 | 0 |
| Externalized judgment scales capability | Writing judgment criteria into a document (gates, contrast examples, litmus tests) lets mid-tier models perform tasks that otherwise require frontier models — the quality ceiling shifts with the quality of the framework, not just the model | Seed | 2026-02-19 | 0 |
| Flat columns over JSONB blobs | Store form submission fields as individual named columns rather than JSONB objects — display pages reference flat columns directly, while JSONB field renames break silently at runtime with no build error | Confirmed | 2026-02-20 | 0 |
| JSONB fields are TypeScript-invisible | A field name mismatch inside a JSONB column compiles clean with zero TypeScript errors but renders nothing at runtime — grep every display page for JSONB key references after any schema change | Seed | 2026-02-20 | 0 |

## Frontend & Full-Stack

| Pearl | Rule | Maturity | Added | Uses |
|-------|------|----------|-------|------|
| Audit display pages after form redesign | Whenever a data entry form's schema is redesigned, immediately audit every page that reads its submitted data — stale field references render nothing silently with no compile-time error | Seed | 2026-02-20 | 0 |
| HMR skips module-level constants | Any value computed at module load time requires a full dev server restart to reflect source file changes — hot reload only patches component boundaries, not module-scope initialization | Seed | 2026-02-20 | 0 |
| i18n key mismatches invisible at build time | A missing translation key returns the raw key string at runtime with zero build warnings — grep the translation file for every t() call after adding new keys to a component | Seed | 2026-02-20 | 0 |
| Dead HMR connection silences all new files | When a dev server's WebSocket HMR connection drops, new source files are never delivered to the browser — always restart the dev server when changes appear absent and the console shows WebSocket failures | Seed | 2026-02-20 | 0 |
| False-default gates hide UI on first render | A React boolean state that gates UI visibility should default to `true` (then disable if unsupported), not `false` (then enable if supported) — the false-default causes a blank first render that persists if the enabling effect never fires | Seed | 2026-02-20 | 0 |
| Check capability lazily not eagerly | Detect browser capabilities (microphone, camera, geolocation, clipboard) on first user interaction rather than on component mount — eager detection causes blank UI if the async check races with the first render | Seed | 2026-02-20 | 0 |

## Database & Auth

| Pearl | Rule | Maturity | Added | Uses |
|-------|------|----------|-------|------|
| Check triggers before assuming INSERT fails | Before concluding a NOT NULL column with no visible default will break an INSERT, query pg_trigger for that table — a BEFORE INSERT trigger may auto-populate it silently | Seed | 2026-02-20 | 0 |
| RLS self-referencing join is always true | A WHERE join that compares a table alias to itself (e.g. cp.id = cp.id) creates a constant-true condition, silently granting every row to every user — always verify every join predicate references a different table | Seed | 2026-02-20 | 0 |
| RLS-disabled can be intentional for catalog tables | RBAC configuration tables (roles, permissions, mappings) legitimately disable RLS because all users need read access — flag disabled-RLS as a finding but verify intent before treating it as a vulnerability | Seed | 2026-02-20 | 0 |
