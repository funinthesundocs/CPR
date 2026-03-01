# Plaintiff Page Skill — Design Specification
> Status: COMPLETE — All design decisions confirmed
> Last updated: 2026-03-01
> Do NOT delete. This is the source of truth for the plaintiff-page-builder skill.

---

## 1. Purpose

A universal skill any agent can follow to build a stunning, individualized, yet
structurally consistent plaintiff case page for Court of Public Record (CPR).
The skill converts NotebookLM artifacts + Supabase case data into a living webpage.

Primary execution agent: Gemini 2.5 Pro (best at visual design + multimodal analysis)
Architect/spec author: Claude (this file)
Reviewer: Claude (reviews Gemini output against 96% quality checklist)
Skill must be: agent-agnostic (any LLM can follow it)

---

## 2. The Full Pipeline

```
Plaintiff fills form (or AI interview — future)
         ↓
Supabase stores testimony + evidence
         ↓
Admin reviews case → approves
         ↓
Convergence check: 2+ independent plaintiffs required to go LIVE
         ↓
Pipeline fires automatically on admin approval + convergence met
         ↓
NotebookLM API creates per-plaintiff notebook
  • All plaintiff files → plaintiff notebook
  • All plaintiff files from ALL plaintiffs → defendant notebook (aggregated)
         ↓
NotebookLM generates artifacts:
  • Infographic (visual identity for the page)
  • Audio podcast (2-person interview)
  • Mind map (JSON structure)
  • Report / Briefing Doc (full analysis)
  • Notebook summary (short paragraph above chat window)
  • Timeline
  • Slide deck
         ↓
Artifacts stored in Supabase Storage buckets
  • Per-plaintiff bucket
  • Per-defendant bucket (aggregated)
         ↓
Page-building skill fires
Agent reads artifact folder + Supabase data
         ↓
Builds plaintiff page (this skill)
```

---

## 3. Storage Architecture

- **Per-plaintiff bucket**: All files for one plaintiff's case
- **Per-defendant bucket**: Aggregated files from ALL plaintiffs against that defendant
- Both buckets feed their respective NotebookLM notebooks
- Artifacts delivered back to buckets after NotebookLM generates them

---

## 4. Trigger Conditions

Page generation fires ONLY when:
1. Admin has approved the case (moved from `pending`)
2. Convergence is met (2+ independent plaintiffs on same defendant)
3. NotebookLM artifacts are ready in the bucket

No API credits wasted on pending/unverified cases.

---

## 5. Artifact Treatment Rules

### Infographic
- **Primary**: Agent interprets infographic → rebuilds as superior code component
- **Secondary**: Agent converts JPEG → SVG (web-native, SEO-friendly, non-stealable)
- **Fallback**: Display original JPEG if agent output is inferior
- Quality decides the format — not ideology
- Used as: visual design inspiration for color palette, aesthetic language, layout density

### Audio Podcast (2-person NotebookLM interview)
- Treatment: Button on hero section → launches floating/minimizable audio player
- Does NOT autoplay
- Player can be minimized and persist while user scrolls

### Mind Map
- NotebookLM does NOT support iframe embed or URL sharing
- Export format: JSON (node/branch structure)
- Treatment: Download JSON via MCP → agent rebuilds as interactive node visualization in code
- Must match or exceed visual quality of the NotebookLM original
- Suggested libraries: react-flow, D3.js, or custom SVG
- Lives in its own dedicated section on the page

### Report / Briefing Doc
- NOT displayed as a document
- Feeds the content of the Case Summary section (see Section 6)

### Notebook Summary (the short paragraph above NotebookLM chat window)
- This is the CASE SUMMARY displayed on the page
- Pulled via: `mcp__notebooklm-mcp__notebook_describe` → `summary` field
- Short, AI-synthesized, clean
- Displayed first in the Case Summary section

