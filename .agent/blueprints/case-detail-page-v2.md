# Case Detail Page — Architecture Blueprint v2

> Target: `src/app/cases/[slug]/page.tsx`
> Strategy: Eliminate Tab Maze. Scroll-based narrative. 10 sections with pattern variety.
> Data fetching: UNCHANGED. Only presentation layer changes.

---

## Section Flow (Top to Bottom)

```
S1  HERO HOOK           — bg-card accent border    — Full width
S2  CASE METADATA BAR   — bg-muted/30              — Contained
S3  THE CONNECTION       — bg-background            — Narrow (prose)
S4  THE PROMISE          — bg-muted/10              — Narrow + comparison inset
S5  FINANCIAL IMPACT     — bg-destructive/5 border  — Contained (visual break)
S6  THE BETRAYAL         — bg-background            — Narrow + timeline inset
S7  THE REVEAL (CLIMAX)  — bg-primary/5 border      — Full-bleed bg, narrow content
S8  WITNESSES & EVIDENCE — bg-muted/20              — Card grid
S9  PATTERN WARNING      — bg-destructive/5         — Contained narrow
S10 RESOLUTION & CTA     — bg-card accent border    — Contained (bookend)
--- VOTE CTA             — existing component
--- COMMENTS             — existing component
```

Background check: card → muted → bg → muted/10 → destructive → bg → primary → muted → destructive → card. No consecutive repeats.

---

## Field → Section Mapping

### S1: HeroHook

| Field | Source | Display |
|-------|--------|---------|
| `caseData.case_number` | direct | Font-mono badge, top-left |
| `caseData.status` | direct | Status badge with color from `statusColors` |
| `defendant.full_name` | joined | `vs. {name}` as h1 headline, linked to defendant page |
| `defendant.photo_url` | joined | Avatar (80px rounded, ring) |
| `story.one_line_summary` | JSONB | Italic quote beneath headline |
| `financialTotal` | computed | DOMINANT number — large type, anchoring element |
| `(evidence).length` | count | Stat block |
| `(witnesses).length` | count | Stat block |
| `(timeline).length` | count | Stat block |
| `vis.tier` | JSONB | Visibility badge if not "open" |
| `betrayal.is_ongoing` | JSONB | "Ongoing" warning badge if "yes" |
| `verdict` | query | If exists: verdict banner rendered INSIDE hero (below stats) |

**Empty rule**: Always renders. `financialTotal=0` shows "$0". Stat blocks show "0" counts.

**Props**:
```ts
type HeroHookProps = {
  caseNumber: string
  status: string
  defendant: { full_name: string; slug: string; photo_url: string | null; location: string | null }
  summary: string
  financialTotal: number
  evidenceCount: number
  witnessCount: number
  timelineCount: number
  visibility: string
  isOngoing: boolean
  verdict: VerdictResult | null
}
```

---

### S2: CaseMetadataBar

| Field | Source | Display |
|-------|--------|---------|
| `caseData.case_types` | direct | Badge row (secondary variant) |
| `caseData.created_at` | direct | "Filed {date}" formatted |
| `defendant.location` | joined | Location with MapPinIcon |
| `relationship.type` | JSONB | "Relationship: {type}" key-value |
| `relationship.duration` | JSONB | "Duration: {value}" key-value |

**Empty rule**: Always renders (case_number and date always exist). Omit individual fields that are empty.

**Props**:
```ts
type CaseMetadataBarProps = {
  caseTypes: string[]
  filedDate: string
  location: string | null
  relationshipType: string
  relationshipDuration: string
}
```

---

### S3: ChapterSection — "The Connection"

| Field | Source | Display |
|-------|--------|---------|
| `relationship.first_interaction` | JSONB | FactBlock: "How They Met" |
| `relationship.early_warnings` | JSONB | FactBlock: "Early Warning Signs" |

**Chapter title**: "The Connection"
**Empty rule**: SKIP entire section if both fields are empty.
**Rendering**: Structured FactBlocks (label + value), NOT AI-generated prose. But styled with chapter heading and narrow reading width for visual differentiation from metadata.

