---
name: plaintiff-page-builder
description: >
  Build a stunning, individualized plaintiff case page for Court of Public Record (CPR).
  Converts NotebookLM artifacts + Supabase case data into a complete, production-ready
  Next.js page. Primary execution agent: Gemini 2.5 Pro. Reviewer: Claude.
  Invoke when: admin has approved a case AND convergence is met (2+ plaintiffs).
  Source of truth: .agent/blueprints/plaintiff-page-skill-spec.md
---

# Plaintiff Page Builder — Executable Skill

> AGENT: Gemini 2.5 Pro (builder)
> REVIEWER: Claude (scores against 96% checklist)
> SPEC: `.agent/blueprints/plaintiff-page-skill-spec.md`
> VERSION: 1.0 — 2026-03-01

---

## Mission

Build a plaintiff case page that:
1. Is visually stunning — individualized per case using infographic-extracted colors
2. Is structurally consistent — identical 12-section IA across all plaintiff pages
3. Is data-complete — every field from Supabase rendered, no placeholders where real data exists
4. Scores ≥ 96/100 on the quality checklist
5. Is production-ready — TypeScript clean, Lighthouse 90+ mobile, no broken layouts

You receive: Supabase case data + NotebookLM artifact IDs
You produce: A complete Next.js page component + all sub-components

**Do NOT ask clarifying questions. Every decision is made in this skill and the spec.**

---

## Absolute Rules (Violations = Auto-Fail)

- NEVER use `lucide-react` — Heroicons only (`@heroicons/react/24/outline`)
- NEVER use emoji in code
- NEVER hardcode hex colors — use CSS variables (`hsl(var(--primary))`) or `var(--accent-500)`
- NEVER manipulate `z-index` or use `position: sticky` inside the timeline component
- NEVER generate realistic human face images for plaintiffs/defendants
- NEVER skip the multimodal image analysis step — the entire color system depends on it
- NEVER leave a section empty when data exists — use Coming Soon placeholder if artifact is missing
- NEVER break the sidebar or navigation with any section's layout

---

## Phase 0: Pre-flight

Before writing a single line of code, verify all conditions are met.

### Check Trigger Conditions
```
✓ cases.status is NOT 'draft' or 'pending'
✓ 2+ independent plaintiffs on same defendant (convergence met)
✓ Admin approval flag = true
```
If any check fails → do not proceed. Report the failed condition.

### Inventory Available Artifacts
Check the Supabase bucket and NotebookLM studio for:
```
Required:
  □ Infographic JPEG (portrait or landscape)
  □ Mind map JSON
  □ Notebook summary text

Highly desired (generate if missing):
  □ Briefing doc / Report
  □ Slide deck PDF
  □ Audio podcast

Optional (will show Coming Soon if absent):
  □ Timeline data in DB (timeline_events table)
  □ Evidence files (evidence table)
```

### Generate Missing Artifacts via NotebookLM MCP
For each missing desired artifact, run:
```
mcp__notebooklm-mcp__studio_create(
  notebook_id="[ID]",
  artifact_type="[audio|slide_deck|report|mind_map]",
  confirm=True
)
```
Then poll until complete:
```
mcp__notebooklm-mcp__studio_status(notebook_id="[ID]")
```
Poll every 30 seconds, max 5 minutes. If still missing after 5 min: use Coming Soon placeholder.

### Load All Data in Parallel

**From Supabase:**
```sql
-- Case + defendant + plaintiff profile
SELECT
  c.*,
  d.first_name, d.last_name, d.full_name, d.aliases, d.dob,
  p.display_name AS plaintiff_name, p.avatar_url AS plaintiff_photo
FROM cases c
JOIN defendants d ON c.defendant_id = d.id
JOIN profiles p ON c.plaintiff_id = p.id
WHERE c.id = '[case_id]'

-- Financial impacts
SELECT * FROM financial_impacts WHERE case_id = '[case_id]'

-- Timeline events (ordered)
SELECT * FROM timeline_events WHERE case_id = '[case_id]' ORDER BY date_or_year ASC

-- Witnesses
SELECT * FROM witnesses WHERE case_id = '[case_id]'

-- Evidence (with timeline links)
SELECT * FROM evidence WHERE case_id = '[case_id]'
```

**From NotebookLM:**
```
# Notebook summary (Case Summary text)
mcp__notebooklm-mcp__notebook_describe(notebook_id="[plaintiff_notebook_id]")
→ use the 'summary' field

# Briefing doc content
mcp__notebooklm-mcp__download_artifact(
  notebook_id="[ID]", artifact_type="report", output_path="/tmp/briefing.md"
)

# Mind map JSON
mcp__notebooklm-mcp__download_artifact(
  notebook_id="[ID]", artifact_type="mind_map", output_path="/tmp/mindmap.json"
)

# Slide deck PDF
mcp__notebooklm-mcp__download_artifact(
  notebook_id="[ID]", artifact_type="slide_deck", output_path="/tmp/slides.pdf"
)

# Audio podcast URL
mcp__notebooklm-mcp__download_artifact(
  notebook_id="[ID]", artifact_type="audio", output_path="/tmp/podcast.mp3"
)
```

