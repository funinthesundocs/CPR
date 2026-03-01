# UI Pattern Selection Guide

Complete reference for choosing the right UI element for each type of information.
This guide is organized by pattern category, with decision criteria for each.

---

## Table of Contents

1. [Data Display Patterns](#data-display)
2. [Narrative Patterns](#narrative)
3. [Sequential Patterns](#sequential)
4. [Evidence & Trust Patterns](#evidence)
5. [Emotional & Impact Patterns](#emotional)
6. [Disclosure & Navigation Patterns](#disclosure)
7. [Comparison Patterns](#comparison)
8. [Status & Metadata Patterns](#status)
9. [Warning & Alert Patterns](#warning)
10. [Anti-Patterns — What NOT to Do](#anti-patterns)

---

## 1. Data Display Patterns <a name="data-display"></a>

### Stat Block / Data Card
**When**: You have 2-6 key numbers that define the story at a glance.
**Why**: Humans process numbers faster in isolated visual blocks than embedded in text.
Stat blocks exploit the "isolation effect" (Von Restorff) — items that stand out are
remembered better.

**Structure**:
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│  $565K   │ │    4     │ │    11    │
│ Damages  │ │Witnesses │ │ Events  │
│ Claimed  │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘
```

**Rules**:
- Maximum 6 stat blocks in a row (3-4 is ideal)
- Each block: one number + one label (max 3 words)
- Use large font for numbers, small for labels
- Consider adding trend indicators or status colors
- On mobile: 2-column grid, never single column (loses comparison value)

**Avoid when**: Numbers need context to be meaningful, or when you have only 1 number.

### Key-Value Pair Grid
**When**: You have structured metadata — labeled facts that don't need narrative context.
**Why**: Key-value pairs match the brain's associative memory model. Users scan the keys
(left column) to find what they care about, then read the value.

**Structure**:
```
Case Number     C-0002
Status          Pending
Filed           February 28, 2026
Location        Da Nang, Vietnam
```

**Rules**:
- Left-align keys, left-align or right-align values consistently
- Use subtle separators (borders or alternating backgrounds)
- Group related pairs together with section headers
- Keep keys to 1-3 words
- Bold or mute keys vs. values to create visual distinction

**Avoid when**: Values are long paragraphs or when items are unrelated.

### Table
**When**: Users need to COMPARE structured data across multiple items with consistent fields.
**Why**: Tables leverage parallel processing — the grid structure lets users scan a column
to compare a single attribute across items.

**Rules**:
- Use for 3+ items with 3+ consistent attributes
- Always include sortable column headers for interactive tables
- Highlight the most important column
- On mobile: convert to card list or use horizontal scroll with sticky first column

**Avoid when**: You have fewer than 3 items (use cards instead), or when data is
heterogeneous (different items have different fields).

---

## 2. Narrative Patterns <a name="narrative"></a>

### Chapter / Section Break
**When**: A long story needs to be broken into digestible parts.
**Why**: Chunking (Miller's Law) — the brain processes information in groups. Chapter
breaks create natural pause points that prevent cognitive overload and give the reader
a sense of progress.

**Structure**:
```
═══════════════════════════════
  Chapter 1: The Meeting
═══════════════════════════════
  [2-4 paragraphs of narrative]

═══════════════════════════════
  Chapter 2: The Deception
═══════════════════════════════
  [2-4 paragraphs of narrative]
```

**Rules**:
- Each chapter: 150-400 words maximum
- Use descriptive, emotionally-resonant chapter titles (not "Section 1")
- Insert a visual break between chapters (divider, different background, illustration)
- Consider adding a chapter nav/progress indicator for 5+ chapters

### Scrollytelling
**When**: A narrative needs to unfold as the user scrolls, with visual context changing
at each scroll position.
**Why**: Scrollytelling exploits the Zeigarnik Effect — people are compelled to complete
sequences they've started. The gradual reveal creates narrative momentum.

**Rules**:
- Each "step" should fit in one viewport
- Use sticky elements that change as the user scrolls past trigger points
- Keep text blocks short (1-3 sentences per step)
- Visual context (maps, images, data) should update with each step
- Works best for 5-15 steps

**Avoid when**: Content doesn't have a clear sequential structure.

### Pull Quote / Callout
**When**: A single powerful sentence from the narrative deserves emphasis.
**Why**: Pull quotes exploit the Von Restorff isolation effect and create visual rhythm
that breaks up text walls. They also serve as "hooks" for scanning readers.

**Structure**:
```
    ╔═══════════════════════════════════╗
    ║  "He is an evil person. Being     ║
    ║   married to someone who was      ║
    ║   deceiving me throughout our     ║
    ║   entire relationship..."         ║
    ╚═══════════════════════════════════╝
```

**Rules**:
- Maximum 2-3 sentences
- Use larger font size than body text (1.5-2x)
- Visually distinct (different background, border treatment, indentation)
- Place between content sections, never at the very start
- One pull quote per 300-500 words of narrative

---

## 3. Sequential Patterns <a name="sequential"></a>

### Vertical Timeline
**When**: Events happen in chronological order and the sequence matters.
**Why**: Timelines match our spatial-temporal mental model — we literally think of time
as a line. Vertical timelines exploit the natural top-to-bottom reading flow.

**Structure**:
```
    ●  2019 — Met on social media
    │
    ●  2020 — Married, invested $300K
    │
    ●  2023 — Moved to Thailand
    │
    ●  2024 — Deception revealed
    │
    ◉  2026 — Case filed
```

**Rules**:
- Each node: date/time + short description (1-2 sentences max)
- Use visual weight to distinguish major vs. minor events
- Color-code by category if events are heterogeneous (financial, relational, legal)
- Add expandable detail for events that need more context
- On mobile: always vertical, never horizontal

### Stepper / Progress Indicator
**When**: A process has defined phases (not just events).
**Why**: Steppers leverage the goal-gradient effect — showing progress toward completion
increases motivation to continue reading.

**Rules**:
- Use for 3-7 steps
- Current step should be visually prominent
- Completed steps should look different from future steps
- Each step needs a clear label

**Avoid when**: Events don't represent a progression toward a goal.

### Horizontal Timeline
**When**: You want to show the big picture of a time span with fewer details per event.
**Why**: Horizontal timelines create a "map" overview that can be scanned quickly.

**Rules**:
- Maximum 8-10 events (more than this gets unreadable)
- Use for overview/summary; vertical timeline for detail
- On mobile: convert to vertical or use horizontal scroll
- Consider making it interactive (click for details)

---

## 4. Evidence & Trust Patterns <a name="evidence"></a>

### Evidence Card / Document Card
**When**: Showing proof — documents, screenshots, records that support claims.
**Why**: Physical-looking artifacts trigger "source credibility" heuristic. Users trust
information more when they can see or reference original documents.

**Structure**:
```
┌────────────────────────────────┐
│  📄 Bank Statement — Nov 2023  │
│  ┌──────────────────────────┐  │
│  │  [Document thumbnail]    │  │
│  └──────────────────────────┘  │
│  Shows transfer of $35,000     │
│  to Bradley's account          │
│  ─────────────────────────────│
│  [View Full Document]          │
└────────────────────────────────┘
```

**Rules**:
- Always show a visual preview (thumbnail, icon, or placeholder)
- Include a descriptive title and 1-sentence summary
- Link to full document or lightbox view
- Group related evidence together
- Show count ("Evidence Item 3 of 12")

### Witness / Testimony Card
**When**: Third-party corroboration of claims.
**Why**: Social proof — one of Cialdini's 6 principles of persuasion. Third-party
testimony is psychologically more credible than first-party claims.

**Structure**:
```
┌────────────────────────────────┐
│  👤 Sissy (Neighbor, Thailand) │
│  ─────────────────────────────│
│  "He told me the exact same    │
│   family trust story..."       │
│                                │
│  Relationship: Neighbor        │
│  Location: Thailand            │
│  Corroborates: Trust story,    │
│  financial deception           │
└────────────────────────────────┘
```

### Corroboration Matrix
**When**: Multiple independent sources confirm the same facts.
**Why**: Convergent evidence is the strongest form of proof. Showing multiple sources
pointing to the same conclusion triggers the "consensus heuristic."

**Structure**:
```
                        │ Sissy  │ Boat    │ Mutual  │ Dubai
Claim                   │(Thai.) │Builders │ Friend  │ Court
────────────────────────┼────────┼─────────┼─────────┼──────
Used "family trust"     │   ✓    │    ✓    │         │
story                   │        │         │         │
────────────────────────┼────────┼─────────┼─────────┼──────
Could not pay bills     │   ✓    │    ✓    │         │   ✓
────────────────────────┼────────┼─────────┼─────────┼──────
Claimed divorce while   │        │         │    ✓    │
still married           │        │         │         │
────────────────────────┼────────┼─────────┼─────────┼──────
Pursued other women     │   ✓    │         │    ✓    │
during marriage         │        │         │         │
```

**Rules**:
- Claims on rows, sources on columns
- Use clear ✓ marks or filled circles — NOT text in cells
- Highlight rows with the most corroboration (most checkmarks)
- Include a corroboration score or count per claim
- On mobile: convert to a list format grouped by claim, showing confirming sources
- Consider color-coding sources by type (witness, document, legal record)

### Pattern Composition: Combining Patterns Within Sections

Many sections benefit from COMBINING two patterns. Rules for composition:

**Primary + Accent pattern**:
- One pattern dominates (60-70% of the section's visual weight)
- A secondary pattern provides emphasis or context (30-40%)
- Example: Narrative text (primary) + embedded stat callout (accent)
- Example: Timeline (primary) + expandable detail cards at each node (accent)
- Example: Witness cards grid (primary) + corroboration summary bar (accent)

**Avoid combining**:
- Two patterns of equal visual weight (creates competition, not hierarchy)
- Two interactive patterns in the same section (cognitive overload)
- A data pattern inside a narrative pattern (jarring context switch)

**Best combinations**:
| Primary Pattern | Works Well With |
|---|---|
| Narrative text | Stat callout, pull quote, inline timeline marker |
| Timeline | Expandable detail cards, embedded stats |
| Card grid | Summary bar, filter controls |
| Impact callout | Breakdown sub-cards, comparison mini-table |
| Pull quote | Attribution card, source badge |

---

## 5. Emotional & Impact Patterns <a name="emotional"></a>

### Impact Callout / Damage Summary
**When**: Showing the tangible consequences of events — financial loss, emotional harm.
**Why**: Concrete, specific impacts are processed more deeply than abstract claims.
The "identifiable victim effect" means specific details create more empathy than
general statements.

**Structure**:
```
┌─────────────────────────────────────────┐
│           FINANCIAL IMPACT              │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │ $300K   │ │ $200K   │ │  $65K    │  │
│  │Savings  │ │ House   │ │3rd Party │  │
│  │ Lost    │ │Refinance│ │  Debts   │  │
│  └─────────┘ └─────────┘ └──────────┘  │
│  ──────────────────────────────────────│
│  Total Documented Losses: $565,000     │
└─────────────────────────────────────────┘
```

**Rules**:
- Break total into component parts (chunking)
- Use visual weight to show proportions
- Consider a stacked bar, waterfall chart, or sankey diagram for financial flows
- Place AFTER the narrative establishes context, never before

### Emotional Testimony Block
**When**: First-person emotional statements that convey psychological impact.
**Why**: Emotional processing enhances memory encoding. Well-presented testimony
creates empathic engagement that keeps readers invested.

**Rules**:
- Use a visually distinct container (different background, larger text)
- Include attribution (who said this)
- Keep to 2-4 sentences — more dilutes impact
- Place at emotional peak of the narrative arc
- Do NOT overuse — one strong testimony block per page section

---

## 6. Disclosure & Navigation Patterns <a name="disclosure"></a>

### Accordion / Expandable Section
**When**: Detail that some readers want but most don't need on first pass.
**Why**: Progressive disclosure — reduce cognitive load by hiding secondary information.
Only readers who need it will expand.

**Rules**:
- Headers must clearly describe what's inside
- Default state: collapsed (unless it's the primary content)
- Allow expand-all / collapse-all for power users
- Don't nest accordions more than 1 level deep
- Use for legal details, methodology, supporting evidence

**Avoid when**: The content is essential to the narrative — don't hide the story.

### Tabs
**When**: Parallel categories of information that users access one at a time.
**Why**: Tabs reduce page length while keeping content accessible. They work because
users have a strong mental model of "tab = category."

**Rules**:
- 2-7 tabs maximum
- Tab labels: 1-3 words each
- First tab should contain the most important/accessed content
- Content within each tab should be independent (not sequential)
- On mobile: convert to accordion or scrollable tab bar

### Sidebar / Aside
**When**: Supplementary information that provides context without interrupting flow.
**Why**: Sidebars leverage spatial separation to signal "related but secondary."

**Rules**:
- Use for: related links, key facts, definitions, warnings
- Keep narrow (25-33% of container width)
- On mobile: move above or below the main content
- Don't put critical information only in a sidebar

---

## 7. Comparison Patterns <a name="comparison"></a>

### Before/After
**When**: Showing what was claimed vs. what was reality, or state before vs. after.
**Why**: Contrast is one of the most powerful cognitive tools. The brain detects
differences faster than similarities.

**Structure**:
```
┌─────────────────────────┬─────────────────────────┐
│      BEFORE / CLAIMED   │      AFTER / REALITY    │
│  ┌───────────────────┐  │  ┌───────────────────┐  │
│  │ "Successful       │  │  │ Undischarged      │  │
│  │  project manager" │  │  │ bankrupt          │  │
│  └───────────────────┘  │  └───────────────────┘  │
│  ┌───────────────────┐  │  ┌───────────────────┐  │
│  │ "Family trust     │  │  │ No trust ever     │  │
│  │  worth millions"  │  │  │ located or proven │  │
│  └───────────────────┘  │  └───────────────────┘  │
└─────────────────────────┴─────────────────────────┘
```

**Rules**:
- Use side-by-side on desktop, stacked with clear labels on mobile
- Visual differentiation: muted/crossed-out for "before," bold/highlighted for "after"
- Works best for 3-6 comparison points (more than 6 → use a table)
- The "reality" column should feel visually authoritative (stronger type, bolder color)

### Two-Column Contrast
**When**: Directly comparing two things point-by-point.
**Why**: Parallel structure reduces cognitive effort — the reader's eyes can flick
back and forth to compare matching attributes.

**Structure**:
```
    What He Said          │  What Was True
    ──────────────────────┼────────────────────
    "Family trust worth   │  No trust ever
     millions"            │  existed
    ──────────────────────┼────────────────────
    "Lost builder's       │  Undischarged
     license due to ex"   │  bankrupt
```

**Rules**:
- Column headers must be descriptive and create tension (not just "Column A / Column B")
- Use alternating row backgrounds for scanability
- Highlight the most damaging contrasts with a subtle accent

### Relationship / Connection Card
**When**: Showing how two or more entities are connected — people, organizations, roles.
**Why**: Relationships are inherently spatial. The brain understands connections better
when they're shown as visual links rather than described in prose.

**Structure**:
```
┌──────────┐                    ┌──────────┐
│ Plaintiff │──── married ────▶│ Defendant │
│  Kelly    │     2020-2024     │   Cole    │
│           │                   │  Bradley  │
└──────────┘                    └──────────┘
     │                               │
     │ financed                      │ told same
     ▼                               ▼ story to
┌──────────┐                    ┌──────────┐
│ Companies │                   │   Sissy   │
│ (2, in    │                   │ (neighbor,│
│  her name)│                   │  Thailand)│
└──────────┘                    └──────────┘
```

**Rules**:
- Use directed arrows/lines to show the nature of connections
- Label every connection with the relationship type
- Include duration where relevant
- On mobile: simplify to a vertical list with relationship labels
- For complex webs (5+ entities): consider a simplified node diagram with
  progressive disclosure for each node's detail

---

## 8. Status & Metadata Patterns <a name="status"></a>

### Status Badge / Pill
**When**: A single status value (pending, active, closed, etc.).
**Why**: Badges leverage pre-attentive processing — color and shape are detected before
conscious reading. A colored badge communicates status in milliseconds.

### Metadata Bar / Header Block
**When**: 3-8 key facts that contextualize the entire page.
**Why**: Orientation — the reader needs to know WHAT they're looking at before they
invest in reading. The metadata bar is the "legend" for the page.

**Structure**:
```
┌────────────────────────────────────────────────────┐
│ C-0002  ●Pending   vs. Colin James Bradley         │
│ Filed Feb 28, 2026 · Da Nang, Vietnam              │
│ fraud · scam · breach of contract · identity theft  │
└────────────────────────────────────────────────────┘
```

---

## 9. Warning & Alert Patterns <a name="warning"></a>

### Pattern Recognition Card
**When**: Showing a behavioral pattern that readers should watch for.
**Why**: Pattern cards activate the reader's "threat detection" system. Presenting
warning signs as a recognizable pattern helps readers apply it to their own lives.

**Structure**:
```
┌──────────────────────────────────────────┐
│  ⚠️  RECOGNIZED PATTERN                  │
│  ─────────────────────────────────────── │
│  ✓ Targets financially independent women │
│  ✓ Rushes toward marriage                │
│  ✓ Registers assets in victim's name     │
│  ✓ Uses "family trust" story             │
│  ✓ Moves countries when exposed          │
│  ✓ Defames victims who speak up          │
│  ─────────────────────────────────────── │
│  10+ other victims reported              │
└──────────────────────────────────────────┘
```

### Alert Banner
**When**: Critical, time-sensitive, or safety-related information.
**Why**: Banners exploit pattern interrupt — they break the visual flow to demand
attention. Use sparingly or they lose effectiveness.

---

## 10. Anti-Patterns — What NOT to Do <a name="anti-patterns"></a>

### The Wall of Text
**Problem**: More than 4 consecutive paragraphs with no visual break.
**Why it fails**: Cognitive fatigue sets in after ~200 words of unbroken text. Readers
start skimming and miss critical information.
**Fix**: Break with pull quotes, stat callouts, dividers, or images every 2-3 paragraphs.

### The Data Dump
**Problem**: Showing all numbers in a single table or list.
**Why it fails**: Numbers without context are meaningless. Violates chunking principle.
**Fix**: Group related numbers into stat blocks, use visual hierarchy to emphasize the
most important figure, and provide narrative context.

### The Accordion Graveyard
**Problem**: Hiding ALL content behind accordions.
**Why it fails**: If everything is collapsed, nothing has priority. Users don't know
what to expand first and often expand nothing.
**Fix**: Show the most important content by default. Only accordion secondary details.

### The Tab Maze
**Problem**: Critical sequential information split across tabs.
**Why it fails**: Tabs imply independent categories, not sequences. Users don't read
tabs in order and may miss critical context.
**Fix**: Use scrolling sections for sequential content. Reserve tabs for truly parallel,
independent content categories.

### Uniform Monotony
**Problem**: Every section uses the same layout — same card, same spacing, same pattern.
**Why it fails**: The brain habituates to repeated patterns and stops paying attention.
This is called "banner blindness" extended to content.
**Fix**: Alternate patterns every 2-3 sections. Vary background treatments, widths,
densities, and interaction types.

### Information Orphaning
**Problem**: Related information separated by unrelated content.
**Why it fails**: Violates Gestalt principle of proximity — items near each other are
perceived as related.
**Fix**: Group related information together. Use visual containers (cards, sections) to
signal relatedness.