---

### S4: ChapterSection — "The Promise"

| Field | Source | Display |
|-------|--------|---------|
| `promise.explicit_agreement` | JSONB | FactBlock: "Agreement Made" |
| `promise.agreement_terms` | JSONB | FactBlock: "Terms" |
| `promise.reasonable_expectation` | JSONB | FactBlock: "Why It Seemed Reasonable" |
| `promise.evidence_of_trust` | JSONB | FactBlock: "Evidence of Good Faith" |
| `promise.others_vouch` | JSONB | FactBlock: "Third-Party Endorsement" |

**Chapter title**: "The Promise"
**Empty rule**: SKIP if all fields empty.

---

### S5: FinancialImpactCard

| Field | Source | Display |
|-------|--------|---------|
| `fi.direct_payments` | query | Breakdown item with proportional bar |
| `fi.lost_wages` | query | Breakdown item |
| `fi.property_loss` | query | Breakdown item |
| `fi.legal_fees` | query | Breakdown item |
| `fi.medical_costs` | query | Breakdown item |
| `fi.credit_damage` | query | Breakdown item |
| `fi.other_amount` | query | Breakdown item (label from `fi.other_description`) |
| `financialTotal` | computed | Large total number at top (anchor) |

**Empty rule**: SKIP if `financialTotal === 0` AND no `financialImpacts` record.
**Layout**: Total as dominant number at top. Individual items as horizontal bars showing proportion of total. Each bar labeled with category + dollar amount.

**Props**:
```ts
type FinancialImpactCardProps = {
  total: number
  breakdown: { label: string; amount: number }[]
}
```

---

### S6: ChapterSection — "The Betrayal" + CaseTimeline

| Field | Source | Display |
|-------|--------|---------|
| `betrayal.what_happened` | JSONB | FactBlock: "What Happened" |
| `betrayal.primary_incident` | JSONB | FactBlock: "Primary Incident" |
| `story.body` (case_summary) | JSONB | Prose block (this IS already flowing text) — rendered in `prose` class |
| `timeline[]` | query | Vertical timeline with color-coded nodes, inline below narrative |

**Chapter title**: "What Happened"
**Empty rule**: SKIP chapter if `what_happened` AND `case_summary` AND `timeline.length === 0` all empty. Timeline sub-section skips independently if no events.
**Timeline rendering**: Same vertical timeline design as current page but rendered inline (not in tab). Each node: date, event_type badge (color-coded), description, optional location.

**Props**:
```ts
type CaseTimelineProps = {
  events: TimelineEvent[]
}
```

---

### S7: RevealSection (Climax)

| Field | Source | Display |
|-------|--------|---------|
| `impact.wish_understood` | JSONB | Pull quote — large italic text, generous whitespace |
| `impact.emotional` | JSONB | Testimony block: "Emotional Impact" |
| `impact.physical` | JSONB | FactBlock: "Physical Impact" (if exists) |
| `betrayal.when_realized` | JSONB | FactBlock: "When the Truth Emerged" |
| `betrayal.how_confirmed` | JSONB | FactBlock: "How It Was Confirmed" |

**Empty rule**: SKIP if ALL five fields empty. If only `wish_understood` exists, render just the pull quote. Pull quote is the star — other fields are supporting.
**Visual treatment**: Different background (bg-primary/5), border accent, larger text for pull quote (text-lg or text-xl italic), maximum whitespace above/below.

---

### S8: WitnessGrid + EvidenceSummary

| Field | Source | Display |
|-------|--------|---------|
| `witnesses[]` | query | Card grid (1-2 col). Each card: name, witness_type badge (Heroicon, NOT emoji), can_verify, statement (collapsible if long) |
| `evidence[]` | query | Summary bar showing count + expandable list. Each item: label, category badge, verified badge, file link |

