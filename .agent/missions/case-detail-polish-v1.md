# Mission: Case Detail Page Polish
> Raise page score: 72 → 96
> Files touched: 8 (7 components + page.tsx)
> Constraint: Zero data-layer changes. Presentation layer only.
> Entry gate: `tsc --noEmit` must pass before and after.

---

## Fix 1 — WitnessCard empty `<p>` bug
**File:** `witness-grid.tsx`

**Problem:** `{open ? '' : statement.slice(0,150)...}` renders an empty `<p>` when expanded.

```tsx
// REMOVE (lines 83–88):
<p className="text-sm text-muted-foreground">
  {open ? '' : `${statement.slice(0, 150)}...`}
</p>
<CollapsibleContent>
  <p className="text-sm text-muted-foreground">{statement}</p>
</CollapsibleContent>

// REPLACE WITH:
{!open && (
  <p className="text-sm text-muted-foreground">
    {statement.slice(0, 150)}...
  </p>
)}
<CollapsibleContent>
  <p className="text-sm text-muted-foreground">{statement}</p>
</CollapsibleContent>
```

---

## Fix 2 — page.tsx root max-width regression
**File:** `page.tsx` line 160

**Problem:** `<div className="space-y-0">` stretches to full viewport width. Layout only provides `p-6` padding — no max-width constraint.

```tsx
// CHANGE:
<div className="space-y-0">
// TO:
<div className="space-y-0 max-w-5xl mx-auto">
```

---

## Fix 3 — RevealSection: remove redundant decorative quote span + fix cite attribute
**File:** `reveal-section.tsx`

**Problem A:** Giant 6xl decorative `&ldquo;` span renders before `<p>&ldquo;{pullQuote}&rdquo;</p>` — visually two opening quotes appear.
**Problem B:** `cite="plaintiff"` is invalid HTML — `cite` must be a URL.

```tsx
// REMOVE entirely (lines 41–46):
<span
  className="text-6xl font-serif text-primary/30 leading-none select-none mb-2 block"
  aria-hidden="true"
>
  &ldquo;
</span>

// CHANGE blockquote opening from:
<blockquote className="relative" cite="plaintiff">
// TO:
<blockquote className="relative" cite="https://courtofpublicrecord.com">
```

Keep the `ChatBubbleLeftRightIcon` — it is the visual anchor and is already `aria-hidden`.
Keep the inline `&ldquo;{pullQuote}&rdquo;` in the `<p>` — it is the correct semantic quote.

---

## Fix 4 — RevealSection: add pull quote fallback for empty wish_understood
**File:** `reveal-section.tsx`

**Problem:** If `wish_understood` is empty but `emotionalImpact` has content, the section renders with no pull-quote treatment — just plain supporting fields. The emotional impact is the next-best human moment and should be elevated as the headline.

**Change — update component body:**

```tsx
export function RevealSection({
  pullQuote,
  emotionalImpact,
  physicalImpact,
  whenRealized,
  howConfirmed,
}: RevealSectionProps) {
  // Use emotionalImpact as fallback headline when primary pull quote is absent
  const usedEmotionalAsQuote = !pullQuote && !!emotionalImpact
  const displayQuote = pullQuote || emotionalImpact
  const displayQuoteSource = usedEmotionalAsQuote
    ? 'Emotional impact, plaintiff testimony'
    : 'Plaintiff testimony'

  // Supporting fields: skip emotionalImpact if it was elevated to headline.
  // Note: SupportingField handles empty string via its own `if (!value) return null` guard —
  // safe to pass any string here; empty values render nothing.
  const hasSupportingFields =
    whenRealized ||
    howConfirmed ||
    (!usedEmotionalAsQuote && emotionalImpact) ||
    physicalImpact

  return (
    <section className="w-full bg-primary/5 border-y border-primary/20 py-16">
      <div className="max-w-2xl mx-auto px-6 space-y-10">
        {displayQuote && (
          <blockquote className="relative" cite="https://courtofpublicrecord.com">
            <ChatBubbleLeftRightIcon
              className="h-8 w-8 text-primary/20 mb-4"
              aria-hidden="true"
            />
            <p className="text-xl md:text-2xl italic font-medium leading-relaxed text-foreground">
              &ldquo;{displayQuote}&rdquo;
            </p>
            <footer className="mt-4 text-sm text-muted-foreground">
              &mdash; {displayQuoteSource}
            </footer>
          </blockquote>
        )}

        {displayQuote && hasSupportingFields && <hr className="border-border/50" />}

        {hasSupportingFields && (
          <div className="space-y-6">
            <SupportingField label="When the Truth Emerged" value={whenRealized} />
            <SupportingField label="How It Was Confirmed" value={howConfirmed} />
            {!usedEmotionalAsQuote && (
              <SupportingField label="Psychological & Emotional Effects" value={emotionalImpact} />
            )}
            <SupportingField label="Physical Impact" value={physicalImpact} />
          </div>
        )}
      </div>
    </section>
  )
}
```

