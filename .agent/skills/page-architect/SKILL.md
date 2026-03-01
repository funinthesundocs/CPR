---
name: page-architect
description: >
  Transform boring, text-heavy web pages into compelling, story-driven visual experiences
  using Information Architecture science and UI pattern psychology. Use this skill whenever
  the user asks to redesign, rearchitect, beautify, or transform an existing page layout —
  especially pages with lots of text content, case studies, reports, profiles, legal cases,
  long-form narratives, or any page that "looks like a wall of text." Also trigger when users
  mention making a page "tell a story," "keep readers engaged," "look more professional,"
  "switch up the presentation," or want to apply IA principles to their UI. This skill should
  be used BEFORE the frontend-design skill — it handles the WHAT and WHY of information
  presentation, while frontend-design handles the HOW of visual styling. Use both together
  for best results.
---

# Page Architect: Information Architecture & UI Pattern Science

Transform any text-heavy page into a compelling, psychologically-optimized visual narrative.

## Overview

This skill applies the science of Information Architecture (IA), cognitive psychology, and
UI pattern selection to restructure how information is presented on a web page. It does NOT
handle visual styling (colors, fonts, animations) — that's for the frontend-design skill.
This skill handles the **structural and cognitive layer**: which UI elements to use, how to
sequence information, when to use progressive disclosure, and how to maintain reader engagement.

**Use this skill together with frontend-design for complete page transformations.**

---

## Step 0: Read the Existing Page

Before any architecture work, understand what you're working with.

### Input Methods (in order of preference)
1. **Page component files**: If you have access to the codebase, read the React/Next.js
   component files. Look for the data fetching, state shape, and existing component structure.
2. **Page data paste**: If the user pastes the page content as text, parse it into blocks.
3. **Screenshot + description**: If the user provides a screenshot, identify visible sections
   and infer the data model.

### Existing Design System Inventory
Before proposing ANY changes, identify and PRESERVE:
- **Color scheme**: Extract CSS variables, Tailwind theme config, or inline styles
- **Component library**: What UI components already exist? (shadcn, Radix, custom?)
- **Typography**: What fonts and scale are already in use?
- **Layout system**: Grid/flex patterns, max-widths, padding conventions
- **Dark/light mode**: What theme is active? Respect it.
- **Existing navigation**: Tabs, sidebars, breadcrumbs — these are constraints, not suggestions

**CRITICAL**: The goal is to transform the CONTENT ARCHITECTURE within the existing design
system — not to redesign the entire application. Match the surrounding pages.

### Data Model Extraction
From the page source, identify:
- What data is fetched (API endpoints, database queries, static props)
- What fields are available but not currently displayed
- What relationships exist between data entities
- What computed/derived values could be created (totals, durations, counts)

---

## Step 1: Content Audit & Classification

Before touching any code, perform a thorough content audit. Read the page data and classify
every piece of information into one of these content types:

### Content Type Taxonomy

| Type | Description | Example |
|------|-------------|---------|
| **Narrative** | Story-driven text that follows a chronological or emotional arc | Case summaries, testimonials, origin stories |
| **Factual/Declarative** | Discrete facts, names, dates, statuses | Filing date, location, case number, status |
| **Quantitative** | Numbers, money, percentages, counts | $565,000 damages, 4 witnesses, 11 timeline events |
| **Relational** | How entities connect to each other | Plaintiff ↔ Defendant, duration, how they met |
| **Sequential** | Events that happened in order | Timeline of fraud, escalation of deception |
| **Evidentiary** | Proof, documentation, supporting materials | Screenshots, witness statements, legal documents |
| **Emotional/Impact** | Psychological effects, personal testimony | "I have lost everything" |
| **Legal/Procedural** | Formal legal actions, judgments, filings | Default judgment, divorce proceedings |
| **Warning/Advisory** | Content meant to alert or protect others | Pattern warnings, red flags |
| **Comparative** | Information best understood by contrast | Before/after, claimed vs. reality |

**Action**: Create a content map listing every information block and its type. This drives
all subsequent decisions.

---

## Step 2: Audience & Intent Analysis

Determine WHO will read this page and WHY. This shapes every pattern choice.

### Key Questions
- **Primary audience**: Who is the main reader? (e.g., potential victims, legal professionals, general public)
- **Reader intent**: Are they scanning, investigating, deciding, or empathizing?
- **Emotional journey**: What should the reader FEEL at the start vs. end?
- **Action desired**: What should the reader DO after reading? (warn others, take legal action, donate, etc.)
- **Trust requirement**: How much does the reader need to trust this content? (affects evidence presentation)

### Intent-to-Pattern Mapping
- **Scanning** → Use stat blocks, badges, key-value pairs, and progressive disclosure
- **Investigating** → Use timelines, evidence galleries, expandable sections
- **Deciding** → Use comparison tables, pro/con layouts, clear CTAs
- **Empathizing** → Use narrative flow, pull quotes, emotional callouts, testimonial design

---

