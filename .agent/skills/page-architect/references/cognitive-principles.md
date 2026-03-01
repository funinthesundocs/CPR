# Cognitive Principles for Page Architecture

The psychological science behind why certain information presentations work better than
others. Use this reference when you need to understand the WHY behind pattern choices.

---

## Table of Contents

1. [Miller's Law & Cognitive Chunking](#millers-law)
2. [Progressive Disclosure](#progressive-disclosure)
2a. [Anchoring Effect](#anchoring)
2b. [Narrative Transportation](#transportation)
3. [Serial Position Effect](#serial-position)
4. [Von Restorff Isolation Effect](#von-restorff)
5. [Hick's Law — Decision Complexity](#hicks-law)
6. [Fitts's Law — Interaction Targets](#fitts-law)
7. [Gestalt Principles](#gestalt)
8. [F-Pattern & Z-Pattern Scanning](#scanning)
9. [Zeigarnik Effect — Incomplete Tasks](#zeigarnik)
10. [Cognitive Load Theory](#cognitive-load)
11. [Dual Coding Theory](#dual-coding)
12. [Emotional Processing & Memory](#emotional)
13. [Social Proof & Source Credibility](#social-proof)
14. [The Variety Principle](#variety)

---

## 1. Miller's Law & Cognitive Chunking <a name="millers-law"></a>

**The Science**: George Miller (1956) demonstrated that working memory can hold approximately
7 ± 2 items simultaneously. This is the single most important constraint in information design.

**Application in Page Architecture**:
- No viewport should present more than 7 discrete information items
- Group related items into chunks (a group counts as 1 item)
- Navigation menus: 5-7 top-level items maximum
- Stat blocks: 3-6 numbers per row
- Timeline events visible at once: 5-7 before requiring scroll

**Implementation Examples**:

BAD — 12 ungrouped facts:
```
Case: C-0002 | Status: Pending | Filed: Feb 28 | Location: Vietnam |
Previously: Dubai | Before: Bangkok | Before: Gold Coast | Categories:
fraud, scam, breach, identity theft | Damages: $565K | Evidence: 0 |
Witnesses: 4 | Timeline: 11 events
```

GOOD — 3 chunks of related items:
```
[Identity]          [Status]           [Scope]
C-0002              ●Pending           $565K damages
vs. Colin Bradley   Filed Feb 2026     4 witnesses
fraud, scam,        Da Nang, Vietnam   11 timeline events
breach, ID theft
```

---

## 2. Progressive Disclosure <a name="progressive-disclosure"></a>

**The Science**: Pioneered by Ben Shneiderman in the 1980s and refined through decades of
HCI research, progressive disclosure reduces cognitive load by presenting only essential
information first, with additional detail available on demand. Nielsen Norman Group research
consistently shows it improves both comprehension and satisfaction.

**Three Levels of Disclosure**:
1. **Essential** (always visible): The minimum information needed to understand what this is
2. **Expected** (one click away): Detail that most engaged readers want
3. **Supplementary** (on deep demand): Full records, raw data, legal text

**Application by Content Type**:

| Content | Essential (visible) | Expected (1 click) | Supplementary (deep) |
|---------|-------------------|-------------------|---------------------|
| Case summary | 2-3 sentence overview | Full narrative | Raw filings |
| Timeline | Key events with dates | Event details | Supporting documents |
| Evidence | Thumbnail + title | Full document view | Metadata, chain of custody |
| Witness | Name + relationship | Full testimony | Contact info (if authorized) |
| Financial | Total loss figure | Breakdown by category | Individual transactions |
| Legal | Current status | Action details | Full legal text |

**UI Patterns for Each Level**:
- Level 1 → 2: Accordion, "Read more" link, expandable card, tooltip
- Level 2 → 3: Modal, new page, lightbox, document viewer
- Never use more than 3 levels of disclosure in a single component

---

## 2a. Anchoring Effect <a name="anchoring"></a>

**The Science**: Tversky & Kahneman (1974) demonstrated that the first number a person
sees disproportionately influences their perception of subsequent numbers. This is called
the "anchoring heuristic" and it is one of the most robust findings in cognitive psychology.

**Application in Page Architecture**:
- **Lead with the biggest number**: If the total loss is $565,000, show that FIRST.
  Everything after it will be perceived relative to that anchor.
- **Financial breakdowns**: Show the total before the components. Seeing "$565K total"
  first makes each component ($300K, $200K, $65K) feel proportionally significant.
- **Time spans**: "6-year deception" anchors the reader's sense of scale before individual
  events are described.
- **Victim counts**: "10+ other victims reported" anchors the severity before details emerge.

**Anti-pattern**: Burying the biggest number in the middle or end of a section. If the
anchor appears late, readers have already formed a weaker frame of reference.

**In Hook Design**: The anchor number should be the FIRST thing the reader processes.
This is why stat-block hooks work — they set the cognitive anchor before any narrative begins.

---

## 2b. Narrative Transportation <a name="transportation"></a>

**The Science**: Green & Brock (2000) identified "narrative transportation" — the experience
of being cognitively and emotionally absorbed into a story. When transported, readers:
- Process information less critically (they "believe" more)
- Form stronger emotional responses
- Remember the content longer
- Are more likely to change attitudes or take action

**Application in Page Architecture**:
- **Maintain narrative flow**: Don't interrupt a story section with unrelated data or
  navigation. Each interruption breaks transportation and requires re-engagement effort.
- **Use concrete, sensory details**: "I borrowed $35,000 from my sister" transports more
  effectively than "additional funds were obtained from family members."
- **Character identification**: Help readers identify with the protagonist BEFORE presenting
  claims. The Setup beat (Beat 3) exists for this purpose.
- **Minimize UI chrome during story sections**: During narrative flow, reduce visible
  navigation, sidebars, and interactive elements. The reader should be IN the story.
- **Strategic interruption**: When you DO break flow (for a stat callout or data section),
  make it brief and use a clear visual "bridge" back into the narrative.

**The Transportation Paradox**: The more absorbed a reader is, the more jarring an
interruption feels — BUT the more powerful a well-placed visual break becomes. This is
why the Variety Principle works: interruptions refresh attention, but only if the reader
was engaged enough to notice the change.

---

## 3. Serial Position Effect <a name="serial-position"></a>

**The Science**: People remember the first items (primacy effect) and last items (recency
effect) in a sequence far better than middle items. This was established by Ebbinghaus
(1885) and replicated extensively.

**Application in Page Architecture**:

```
Page Start (PRIMACY ZONE) ← Put the hook here: key stats, emotional headline
│
│  Middle of page ← Supporting detail, evidence, methodology
│  (Lower recall zone)    This is where you put important-but-forgettable content
│                         Use strong visual patterns to compensate for memory weakness
│
Page End (RECENCY ZONE) ← Put the CTA, warning, or key takeaway here
```

**Specific Guidance**:
- First viewport: The single most important piece of information or emotional hook
- Last section: Call to action, summary of key points, or the "so what?" conclusion
- Middle sections: Use varied UI patterns to fight recall weakness
- For lists: Put the most important item first AND last (repeat if critical)

---

## 4. Von Restorff Isolation Effect <a name="von-restorff"></a>

**The Science**: Items that are visually distinct from their surroundings are remembered
better. Named after Hedwig von Restorff (1933).

**Application**: Use visual isolation for the ONE thing readers must remember from each section.

**Techniques**:
- Pull quotes: Visually distinct text blocks within narrative sections
- Stat blocks: Numbers in large type against a different background
- Alert banners: Colored warnings that break the page flow
- Highlighted rows in tables or timelines
- A single bold sentence in a paragraph

**Warning**: If EVERYTHING is visually distinct, NOTHING is. Isolation only works when
it's... isolated. Use sparingly — maximum 1 isolated element per scroll height.

---

## 5. Hick's Law <a name="hicks-law"></a>

**The Science**: Decision time increases logarithmically with the number of choices.
More options = longer decision time = higher chance of abandonment.

**Application**:
- Navigation: 5-7 choices maximum per level
- Filters: Show 3-5 most common, hide the rest behind "more filters"
- CTAs: One primary action per section, with at most 1 secondary
- Tab sets: 3-5 tabs (7 absolute maximum)

---

## 6. Fitts's Law <a name="fitts-law"></a>

**The Science**: The time to reach a target is proportional to the distance and inversely
proportional to the target's size. Larger, closer targets are faster to interact with.

**Application**:
- Primary CTAs: Large buttons, prominent placement
- Interactive timeline nodes: Minimum 44x44px touch targets
- Accordion toggle areas: Full-width clickable headers (not just the arrow icon)
- Expandable cards: The entire card should be the click target, not just a small link

---

## 7. Gestalt Principles <a name="gestalt"></a>

The Gestalt principles describe how humans perceive visual groupings. These are foundational
to every layout decision.

### Proximity
Items near each other are perceived as related. Items far apart are perceived as separate.

**Application**: Use consistent spacing to signal relationships:
- Related items: 8-16px gap
- Grouped items within a section: 16-24px gap
- Between sections: 48-80px gap

### Similarity
Items that look similar are perceived as related.

**Application**: Use consistent styling for items of the same type:
- All stat blocks look the same
- All evidence cards share a visual treatment
- All timeline nodes share a shape

### Continuity
The eye follows smooth paths. Elements arranged along a line or curve are perceived as related.

**Application**: Timelines, progress bars, flow diagrams — arrange sequential elements
along a visible path.

### Closure
The brain completes incomplete shapes. You don't need to draw every border.

**Application**: Use partial borders, implied containers (background color without border),
and whitespace to create visual groupings without heavy borders.

### Figure-Ground
The brain separates foreground from background. Use contrast to ensure important elements
are perceived as foreground.

**Application**: Cards, modals, elevated sections, drop shadows — all techniques that
bring content "forward" from the background.

---

## 8. F-Pattern & Z-Pattern Scanning <a name="scanning"></a>

**The Science**: Eye-tracking research (Nielsen, 2006) shows predictable scanning patterns.

### F-Pattern (Text-heavy pages)
```
████████████████████████    ← First: horizontal scan across top
████████████████            ← Second: shorter horizontal scan
██                          ← Third: vertical scan down left side
██
██
```

**When to design for F-pattern**: Long-form content, articles, case studies, documentation.
**How**: Place key information along the top and left. Use headings and first sentences
of paragraphs to front-load important content.

### Z-Pattern (Visual / landing pages)
```
████████████████████████    ← Top: logo, nav, headline
              ████████      ← Diagonal: eye crosses to middle content
████████████████████████    ← Bottom: CTA, conclusion
```

**When to design for Z-pattern**: Pages with less text, hero sections, summary views.
**How**: Place the hook top-left, supporting content in the diagonal, CTA bottom-right.

### Implication for Page Architecture
The first 2-3 words of every section heading carry disproportionate weight. Front-load
meaning: "Financial Breakdown: $565K Lost" is better than "Summary of Damages and
Financial Impact Assessment."

---

## 9. Zeigarnik Effect <a name="zeigarnik"></a>

**The Science**: People remember uncompleted tasks better than completed ones. This creates
psychological tension that motivates continuation.

**Application in Page Architecture**:
- Progress indicators on long pages ("Section 3 of 6")
- Timeline events that build toward an unresolved outcome
- Scrollytelling that reveals information gradually
- "Continue reading" prompts at natural break points
- Cliffhanger section endings that motivate scrolling

---

## 10. Cognitive Load Theory <a name="cognitive-load"></a>

**The Science**: John Sweller (1988) identified three types of cognitive load:
- **Intrinsic**: Complexity inherent in the information itself
- **Extraneous**: Load caused by poor presentation (bad design)
- **Germane**: Load that contributes to understanding (good challenge)

**Goal**: Minimize extraneous load. Manage intrinsic load through chunking and sequencing.
Maximize germane load through engaging patterns.

**Extraneous Load Reducers**:
- Semantic HTML and clear visual hierarchy
- Consistent layout patterns across sections
- Familiar UI conventions (tabs, accordions, cards)
- White space between information groups
- Visual indicators instead of text explanations

**Germane Load Enhancers**:
- Varied presentation patterns that maintain attention
- Interactive elements that require active processing
- Comparison layouts that encourage analysis
- Narrative structure that creates meaning from data

---

## 11. Dual Coding Theory <a name="dual-coding"></a>

**The Science**: Allan Paivio (1971) demonstrated that information encoded in BOTH
verbal and visual channels is remembered significantly better than either alone.

**Application**: Every major claim or data point should have both a text component AND
a visual component:

| Information | Text Encoding | Visual Encoding |
|---|---|---|
| $565K loss | "Total documented losses: $565,000" | Stat block with large number |
| Timeline | Narrative paragraphs | Visual timeline with nodes |
| Pattern | Warning text | Checklist with checkmarks |
| Financial breakdown | Dollar amounts in text | Proportional bar chart or pie |
| Witnesses | Written testimony | Testimony cards with avatars |

---

## 12. Emotional Processing & Memory <a name="emotional"></a>

**The Science**: Emotionally-charged information is processed in the amygdala in addition
to the cortex, creating stronger and more durable memories. This is called the
"emotional enhancement effect" on memory.

**Application in Page Architecture**:
- **Emotional pacing**: Alternate between factual/neutral and emotional content.
  Too much emotion causes fatigue; too little causes disengagement.
- **Concrete details**: Specific amounts, dates, and names create stronger emotional
  responses than vague claims. "$35,000 borrowed from her sister" hits harder than
  "money borrowed from family."
- **Testimony placement**: Place the most powerful emotional testimony at the natural
  climax of the narrative arc (approximately 70-80% through the page).
- **Breathing room**: After a heavy emotional section, provide a neutral section (data,
  legal details, metadata) before the next emotional section.

**Emotional Arc for a Case Page**:
```
Engagement ▲
           │        ╱╲
           │       ╱  ╲         ╱╲
           │   ╱╲ ╱    ╲       ╱  ╲
           │  ╱  ╲      ╲     ╱    ╲
           │ ╱    Context ╲   ╱  CTA ╲
           │╱               ╲╱        ╲
           └────────────────────────────►
           Hook  Build  Climax  Evidence  Resolution
```

---

## 13. Social Proof & Source Credibility <a name="social-proof"></a>

**The Science**: Cialdini (1984) identified social proof as one of 6 principles of persuasion.
People are more persuaded by claims supported by multiple independent sources than by a
single source, regardless of the strength of that single source. This effect is amplified
when sources are perceived as independent, credible, and similar to the reader.

**Application**:
- Show witness/corroboration counts prominently
- Present independent confirmations as separate cards (not a combined paragraph)
- Use a "corroboration matrix" when multiple sources confirm the same facts
- Third-party quotes are more credible than first-party claims — feature them prominently
- Authority signals (legal judgments, official records) should be visually distinct from
  personal testimony

**Source Credibility Hierarchy** (from most to least persuasive):
1. **Official records**: Court judgments, government filings, financial records
2. **Independent expert confirmation**: Professional assessments, audits
3. **Independent witness corroboration**: Unrelated third parties confirming the same facts
4. **Affiliated witness testimony**: Friends, family, colleagues who can confirm events
5. **First-person account**: The claimant's own narrative
6. **Unverified claims**: Statements without supporting evidence

**Visual Implementation**:
- Each source type should have a distinct visual treatment (icon, badge, or border style)
- Group evidence by credibility tier, with the strongest evidence most prominent
- Show corroboration counts inline: "Confirmed by 3 independent sources" next to a claim
- Use the corroboration matrix pattern (see pattern-selection-guide.md) when 3+ sources
  confirm 3+ claims — this is the most powerful trust-building pattern available

**When Social Proof Backfires**:
- Showing zero evidence items or zero witnesses REDUCES trust (worse than not showing counts)
- If evidence is weak, focus on narrative strength instead of evidence counts
- Don't fabricate or inflate corroboration — it undermines the entire trust architecture

---

## 14. The Variety Principle <a name="variety"></a>

**The Science**: The brain habituates to repeated stimuli — a process called "neural
adaptation." When the same visual pattern repeats, the brain literally reduces its
processing of subsequent instances. This is why endless same-format sections feel "boring."

**Application — The 2-Section Rule**:
Never use the same UI pattern for more than 2 consecutive content sections. After 2
sections of the same type, the brain starts to habituate and engagement drops.

**Variety Rotation Example**:
```
Section 1: [Stat blocks]        — Data display
Section 2: [Narrative text]     — Story
Section 3: [Timeline]           — Sequential
Section 4: [Pull quote]         — Emotional emphasis
Section 5: [Evidence cards]     — Visual grid
Section 6: [Two-column compare] — Analytical
Section 7: [Alert/Warning]      — Pattern interrupt
Section 8: [CTA block]          — Action
```

Each section uses a DIFFERENT primary pattern. This is what keeps a reader's brain engaged
through a long page.

**Variety Dimensions to Rotate**:
- Layout: full-width ↔ contained ↔ asymmetric
- Density: spacious ↔ dense ↔ medium
- Background: light ↔ dark ↔ accent
- Interaction: static ↔ expandable ↔ scrollable
- Content type: text ↔ data ↔ visual ↔ interactive