### Slide Deck
- Source: NotebookLM slide deck artifact downloaded as PDF → stored in Supabase bucket
- **Treatment: PDF carousel viewer** (NOT rebuilt in code)
  - Rationale: slides contain custom visual design by NotebookLM — preserving that is the goal
  - Library: `react-pdf` / `pdfjs-dist` — renders each PDF page as a crisp canvas element
- The carousel component is standardized and premium across all pages:
  - Full-bleed dark section background
  - Centered slide display, large and readable
  - Previous / Next navigation arrows
  - Slide counter (e.g. "3 / 12")
  - Smooth transition animation between slides
  - Fullscreen button — expands to lightbox mode
  - Keyboard navigation (arrow keys)
  - Swipe support on mobile
- The *container* visual treatment may vary per case (colors, section background)
- The *slides themselves* are NotebookLM's output — not modified

### Timeline
- Generated from NotebookLM data
- Built as interactive horizontal-scroll timeline in code
- CRITICAL CONSTRAINT: Must be fully isolated — previous horizontal timeline
  implementation broke z-axis, sidebar overlap, and hero centering
- Must NOT affect page z-index stack
- Must NOT overflow into sidebar
- Horizontal scroll contained within its own scroll context

---

## 6. Case Summary Section — Detailed Spec

```
┌─────────────────────────────────────────────────┐
│  [Notebook Summary paragraph]                   │
│  Short AI synthesis from NotebookLM             │
│                                                 │
│  [ View Full Report ]  [ Original Testimony ]   │
└─────────────────────────────────────────────────┘
         ↓ "View Full Report" opens:
┌─────────────────────────────────────────────────┐
│  FULL SCREEN MODAL                              │
│  Tab 1: "Detailed Analysis"                     │
│    → Full NotebookLM Briefing Doc content       │
│  Tab 2: "Original Testimony"                    │
│    → Plaintiff case form rendered read-only     │
│    → Exact words, no AI, no editing possible    │
│    → Same form UI, all fields locked            │
└─────────────────────────────────────────────────┘
```

"Original Testimony" is the sacred record. No AI interpretation. No editing.
Exact word-for-word capture of what the plaintiff submitted.

---

## 7. Page IA Section Order — COMPLETE

```
01  HERO — "Plaintiff vs Defendant" boxing poster (hard diagonal split)
02  HERO TEXT — Names + AI tagline + prominent status badge
03  STORY INFOGRAPHIC — with audio button overlay → floating player
04  FOUR INFO BOXES — Alias | Business | Years Active | Witnesses
05  CASE SUMMARY MODULE — Notebook summary + modal (Full Report / Original Testimony)
06  SLIDE DECK — NotebookLM slide deck rendered as PDF carousel
07  CASE TIMELINE — Horizontal scroll, isolated, database-driven, bidirectional evidence links
08  MIND MAP — Rebuilt from JSON, interactive
09  LOCATION MAP — react-map-gl + MapLibre, animated trail between crime locations
10  EVIDENCE VAULT — All documents/media, each tagged to timeline event
11  INLINE VOTING — Dual-verdict system (gut instinct + social verdict)
12  FOOTER
```

---

### Section Detail: 01 — Hero

- **Layout**: Hard diagonal split — left half plaintiff, right half defendant
  - Diagonal divider cuts through center at ~15° angle (CSS clip-path)
  - Left side: plaintiff photo, labeled "PLAINTIFF" in uppercase
  - Right side: defendant photo, labeled "DEFENDANT" in uppercase
  - Both sides tinted with infographic-extracted accent color
- **All 4 animations active**:
  1. **Entrance**: Each photo slides in from its edge on page load — 0.6s ease-out, staggered 0.2s
  2. **Idle pulse**: Subtle glow pulse on each photo, 3s cycle, infinite repeat
  3. **Parallax**: Hero background layer moves at 0.3× scroll speed (subtle depth)
  4. **VS badge flash**: The "VS" badge flashes once on load (brief double-blink), then settles static
- **Photos**: Personal upload if available, Imagen-generated placeholder avatar if not
  - Avatar style: abstract silhouette, professional, non-representational
  - Never generate realistic human faces for plaintiff/defendant
