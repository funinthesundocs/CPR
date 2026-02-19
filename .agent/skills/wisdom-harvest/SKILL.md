---
name: wisdom-harvest
description: End-of-session retrospective that extracts generalizable principles (pearls of wisdom) from the current session and adds them to the collective alignment folder. Use when the user says "harvest", "extract pearls", or at the end of any session that involved iterative problem-solving.
---

# Wisdom Harvest — Pearl Extraction

> Extract general principles from this session. Strip all project details. Write rules that help agents on completely unrelated future work.

## Run It

At the end of a session, the user says "harvest" or "extract pearls." Follow the process below.

## The Harvest Process

1. **Retrospective scan** — Review the session's key decisions, failures, fixes, and iterations
2. **Extract candidates** — Identify moments where a general principle was learned (not project-specific outcomes)
3. **Generalize** — Strip project names, client names, filenames. Rewrite as a universal one-sentence rule
4. **Dedup check** — Read `.agent/alignment/pearls.md` and check if a similar pearl already exists
5. **Write or promote** — If new, add as a Seed row in the appropriate category table. If similar exists, promote its maturity level (Seed → Confirmed → Established)
6. **Update line count** — Update the `<!-- XX lines / ~150 max -->` comment at the top of `pearls.md`
7. **Git sync** — Commit and push:
   ```powershell
   git add .agent/alignment/; git commit -m "harvest: [pearl title]"; git push
   ```

---

## The Pearl Quality Gate

> [!CAUTION]
> A pearl is NOT just a useful fact. It is a **principle that changes behavior** — something that, had you known it beforehand, would have prevented real lost time.

**Every candidate must pass ALL THREE gates. If it fails any one, discard it.**

| Gate | Question | Fail = Rock |
|------|----------|-------------|
| **Non-obvious** | Would a competent agent get this wrong by default? | If any reasonable agent would already know this, it's a lookup, not wisdom |
| **Pain-tested** | Did violating this cause real debugging time, not just a quick retry? | If the fix took < 30 seconds, it's trivia |
| **Transferable** | Does this principle apply to 3+ fundamentally different types of work? | If it only helps one narrow domain, it belongs in a skill, not in pearls |

### Pearls vs Rocks — learn the difference

| Pearl (passes all 3 gates) | Rock (fails at least 1) | Which gate fails? |
|---------------------------|------------------------|-------------------|
| "Extract data from DOM before triggering state changes" | "PowerShell uses semicolons not &&" | Non-obvious: any developer can look this up |
| "Set a numeric satisfaction threshold — open-ended loops never converge" | "git pull doesn't delete untracked files" | Pain-tested: no debugging time lost, just a momentary scare |
| "Design shared files as append-only to prevent merge conflicts" | "Nested markdown code fences break rendering" | Transferable: only applies to markdown authoring |

If it's a **fact you could find on Stack Overflow in 10 seconds**, it's a rock. Discard it.
If it's a **principle you wish someone had told you before you wasted an hour**, it's a pearl. Keep it.

---

## Pearl Format

Pearls live in a **table per category** inside `pearls.md`:

```markdown
## [Category Name]

| Pearl | Rule | Maturity | Added |
|-------|------|----------|-------|
| [short title] | [one-sentence actionable rule] | Seed/Confirmed/Established | [date] |
```

### Hard constraints

- **Rule must be one sentence.** If you can't say it in one sentence, it's two pearls.
- **No project names, client names, or specific filenames** in the Rule or title.
- **Context goes as an HTML comment** below the table only if non-obvious: `<!-- browser scraping task -->`

---

## Maturity Model

| Level | Criteria | Agent should... |
|-------|----------|-----------------|
| **Seed** | First observation | Consider it |
| **Confirmed** | Seen independently in 2+ sessions | Follow it |
| **Established** | 3+ sessions or ratified by human | Treat as law |

> [!IMPORTANT]
> If a similar pearl already exists, **promote its maturity** instead of adding a duplicate. Change its maturity level in the existing row.

---

## Category Guide

Add pearls to existing categories when possible. Create new categories only when no existing one fits.

Starter categories (expand as needed):
- **Browser Automation** — Selenium, DOM, scraping, headless Chrome
- **API Integration** — HTTP calls, authentication, webhooks, email APIs
- **Multi-Model Dispatch** — Agent orchestration, model selection, dispatch patterns
- **Windows Compatibility** — Encoding, paths, subprocess, OS-specific issues
- **Documentation & Skills** — Skill authoring, knowledge management, templates
- **General Engineering** — Architecture, dependencies, error handling, testing

---

## Critical Rules

- **Never add project-specific details** — strip everything. The pearl must be universal.
- **One sentence per rule** — if it needs two sentences, it's two pearls.
- **Check for duplicates FIRST** — read the entire `pearls.md` before adding anything.
- **Promote, don't duplicate** — if a similar pearl exists at a lower maturity, upgrade it.
- **Update the line count comment** at the top of `pearls.md` after every harvest.
- When `pearls.md` approaches **~150 lines**, warn the user it's time to split into domain files under `.agent/alignment/domains/`.

---

## Error Table

| Error | Cause | Fix |
|-------|-------|-----|
| Duplicate pearl added | Didn't read existing pearls first | Always read full `pearls.md` before step 5 |
| Pearl too specific | Contains project names/filenames | Strip all specifics — apply the 3-gate test |
| Pearl too vague | "Be careful with code" | Must be actionable — "Use X instead of Y" or "Do X before Y" |
| Rock slipped through | Passed the old loose test but fails a gate | Re-check: Non-obvious? Pain-tested? Transferable? Remove if it fails any |
| Git push fails | No upstream configured | Run `git push --set-upstream origin main` first |

## Success Criteria

- [OK] Every pearl passes ALL THREE quality gates (Non-obvious, Pain-tested, Transferable)
- [OK] New pearl(s) added to correct category table
- [OK] No project-specific details in any pearl
- [OK] No duplicates — existing similar pearls were promoted instead
- [OK] Line count comment updated
- [OK] Changes committed and pushed