## Step 3: Apply the Pattern Selection Framework

For each content block identified in Step 1, select the optimal UI pattern using this
decision framework. **Read `references/pattern-selection-guide.md` for the complete
pattern library with detailed guidance on each pattern.**

### Quick Reference: Content Type → UI Pattern

| Content Type | Primary Pattern | Alternative | Avoid |
|---|---|---|---|
| Narrative | Scrollytelling / Chapter sections | Card sequence | Wall of text, accordion |
| Factual | Key-value pairs / Metadata bar | Badge grid | Buried in paragraphs |
| Quantitative | Stat blocks / Data cards | Gauge / Progress | Tables for < 4 items |
| Relational | Connection diagram / Relationship card | Timeline | Plain text description |
| Sequential | Vertical timeline / Stepper | Horizontal timeline | Numbered list |
| Evidentiary | Evidence gallery / Document cards | Lightbox grid | Inline links |
| Emotional | Pull quotes / Impact callouts | Full-bleed testimony | Italic paragraph |
| Legal | Structured card / Sidebar | Accordion | Unformatted text block |
| Warning | Alert banner / Pattern card | Callout box | Buried in narrative |
| Comparative | Before/after / Two-column | Table | Single column text |

---

## Step 4: Apply Cognitive Science Principles

These are non-negotiable psychological principles that govern the page structure.
**Read `references/cognitive-principles.md` for deep explanations and implementation
guidance.**

### The Core Principles

These are non-negotiable psychological principles that govern the page structure.
**Read `references/cognitive-principles.md` for deep explanations, implementation
guidance, and BAD/GOOD examples for each.**

1. **Progressive Disclosure** — Never show everything at once. Layer information from
   essential → detailed → supporting. Use expandable sections, tabs, and "read more."