- **Status badge**: Prominently placed in hero (see Section 8 for spec)
- **Tone**: Judicial authority — NOT Street Fighter. Entertaining but professional.
- **Implementation**: Framer Motion for all animations

### Section Detail: 02 — Hero Text

- Large: "[Plaintiff Name] vs. [Defendant Name]"
- Below: AI-generated tagline
  - Generated by Gemini using all available case data (Deep Think mode)
  - One punchy sentence capturing the essence of the allegation
  - Example: "A global trail of fabricated promises, drained savings, and broken lives across five countries."
  - Requirements: < 20 words, present tense, no legal jargon, emotionally resonant
- Below tagline: case ID + filing date in muted smaller text

### Section Detail: 03 — Story Infographic

- The main NotebookLM infographic (portrait or landscape)
- Audio button overlaid on the infographic
  - Clicking opens a floating/minimizable audio player
  - Player persists while user scrolls
- Infographic treatment: SVG preferred, code rebuild if agent can do better, JPEG as fallback

### Section Detail: 04 — Four Info Boxes

Standard across all plaintiff pages:
- **Alias**: Known aliases of the defendant
- **Business Name(s)**: Business entities involved
- **Years Active**: Date range of alleged fraud activity
- **Witnesses**: Count of witnesses on record for this case

### Section Detail: 05 — Case Summary Module

See Section 6 of this document for full spec.
Short: Notebook summary paragraph → "View Full Report" (full-screen modal with 2 tabs)
- Tab 1: Detailed Analysis (full briefing doc)
- Tab 2: Original Testimony (read-only plaintiff form)

### Section Detail: 06 — Slide Deck

See Artifact Treatment Rules (Section 5) for full spec.
PDF carousel viewer using react-pdf/pdfjs-dist. Standardized across all pages.

### Section Detail: 07 — Case Timeline

- **Layout**: Horizontal scroll, fixed container height (standardized across all pages)
- **Isolation**: Fully contained scroll context — zero z-index interference with sidebar or nav
  - Parent: `overflow: hidden`
  - Inner track: `overflow-x: auto`
  - NO `position: sticky`, NO `z-index` manipulation inside the timeline component
- **Data**: Driven from `timeline_events` table — NOT static
- **Visual variance**: Agent may style differently per case as long as:
  - Container height is consistent
  - IA structure is consistent
  - Data is live from DB
- **Bidirectional evidence linking**:
  - Each timeline event shows an indicator if it has supporting evidence in the vault
  - Clicking the indicator opens that evidence from the vault
  - Each evidence item in the vault shows which timeline event it's attached to
  - Clicking that link scrolls/highlights the timeline event

### Section Detail: 08 — Mind Map

- Source: NotebookLM mind map exported as JSON
- Rebuilt as interactive node visualization in code
- Libraries: react-flow, D3.js, or custom SVG
- Must match or exceed visual quality of the NotebookLM original
- Full interactivity: zoom, pan, expand/collapse nodes

### Section Detail: 09 — Location Map

- Standardized technology across ALL plaintiff pages (no variance)
- Shows pins/markers for each geographic location in the case
- Connects locations with a trail/route line (showing the fraud journey)
- **Technology**: react-map-gl + MapLibre GL JS
  - Free, open-source (no Mapbox API billing surprises)
  - Supports vector tiles, route trails, animated paths, custom pins
  - Renders locations as pins connected by an animated trail line
  - Shows the "fraud journey" — where the defendant moved between victims
- Data source: `timeline_events.city` field + `defendants` location field

### Section Detail: 10 — Evidence Vault

- Displays ALL evidence for the case:
  - Documents, contracts, screenshots
  - Chat logs (WhatsApp, email, text)
  - Police reports, witness testimony
  - Videos and audio recordings
- Each evidence item has:
  - File type indicator
  - Title/description
  - **Timeline event tag** — shows which event it's associated with
  - Viewable inline or in a lightbox
- Bidirectional link to timeline (see Section 07 detail)