**Empty rule**: SKIP witnesses sub-section if 0 witnesses. SKIP evidence sub-section if 0 evidence. SKIP entire section if both are empty.
**Witness type icons** (replacing emoji): Use Heroicons — EyeIcon (eyewitness), UserIcon (character), LinkIcon (corroborating), AcademicCapIcon (expert), ComputerDesktopIcon (digital).

---

### S9: PatternWarningCard

| Field | Source | Display |
|-------|--------|---------|
| `legal.other_victims` | JSONB | Alert line: "Other victims: Yes/Suspected" |
| `legal.other_victims_count` | JSONB | Count if available |
| `caseData.case_types` | direct | Checklist of case types as "recognized patterns" |

**Empty rule**: SKIP if `other_victims === 'no'` or empty AND `case_types` is empty.
**Icon**: ExclamationTriangleIcon from Heroicons.

---

### S10: ResolutionSection

| Field | Source | Display |
|-------|--------|---------|
| `legal.police_report` | JSONB | Badge (if not "no") |
| `legal.lawyer` | JSONB | Badge (if not "no") |
| `legal.court_case` | JSONB | Badge (if not "no") |
| `legal.description` | JSONB | FactBlock: "Legal Details" (collapsible) |
| `legal.why_filing` | JSONB | FactBlock: "Why Filing on the Public Record" |
| `caseData.nominal_damages_claimed` | direct | Damages claimed callout |
| `responses[]` | query | Defendant response cards (distinct visual treatment — different border/bg) |

**Empty rule**: Always renders (why_filing or legal badges usually present). Responses sub-section shows "No defendant response filed" empty state if none.
**Defendant response visual**: Different border style (border-dashed or border-warning), labeled "Defendant's Response" with right-of-reply notice.

---

## Component File Structure

```
src/app/cases/[slug]/
├── page.tsx                      ← Server component: data fetch + compose sections
├── case-comments.tsx             ← KEEP existing
├── export/                       ← KEEP existing
└── components/
    ├── hero-hook.tsx              ← S1
    ├── case-metadata-bar.tsx      ← S2
    ├── chapter-section.tsx        ← S3/S4/S6 (reusable: title + children)
    ├── financial-impact-card.tsx  ← S5
    ├── case-timeline.tsx          ← S6 sub-component
    ├── reveal-section.tsx         ← S7
    ├── witness-grid.tsx           ← S8
    ├── evidence-summary.tsx       ← S8
    ├── pattern-warning.tsx        ← S9
    └── resolution-section.tsx     ← S10
```

### page.tsx Composition (pseudocode)

```tsx
export default async function CaseDetailPage({ params }) {
  // ... existing data fetching (unchanged) ...
  // ... existing JSONB destructuring (unchanged) ...

  return (
    <div className="space-y-0"> {/* spacing controlled per-section */}
      <HeroHook {...heroProps} />
      <CaseMetadataBar {...metaProps} />

      {(first_interaction || early_warnings) && (
        <ChapterSection title="The Connection" bg="bg-background">
          {first_interaction && <FactBlock label="How They Met" value={first_interaction} />}
          {early_warnings && <FactBlock label="Early Warning Signs" value={early_warnings} />}
        </ChapterSection>
      )}

      {(explicit_agreement || agreement_terms || reasonable_expectation || evidence_of_trust || others_vouch) && (
        <ChapterSection title="The Promise" bg="bg-muted/10">
          {/* ...FactBlocks... */}
        </ChapterSection>
      )}

      {financialTotal > 0 && <FinancialImpactCard total={financialTotal} breakdown={breakdown} />}

      {(what_happened || case_summary || (timeline && timeline.length > 0)) && (
        <ChapterSection title="What Happened" bg="bg-background">
          {what_happened && <FactBlock label="What Happened" value={what_happened} />}
          {primary_incident && <FactBlock label="Primary Incident" value={primary_incident} />}
          {case_summary && <div className="prose prose-sm dark:prose-invert">{case_summary}</div>}
          {timeline && timeline.length > 0 && <CaseTimeline events={timeline} />}
        </ChapterSection>
      )}

      {(wish_understood || emotional_impact || when_realized || how_confirmed) && (
        <RevealSection
          pullQuote={wish_understood}
          emotionalImpact={emotional_impact}
          physicalImpact={physical_impact}
          whenRealized={when_realized}
          howConfirmed={how_confirmed}
        />
      )}

      {((witnesses && witnesses.length > 0) || (evidence && evidence.length > 0)) && (
        <section className="bg-muted/20 py-12">
          {witnesses && witnesses.length > 0 && <WitnessGrid witnesses={witnesses} />}
          {evidence && evidence.length > 0 && <EvidenceSummary evidence={evidence} />}
        </section>
      )}

      {showPatternWarning && <PatternWarning otherVictims={other_victims} count={other_victims_count} caseTypes={caseData.case_types} />}

      <ResolutionSection
        legal={{ policeReport: police_report_filed, lawyer: lawyer_consulted, courtCase: court_case_filed, details: legal_details, whyFiling: why_filing }}
        nominalDamages={caseData.nominal_damages_claimed}
        responses={responses}
      />

      {['judgment', 'investigation', 'pending_convergence'].includes(caseData.status) && (
        <VoteCTA caseId={caseData.id} />
      )}

      <Separator />
      <CaseComments caseId={caseData.id} />
    </div>
  )
}
```

