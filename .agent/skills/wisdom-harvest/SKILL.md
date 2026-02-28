---
name: wisdom-harvest
description: End-of-session retrospective that extracts generalizable principles (pearls of wisdom) from the current session and adds them to .agent/alignment/pearls.md. Use when the user says "harvest", "extract pearls", or at the end of any session that involved iterative problem-solving.
---

# Wisdom Harvest

> **Canonical implementation lives at `~/.claude/commands/harvest.md`.**
> That file is the single source of truth for the harvest process.
> Invoke via `/harvest` — it auto-detects Pearl Table Mode when `.agent/alignment/pearls.md` exists.

## Quick Reference

**Pearl destination:** `.agent/alignment/pearls.md`
**Format:** table rows, one per category table
**Quality gate:** 3-gate test (Non-obvious · Pain-tested · Transferable) — all three required
**Maturity:** Seed (new) → Confirmed (2+ sessions) → Established (3+ or ratified)
**Pruning threshold:** 40 rows — see Pruning Guide at top of pearls.md

## Pearl Row Format

```markdown
| [short title] | [one-sentence actionable rule — "Use X instead of Y" or "Do X before Y"] | Seed | YYYY-MM-DD | 0 |
```

Hard constraints:
- Rule = one sentence, always actionable
- No project names, client names, or filenames in the rule
- `Uses` starts at 0; incremented by harvest when ⚡ invocation logs are found

## The 3-Gate Test

| Gate | Question | Rock if... |
|------|----------|------------|
| **Non-obvious** | Would a competent agent get this wrong by default? | Any reasonable agent already knows this |
| **Pain-tested** | Did violating this cost real debugging time? | Fix took < 30 seconds |
| **Transferable** | Does this apply to 3+ fundamentally different types of work? | Only helps one narrow domain |

**Litmus test:** Find it on Stack Overflow in 10 seconds? Rock. Wish you'd known it an hour earlier? Pearl.

## Pearl Invocation Logging

During a session, whenever a pearl prevents a mistake or shapes a decision, log it:

```
⚡ Pearl invoked: "[Pearl Title]" — [what you were about to do and what you did instead]
```

The harvest process scans for these logs and increments `Uses` counters automatically.

## First-Time Setup

If `.agent/alignment/pearls.md` does not exist, create it with:

```markdown
# Organizational Pearls of Wisdom

> General principles extracted from real work sessions. These apply to ALL future work regardless of project.
> Maintained by the `wisdom-harvest` skill (see `.agent/skills/wisdom-harvest/SKILL.md`).
```

Then run `/harvest` to begin populating it.