### Section Detail: 11 — Inline Voting

See Section 12 for full dual-verdict spec.
- Position: After Evidence Vault, before Footer
- Two vote dimensions: Plaintiff Credibility + Defendant Guilt (this case)
- Shows both verdicts at resolution: Gut Instinct + Social

### Section Detail: 12 — Footer

- Standard CPR footer
- Consistent across all pages

---

## 8. Design System — COMPLETE

### Color System

**Base**: CPR brand colors (from Tailwind config / CSS variables) — always present on every page
**Accent**: ONE accent color extracted per case from the case's infographic artifact

**Color Extraction Algorithm** (Gemini executes via multimodal analysis):
1. Load infographic JPEG as image input
2. Identify the single most dominant non-neutral color (exclude whites, blacks, grays, beiges)
3. Generate 5-variant palette using code execution (color math):
   - `--accent-100`: Very light (95% lightness) → section tint overlays at 5-10% opacity
   - `--accent-300`: Light (70% lightness) → highlights, hover states
   - `--accent-500`: The base extracted color → primary usage, buttons, accents
   - `--accent-700`: Dark (35% lightness) → deep backgrounds, borders
   - `--accent-900`: Very dark (15% lightness) → text on light backgrounds, deep section BGs
4. Apply palette across page:
   - Hero tinting and diagonal split overlay: `accent-700` / `accent-900`
   - Section backgrounds: alternating CPR base and `accent-900`
   - Section accent lines/dividers: `accent-500`
   - Info boxes: `accent-700` background, `accent-300` border
   - Timeline track line: `accent-500`
   - Mind map primary nodes: `accent-500`; secondary: `accent-300`
   - CTA buttons: `accent-500` background, white text
5. **Fallback**: CPR `--primary` color if extraction fails or infographic is absent

### Typography

- **All sans-serif** — no serif fonts anywhere on the page
- **Scale**: Tailwind default type scale
- **Style**: Modern, clinical — suggests institutional authority, not warmth
- **Weights**: `font-normal` through `font-bold` — no thin/light weights
- Hero names: `text-5xl font-bold tracking-tight` (desktop), responsive
- Tagline: `text-xl font-normal text-muted-foreground italic`
- Section headers: `text-2xl font-semibold`
- Body: `text-base font-normal leading-relaxed`
- Muted metadata: `text-sm text-muted-foreground`

### Scroll Animation System

- **Library**: Framer Motion — `motion` components + `whileInView`
- **Pattern**: All sections fade + rise on scroll into view
  - Initial: `opacity: 0, y: 24`
  - Animated: `opacity: 1, y: 0`
  - Transition: `duration: 0.5, ease: 'easeOut'`
  - Trigger: `whileInView={{ opacity: 1, y: 0 }}` + `viewport={{ once: true, margin: '-80px' }}`
- **Stagger**: Individual cards within sections stagger children by 0.08s
- **GPU only**: Use `transform` and `opacity` exclusively — never animate `top`, `left`, `margin`, `height`
- **Performance**: `once: true` means animations never re-trigger = zero recurring CPU cost

### Status Badge

- **Position**: In hero section, centered, below VS badge, above names
- **States**:

| Status | Label | Color |
|---|---|---|
| `pending` / `pending_convergence` | PENDING REVIEW | Amber |
| `admin_review` / `investigation` | UNDER INVESTIGATION | Blue |
| `judgment` | IN JUDGMENT — VOTING OPEN | Orange |
| `verdict` | VERDICT RENDERED | Green |
| `restitution` | RESTITUTION ORDERED | Purple |

- **Style**: `rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest`
- **Glow**: `shadow-[0_0_12px_currentColor]` for visual prominence
- **Background**: `bg-[color]/20 text-[color]-400` (subtle tinted pill)

---

## 9. NotebookLM Notebooks (Real Data)

