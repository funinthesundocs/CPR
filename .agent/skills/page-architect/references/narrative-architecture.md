# Narrative Architecture for Story-Driven Pages

Specific guidance for pages that tell a story: case studies, legal cases, testimonials,
investigative reports, personal profiles, and long-form narratives.

---

## Table of Contents

1. [The Narrative Arc Framework](#narrative-arc)
2. [Content Sequencing for Engagement](#sequencing)
3. [Emotional Pacing Techniques](#pacing)
4. [The Hook Design](#hook)
5. [Story Chunking Strategy](#chunking)
6. [Trust Architecture](#trust)
7. [Resolution & Call-to-Action Design](#resolution)
8. [Applied Example: Legal Case Page](#example)

---

## 1. The Narrative Arc Framework <a name="narrative-arc"></a>

Every story-driven page should follow Freytag's Pyramid adapted for digital:

```
                    ┌── CLIMAX ──┐
                   ╱              ╲
                  ╱   (Emotional   ╲
                 ╱     peak —       ╲
                ╱      impact &      ╲
               ╱       testimony)     ╲
              ╱                        ╲
    RISING   ╱                          ╲  FALLING
    ACTION  ╱                            ╲ ACTION
           ╱  (Building the story:        ╲
          ╱    what happened, evidence,     ╲
         ╱     escalation)                  ╲
        ╱                                    ╲
───────╱                                      ╲──────────
EXPOSITION                                    RESOLUTION
(Hook + Context:                              (Legal status,
 who, what, where,                             warning, CTA,
 key numbers)                                  next steps)
```

### Digital Adaptation Rules

1. **Exposition is NOT the first thing the reader sees.** In digital, the HOOK comes before
   exposition. You have 3 seconds to capture attention before the reader bounces.

2. **Rising action should use progressive disclosure.** Don't dump the entire story at once.
   Reveal it through scrolling, chapters, or expandable sections.

3. **The climax should be a visual and emotional peak.** Use a distinct background treatment,
   larger typography, and a pull quote or testimony block.

4. **Falling action delivers evidence.** After the emotional peak, shift to analytical mode:
   evidence cards, corroboration, comparative data.

5. **Resolution is a CTA.** What should the reader DO with this information?

---

## 2. Content Sequencing for Engagement <a name="sequencing"></a>

The order information appears dramatically affects comprehension and engagement. Here is
the optimal sequence for story-driven pages, based on research into narrative visualization
and long-form journalism:

### The Seven-Beat Sequence

**Beat 1: THE HOOK** (0-3 seconds)
- Content: 1 headline + 2-4 stat blocks
- Pattern: Hero section with data overlay
- Goal: Answer "Why should I care?" instantly
- Example: "$565,000 stolen through years of marriage fraud"

**Beat 2: ORIENTATION** (3-15 seconds)
- Content: Who, what, where, when — metadata
- Pattern: Metadata bar + status badges + relationship card
- Goal: Orient the reader in the story
- Example: Case number, filing date, location, categories, parties involved

**Beat 3: THE SETUP** (15-60 seconds)
- Content: How the connection formed, early trust building
- Pattern: Narrative text with chapter heading + relationship timeline
- Goal: Establish the "normal" before things go wrong
- Example: "Met on social media in 2019... presented himself as friendly..."

**Beat 4: ESCALATION** (60-180 seconds)
- Content: How the deception deepened, money extracted, pattern repeated
- Pattern: Timeline + interspersed stat callouts + expandable details
- Goal: Build tension through escalating scale and audacity
- Example: $300K → $200K → $35K from sister → $30K from friends...

**Beat 5: THE REVEAL** (Climax — 180-240 seconds)
- Content: The moment the truth was discovered + independent confirmation
- Pattern: Pull quote + testimony card + two-column comparison (said vs. truth)
- Goal: Maximum emotional impact + credibility
- Example: Photo from mutual friend → call to Sissy → full pattern exposed

**Beat 6: THE EVIDENCE** (240-300 seconds)
- Content: Corroborating witnesses, documents, legal records
- Pattern: Evidence gallery + corroboration matrix + witness cards
- Goal: Shift from emotion to proof — satisfy the analytical reader
- Example: Witness cards for Sissy, boat builders, mutual friends

**Beat 7: RESOLUTION & WARNING** (300+ seconds)
- Content: Legal status, what happens next, warning to others
- Pattern: Legal summary card + pattern recognition card + CTA
- Goal: Give the reader a clear takeaway and action path
- Example: Default judgment info + behavioral pattern warning + "protect yourself"

---

## 3. Emotional Pacing Techniques <a name="pacing"></a>

Like a film score, a narrative page needs dynamic range. Constant intensity is exhausting.
Constant calm is boring.

### The Tension-Release Pattern

```
High  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
      ░░░░░░                  ████░░░░░░░░░░░░░░░░░░
      ░░░░░░    ████░░░░░░████    ░░░░████░░░░░░░░░░
      ░░░░████░░    ░░████        ░░░░    ░░████░░░░
      ████    ░░░░░░░░            ░░░░░░░░░░    ████
Low   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
      Hook  Data  Story  Data  Story  Evidence  CTA
                ↑          ↑                 ↑
             Breather   Breather          Breather
```

### Pacing Rules
- After every emotional section, include a "breather" — data, metadata, or a neutral visual
- Never stack more than 2 emotional sections consecutively
- Data sections serve as emotional palate cleansers
- The page should have exactly ONE climactic moment, not multiple
- White space IS a pacing tool — use generous padding after intense sections

### Transition Types Between Sections

**Hard transition**: Full-width divider, background color change, chapter heading.
Use between major narrative beats.

**Soft transition**: Subtle spacing increase, faded border, transitional sentence.
Use between sub-beats within the same narrative phase.

**Visual transition**: An image, chart, or visual element that bridges two sections.
Use to shift from narrative to analytical mode.

---

## 4. The Hook Design <a name="hook"></a>

The hook is the single most critical element on the page. Research shows users decide
whether to stay within 3-10 seconds.

### Hook Components (in order of priority)

1. **The Number**: A striking statistic that quantifies the story
   - "$565,000 stolen through marriage fraud"
   - "6-year deception across 4 countries"

2. **The Headline**: Who vs. who, in the fewest possible words
   - "vs. Colin James Bradley"

3. **The Status Signal**: Is this active, resolved, urgent?
   - Status badge (Pending, Active, Resolved)

4. **The Summary Line**: One sentence that captures the essence
   - Maximum 25 words. Must convey the central conflict.

### Hook Layouts

**Option A: Data-Led Hook** (best for cases with dramatic numbers)
```
┌─────────────────────────────────────────────┐
│              $565,000                        │
│     vs. Colin James Bradley                 │
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ ●Pending│ │4 Witness│ │11 Events│         │
│  └────────┘ └────────┘ └────────┘          │
│                                             │
│  "Married me while concealing bankruptcy,   │
│   then extracted $500K through years of     │
│   lies about a European family trust."      │
└─────────────────────────────────────────────┘
```

**Option B: Quote-Led Hook** (best for emotionally compelling testimony)
```
┌─────────────────────────────────────────────┐
│  "He used my money to date other women      │
│   throughout our entire marriage."           │
│                                             │
│  vs. Colin James Bradley                    │
│  $565K in documented losses                 │
│  Case C-0002 · Pending                      │
└─────────────────────────────────────────────┘
```

**Option C: Verdict-Led Hook** (best for resolved cases)
```
┌─────────────────────────────────────────────┐
│  JUDGMENT: $340,000 AED DEFAULT JUDGMENT    │
│                                             │
│  vs. Colin James Bradley                    │
│  $565K in documented losses                 │
│  6-year fraud spanning 4 countries          │
└─────────────────────────────────────────────┘
```

---

## 5. Story Chunking Strategy <a name="chunking"></a>

Long narratives must be broken into chapters. Here's how to identify natural break points:

### Break Point Indicators
- **Location change**: When the story moves to a new place
- **Time jump**: When significant time passes between events
- **Escalation**: When the stakes increase significantly
- **Character introduction**: When a new key person enters the story
- **Revelation**: When a major truth is discovered
- **Mode shift**: When the story moves from personal to legal, emotional to analytical

### Optimal Chapter Length
- **Web**: 150-400 words per chapter (2-4 short paragraphs)
- **Mobile**: 100-250 words per chapter (shorter for thumb-scrolling)
- **Interactive**: 50-150 words per step (for scrollytelling)

### Chapter Title Strategy
Titles should create curiosity and forward momentum. They're micro-hooks.

BAD chapter titles (generic, no tension):
- "Background"
- "Section 2: Events"
- "Financial Details"

GOOD chapter titles (specific, tension-building):
- "The Meeting: Melbourne, 2019"
- "The Companies Nobody Asked For"
- "$300,000 in Good Faith"
- "Thailand, Dubai, Vietnam — Always Moving"
- "The Photo That Changed Everything"
- "Sissy's Story: The Same Script, Different Actress"

---

## 6. Trust Architecture <a name="trust"></a>

For pages making claims about others (legal cases, reports, reviews), trust must be
actively constructed through the information architecture.

### The Trust Pyramid

```
                 ┌─────────┐
                 │  Legal   │ ← Hardest evidence: court records, judgments
                 │ Records  │
                ┌┴─────────┴┐
                │ Independent│ ← Third-party confirmation
                │Corroboration│
               ┌┴───────────┴┐
               │  Documented  │ ← Financial records, communications
               │  Evidence    │
              ┌┴─────────────┴┐
              │  Pattern       │ ← Multiple victims, repeated behavior
              │  Recognition   │
             ┌┴───────────────┴┐
             │  First-Person    │ ← The plaintiff's own account
             │  Testimony       │
            ┌┴─────────────────┴┐
            │  Claims & Demands  │ ← What the plaintiff wants
            └───────────────────┘
```

**Principle**: Present from bottom to top during the narrative (build trust), but
DISPLAY the trust level of each piece of information visually (badges, icons, labels).

### Trust Signals in UI
- **Verified badge**: For information confirmed by independent sources
- **Document icon**: For claims backed by documentary evidence
- **Source label**: For every quote or claim, show who said it
- **Date stamps**: For temporal anchoring — when something was said or documented
- **Corroboration count**: "Confirmed by 3 independent sources"

---

## 7. Resolution & Call-to-Action Design <a name="resolution"></a>

The final section must answer: "Now what?"

### Resolution Components
1. **Status summary**: Current legal/procedural status in a clean card
2. **Pattern warning**: If applicable, a behavioral pattern card for future victims
3. **Primary CTA**: The ONE thing the reader should do next
4. **Secondary actions**: Share, report, contact, download
5. **Attribution**: Who filed this, when, and why

### CTA Strategy by Page Purpose

| Page Purpose | Primary CTA | Secondary CTAs | Emotional Tone |
|---|---|---|---|
| **Legal case / claim** | Report similar experience | Share, Download PDF, Contact | Protective, urgent |
| **Investigative report** | Subscribe / Follow updates | Share, Download, Cite | Informational |
| **Testimonial / review** | Leave your own review | Share, Report, Contact | Communal |
| **Profile / about page** | Contact / Connect | Follow, Portfolio, Resume | Professional |
| **Product case study** | Start free trial / Demo | Pricing, Docs, Contact sales | Aspirational |
| **Public warning** | Check if you're affected | Report, Share, Resources | Urgent, protective |

### CTA Hierarchy (Fitts's Law applied)
```
┌─────────────────────────────────────┐
│  ██████████████████████████████████  │ ← Primary: large, prominent, full-width
│  ██  Report Similar Experience  ██  │
│  ██████████████████████████████████  │
│                                     │
│  [Share]  [Download PDF]  [Contact] │ ← Secondary: smaller, inline
└─────────────────────────────────────┘
```

### Resolution Bookending
The resolution section should visually "bookend" the hook. If the hook used a dark
background with accent stats, the resolution should echo that treatment — creating a
sense of visual closure (Gestalt closure principle applied to page structure).

---

## 8. Applied Example: Legal Case Page <a name="example"></a>

Here's how to apply all principles to a page like a fraud case:

### Content Audit Results

```
Content Block                    | Type          | Priority | Pattern
────────────────────────────────┼──────────────┼─────────┼──────────────
Case number, status, categories | Factual       | High     | Metadata bar
Defendant name + charges        | Factual       | Critical | Hero headline
$565K damages claimed           | Quantitative  | Critical | Stat block
Case summary (long narrative)   | Narrative     | High     | Chapter sections
Timeline of fraud (11 events)   | Sequential    | High     | Vertical timeline
Financial breakdown             | Quantitative  | High     | Impact card + breakdown
Relationship details            | Relational    | Medium   | Relationship card
Basis of trust                  | Evidentiary   | Medium   | Expandable section
Witnesses (4)                   | Evidentiary   | High     | Witness cards
Emotional testimony             | Emotional     | High     | Pull quote
Behavioral pattern              | Warning       | High     | Pattern card
Legal actions + judgment        | Legal         | Medium   | Legal summary card
Why filing publicly             | Advisory      | Medium   | Callout block
Other victims mentioned         | Warning       | High     | Alert banner
```

### Resulting Page Architecture

```
Section 1: HERO HOOK
├── Pattern: Data-led hook
├── Content: $565K + defendant name + status badge + 1-sentence summary
├── Principle: Serial Position (primacy) + Von Restorff + Anchoring Effect
├── Density: Medium
├── Emotional Tone: Urgent / authoritative
├── Interaction: Static (no clicks needed — instant comprehension)
├── Transition In: N/A (page entry point)
├── Transition Out: Hard transition — background shift into metadata section
├── Background: Dark / accent
├── Width: Full-bleed
├── Component: HeroSection with StatBlockRow + StatusBadge + SummaryText

Section 2: CASE METADATA
├── Pattern: Metadata bar + tag badges + key-value grid
├── Content: Case number, date, location, categories, parties
├── Principle: Cognitive Chunking + Orientation
├── Density: High (compact)
├── Emotional Tone: Neutral / informational
├── Interaction: Static
├── Transition In: Contrast from dramatic hook to clean data
├── Transition Out: Soft transition — spacing into first narrative chapter
├── Background: Light / subtle
├── Width: Contained
├── Component: CaseMetadataBar with TagBadges + KeyValueGrid

Section 3: THE STORY — Chapter 1: "The Meeting"
├── Pattern: Chapter heading + narrative text (2-3 paragraphs)
├── Content: How they met, his presentation of himself
├── Principle: Narrative Arc (exposition) + Narrative Transportation
├── Density: Medium
├── Emotional Tone: Neutral → building unease
├── Interaction: Static (let the story flow)
├── Transition In: Chapter heading with decorative number
├── Transition Out: Soft transition into next chapter
├── Background: Dark
├── Width: Narrow (reading-width, ~65ch max)
├── Component: ChapterSection with ChapterHeading + NarrativeText

Section 4: THE STORY — Chapter 2: "The Investment"
├── Pattern: Narrative text + embedded stat callout ($300K)
├── Content: Marriage, companies, financial entanglement
├── Principle: Escalation + Dual Coding (stat + story) + Anchoring
├── Density: Medium
├── Emotional Tone: Tense / escalating
├── Interaction: Static with inline stat accent
├── Transition In: Continuation from previous chapter
├── Transition Out: Hard transition — full-width data break
├── Background: Dark (continuation)
├── Width: Narrow with stat callout breaking to medium width
├── Component: ChapterSection with InlineStatCallout

Section 5: FINANCIAL IMPACT (Visual Break)
├── Pattern: Impact card with breakdown + stacked bar or waterfall
├── Content: $300K + $200K + $35K + $30K = $565K
├── Principle: Chunking + Variety (data break after narrative) + Dual Coding
├── Density: High (but visually organized)
├── Emotional Tone: Authoritative / stark
├── Interaction: Hover for detail on each segment
├── Transition In: Hard — full background change, different section feel
├── Transition Out: Visual transition back into story mode
├── Background: Accent / contrasting
├── Width: Contained (medium)
├── Component: FinancialImpactCard with BreakdownBar + ComponentCards

Section 6: THE STORY — Chapter 3: "The Unraveling"
├── Pattern: Timeline (key events) + narrative for the reveal moment
├── Content: Thailand → Dubai → Vietnam → The photo → Sissy's story
├── Principle: Sequential + Zeigarnik (building toward reveal) + Transportation
├── Density: Medium-High
├── Emotional Tone: Tense → shocking
├── Interaction: Timeline nodes expandable for detail
├── Transition In: Visual bridge from data back to narrative
├── Transition Out: Hard transition to climax (visual peak)
├── Background: Dark
├── Width: Contained with timeline at medium width
├── Component: TimelineSection with ExpandableTimelineNode

Section 7: THE REVEAL — Climax
├── Pattern: Pull quote + two-column comparison (what he said vs. truth)
├── Content: Key quotes, Sissy's confirmation, boat builders' confirmation
├── Principle: Von Restorff + Contrast + Emotional peak + Transportation climax
├── Density: Low (breathing room, emphasis through space)
├── Emotional Tone: Empathetic / devastating
├── Interaction: Static — let the content hit
├── Transition In: Hard — distinct background, larger typography
├── Transition Out: Soft transition to evidence (emotional → analytical shift)
├── Background: Accent (distinct from everything before and after)
├── Width: Full-bleed background, narrow content
├── Component: ClimaxSection with PullQuote + ComparisonTable

Section 8: WITNESSES & CORROBORATION
├── Pattern: Witness card grid (4 cards)
├── Content: Each witness, their relationship, what they confirm
├── Principle: Social Proof + Evidence hierarchy
├── Density: Medium
├── Emotional Tone: Authoritative / evidential
├── Interaction: Cards expandable for full testimony
├── Transition In: Analytical shift — "this is backed by proof"
├── Transition Out: Soft transition to warning
├── Background: Light / subtle
├── Width: Contained (card grid)
├── Component: WitnessGrid with WitnessCard (expandable)

Section 9: BEHAVIORAL PATTERN WARNING
├── Pattern: Pattern recognition card (checklist format)
├── Content: List of red flags and behavioral patterns
├── Principle: Warning + Practical utility for readers + Von Restorff
├── Density: Medium
├── Emotional Tone: Urgent / protective
├── Interaction: Static
├── Transition In: From evidence to implication — "here's what this means for you"
├── Transition Out: Hard transition into resolution
├── Background: Warning accent (amber/red-tinted)
├── Width: Contained (narrow-medium)
├── Component: PatternWarningCard with ChecklistItems

Section 10: LEGAL STATUS & RESOLUTION
├── Pattern: Legal summary card + CTA block
├── Content: Dubai judgment, divorce proceedings, nominal damages
├── Principle: Serial Position (recency) + Resolution
├── Density: Low-Medium
├── Emotional Tone: Authoritative / resolving
├── Interaction: CTA buttons
├── Transition In: From warning to action — "here's what's being done"
├── Transition Out: N/A (page end) — footer follows
├── Background: Dark (bookend matching hero)
├── Width: Contained
├── Component: ResolutionSection with LegalSummaryCard + CTABlock
```

### Handling Defendant Response Sections

Many case/claim pages include a space for the opposing party's response. Architecture rules:

1. **Position**: Place AFTER the plaintiff's full narrative and evidence, but BEFORE the
   resolution section. The reader needs full context before seeing a response.
2. **Visual distinction**: Use a clearly different visual treatment (border style, background)
   to signal "this is a different voice." Never let it blend with the plaintiff's narrative.
3. **Status handling**:
   - If response exists: Display in a distinct card with the respondent's name and date
   - If no response yet: Show a clearly-labeled empty state: "No response filed. The
     respondent has been notified and may respond at any time."
   - If response is pending: Show status with timeline context
4. **Neutrality**: The page architecture should present both sides with equal structural
   dignity, even if the content is asymmetric. Use the same card/section patterns for both.

### Variety Check ✓
- 7+ distinct UI patterns used
- No pattern repeats more than twice
- Background alternates: dark → light → dark → accent → light...
- Density oscillates: medium → high → medium → medium → high → medium → low → medium → medium → low
- Emotional arc: hook → context → build → data break → build → climax → evidence → warning → resolution
