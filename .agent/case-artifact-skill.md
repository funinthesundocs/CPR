# Case Artifact Build Skill — End-to-End Workflow

## Purpose
Build complete case artifacts (tagline, notebook summary, briefing, images) for a plaintiff case page. This skill prevents errors in artifact generation, file placement, and component rendering.

---

## Step 1: Verify Case Exists in Database

Query Supabase to confirm the case exists and retrieve:
- `case_number` (e.g., "C-0001")
- `plaintiff_id`
- Plaintiff's `display_name` from `user_profiles`

**Rule:** Derive `artifactSlug` from display_name:
```
artifactSlug = displayName
  .toLowerCase()
  .trim()
  .replace(/\s+/g, '-')
  .replace(/[^a-z0-9-]/g, '')
```
Example: "Matt Campbell" → "matt-campbell"

---

## Step 2: Create Artifact Folders

Create TWO folder structures:
- `.agent/artifacts/{artifactSlug}/` — server-side files (text-based)
- `public/artifacts/{artifactSlug}/` — client-side files (media)

```
.agent/artifacts/matt-campbell/
├── tagline.txt
├── notebook-summary.txt
└── briefing.md

public/artifacts/matt-campbell/
├── infographic-landscape.jpg
├── slides.pdf
└── podcast.mp3
```

---

## Step 3: Generate Tagline

**Rules:**
- **Hard limit: 40 characters** (no exceptions)
- Write in lowercase — CSS `capitalize` class handles title case
- Formula: 3-part punchy structure separated by commas or periods
- Example: "Phantom yachts, stolen wages, four countries of victims."
- File: `.agent/artifacts/{slug}/tagline.txt`

**Component CSS (HeroText.tsx):**
```tsx
<p className="text-lg md:text-xl font-normal text-white/60 italic capitalize text-center mb-6">
  {tagline}
</p>
```

**Common errors:**
- ❌ Over 40 chars → wraps to 3+ lines
- ❌ Missing `capitalize` class → no title case enforcement
- ❌ `whitespace-nowrap` anywhere → forces single line, causes overflow

---

## Step 4: Generate Notebook Summary (SHORT)

**Query NotebookLM:**
```
Request a 1-2 paragraph punchy summary covering:
- Who the defendant is
- What happened
- Why it matters

Format: Plain text or minimal markdown (no citation numbers)
```

**Rules:**
- **Max 200 words** (2 short paragraphs)
- Remove ALL citation numbers like [1], [2], [3, 4]
- Save to: `.agent/artifacts/{slug}/notebook-summary.txt`
- This appears in the Case Summary box on the page

**Component usage:**
- Displays on main case page (not modal)
- Wrapped in `ReactMarkdown` with custom styling
- Max width enforced by container

---

## Step 5: Generate Briefing Document (LONG)

**Query NotebookLM:**
```
Request a full 10-section briefing including:
- Executive Summary
- Defendant Profile
- How Relationship Began
- Promise and Deception
- Financial Impact
- Timeline of Events
- Evidence and Documentation
- Witness Testimony
- Pattern of Behavior
- Why This Case Matters

Format: Rich markdown with ## headings and **bold** for names/dates/amounts
```

**Rules:**
- **No character limit** — comprehensive coverage
- Remove citation numbers: [1], [2], [3, 4], etc.
- Use **bold** markdown for names, dates, amounts, entities (e.g., `**Colin Bradley**`, `**$40,000/month**`, `**October 20, 2025**`)
- **Format as prose paragraphs, NOT bullet lists** — lists with embedded bold break rendering
- Bold renders as bold text only — NO highlight background (component removes bg color)
- Save to: `.agent/artifacts/{slug}/briefing.md`
- This appears ONLY in "View Full Report" modal
- **CRITICAL:** This is NOT the notebook-summary

**Component usage:**
- Only rendered when user clicks "View Full Report" button
- Rendered in modal with distinct styling
- ReactMarkdown with extensive custom components

---

## Step 6: Download Public Artifacts from NotebookLM

Studio artifacts to download (to `public/artifacts/{slug}/`):
1. **podcast.mp3** — Audio Overview (deep dive format recommended)
2. **slides.pdf** — Slide Deck (detailed_deck format)
3. **infographic-landscape.jpg** — Infographic (landscape orientation)

**Skip (not needed for current design):**
- ❌ Mind map
- ❌ Report artifact (use briefing.md instead)
- ❌ Data table
- ❌ Quiz/Flashcards

**Download tool:**
```
download_artifact(
  notebook_id="...",
  artifact_type="audio|video|slide_deck|infographic",
  output_path="public/artifacts/{slug}/filename"
)
```

