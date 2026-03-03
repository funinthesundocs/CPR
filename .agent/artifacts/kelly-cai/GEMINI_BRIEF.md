# Gemini Mission Brief — Kelly Cai Plaintiff Page
> Prepared by: Claude
> Date: 2026-03-01
> Skill reference: C:\Antigravity\CPR\.agent\skills\plaintiff-page-builder\SKILL.md

---

## Your Task

Build the plaintiff case page for Kelly Cai vs Colin James Bradley.
Follow SKILL.md exactly. This brief gives you all pre-loaded data so you don't need DB access.

---

## Codebase

```
C:\Antigravity\CPR\
```
Stack: Next.js 16.1.6, App Router, React 19, TypeScript, Tailwind v4, shadcn/ui
Icons: @heroicons/react/24/outline ONLY. No lucide-react. No emoji.

---

## Case Identity

| Field | Value |
|---|---|
| Case Number | C-0002 |
| Case ID | `e2ec2d49-e89a-4185-a70d-59586a5ddf3b` |
| Plaintiff Name | Kelly Cai (display name not yet set in DB — use "Kelly Cai") |
| Plaintiff ID | `a86a4af8-cba0-49cd-86bd-1ce5e1e43028` |
| Defendant Name | Colin James Bradley |
| Defendant ID | *(in case-data.json)* |
| Status | `pending` |
| Total Damages | $565,000 AUD |
| Created | *(in case-data.json)* |

---

## Local Artifact Files

All files are in: `C:\Antigravity\CPR\.agent\artifacts\kelly-cai\`

| File | Type | Use For |
|---|---|---|
| `infographic-landscape.jpg` | Infographic (2752×1536) — "Colin Bradley's Global Deception Map" | SECTION 03 + color extraction |
| `infographic-landscape-2.jpg` | Infographic (2752×1536) — "Global Timeline of Financial Exploitation" | SECTION 03 (secondary) |
| `slides.pdf` | Slide Deck PDF | SECTION 06 — PDF carousel |
| `podcast.mp3` | Audio Podcast — "The Half Million Dollar Phantom Wealth Scam" | SECTION 03 — audio button |
| `case-data.json` | Full DB export (case, defendant, financial, timeline, witnesses) | All sections |

---

## Notebook Summary (SECTION 05 — Case Summary Text)

> "These sources document the **systematic financial and emotional exploitation** allegedly carried out by **Colin "Cole" Bradley** across multiple countries, including **Australia, Thailand, the UAE, and Vietnam**. Through WhatsApp chat logs, bank statements, and legal documents, a group of victims led by Matt Campbell and Kelly are shown collaborating to build a collective timeline of his deceptions. The records reveal a consistent modus operandi involving false claims of a multi-million dollar family trust to solicit funds from romantic partners and business associates. Evidence indicates that Bradley's actions resulted in significant financial ruin for his victims, with one individual reporting losses exceeding $500,000. The group is now utilizing a Court of Public Record justice platform to consolidate testimony and warn others of his predatory behavior."

---

## Mind Map (SECTION 08)

Mind map JSON cannot be downloaded via MCP async. Two options:
1. **Preferred**: Use NotebookLM MCP directly — artifact_id `eb4037de-0338-4e7b-9291-9247e1a7f5a7`, notebook `86438ec8-ec42-4f4e-8331-fda2ed649053`
2. **Fallback**: Show `<ComingSoonPlaceholder section="Mind Map" />` — structure the section, mark for later

## Briefing Doc / Report (SECTION 05 — Full Report modal)

Report cannot be downloaded directly. Two options:
1. **Preferred**: Use NotebookLM MCP `notebook_query` to extract full report content from notebook `86438ec8-ec42-4f4e-8331-fda2ed649053`
2. **Fallback**: Use `case-data.json` → `case.story_narrative.body` + `case.betrayal_narrative` fields as the Detailed Analysis tab content

---

## Timeline Events (from case-data.json)

11 events — all from Brisbane/Australia, Thailand, Dubai, Vietnam. Pre-loaded in `case-data.json`.

Key events:
- 2019: Met on social media (Melbourne/Brisbane)
- 2020: Marriage + $300K investment
- 2020–2021: Building company collapse
- Early 2023: Cole moves to Thailand
- Nov 2023: Cole moves to Dubai, borrows $35K
- June 2024: Cole moves to Da Nang, Vietnam
- Late 2024: Discovers Cole with another woman (Sissy)

---

## Location Map Data (SECTION 09)

Fraud trail cities (in sequence):
1. Melbourne / Brisbane, Australia
2. Thailand
3. Dubai, UAE
4. Da Nang, Vietnam

Use Google Search grounding to get precise lat/lng for each.

---

## Key Design Decisions

- **Primary infographic for color extraction**: `infographic-landscape.jpg`
- **Status badge**: PENDING REVIEW (amber) — status is `pending`
- **Plaintiff photo**: None uploaded → generate abstract placeholder avatar
- **Defendant photo**: None uploaded → generate abstract placeholder avatar
- **Evidence vault**: 0 evidence files in DB → show empty state gracefully
- **Witnesses**: 4 witnesses → show count in SECTION 04 info box

---

## Four Info Boxes Data (SECTION 04)

| Box | Value |
|---|---|
| Known Aliases | "Cole Bradley", "Colin Cole Bradley" *(derive from case context)* |
| Business Name(s) | "Building company" *(case.betrayal_narrative — derive exact name)* |
| Years Active | 2019 – 2024 *(first to last timeline event)* |
| Witnesses | 4 on record |

---

## Output Location

```
src/app/cases/[slug]/plaintiff/[plaintiffId]/page.tsx
src/components/plaintiff-page/
```

Slug: `colin-james-bradley` *(or defendant slug from case-data.json)*
plaintiffId: `a86a4af8-cba0-49cd-86bd-1ce5e1e43028`

---

## Pre-flight Note

Case status is `pending` — pre-flight check will flag this. **Override for test run**: proceed with full build. The status badge will correctly display "PENDING REVIEW" which is accurate.

---

## Done When

Claude scores your output ≥ 96/100 on the quality checklist in SKILL.md Section 17.
