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
   git add .agent/alignment/ && git commit -m "harvest: [pearl title]" && git push
   ```

---

## The Qualification Test

**Would this help an agent working on a completely unrelated project?**

| Qualifies | Does NOT qualify |
|-----------|-----------------|
| "Replace every sleep() with an observable wait condition" | "We fixed the FareHarbor login bug" |
| "Extract data from the DOM before triggering state changes" | "PAX count was 2 for tomorrow" |
| "Windows charmap crashes on Unicode in subprocess output" | "The email was sent to funinthesundocs@gmail.com" |
| "Always verify DOM element tags with a debug probe before writing selectors" | "The th.ng-table-header element holds the data" |

If it's project-specific, it belongs in the skill, NOT in pearls.

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
| Pearl too specific | Contains project names/filenames | Strip all specifics — apply the qualification test |
| Pearl too vague | "Be careful with code" | Must be actionable — "Use X instead of Y" or "Do X before Y" |
| Git push fails | No upstream configured | Run `git push --set-upstream origin main` first |

## Success Criteria

- [OK] New pearl(s) added to correct category table
- [OK] No project-specific details in any pearl
- [OK] No duplicates — existing similar pearls were promoted instead
- [OK] Line count comment updated
- [OK] Changes committed and pushed