---

## Emoji → Heroicon Migration

| Current Emoji | Replace With | Import |
|---------------|-------------|--------|
| 📋 Case Summary | DocumentTextIcon | `@heroicons/react/24/outline` |
| 🔴 The Incident | ExclamationCircleIcon | outline |
| 🔗 The Connection | LinkIcon | outline |
| 🤝 Basis of Trust | HandRaisedIcon | outline |
| 💥 Damages | BanknotesIcon | outline |
| ⚖️ Legal Actions | ScaleIcon | outline |
| 🚔 Police Report | ShieldCheckIcon | outline |
| 🏛️ Court Case | BuildingLibraryIcon | outline |
| 📍 Location | MapPinIcon | outline |
| ⚠️ Ongoing/Warning | ExclamationTriangleIcon | outline |
| 📎 View File | PaperClipIcon | outline |
| 👁 Eyewitness | EyeIcon | outline |
| 🧠 Character | UserIcon | outline |
| 🔗 Corroborating | LinkIcon | outline |
| 🎓 Expert | AcademicCapIcon | outline |
| 💻 Digital | ComputerDesktopIcon | outline |

---

## Variety Audit

| Check | Pass? |
|-------|-------|
| 8+ distinct UI patterns | YES: hero, metadata bar, chapter+factblocks, comparison, impact card, timeline, pull quote, witness cards, pattern checklist, legal card + CTA |
| No same pattern 3x consecutive | YES: chapters alternate with visual breaks (financial, timeline, pull quote) |
| Background alternation | YES: card→muted→bg→muted/10→destructive→bg→primary→muted→destructive→card |
| Density oscillation | YES: med→high→med→med→high→med-high→LOW→med→med→low-med |
| Hook captures in 3 seconds | YES: dominant $ number + defendant name + status |
| Progressive disclosure | YES: timeline nodes, witness statements, legal details, evidence list |
| No wall of text | YES: max 3 FactBlocks before visual break |
| Semantic HTML | YES: section, article, blockquote for quotes, figure for evidence |

---

## Accessibility Requirements

- Heading hierarchy: h1 (defendant name in hero), h2 (chapter titles), h3 (sub-sections)
- All sections wrapped in `<section aria-labelledby="section-title-id">`
- Pull quote in `<blockquote cite="plaintiff">`
- Timeline: `<ol>` with `<li>` for each event
- Witness cards: `<article>` elements
- All Heroicons: `aria-hidden="true"` (decorative)
- Keyboard: Collapsible sections use `<button>` with `aria-expanded`
- Color never sole indicator: status badges include text label, not just color

---

## Mobile Adaptations