---

## Fix 5 — ChapterSection: add aria-labelledby
**File:** `chapter-section.tsx`

**Problem:** `<section>` has no `aria-labelledby`. Blueprint requires all sections to have this. The h2 has no `id`.

```tsx
// CHANGE the function body to:
export function ChapterSection({ title, bg = 'bg-background', children }: ChapterSectionProps) {
  const id = `section-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
  return (
    <section className={bg} aria-labelledby={id}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="w-12 h-0.5 bg-primary/40 mb-4" />
        <h2 id={id} className="text-xl font-bold tracking-tight text-foreground mb-6">
          {title}
        </h2>
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </section>
  )
}
```

---

## Fix 6 — Add aria-labelledby to 3 remaining section components

Apply this pattern to each file listed:

| File | Section element change | Heading element change |
|------|----------------------|----------------------|
| `financial-impact-card.tsx` | Add `aria-labelledby="financial-impact-heading"` to `<section>` | Change `<p>Financial Impact</p>` to `<h2 id="financial-impact-heading">` (proper landmark heading, not styled `<p>`) — keep all existing className attributes |
| `pattern-warning.tsx` | Add `aria-labelledby="pattern-warning-heading"` to `<section>` | Add `id="pattern-warning-heading"` to `<h2>Recognized Pattern</h2>` |
| `resolution-section.tsx` | Add `aria-labelledby="resolution-heading"` to `<section>` | Add `id="resolution-heading"` to `<h2>Legal Status & Resolution</h2>` |

---

## Fix 7 — Add 'verdict' to HeroHook statusColors
**File:** `hero-hook.tsx`

**Problem:** `verdict` is a valid lifecycle stage but absent from `statusColors`. Badge renders with no color styling.

```ts
// ADD to statusColors map (after 'judgment' line):
verdict: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
```

---

## Fix 8 — CaseTimeline: h3 sub-heading + remove double top margin
**File:** `case-timeline.tsx` lines 43–46

```tsx
// REMOVE:
<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-8 mb-2">
  Timeline of Events
</p>
<ol className="relative pl-8 space-y-6 mt-8 border-l-2 border-border ml-3">

// REPLACE WITH:
<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-8 mb-4">
  Timeline of Events
</h3>
<ol className="relative pl-8 space-y-6 border-l-2 border-border ml-3">
```

---

## Fix 9 — EvidenceSummary: aria-expanded + aria-controls on toggle button
**File:** `evidence-summary.tsx`

```tsx
// CHANGE button:
<button
  onClick={() => setExpanded(!expanded)}
  className="text-sm text-primary"
>

// TO:
<button
  onClick={() => setExpanded(!expanded)}
  className="text-sm text-primary"
  aria-expanded={expanded}
  aria-controls="evidence-list"
>