**Rules:**
- Files must exist in `public/artifacts/{slug}/` for URLs to resolve
- Missing files → 404 errors in browser
- Verify downloads completed with file sizes

---

## Step 7: Understand Page Layout

**Case Summary Section appears ONCE on main case page:**

```
┌─────────────────────────────────────────────────────────┐
│ Case Summary                    [View Full Report] [Original Testimony] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ LEFT (flex-1):                  RIGHT (w-[340px]):      │
│ ───────────────                 ───────────────         │
│                                                          │
│ • notebookSummary              • summaryImage1Url       │
│   (SHORT 1-2 para,               (case-summary-pool     │
│    from .txt file)               random image)          │
│                                                          │
│ • Supporting Docs              • summaryImage2Url       │
│   (from evidenceInventory)       (case-summary-pool     │
│                                  random image)          │
│ • Closing Statement                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘

MODAL (opens on button click):
┌─────────────────────────────────────────────────────────┐
│ [Detailed Analysis] [Original Testimony]           [X]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ briefingContent (FULL 10-section markdown)             │
│ (from .md file)                                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Step 8: Update Case Page Component Props

**File:** `src/app/cases/[slug]/page.tsx`

Pass these props to `PlaintiffPageClient`:
```tsx
<PlaintiffPageClient
  notebookSummary={notebookSummary}        // from .txt file → LEFT column
  briefingContent={briefingContent}        // from .md file → modal only
  tagline={tagline}                       // from .txt file → hero section
  infographicUrl={`${artifactBase}/infographic-landscape.jpg`}
  audioUrl={`${artifactBase}/podcast.mp3`}
  pdfUrl={`${artifactBase}/slides.pdf`}
  summaryImage1Url={summaryImage1Url}     // from case-summary-pool
  summaryImage2Url={summaryImage2Url}     // from case-summary-pool
  ...
/>
```

**No hardcoded URLs:** All paths derived from `artifactSlug`.

**Image pool rule:** Images are randomly selected from `/public/case-summary-pool/` on every page load using Fisher-Yates shuffle. Same images used for all cases.

---

## Step 8: Git Commit All Artifacts

**Commit message template:**
```
feat: add {plaintiff-name} artifacts and build complete case page
```

**Stage files:**
```
git add .agent/artifacts/{slug}/
git add public/artifacts/{slug}/
git add src/app/cases/[slug]/...  (if component changes)
```

---

## Dev Server Cache Issues

**Critical rule:** After writing artifact files, the dev server must restart to pick them up.

```bash
# Kill and restart
rm -rf .next
npm run dev
```

**Why?**
- Server Components read files at request time
- `.next` cache can hold stale module state
- HMR (Hot Module Reload) doesn't always pick up file system changes

**Signs of cache issue:**
- Page renders old content despite file changes
- Error: "summaryImage2Url is not defined" (stale component bytecode)

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Tagline wraps 3+ lines | Over 40 chars | Shorten text, never increase font size |
| Case Summary shows full briefing | Loaded wrong file | notebook-summary.txt must be SHORT (1-2 para) |
| 404 on infographic/slides | Files don't exist in public/ | Re-download artifacts to correct folder |
| "summaryImage2Url undefined" | Stale component cache | `rm -rf .next && npm run dev` |
| Tagline not capitalized | Missing CSS class | Add `capitalize` class to element |
| File not picked up | Dev server cache | Clear `.next` and full restart |

---

## Validation Checklist

Before considering the case "done":

- [ ] Tagline displays centered, on 1-2 lines max, title case
- [ ] Case Summary shows SHORT notebook summary (not full briefing)
- [ ] "View Full Report" button opens modal with full briefing
- [ ] Infographic loads (no 404)
- [ ] PDF and audio links work
- [ ] All artifact files exist in both folders
- [ ] Dev server has no errors in console
- [ ] Git commit includes all artifacts

---

## File Reference

| File | Purpose | Max Size | Format |
|------|---------|----------|--------|
| `tagline.txt` | One-liner for hero section | 40 chars | Plain text, lowercase |
| `notebook-summary.txt` | Case Summary box | 200 words | Plain text or minimal markdown |
| `briefing.md` | Full Report modal | Unlimited | Rich markdown with ## headings |
| `infographic-landscape.jpg` | Visual summary | Any | JPG/PNG |
| `slides.pdf` | Presentation | Any | PDF |
| `podcast.mp3` | Audio overview | Any | MP3 |

---

## Next Plaintiff Workflow

1. Run this skill end-to-end for the next case
2. If ANY error occurs, reference the "Common Errors" table above
3. If error not listed, document it and add to this file
4. All future cases use this unified process

**No improvisation. Follow the checklist.**