### Plaintiff — Kelly Cai
- Notebook ID: `86438ec8-ec42-4f4e-8331-fda2ed649053`
- Sources: 37
- Artifacts ready:
  - Infographic: "The Cost of Deception" (portrait 1536×2752)
  - Infographic: "Anatomy of a Global Deception" (landscape 2752×1536)
  - Mind Map: "The Case File of Colin James Bradley"
  - Mind Map: "The Colin Bradley Dossier: Investigation of a Global Con Man"
  - Flashcards: "Fraud Flashcards" (9 cards)
- Missing: Audio podcast, Timeline, Slide deck

### Defendant — Colin James Bradley
- Notebook ID: `ddcaf0ca-f7d6-40a5-8588-ea19a3747398`
- Sources: 21
- Artifacts ready:
  - Report: "Investigation and Exposure of Colin James Bradley: Comprehensive Briefing"
  - Infographic: "International Deceptions Case Profile Overview" (landscape 2752×1536)
  - Mind Map: "The Court of Public Record: The Bradley Fraud Dossier"
- Missing: Audio podcast, Timeline, Slide deck

### Notebook Summary (Kelly Cai) — The Case Summary Text
"These sources document an alleged international romance and investment scam
orchestrated by Colin 'Cole' Bradley. Victims from Australia, Thailand, and Dubai
detail a consistent pattern where Bradley manipulates women into marriage or
partnerships by fabricating stories of a multimillion-dollar European trust.
Once trust is established, he reportedly drains their assets, convinces them to
borrow from family, and then disappears to another country to repeat the cycle."

---

## 10. Key Case Facts (Kelly Cai — from notebook_query)

- **Plaintiff**: Wenying "Kelly" Cai, Australian resident (now in China due to financial ruin)
- **Defendant**: Colin James Bradley (DOB: June 26, 1971)
- **Total damages**: $500,000+ AUD
- **Breakdown**: $300K offset account + $200K home refinance + $35K sister loan + $30K friends
- **Locations**: Australia (Brisbane/Melbourne) → Thailand → Dubai (UAE) → Vietnam → China
- **Timeline**: Met 2019 (WeChat) → Married Jan 18, 2020 → Business collapse Nov 2021
  → Colin to Thailand Mar 2024 → Dubai Nov 2024 → Vietnam Jul 2025
- **MO**: Fake European family trust story, shadow director (bankrupt), serial relocation

---

## 11. Technical Constraints

### Hero Centering Bug
The current live page has the hero section right-justified instead of centered.
Fix this before or during rebuild. Root cause: sidebar width not accounted for in hero layout.
The hero must be centered relative to the main content area, not the full viewport.

### Horizontal Timeline Z-Axis Rule
Previous implementation broke:
- Page z-index stack
- Sidebar overlap
- Hero section alignment

Solution: Timeline must use `overflow-x: scroll` contained within an isolated wrapper.
```
Parent container:  overflow: hidden (clips horizontally)
Inner track:       overflow-x: auto (scrollable)
```
No `position: sticky` or `z-index` manipulation ANYWHERE in the timeline component.
The timeline is a simple flow element — no stacking context creation.

### Stack
- Next.js 16.1.6, App Router, React 19, TypeScript
- Supabase (PostgreSQL + Auth + Storage)
- Tailwind CSS v4 + shadcn/ui + Radix UI
- Icons: Heroicons ONLY (@heroicons/react/24/outline)
- No lucide-react. No emoji in code.

### Animation Performance Rule
- Use Framer Motion `motion.div` — not CSS `@keyframes` for components
- Always `once: true` on scroll triggers to prevent recurring repaint
- Hero parallax: CSS `transform: translateY()` driven by `useScroll` + `useTransform`
- Never animate `width`, `height`, `top`, `left`, `margin` — only `transform` and `opacity`

---

## 12. Voting System — Dual Verdict Spec

### The Two Verdicts

**Gut Instinct Verdict** (locked on first vote — immutable forever):
- Captured as `initial_score` when the voter first casts a vote
- Setting: immutable — updating your vote NEVER changes your gut instinct
- At resolution: aggregate of all `initial_score` values = Gut Instinct Verdict