2. **Cognitive Chunking** — Break information into 3-7 item groups. The human brain cannot
   process more than ~7 discrete items at once (Miller's Law).

3. **Serial Position Effect** — People remember the FIRST and LAST items best. Put your
   most critical information at the top and bottom of the page. The middle is for supporting detail.

4. **Visual Hierarchy** — Size, contrast, color, and position create an implicit reading order.
   Every page needs exactly ONE focal point at each scroll position.

5. **Variety Principle** — Alternating presentation styles prevents cognitive fatigue. Never
   use the same UI pattern for more than 2 consecutive content blocks. Switch between:
   text → visual → data → interactive → text.

6. **F-Pattern & Z-Pattern Scanning** — Users scan in predictable patterns. Place critical
   information along the top horizontal band and the left vertical band (F-pattern) for
   text-heavy pages, or along diagonal paths (Z-pattern) for visual pages.

7. **Emotional Pacing** — Like a film, a page needs rhythm. Tension → relief → tension → resolution.
   Alternate between heavy emotional content and breathing room (whitespace, data, neutral facts).

8. **Anchoring Effect** — The first number a reader sees sets the frame for everything after.
   Lead with the most impactful statistic. Show totals before breakdowns.

9. **Narrative Transportation** — When readers are absorbed in a story, they process information
   more deeply and remember it longer. Protect narrative flow during story sections; minimize
   UI chrome and avoid jarring interruptions. Use strategic visual breaks to refresh attention.

---

## Step 5: Design the Page Architecture

Create a section-by-section blueprint before writing any code.

### Blueprint Template

For each section, define ALL of these fields:
```
Section: [Name]
Content Type: [from taxonomy]
UI Pattern: [from selection framework]
Cognitive Principle: [which principle drives this choice]
Information Density: [low / medium / high]
Emotional Tone: [neutral / tense / empathetic / urgent / authoritative]
Interaction: [static / expandable / scrollable / clickable]
Transition In: [how the previous section leads into this one]
Transition Out: [how this section leads into the next]
Background: [light / dark / accent / gradient — must differ from adjacent sections]
Width: [full-bleed / contained / narrow — vary across page]
Component Approach: [specific React/HTML component strategy]
```

### Output Format

When presenting the architecture plan to the user, produce:

1. **Content Audit Table**: Every content block mapped to type, priority, and pattern
2. **Page Blueprint**: The ordered section list with all template fields filled in
3. **Variety Audit**: Confirmation that pattern diversity, density oscillation, and
   background alternation requirements are met
4. **Emotional Arc Diagram**: ASCII visualization of the tension curve
5. **Implementation Notes**: Any framework-specific guidance (React component splitting,
   state management, data fetching changes needed)

### Page Flow Structure (Narrative Pages)

For story-driven pages (cases, reports, profiles), follow this narrative arc:

```
┌─────────────────────────────────────┐
│  1. HOOK — Stat blocks + headline   │  ← Capture attention in 3 seconds
│     (Quantitative + Factual)        │
├─────────────────────────────────────┤
│  2. CONTEXT — Metadata bar +        │  ← Orient the reader
│     relationship card               │
│     (Factual + Relational)          │
├─────────────────────────────────────┤
│  3. NARRATIVE — Scrolling story     │  ← Build emotional investment
│     with chapter breaks             │
│     (Narrative + Sequential)        │
├─────────────────────────────────────┤
│  4. EVIDENCE — Gallery / cards      │  ← Establish credibility
│     (Evidentiary + Comparative)     │
├─────────────────────────────────────┤
│  5. IMPACT — Pull quotes + data     │  ← Emotional peak
│     (Emotional + Quantitative)      │
├─────────────────────────────────────┤
│  6. RESOLUTION — Legal status +     │  ← What happens next
│     CTA                             │
│     (Legal + Warning + Advisory)    │
└─────────────────────────────────────┘
```

---

## Step 6: Implementation Rules

When converting the blueprint to code:

### Section Variety Requirements
- **Never** use the same background treatment for consecutive sections
- **Alternate** between full-width and contained-width sections
- **Vary** information density: follow a dense section with a spacious one
- **Break** long narrative with visual interrupts (stat callouts, quotes, timeline markers)

### Pattern Mixing Rules
- A page with 6+ sections MUST use at least 4 distinct UI patterns
- No single pattern type should exceed 30% of the page
- Every 2-3 scroll heights, introduce a pattern the reader hasn't seen yet
- Data visualization should appear within the first 2 scroll heights

### Mobile Considerations
- Timelines: Switch from horizontal to vertical on mobile
- Stat grids: Stack from row to column
- Tabs: Convert to accordion on small screens
- Side-by-side comparisons: Stack vertically with clear labels

### Accessibility
- All interactive elements must be keyboard navigable
- Use semantic HTML (article, section, aside, figure, blockquote)
- Ensure color is never the ONLY way to convey information
- All images need alt text; decorative images use alt=""

---

## Step 7: Review Checklist

Before delivering, verify:

- [ ] **No Wall of Text**: No section has more than 3 consecutive paragraphs without a visual break
- [ ] **Pattern Variety**: At least 4 distinct UI patterns used across the page
- [ ] **Hook Quality**: First viewport captures attention with data or a compelling headline
- [ ] **Progressive Disclosure**: At least 2 sections use expandable/layered content
- [ ] **Emotional Arc**: Page has identifiable tension, evidence, and resolution phases
- [ ] **Cognitive Load**: No single viewport shows more than 7 discrete information items
- [ ] **Scanning Support**: Key facts are extractable without reading full paragraphs
- [ ] **Mobile Ready**: Layout adapts gracefully to narrow viewports
- [ ] **Accessibility**: Semantic HTML, keyboard nav, screen reader compatible

---

## Reference Files

For detailed guidance, read these files as needed:

- **`references/pattern-selection-guide.md`** — Complete UI pattern library with when/why/how
  for each pattern. READ THIS for implementation details on any specific pattern.

- **`references/cognitive-principles.md`** — Deep dive into the psychology behind each
  principle, with examples of good and bad implementations. READ THIS when you need to
  understand WHY a principle matters.

- **`references/narrative-architecture.md`** — Specific guidance for story-driven pages:
  how to structure narrative arcs, emotional pacing, and reader engagement techniques.
  READ THIS for case studies, testimonials, reports, and any page telling a story.

---

## Usage with Other Skills

### Handoff Protocol: Page Architect → Frontend Design

1. **Page Architect produces**: The blueprint (section list, patterns, principles, emotional arc)
2. **Frontend Design receives**: The blueprint as input context
3. **Frontend Design produces**: Visual styling, typography, color, motion, and spatial composition
   applied to each section according to its pattern type and emotional tone

### Handoff Protocol: Page Architect → Code Implementation

When implementing directly (without separate frontend-design pass):
1. Respect the existing design system (extracted in Step 0)
2. Build each section as an independent component or section within the page component
3. Use the blueprint's `Component Approach` field for implementation guidance
4. Test the variety audit against the rendered output

### Skill Combinations
- **Page Architect + frontend-design**: Full page transformation (structure + style)
- **Page Architect alone**: Restructuring within an existing design system
- **Page Architect + docx/pdf**: When the output is a document, not a web page
- **Order**: ALWAYS run Page Architect FIRST, then apply visual design or implementation

### Non-Narrative Page Types

This skill is NOT only for story-driven pages. For other page types, adapt the framework:

| Page Type | Skip | Emphasize | Primary Arc |
|---|---|---|---|
| **Dashboard** | Narrative sections, emotional pacing | Data display, progressive disclosure, chunking | Overview → Detail → Action |
| **Directory/List** | Story chunking, emotional arc | Filtering, scanning patterns, card grids | Browse → Filter → Select |
| **Profile** | Legal/procedural, evidence gallery | Hero hook, key-value metadata, social proof | Identity → Credentials → Contact |
| **Settings/Form** | All narrative, emotional patterns | Stepper, progressive disclosure, grouping | Orient → Input → Confirm |
| **Documentation** | Emotional pacing, trust architecture | F-pattern, progressive disclosure, sidebar | Find → Read → Apply |