| Component | Desktop | Mobile (< 768px) |
|-----------|---------|-------------------|
| Stat blocks | 4-col grid | 2-col grid |
| Metadata bar | Inline key-values | Stacked |
| Chapter sections | max-w-prose centered | Full width with px-4 |
| Financial breakdown | Horizontal bars | Stacked cards |
| Timeline | Vertical with left line | Same (already mobile-friendly) |
| Witness grid | 2-col card grid | Single column |
| Comparison block | Side-by-side columns | Stacked with labels |

---

## Status-Based Rendering Modes

The page adapts its presentation based on `caseData.status`:

### Mode 1: Early Stage (`draft`, `pending`, `pending_convergence`)
- Hero Hook: Shows status badge prominently, stat blocks may show "0" — that's fine
- Pattern Warning (S9): SKIP — not enough data to establish patterns yet
- Verdict: Not shown (doesn't exist)
- Vote CTA: Shown for `pending_convergence` only
- All other sections: Render normally, empty-rule skipping handles sparse data

### Mode 2: Active (`admin_review`, `investigation`, `judgment`)
- Full page renders — all 10 sections active
- Vote CTA: Shown for `investigation` and `judgment`
- Verdict: Not shown yet

### Mode 3: Resolved (`verdict`, `restitution`, `resolved`)
- Verdict banner renders INSIDE HeroHook, below stat blocks — dominant visual treatment
- Vote CTA: Hidden (voting closed)
- If `verdict.verdict === 'guilty'`: destructive accent on verdict banner
- If `verdict.verdict === 'innocent'`: success accent on verdict banner
- Resolution section (S10) emphasizes restitution status if applicable

### Status-to-VoteCTA Logic (preserved from current page)
```ts
const showVoteCTA = ['judgment', 'investigation', 'pending_convergence'].includes(caseData.status)
```

---

## Case Roles Integration (S8 addition)

The `case_roles` query returns approved participants with their user profiles.

**Display location**: Inside S8 (Witnesses & Evidence section), as a separate sub-section titled "Case Participants" above the witness cards.

**Rendering**:
- Each role as a compact badge/chip: `{display_name} — {role}` (e.g., "Matt Campbell — Plaintiff")
- Uses Avatar component if `avatar_url` available, otherwise initials
- Grouped by role type
- Only shown if `roles.length > 0`

**Props addition to S8**:
```ts
type CaseParticipant = {
  role: string
  user_profiles: { display_name: string; avatar_url: string | null }
}
```

---

## ChapterSection Component Specification

`ChapterSection` is the reusable container for S3, S4, and S6. It provides visual structure that differentiates narrative sections from data sections.

**Props**:
```ts
type ChapterSectionProps = {
  title: string           // Chapter heading text
  bg?: string             // Background class (default: 'bg-background')
  children: React.ReactNode
}
```

**Visual treatment**:
```
┌─ Full-width background (bg prop) ──────────────────────┐
│                                                         │
│   ┌─ max-w-prose mx-auto ─────────────────────────┐    │
│   │                                                │    │
│   │  ── thin decorative line (border-primary/20) ──│    │
│   │                                                │    │
│   │  <h2 className="text-xl font-bold tracking-    │    │
│   │       tight text-foreground">                   │    │
│   │    {title}                                     │    │
│   │  </h2>                                         │    │
│   │                                                │    │
│   │  <div className="space-y-4 mt-4">              │    │
│   │    {children — FactBlocks, prose, timeline}     │    │
│   │  </div>                                        │    │
│   │                                                │    │
│   └────────────────────────────────────────────────┘    │
│                                                         │
│   py-12 (generous vertical padding between sections)    │
└─────────────────────────────────────────────────────────┘
```

**Key visual differences from current Card-based approach**:
- No card border/shadow — chapter sections float on background color
- Narrow reading width (max-w-prose ~65ch) vs. current max-w-4xl
- Decorative top line (2px, primary/20) replaces card header
- Generous vertical padding (py-12) creates breathing room between sections
- h2 heading hierarchy (current page uses CardTitle which is not semantic)