**Social Verdict** (live, mutable until finalized):
- Captured as `vote_score` (the mutable current score)
- Voters can update until verdict is finalized
- At resolution: aggregate of all current `vote_score` values = Social Verdict

### Why Two Verdicts
The gap between them reveals social pressure dynamics:
- Gut Instinct diverging FROM Social Verdict → group pressure shifting public opinion
- Gut Instinct tracking WITH Social Verdict → organic consensus

This is a core CPR data science output — headline story on verdict day.

### DB Schema Migration Required
```sql
-- Add initial_guilt_score column to votes table
-- NOTE: votes table uses guilt_score (not vote_score)
ALTER TABLE votes
ADD COLUMN IF NOT EXISTS initial_guilt_score numeric(3,1);

-- Backfill existing rows
UPDATE votes
SET initial_guilt_score = guilt_score
WHERE initial_guilt_score IS NULL;

-- Trigger: capture initial_guilt_score on first INSERT only
CREATE OR REPLACE FUNCTION capture_initial_guilt_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.initial_guilt_score IS NULL THEN
    NEW.initial_guilt_score := NEW.guilt_score;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_initial_guilt_score ON votes;
CREATE TRIGGER set_initial_guilt_score
BEFORE INSERT ON votes
FOR EACH ROW EXECUTE FUNCTION capture_initial_guilt_score();

-- Trigger: protect initial_guilt_score from being overwritten on UPDATE
CREATE OR REPLACE FUNCTION protect_initial_guilt_score()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.initial_guilt_score IS NOT NULL THEN
    NEW.initial_guilt_score := OLD.initial_guilt_score;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS preserve_initial_guilt_score ON votes;
CREATE TRIGGER preserve_initial_guilt_score
BEFORE UPDATE ON votes
FOR EACH ROW EXECUTE FUNCTION protect_initial_guilt_score();
```

### Voting Widget UI Spec
- **Position**: Bottom of plaintiff page, after Evidence Vault, before Footer
- **Two dimensions per case**:
  1. **Plaintiff Credibility**: "How credible is this plaintiff's account?" (scale 1–10)
  2. **Defendant Guilt**: "How guilty is the defendant based on this case?" (scale 1–10)
- After first vote: display "Your gut instinct is locked: [score]" (cannot change)
- Show current social average + total vote count
- At verdict resolution: show both verdict cards side by side
  - Left: "Gut Instinct Verdict — [score]/10"
  - Right: "Social Verdict — [score]/10"
  - If gap > 2 points: show divergence callout

---

## 13. Gemini Tool Invocation Protocol

Gemini 2.5 Pro is the primary build agent. All available capabilities must be used at the right moments:

### Multimodal Image Analysis — INVOKE FIRST
- Before writing any code, load all infographic JEPGs as image inputs
- Extract: (1) dominant accent color in HEX, (2) design vocabulary (geometric/editorial/organic),
  (3) emotional tone, (4) layout density
- This analysis DRIVES all visual decisions downstream

### Deep Think / Extended Reasoning — INVOKE FOR
- Hero section visual composition ("think through the optimal boxing-poster layout")
- AI tagline generation ("produce the single most powerful one-sentence summary")
- Evidence vault categorization scheme ("think through optimal organization of these evidence types")

### Code Execution (Python sandbox) — INVOKE FOR
- Color math: derive 5-variant palette from extracted HEX (HSL manipulation)
- Mind map JSON parsing and node layout calculation
- Timeline event date sorting and gap calculation
- Coordinate distance calculations for map routing

### Google Search Grounding — INVOKE FOR
- Verify city/country names for location map pins (canonical spelling)
- Legal terminology accuracy for case summary display
- Do NOT use for case facts — trust NotebookLM data only

### Long Context Window (1M tokens) — ALWAYS ACTIVE
- Feed ALL artifacts simultaneously: infographic + mind map JSON + briefing doc + summary + evidence list
- Gemini sees the complete case in one pass — no piecemeal assembly
- This is the architectural advantage over smaller-context models