**CPR Notebook IDs (real data):**
- Kelly Cai (plaintiff): `86438ec8-ec42-4f4e-8331-fda2ed649053`
- Colin James Bradley (defendant): `ddcaf0ca-f7d6-40a5-8588-ea19a3747398`

---

## Phase 0.5: Generate Short Titles + Set Coordinates

### Step A — Short Titles

After loading timeline events, check each one for a `short_title` value.

For every event where `short_title` IS NULL, generate a 2-word dramatic chapter title:
- Exactly 2 words — no exceptions
- First word is always "THE"
- Second word: one powerful noun in ALL CAPS capturing the event essence
- Examples: THE MEETING, THE BETRAYAL, THE ARREST, THE HOOK, THE COLLAPSE, THE SILENCE, THE DEMAND, THE THREAT, THE TRANSFER

Write back immediately:
```javascript
await admin.from('timeline_events').update({ short_title: '[title]' }).eq('id', event.id)
```

Do NOT modify events that already have a short_title.

---

### Step B — Coordinates

**Every timeline event must have precise `latitude` and `longitude` set in the DB.**

Rules:
1. Use Google Search or maps to get exact coordinates for each event's city/location
2. Write BOTH the coordinate string AND the numeric columns:
   - `city` = `"lat, lng"` string (e.g. `"16.0476743, 108.2496587"`) — this is the primary source for map rendering
   - `latitude` = numeric value
   - `longitude` = numeric value
3. Store coordinates as precise as possible — suburb/district level, not country center
4. If the location is vague (e.g. "Australia (communication)"), use the most relevant city in that country

**Why both fields?** `resolveCoords()` checks the `city` string for coordinate format first (highest priority), then falls back to `latitude`/`longitude` columns. Storing both provides redundancy — if either is present, the map pin renders correctly.

**CRITICAL: Never overwrite existing coordinates.** Use UPDATE only if `latitude IS NULL`:
```javascript
// Only set if not already populated
if (!event.latitude) {
  await admin.from('timeline_events')
    .update({ city: `${lat}, ${lng}`, latitude: lat, longitude: lng })
    .eq('id', event.id)
}
```

Do this for ALL events before building the page.

---

## Phase 1: Design Analysis

**This phase drives ALL visual decisions. Do not skip any step.**

### Step 1.1 — INVOKE MULTIMODAL IMAGE ANALYSIS

Load the infographic JPEG as a direct image input.

Ask yourself systematically:
1. **Dominant accent color**: "What is the single most dominant non-neutral color? (exclude white, black, gray, beige) Give me the HEX value."
2. **Design vocabulary**: "Is this design geometric (hard edges, grids), editorial (typography-forward, high contrast), or organic (curves, flowing shapes)?"
3. **Emotional tone**: "Is this dark and tense, clean and clinical, or warm and human?"
4. **Layout density**: "Is this sparse with breathing room, or dense and information-rich?"

Document your analysis:
```
// ═══════════════════════════════════════════════════
// DESIGN ANALYSIS — [Case Name] ([Date])
// ═══════════════════════════════════════════════════
// Dominant accent: #[HEX]
// Design vocabulary: [geometric | editorial | organic]
// Emotional tone: [dark-tense | clean-clinical | warm-human]
// Layout density: [sparse | balanced | dense]
// ═══════════════════════════════════════════════════
```

### Step 1.2 — INVOKE CODE EXECUTION: Derive 5-Variant Palette

```python
import colorsys

def hex_to_hsl(hex_color):
    hex_color = hex_color.lstrip('#')
    r, g, b = tuple(int(hex_color[i:i+2], 16)/255.0 for i in (0, 2, 4))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h * 360, s * 100, l * 100

def hsl_to_hex(h, s, l):
    h /= 360; s /= 100; l /= 100
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return '#{:02x}{:02x}{:02x}'.format(int(r*255), int(g*255), int(b*255))

base_hex = "#[YOUR_EXTRACTED_COLOR]"
h, s, l = hex_to_hsl(base_hex)

palette = {
    '--accent-100': hsl_to_hex(h, s * 0.4, 95),   # Very light tint
    '--accent-300': hsl_to_hex(h, s * 0.7, 72),   # Light
    '--accent-500': base_hex,                       # Base extracted color
    '--accent-700': hsl_to_hex(h, s, 32),          # Dark
    '--accent-900': hsl_to_hex(h, s * 0.8, 12),   # Very dark
}

for var, value in palette.items():
    print(f"{var}: {value}")
```

Store the output. You will inject these as CSS custom properties in the page's style block.

### Step 1.3 — INVOKE DEEP THINK: Generate AI Tagline

Feed Deep Think ALL of this simultaneously:
- Notebook summary
- Key timeline events (dates, locations, what happened)
- Financial damages total
- Number of victims/countries

Task: "Generate a single sentence that captures the essence of this case with maximum journalistic impact."

Requirements:
- Under 20 words
- Present tense (allegation framing)
- No legal jargon
- Emotionally resonant without being melodramatic
- The reader must immediately understand the scale and nature of the betrayal

Example quality bar: _"A global trail of fabricated promises, drained savings, and broken lives across five countries."_

---

## Phase 2: File Structure

Create these files:

```
src/
  app/
    cases/[slug]/plaintiff/[plaintiffId]/
      page.tsx                    ← Server Component: data fetch + SEO metadata
  components/
    plaintiff-page/
      HeroSection.tsx             ← Section 01
      HeroText.tsx                ← Section 02
      StoryInfographic.tsx        ← Section 03
      InfoBoxes.tsx               ← Section 04
      CaseSummaryModule.tsx       ← Section 05
      SlideDeckSection.tsx        ← Section 06
      CaseTimeline.tsx            ← Section 07
      MindMapSection.tsx          ← Section 08
      LocationMap.tsx             ← Section 09
      EvidenceVault.tsx           ← Section 10
      InlineVoting.tsx            ← Section 11
      FloatingAudioPlayer.tsx     ← persistent audio (launched from Section 03)
      StatusBadge.tsx             ← used in Section 01
      ComingSoonPlaceholder.tsx   ← fallback for missing artifacts
```

### page.tsx — Server Component (SEO + Data Fetching)

```tsx
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
// import all section components

export async function generateMetadata({ params }): Promise<Metadata> {
  // Fetch case data
  // Return full SEO metadata object (see Phase 2.1 below)
}

export default async function PlaintiffPage({ params }) {
  const supabase = await createClient()
  // Load all data (see Phase 0 queries)
  // Pass to client layout component
}
```

### Phase 2.1 — SEO Metadata (inject in page.tsx generateMetadata)

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  // [fetch case data]
  const description = notebookSummary.slice(0, 155)
  const canonicalUrl = `https://courtofpublicrecord.com/case/${slug}/plaintiff/${plaintiffId}`

  return {
    title: `${plaintiffName} vs ${defendantName} | Court of Public Record`,
    description,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${plaintiffName} vs ${defendantName}`,
      description,
      url: canonicalUrl,
      siteName: 'Court of Public Record',
      images: [{ url: infographicUrl }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${plaintiffName} vs ${defendantName}`,
      description,
      images: [infographicUrl],
    },
  }
}
```

Inject JSON-LD in the page body:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LegalCase",
    "name": `${plaintiffName} vs ${defendantName}`,
    "description": notebookSummary,
    "datePublished": caseData.created_at,
    "url": canonicalUrl,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Cases", "item": "/cases" },
        { "@type": "ListItem", "position": 2, "name": defendantName, "item": `/defendants/${defendantSlug}` },
        { "@type": "ListItem", "position": 3, "name": `${plaintiffName}'s Case` }
      ]
    }
  })}}
/>
```

---

## Phase 3: Build Each Section

Use this scroll animation wrapper on every section (copy exactly):

```tsx
// Reusable scroll fade-rise pattern
import { motion } from 'framer-motion'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