// ADD id to the expandable div:
{expanded && (
  <div id="evidence-list" className="mt-4">
```

---

## Fix 10 — Remove rounded-2xl from section elements (restore full-bleed rhythm)
**Files:** `hero-hook.tsx`, `financial-impact-card.tsx`

Blueprint defines alternating full-bleed color bands. `rounded-2xl` on `<section>` creates a floating-card appearance inside `p-6` padding, breaking the rhythm.

**hero-hook.tsx:**
```tsx
// CHANGE section className from:
"rounded-2xl border bg-gradient-to-br from-card via-card to-muted/30 p-8"
// TO:
"border-b bg-gradient-to-br from-card via-card to-muted/30 px-8 py-10"
```

**financial-impact-card.tsx:**
```tsx
// CHANGE section className from:
"bg-destructive/5 border border-destructive/20 rounded-2xl"
// TO:
"bg-destructive/5 border-y border-destructive/20"
```

---

## Fix 11 — S8 wrapper: add aria-label
**File:** `page.tsx` lines ~262

```tsx
// CHANGE:
<section className="bg-muted/20 py-12">
// TO:
<section className="bg-muted/20 py-12" aria-label="Witnesses and Evidence">
```

---

## Fix 12 — Add ComparisonBlock to ChapterSection + use it in S4
**Files:** `chapter-section.tsx` (add export), `page.tsx` (use in S4)

**Why:** Blueprint variety audit specifies "comparison" as one of 8+ distinct UI patterns required for the page. S4 "The Promise" is the natural home — contrasting what was agreed vs. what happened exposes the betrayal structurally.

**Render condition:** Both `explicit_agreement` AND `what_happened` are non-empty.

**Add to `chapter-section.tsx`:**
```tsx
export function ComparisonBlock({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string
  leftValue: string
  rightLabel: string
  rightValue: string
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-border/50 rounded-lg overflow-hidden">
      <div className="bg-green-500/5 p-4 sm:border-r border-b sm:border-b-0 border-border/50">
        <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">
          {leftLabel}
        </p>
        <p className="text-sm leading-relaxed">{leftValue}</p>
      </div>
      <div className="bg-destructive/5 p-4">
        <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">
          {rightLabel}
        </p>
        <p className="text-sm leading-relaxed">{rightValue}</p>
      </div>
    </div>
  )
}
```

**Update S4 in `page.tsx`:**

When the ComparisonBlock renders, it already displays `explicit_agreement` as its left column — so the "Agreement Made" FactBlock is suppressed in that case to avoid showing the same content twice.

```tsx
{(explicit_agreement || agreement_terms || reasonable_expectation || evidence_of_trust || others_vouch) && (
  <ChapterSection title="The Promise" bg="bg-muted/10">
    {explicit_agreement && what_happened && (
      <ComparisonBlock
        leftLabel="What Was Promised"
        leftValue={explicit_agreement}
        rightLabel="What Actually Happened"
        rightValue={what_happened}
      />
    )}
    {/* Suppress "Agreement Made" when ComparisonBlock already shows explicit_agreement */}
    {explicit_agreement && !what_happened && (
      <FactBlock label="Agreement Made" value={explicit_agreement} />
    )}
    {agreement_terms && (
      <FactBlock label="Terms" value={agreement_terms} />
    )}
    {reasonable_expectation && (
      <FactBlock label="Why It Seemed Reasonable" value={reasonable_expectation} />
    )}
    {evidence_of_trust && (
      <FactBlock label="Evidence of Good Faith" value={evidence_of_trust} />
    )}
    {others_vouch && (
      <FactBlock label="Third-Party Endorsement" value={others_vouch} />
    )}
  </ChapterSection>
)}
```

Also add `ComparisonBlock` to the import in `page.tsx`:
```tsx
import { ChapterSection, FactBlock, ComparisonBlock } from './components/chapter-section'
```

---

## Execution Order

Execute each fix in a single pass per file:

1. `witness-grid.tsx` — Fix 1
2. `reveal-section.tsx` — Fix 3 + Fix 4 (single rewrite of component)
3. `chapter-section.tsx` — Fix 5 + Fix 12 (add aria-labelledby + ComparisonBlock export)
4. `hero-hook.tsx` — Fix 7 + Fix 10-hero
5. `financial-impact-card.tsx` — Fix 6-financial + Fix 10-financial
6. `pattern-warning.tsx` — Fix 6-pattern
7. `resolution-section.tsx` — Fix 6-resolution
8. `case-timeline.tsx` — Fix 8
9. `evidence-summary.tsx` — Fix 9
10. `page.tsx` — Fix 2 + Fix 11 + Fix 12-usage (single read → multiple edits)

---

## Projected Score After All Fixes

| Dimension | Current | Δ | Target |
|-----------|---------|---|--------|
| Completeness | 18/25 | +5 (aria-labelledby ×6, h3, aria-expanded, ComparisonBlock) | 23/25 |
| Correctness | 17/25 | +5 (WitnessCard, double-quote, verdict status, h3, cite) | 22/25 |
| Robustness | 13/20 | +5 (max-width, WitnessCard, aria-expanded, fallback quote) | 18/20 |
| Clarity | 11/15 | +3 (double-quote gone, full-bleed sections, h3 semantics) | 14/15 |
| Economy | 13/15 | +2 (CaseTimeline margin, RevealSection spans) | 15/15 |
| **Total** | **72** | **+20** | **92** |

Fix 12 (ComparisonBlock) contributes the final +4:
- Completeness +2 (variety audit "comparison" pattern now present)
- Correctness +1 (variety audit requirement satisfied)
- Clarity +1 (S4 gains structural contrast, not just stacked FactBlocks)

**Final projected total: 72 + 24 = 96 ✅**

---

## Success Criteria (all binary, testable)

- [ ] `tsc --noEmit` passes with zero errors
- [ ] WitnessCard: no empty `<p>` in DOM when statement is expanded
- [ ] RevealSection: single opening `"` visible before pull quote (not two)
- [ ] RevealSection: `emotional_impact` renders as pull quote when `wish_understood` is empty
- [ ] `emotional_impact` does NOT appear twice (once as headline + once as supporting field)
- [ ] All `<section>` elements have either `aria-labelledby` or `aria-label`
- [ ] `verdict` case status renders with orange badge (same as `judgment`)
- [ ] "Timeline of Events" is an `<h3>` element, not `<p>`
- [ ] EvidenceSummary show/hide button has `aria-expanded` attribute that reflects state
- [ ] HeroHook and FinancialImpactCard sections are full-bleed bands (no `rounded-2xl`)
- [ ] S4 renders ComparisonBlock when both `explicit_agreement` and `what_happened` are populated
- [ ] Page content capped at `max-w-5xl` on wide screens