### Structured Output — USE FOR
- Color palette extraction result (HEX values + usage assignments as JSON)
- Section-by-section quality self-scores
- Mind map node hierarchy (JSON → component tree mapping)

### Imagen / Avatar Generation — INVOKE WHEN
- Plaintiff or defendant photo not available → generate placeholder avatar
- Style requirements: abstract, professional, silhouette or geometric — NOT a realistic face
- Never generate photorealistic human likenesses for case parties

---

## 14. Performance Budget

| Metric | Target |
|---|---|
| Lighthouse Performance (mobile) | ≥ 90 |
| First Contentful Paint | < 2.0s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Total Blocking Time | < 200ms |

### Implementation Rules
- **All images**: `loading="lazy"` except hero photos (eager)
- **Mind map**: Lazy-load — initialize only when section enters viewport
- **PDF carousel**: Dynamic import `pdfjs-dist` — loads only when slide section is visible
- **Audio player**: Lazy-load JS — only after user clicks play button
- **Location map**: Load MapLibre only when Location Map section enters viewport
- **Animations**: Only `opacity` + `transform` — zero layout recalculation during scroll
- **Fonts**: Preload one sans-serif in `<head>`, `font-display: swap`
- **No blocking**: Zero synchronous scripts in `<head>`

---

## 15. SEO Requirements

### Meta Tags
```html
<title>[Plaintiff Name] vs [Defendant Name] | Court of Public Record</title>
<meta name="description" content="[Notebook summary — first 155 chars]" />
<link rel="canonical" href="https://courtofpublicrecord.com/case/[slug]/plaintiff/[id]" />
<meta name="robots" content="index, follow" />
```

### Open Graph
```html
<meta property="og:title" content="[Plaintiff Name] vs [Defendant Name]" />
<meta property="og:description" content="[Notebook summary — 155 chars]" />
<meta property="og:image" content="[infographic Supabase URL]" />
<meta property="og:url" content="[canonical URL]" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Court of Public Record" />
```

### Twitter Card
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="[Plaintiff Name] vs [Defendant Name]" />
<meta name="twitter:description" content="[Notebook summary — 155 chars]" />
<meta name="twitter:image" content="[infographic URL]" />
```

### JSON-LD Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "LegalCase",
  "name": "[Plaintiff] vs [Defendant]",
  "description": "[Notebook summary]",
  "datePublished": "[case created_at ISO string]",
  "url": "[canonical URL]",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Cases", "item": "/cases" },
      { "@type": "ListItem", "position": 2, "name": "[Defendant Name]", "item": "/defendants/[slug]" },
      { "@type": "ListItem", "position": 3, "name": "[Plaintiff Name]'s Case" }
    ]
  }
}
```

### Sitemap
- Each plaintiff page URL added to sitemap.xml on generation
- Priority: 0.8 (high — public accountability content)
- changefreq: weekly

---

## 16. Agent Execution Protocol

### Build Order — Execute in This Exact Sequence

**Phase 0 — Pre-flight Verification**
1. Confirm `cases.status` != `draft` or `pending`
2. Confirm convergence: count of plaintiffs on same defendant ≥ 2
3. Confirm artifact availability in Supabase bucket
4. If any required artifact is missing: generate via NotebookLM MCP, poll every 30s, wait up to 5 min
5. If generation fails after 5 min: build "Coming Soon" placeholder for that section

**Phase 1 — Full Data Ingest (parallel)**
Load simultaneously:
- `cases` row + JOIN `defendants` + JOIN `profiles` (plaintiff data)
- `financial_impacts` row
- `timeline_events[]` for this `case_id`
- `witnesses[]` for this `case_id`
- `evidence[]` for this `case_id`
- NotebookLM notebook summary (`notebook_describe`)
- NotebookLM briefing doc text (`source_get_content` on report source)
- Mind map JSON (download_artifact)
- Infographic URL from Supabase bucket