// Wrap each section:
<motion.section
  variants={sectionVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-80px' }}
>
  {/* section content */}
</motion.section>
```

For card grids, stagger children:
```tsx
const containerVariants = {
  visible: { transition: { staggerChildren: 0.08 } }
}
```

---

### SECTION 01 — Hero

**File**: `HeroSection.tsx`

Layout: Hard diagonal split — plaintiff left, defendant right, VS badge center.

```tsx
'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { StatusBadge } from './StatusBadge'

export function HeroSection({ plaintiffPhoto, defendantPhoto, status, accentColor }) {
  const { scrollY } = useScroll()
  // Parallax: background moves at 0.3x scroll speed
  const bgY = useTransform(scrollY, [0, 400], [0, 120])

  return (
    <section className="relative min-h-[60vh] overflow-hidden bg-[var(--accent-900)]">
      {/* Parallax background layer */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-gradient-to-br from-[var(--accent-900)] to-black opacity-80"
      />

      {/* Diagonal divider — CSS clip-path */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(
            105deg,
            var(--accent-900) 0%,
            var(--accent-900) 48%,
            transparent 48%,
            transparent 52%,
            var(--accent-700) 52%,
            var(--accent-700) 100%
          )`
        }}
      />

      {/* Plaintiff — left side — slides in from left */}
      <motion.div
        className="absolute left-0 top-0 w-[52%] h-full flex flex-col items-center justify-center z-20"
        initial={{ x: -120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 8px 2px var(--accent-500)',
              '0 0 24px 8px var(--accent-500)',
              '0 0 8px 2px var(--accent-500)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-40 h-40 rounded-full overflow-hidden border-2 border-[var(--accent-500)]"
        >
          <img
            src={plaintiffPhoto || '/avatars/plaintiff-default.svg'}
            alt="Plaintiff"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <span className="mt-3 text-xs font-bold tracking-[0.25em] uppercase text-[var(--accent-300)]">
          Plaintiff
        </span>
      </motion.div>

      {/* VS badge — center — flashes once on load */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30
                   w-16 h-16 rounded-full bg-[var(--accent-500)] flex items-center justify-center
                   text-white font-black text-lg shadow-[0_0_32px_var(--accent-500)]"
        animate={{ opacity: [1, 0.2, 1, 0.2, 1] }}
        transition={{ duration: 0.8, times: [0, 0.2, 0.4, 0.6, 1] }}
      >
        VS
      </motion.div>

      {/* Status badge — below VS */}
      <div className="absolute left-1/2 top-[65%] -translate-x-1/2 z-30">
        <StatusBadge status={status} />
      </div>

      {/* Defendant — right side — slides in from right */}
      <motion.div
        className="absolute right-0 top-0 w-[52%] h-full flex flex-col items-center justify-center z-20"
        initial={{ x: 120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 8px 2px var(--accent-700)',
              '0 0 24px 8px var(--accent-700)',
              '0 0 8px 2px var(--accent-700)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="w-40 h-40 rounded-full overflow-hidden border-2 border-[var(--accent-700)]"
        >
          <img
            src={defendantPhoto || '/avatars/defendant-default.svg'}
            alt="Defendant"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <span className="mt-3 text-xs font-bold tracking-[0.25em] uppercase text-[var(--accent-300)] opacity-70">
          Defendant
        </span>
      </motion.div>
    </section>
  )
}
```

**StatusBadge.tsx:**
```tsx
const STATUS_CONFIG = {
  pending: { label: 'PENDING REVIEW', className: 'bg-amber-500/20 text-amber-400 shadow-amber-500/40' },
  pending_convergence: { label: 'PENDING REVIEW', className: 'bg-amber-500/20 text-amber-400 shadow-amber-500/40' },
  admin_review: { label: 'UNDER INVESTIGATION', className: 'bg-blue-500/20 text-blue-400 shadow-blue-500/40' },
  investigation: { label: 'UNDER INVESTIGATION', className: 'bg-blue-500/20 text-blue-400 shadow-blue-500/40' },
  judgment: { label: 'IN JUDGMENT — VOTING OPEN', className: 'bg-orange-500/20 text-orange-400 shadow-orange-500/40' },
  verdict: { label: 'VERDICT RENDERED', className: 'bg-green-500/20 text-green-400 shadow-green-500/40' },
  restitution: { label: 'RESTITUTION ORDERED', className: 'bg-purple-500/20 text-purple-400 shadow-purple-500/40' },
} as const

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
  if (!config) return null
  return (
    <span className={`rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest shadow-lg ${config.className}`}>
      {config.label}
    </span>
  )
}
```

**Self-score before Section 02**: Are both photos framed? All 4 animations working? Diagonal split correct? Status badge visible?

---

### SECTION 02 — Hero Text

**File**: `HeroText.tsx`

```tsx
export function HeroText({ plaintiffName, defendantName, tagline, caseNumber, filedAt }) {
  return (
    <motion.div
      className="text-center py-12 px-6 bg-[var(--accent-900)]"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <h1 className="text-5xl font-bold tracking-tight text-white mb-4">
        {plaintiffName} <span className="text-[var(--accent-500)]">vs.</span> {defendantName}
      </h1>
      <p className="text-xl font-normal text-muted-foreground italic max-w-2xl mx-auto mb-6">
        {tagline}
      </p>
      <p className="text-sm text-muted-foreground">
        Case {caseNumber} · Filed {new Date(filedAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long' })}
      </p>
    </motion.div>
  )
}
```

---

### SECTION 03 — Story Infographic

**File**: `StoryInfographic.tsx`

```tsx
'use client'
import { useState } from 'react'
import { PlayCircleIcon } from '@heroicons/react/24/outline'
import { FloatingAudioPlayer } from './FloatingAudioPlayer'

export function StoryInfographic({ infographicUrl, audioUrl }) {
  const [playerOpen, setPlayerOpen] = useState(false)

  return (
    <motion.section /* scroll wrapper */>
      <div className="relative inline-block max-w-3xl mx-auto">
        <img
          src={infographicUrl}
          alt="Case Infographic"
          className="w-full rounded-lg shadow-2xl"
          loading="lazy"
        />
        {/* Audio button overlay — top-right corner of infographic */}
        {audioUrl && (
          <button
            onClick={() => setPlayerOpen(true)}
            className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2
                       bg-black/70 hover:bg-[var(--accent-500)] text-white rounded-full
                       text-sm font-medium transition-colors backdrop-blur-sm"
          >
            <PlayCircleIcon className="h-5 w-5" />
            Listen to Case Summary
          </button>
        )}
      </div>
      {playerOpen && (
        <FloatingAudioPlayer audioUrl={audioUrl} onClose={() => setPlayerOpen(false)} />
      )}
    </motion.section>
  )
}
```

**FloatingAudioPlayer** must:
- Use `position: fixed`, `bottom: 24px`, `right: 24px`, high `z-index` (but ONLY this component — not the page)
- Include minimize button (collapses to small pill, still accessible)
- Show case title and current playback position
- Have a close button

---

### SECTION 04 — Four Info Boxes

**File**: `InfoBoxes.tsx`

Data sources:
- **Alias**: `defendants.aliases` (array) or `cases.relationship_narrative.entity_type`
- **Business Name(s)**: extract from case data / defendant data
- **Years Active**: derive from `MIN(timeline_events.date_or_year)` to `MAX(timeline_events.date_or_year)`
- **Witnesses**: `COUNT(witnesses WHERE case_id = this_case)`

```tsx
const boxes = [
  { label: 'Known Aliases', value: defendant.aliases?.join(', ') || 'None on record' },
  { label: 'Business Name(s)', value: businessNames || 'See case details' },
  { label: 'Years Active', value: `${minYear} – ${maxYear}` },
  { label: 'Witnesses', value: `${witnessCount} on record` },
]
```

Style: 4-column grid (desktop), 2-column (tablet), 1-column (mobile).
Each box: `bg-[var(--accent-700)] border border-[var(--accent-300)]/30 rounded-lg p-6`

---

### SECTION 05 — Case Summary Module

**File**: `CaseSummaryModule.tsx`

```tsx
'use client'
import { useState } from 'react'

export function CaseSummaryModule({ notebookSummary, briefingDocContent, originalTestimony }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'analysis' | 'testimony'>('analysis')

  return (
    <>
      {/* Summary card */}
      <motion.section /* scroll wrapper */>
        <div className="max-w-3xl mx-auto bg-card rounded-lg border p-8">
          <p className="text-base leading-relaxed text-foreground mb-6">
            {notebookSummary}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { setActiveTab('analysis'); setModalOpen(true) }}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-medium"
            >
              View Full Report
            </button>
            <button
              onClick={() => { setActiveTab('testimony'); setModalOpen(true) }}
              className="bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground
                         px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Original Testimony
            </button>
          </div>
        </div>
      </motion.section>

      {/* Full-screen modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Tab bar */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'analysis' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
              >
                Detailed Analysis
              </button>
              <button
                onClick={() => setActiveTab('testimony')}
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'testimony' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
              >
                Original Testimony
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="ml-auto px-6 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            {/* Content */}
            <div className="overflow-y-auto p-8 flex-1">
              {activeTab === 'analysis' && (
                <div className="prose prose-invert max-w-none">
                  {/* Render briefingDocContent as markdown */}
                  {briefingDocContent}
                </div>
              )}
              {activeTab === 'testimony' && (
                <div>
                  {/* Original testimony — read-only form fields, all disabled */}
                  {/* Render original_testimony object as locked form display */}
                  <p className="text-xs text-muted-foreground mb-6 italic">
                    Sacred record — exact words submitted by the plaintiff. No AI interpretation. Read-only.
                  </p>
                  {/* Map testimony fields as disabled inputs */}
                  {originalTestimony}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

---

### SECTION 06 — Slide Deck

**File**: `SlideDeckSection.tsx`

Lazy-load react-pdf. Load pdfjs-dist only when this section becomes visible.

```tsx
'use client'
import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'

// Dynamic import — only loads when section is visible
const PDFViewer = lazy(() => import('./PDFViewer'))

export function SlideDeckSection({ pdfUrl }) {
  const [visible, setVisible] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  if (!pdfUrl) return <ComingSoonPlaceholder section="Slide Deck" />

  return (
    <motion.section /* scroll wrapper */ ref={ref}>
      <div className="bg-[var(--accent-900)] py-16">
        {/* Slide counter + navigation */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRightIcon className="h-6 w-6" />
          </button>
          <button onClick={() => setFullscreen(true)} className="ml-4">
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>
        </div>

        {/* PDF page render */}
        {visible && (
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg mx-auto max-w-2xl" />}>
            <PDFViewer
              url={pdfUrl}
              page={page}
              onDocumentLoad={(numPages) => setTotalPages(numPages)}
              fullscreen={fullscreen}
              onCloseFullscreen={() => setFullscreen(false)}
            />
          </Suspense>
        )}
      </div>
    </motion.section>
  )
}
```

Keyboard navigation: `useEffect` that listens for `ArrowLeft`/`ArrowRight` keydown events.
Swipe: `touchstart`/`touchend` handlers tracking deltaX.

---

### SECTION 07 — Case Timeline

**File**: `src/components/plaintiff-page/CaseTimeline.tsx`

**DO NOT rewrite this component** — it is a production-stable shared component used by all case pages. Import and use it directly:

```tsx
import { CaseTimeline } from '@/components/plaintiff-page/CaseTimeline'

// In page:
<CaseTimeline events={sortedTimeline} />
```

Where `sortedTimeline` is `timeline_events[]` sorted by `date_or_year` ASC.

**Component behaviour (do not deviate):**

- **Horizontal view** (default): horizontally scrollable flip-card track with drag support and numbered alternating above/below spine dots
- **Vertical view**: togglable via header buttons — two-column rows (flag left, content right)
- **Flip cards**: 300px wide, 3D flip animation (framer-motion `useAnimate`)

**FlipCard — FRONT face spec (locked):**
- Layout: `flex flex-col items-center justify-center text-center gap-3`
- Short title: `text-[22px] font-black uppercase leading-none tracking-tight text-white` — reads from `event.short_title`; fallback: `'THE ' + firstWord.toUpperCase()`
- Date: `text-[16px] font-bold uppercase tracking-wider text-[var(--accent-300)]`
- Location: `text-[16px] text-white/40` with `MapPinIcon h-3 w-3`
- Button: `w-full px-6 py-2 text-[12px] tracking-widest uppercase` label **"Flip Card"** — accent colours

**FlipCard — BACK face spec (locked):**
- Date: `text-[14px] font-bold uppercase tracking-wider text-[var(--accent-300)] mb-2 text-center`
- Description: `text-[14px] text-white/80 leading-[1.5] text-justify` + `style={{ letterSpacing: '-1px' }}`
- Location: `text-[12px] text-white/40` with `MapPinIcon h-3 w-3`
- Button: `px-3 py-1 text-[11px]` label **"← Back"** — accent colours

**short_title rules (set in Phase 0.5):**
- Always exactly 2 words: `THE [NOUN]` in ALL CAPS
- Examples: THE MEETING, THE BETRAYAL, THE ARREST, THE COLLAPSE, THE SILENCE

**Vertical view — 3-column row layout (locked):**

| Col | Width | Content |
|-----|-------|---------|
| A — Flag | `w-[15%]` | Country flag (FlagIcon), `bg-white/10`, full bleed |
| B — Text | `flex-1` | Number + short_title + date on top line; full description below |
| divider | `w-px bg-white/10` | Full-height vertical rule |
| C — Location | `w-[15%]` | MapPinIcon + city, centered, `text-[13px] text-white/50` |

**Column B top line:**
- `#N`: `text-[24px] font-bold text-[var(--accent-500)]`
- `short_title`: `text-[18px] font-black uppercase tracking-tight text-[var(--accent-500)]`
- Date: `text-[16px] font-semibold text-white`
- All three on one `items-baseline flex gap-4` row

**Column B description:** `text-[15px] leading-relaxed text-white/80`

**Column C:** `flex flex-col items-center gap-1 text-center`, pin icon above city name, dash if no city

**CRITICAL z-index rule**: The timeline isolation container (`style={{ overflow: 'hidden' }}`) must NEVER have `position`, `z-index`, or `overflow:visible` — it will break the sidebar.

**Self-check**: Scroll right in the timeline. Does the sidebar remain fixed? Does the hero section above remain centered? If anything shifts: the timeline is leaking z-index.

---

### SECTION 08 — Mind Map

**File**: `MindMapSection.tsx`

Load react-flow lazily (only when section enters viewport).

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'

// Parse NotebookLM mind map JSON → react-flow nodes/edges
function parseMindMapJSON(json: any) {
  // NotebookLM mind map JSON structure:
  // { title, nodes: [{ id, label, children: [...] }] }
  // Convert to react-flow format: { nodes: Node[], edges: Edge[] }
  const nodes: any[] = []
  const edges: any[] = []

  function traverse(node: any, parentId: string | null, depth: number, x: number, y: number) {
    nodes.push({
      id: node.id,
      data: { label: node.label },
      position: { x, y },
      style: {
        background: depth === 0 ? 'var(--accent-500)' :
                    depth === 1 ? 'var(--accent-700)' : 'var(--accent-900)',
        border: '1px solid var(--accent-300)',
        borderRadius: '8px',
        color: 'white',
        padding: '8px 12px',
        fontSize: '12px',
      }
    })
    if (parentId) {
      edges.push({ id: `${parentId}-${node.id}`, source: parentId, target: node.id,
                   style: { stroke: 'var(--accent-300)' } })
    }
    node.children?.forEach((child: any, i: number) => {
      traverse(child, node.id, depth + 1, x + 280, y + (i * 80) - (node.children.length * 40))
    })
  }

  if (json?.nodes?.[0]) traverse(json.nodes[0], null, 0, 0, 0)
  return { nodes, edges }
}

export function MindMapSection({ mindMapJson }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  if (!mindMapJson) return <ComingSoonPlaceholder section="Mind Map" />

  const { nodes, edges } = parseMindMapJSON(mindMapJson)

  return (
    <motion.section /* scroll wrapper */ ref={ref}>
      <h2 className="text-2xl font-semibold mb-8 px-6">Case Mind Map</h2>
      {visible && (
        // Dynamically import ReactFlow only when visible
        <div className="h-[600px] border border-border rounded-lg overflow-hidden">
          {/* <ReactFlow nodes={nodes} edges={edges} fitView /> */}
          {/* Full implementation: import ReactFlow from 'reactflow' */}
        </div>
      )}
    </motion.section>
  )
}
```

---

### SECTION 09 — Location Map

**File**: `LocationMap.tsx` — DO NOT rewrite this component. It already exists and is production-ready.

**Technology**: Leaflet (loaded dynamically via `import('leaflet')`). NOT react-map-gl, NOT MapLibre.

**How coordinate resolution works** (`resolveCoords` priority order — highest to lowest):
1. `city` field contains a coordinate string like `"16.0476743, 108.2496587"` → parsed directly ✓
2. `city` field contains a Google Maps URL → coords extracted from URL ✓
3. `latitude` / `longitude` DB columns are set → used as-is ✓
4. `city` is a plain name → looked up in `CITY_COORDS` table in LocationMap.tsx ✓

**Page.tsx passes locations like this:**
```tsx
const locations = sortedTimeline
  .filter((t: any) => t.city)
  .map((t: any) => ({
    name: t.city,
    date: t.date_or_year,
    description: t.description,
    coordinates: t.latitude && t.longitude ? [t.longitude, t.latitude] : undefined,
  }))
```

**DB requirements** (set in Phase 0.5 Step B):
- `city` = coordinate string `"lat, lng"` (e.g. `"16.0476743, 108.2496587"`)
- `latitude` = numeric lat
- `longitude` = numeric lng

Both fields set = maximum redundancy. Map always renders correctly regardless of which field survives.

---

### SECTION 10 — Evidence Vault

**File**: `EvidenceVault.tsx`

```tsx
const FILE_TYPE_ICONS = {
  pdf: DocumentTextIcon,
  image: PhotoIcon,
  video: VideoCameraIcon,
  audio: SpeakerWaveIcon,
  chat: ChatBubbleLeftIcon,
}

export function EvidenceVault({ evidence, onHighlightTimelineEvent }) {
  const [filter, setFilter] = useState<string | null>(null)

  const filtered = filter ? evidence.filter(e => e.file_type === filter) : evidence

  return (
    <motion.section /* scroll wrapper */>
      <h2 className="text-2xl font-semibold mb-8 px-6">Evidence Vault</h2>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 px-6 overflow-x-auto">
        {['all', 'pdf', 'image', 'video', 'audio', 'chat'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type === 'all' ? null : type)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap
              ${filter === type || (type === 'all' && !filter)
                ? 'bg-[var(--accent-500)] text-white'
                : 'bg-muted/50 text-foreground/80 hover:bg-[var(--accent-700)]'}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Evidence grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-6">
        {filtered.map(item => (
          <div key={item.id} className="bg-card border border-border rounded-lg overflow-hidden">
            {/* File preview / thumbnail */}
            {/* Title, description */}
            {/* Timeline event tag — bidirectional link */}
            {item.timeline_event_id && (
              <button
                onClick={() => onHighlightTimelineEvent(item.timeline_event_id)}
                className="text-xs text-[var(--accent-300)] hover:underline px-3 pb-2 block"
              >
                → See in timeline
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.section>
  )
}
```

---

### SECTION 11 — Inline Voting (Dual Verdict)

**File**: `InlineVoting.tsx`

```tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function InlineVoting({ caseId, userId, existingVote }) {
  const [guiltScore, setGuiltScore] = useState(existingVote?.guilt_score ?? 5)
  const [hasVoted, setHasVoted] = useState(!!existingVote)
  const gutInstinct = existingVote?.initial_guilt_score ?? null
  const supabase = createClient()

  const handleVote = async () => {
    const voteData = {
      case_id: caseId,
      voter_id: userId,
      guilt_score: guiltScore,
      // initial_guilt_score is captured by DB trigger on first INSERT — immutable
      updated_at: new Date().toISOString(),
    }

    if (hasVoted) {
      await supabase.from('votes').update(voteData).eq('case_id', caseId).eq('user_id', userId)
    } else {
      await supabase.from('votes').insert(voteData)
      setHasVoted(true)
    }
  }

  return (
    <motion.section /* scroll wrapper */>
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-8">
        <h2 className="text-2xl font-semibold mb-2">Your Verdict</h2>
        <p className="text-sm text-muted-foreground mb-8">
          Your gut instinct is captured once and locked forever.
          You can update your considered verdict at any time.
        </p>

        {/* Plaintiff Credibility slider */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">
            Plaintiff Credibility — How believable is this account?
          </label>
          <input type="range" min="1" max="10" value={credibilityScore}
            onChange={e => setCredibilityScore(Number(e.target.value))}
            className="w-full accent-[var(--accent-500)]"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1 — Not credible</span>
            <span className="font-bold text-[var(--accent-500)]">{credibilityScore}</span>
            <span>10 — Fully credible</span>
          </div>
        </div>

        {/* Defendant Guilt slider */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-3">
            Defendant Guilt — Based on this case, how guilty?
          </label>
          <input type="range" min="1" max="10" value={guiltScore}
            onChange={e => setGuiltScore(Number(e.target.value))}
            className="w-full accent-[var(--accent-500)]"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1 — Not guilty</span>
            <span className="font-bold text-[var(--accent-500)]">{guiltScore}</span>
            <span>10 — Clearly guilty</span>
          </div>
        </div>

        {/* Gut instinct lock indicator */}
        {gutInstinct && (
          <p className="text-sm text-[var(--accent-300)] mb-4">
            Your gut instinct is locked: {gutInstinct}/10
          </p>
        )}

        <button
          onClick={handleVote}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium"
        >
          {hasVoted ? 'Update My Verdict' : 'Submit My Verdict'}
        </button>
      </div>
    </motion.section>
  )
}
```

---

### Coming Soon Placeholder

**File**: `ComingSoonPlaceholder.tsx`

```tsx
export function ComingSoonPlaceholder({ section }: { section: string }) {
  return (
    <motion.section /* scroll wrapper */>
      <div className="border border-border/50 rounded-xl p-16 text-center bg-muted/20">
        <div className="w-16 h-16 rounded-full bg-[var(--accent-700)] mx-auto mb-6
                        flex items-center justify-center animate-pulse">
          <span className="text-2xl text-[var(--accent-300)]">⋯</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">{section}</h3>
        <p className="text-sm text-muted-foreground">
          This section will populate once the {section.toLowerCase()} is generated.
        </p>
      </div>
    </motion.section>
  )
}
```

---

## Phase 4: Inject Accent Colors

After building all components, inject the extracted palette at the top of the page:

```tsx
// In page.tsx, inside <head> or as an inline style on the root wrapper:
<style>{`
  :root {
    --accent-100: ${palette['--accent-100']};
    --accent-300: ${palette['--accent-300']};
    --accent-500: ${palette['--accent-500']};
    --accent-700: ${palette['--accent-700']};
    --accent-900: ${palette['--accent-900']};
  }
`}</style>
```

Or use Tailwind arbitrary values referencing these CSS variables throughout.

---

## Phase 5: Self-Review Before Submitting

Score yourself on the 96% checklist. Fix anything below 4/5 before submitting to Claude.

### Quick Checklist
```
STRUCTURE
  □ All 12 sections present in correct order?
  □ No section empty when data exists?
  □ Sidebar/nav unbroken by any section?
  □ Mobile layout correct?

VISUAL
  □ Extracted accent color applied throughout?
  □ Hero diagonal split + both photos framed?
  □ All 4 hero animations working?
  □ Scroll fade+rise on every section?
  □ All-sans-serif typography?

DATA
  □ All Supabase fields showing real data?
  □ Timeline events from DB?
  □ Evidence vault cross-linked to timeline?
  □ Location pins match actual case locations?

TECHNICAL
  □ Timeline z-index isolated — sidebar doesn't move during timeline scroll?
  □ Hero centered on content area (not viewport)?
  □ tsc --noEmit passes with zero errors?
  □ No lucide-react / no emoji / no hardcoded hex?

CONTENT
  □ AI tagline compelling and under 20 words?
  □ Status badge prominent and correct?
  □ Notebook summary present in Case Summary section?
```

**TOTAL YOUR SCORE. If < 96/100 → fix and re-score before submitting.**

---

## Phase 6: Submit to Claude for Review

Send Claude:
1. All built component files
2. Your self-scores per checklist item
3. List of any sections using Coming Soon placeholder (and why)
4. Any TypeScript errors you couldn't resolve

Claude will:
1. Score each checklist item independently
2. Return specific required changes with file + line references
3. Re-score after you fix — repeat until ≥ 96/100

---

## Reference: NotebookLM Artifact Pipeline

```
# List all artifacts for a notebook
mcp__notebooklm-mcp__studio_status(notebook_id="[ID]")

# Get notebook summary (Case Summary text)
mcp__notebooklm-mcp__notebook_describe(notebook_id="[ID]")
→ use summary field

# Download mind map JSON
mcp__notebooklm-mcp__download_artifact(
  notebook_id="[ID]", artifact_type="mind_map", output_path="/tmp/mindmap.json"
)

# Download briefing doc
mcp__notebooklm-mcp__download_artifact(
  notebook_id="[ID]", artifact_type="report", output_path="/tmp/briefing.md"
)

# Download slide deck PDF
mcp__notebooklm-mcp__download_artifact(
  notebook_id="[ID]", artifact_type="slide_deck", output_path="/tmp/slides.pdf"
)

# Download audio
mcp__notebooklm-mcp__download_artifact(
  notebook_id="[ID]", artifact_type="audio", output_path="/tmp/podcast.mp3"
)

# Create missing artifact
mcp__notebooklm-mcp__studio_create(
  notebook_id="[ID]",
  artifact_type="[audio|slide_deck|mind_map|report]",
  confirm=True
)
# Poll until ready (every 30s, max 5 min):
mcp__notebooklm-mcp__studio_status(notebook_id="[ID]")
```

**CPR Notebook IDs:**
- Kelly Cai (plaintiff): `86438ec8-ec42-4f4e-8331-fda2ed649053`
- Colin James Bradley (defendant): `ddcaf0ca-f7d6-40a5-8588-ea19a3747398`

---

## Reference: DB Schema Quick View

```sql
-- Key fields used by this skill:

cases: id, case_number, status, case_types, plaintiff_id, defendant_id,
       relationship_narrative (JSONB), promise_narrative (JSONB),
       betrayal_narrative (JSONB), personal_impact (JSONB),
       legal_actions (JSONB), story_narrative (JSONB),
       visibility_settings (JSONB), nominal_damages_claimed, created_at

defendants: id, slug, first_name, last_name, full_name, aliases (array), dob

profiles: id, display_name, avatar_url (plaintiff display)

financial_impacts: case_id, total_lost, direct_payments, lost_wages,
                   property_loss, legal_fees, medical_costs

timeline_events: id, case_id, event_type, date_or_year, description, short_title,
                 city (coordinate string "lat, lng" OR display name),
                 latitude (DOUBLE PRECISION), longitude (DOUBLE PRECISION),
                 submitted_by
                 — NEVER wipe lat/lng via form save; only skill/SQL may write coordinates

witnesses: id, case_id, full_name, witness_type, contact_info, details (JSONB)

evidence: id, case_id, file_url, file_type, title, description, timeline_event_id

votes: id, case_id, voter_id, guilt_score, initial_guilt_score (LOCKED ON INSERT),
       nominal_approved, punitive_amount, justification, updated_at
```

---

## Skill Complete

When Claude scores ≥ 96/100, the page is ready to ship.
The page lives at: `/cases/[slug]/plaintiff/[plaintiffId]`