**Phase 2 — Design Analysis (Gemini multimodal + Deep Think)**
1. INVOKE MULTIMODAL: load infographic image → extract accent color + vocabulary
2. INVOKE CODE EXECUTION: derive 5-variant palette from extracted HEX
3. INVOKE DEEP THINK: generate AI tagline from full case context
4. Document palette + vocabulary as comments at top of main page file

**Phase 3 — Build Sections 01–12 (in order)**
After each section, self-score:
- "Does this section match the spec exactly?"
- "Is all data live from the database?"
- "Does the styling use the extracted palette correctly?"
Fix issues before moving to the next section.

**Phase 4 — Claude Review**
Submit complete built page to Claude.
Claude runs the Section 17 quality checklist and returns required changes.

**Phase 5 — Iterate**
Address every required change. Re-submit.
Repeat until Claude scores ≥ 96/100.

### Missing Artifact Fallback
When an artifact is missing:
```
Section structure: VISIBLE (heading, description text, section wrapper)
Content area: animated skeleton loader
Message: "This section will populate once [artifact name] is ready."
Style: Subtle pulsing skeleton matching section accent color
```
Never show blank/empty UI. Sections are always visible even when content is pending.

---

## 17. Quality Gate — 96% Checklist

Claude uses this checklist when reviewing Gemini's output.

### A. Structure (20 points)
- [ ] All 12 sections present and in correct order (5)
- [ ] No section is empty/blank when data exists (5)
- [ ] Navigation/sidebar not broken by any section (5)
- [ ] Mobile layout correct on all 12 sections (5)

### B. Visual Design (25 points)
- [ ] Extracted accent color applied consistently across page (5)
- [ ] Hero diagonal split correct — both photos framed properly (5)
- [ ] All 4 hero animations working: entrance, pulse, parallax, VS flash (5)
- [ ] Scroll fade+rise animations on all sections, `once: true` (5)
- [ ] Typography all sans-serif — no rogue fonts (5)

### C. Data Integrity (20 points)
- [ ] All Supabase fields displaying real data, not placeholders (5)
- [ ] Timeline events loaded from `timeline_events` table, not hardcoded (5)
- [ ] Evidence vault items cross-linked to timeline events (5)
- [ ] Location map pins match actual location data from DB (5)

### D. Technical (20 points)
- [ ] Timeline z-index isolation — no sidebar overlap, no position:sticky (5)
- [ ] Hero centering bug fixed — centered on content area, not viewport (5)
- [ ] TypeScript passes: `tsc --noEmit` zero errors (5)
- [ ] No lucide-react, no emoji, no hardcoded hex colors in code (5)

### E. Content Quality (15 points)
- [ ] AI tagline is genuinely compelling and under 20 words (5)
- [ ] Status badge prominent in hero, correct state and color (5)
- [ ] Notebook summary in case summary section — real text, not placeholder (5)

**TOTAL: 100 points. Must score ≥ 96 to pass.**
Any section scoring < 4/5 must be fixed before the page ships.

---

## 18. Skill File Location

Skill lives at:
`C:\Antigravity\CPR\.agent\skills\plaintiff-page-builder\SKILL.md`

References:
- `references/artifact-pipeline.md` — How to pull artifacts via MCP (to be created)
- `references/design-tokens.md` — CPR brand colors, typography, component patterns (to be created)

---

## NEXT STEPS (in order)

1. [x] User describes full page IA vision (section by section) — DONE
2. [x] Add section order to Section 7 — DONE
3. [x] Discuss slide deck section treatment — DONE (PDF carousel)
4. [x] All design decisions confirmed — DONE (hero, color, animations, SEO, performance, voting, Gemini tools)
5. [x] Write the spec — DONE (this file)
6. [ ] Write the skill SKILL.md — IN PROGRESS
7. [ ] Run SQL migration: add `initial_score` to votes table (Section 12)
8. [ ] Generate missing artifacts: audio + slide deck for Kelly Cai notebook
9. [ ] Test skill against Gemini with Kelly Cai data
10. [ ] Fix hero centering bug on current live page
