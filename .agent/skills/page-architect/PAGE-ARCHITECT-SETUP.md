# Page Architect Skill — Setup & Usage Guide

## Step 1: Install the Skill Files

Place the `page-architect` folder in your Claude Code project's `.claude/skills/` directory:

```
your-project/
├── .claude/
│   └── skills/
│       └── page-architect/
│           ├── SKILL.md
│           └── references/
│               ├── pattern-selection-guide.md
│               ├── cognitive-principles.md
│               └── narrative-architecture.md
├── src/
├── package.json
└── ...
```

### Commands to set it up:

```bash
# From your project root
mkdir -p .claude/skills/page-architect/references

# Copy the files (adjust source path to wherever you downloaded them)
cp page-architect/SKILL.md .claude/skills/page-architect/
cp page-architect/references/*.md .claude/skills/page-architect/references/
```

---

## Step 2: Add to CLAUDE.md (Project Instructions)

Open your project's `CLAUDE.md` (or create one in the project root) and add:

```markdown
## Custom Skills

### Page Architect
Location: `.claude/skills/page-architect/SKILL.md`
Trigger: Use this skill whenever transforming, redesigning, or rearchitecting any
page layout — especially pages with dense text content. Always read SKILL.md first,
then read the relevant reference files before writing any code.
```

This ensures Claude Code knows the skill exists and when to use it.

---

## Step 3: Prompt Claude Code

Here's the exact prompt sequence for transforming your case page. You can do this
in a single prompt or break it into phases.

### Option A: Single Prompt (Let Claude Run)

```
Read the skill at .claude/skills/page-architect/SKILL.md and ALL three reference
files in the references/ directory.

Then transform the case detail page at src/app/cases/[id]/page.tsx (or wherever
your case page component lives).

The page currently displays case C-0002 at localhost:3000/cases/C-0002 and it's
just a wall of text. Apply the full Page Architect process:

1. Step 0: Read the existing page component and identify the design system
   (Tailwind config, existing components, dark/light theme, layout patterns)
2. Step 1: Content audit — classify every data block by type
3. Step 2: Audience analysis — this is a public-facing case record that needs
   to tell a compelling story while maintaining credibility
4. Step 3-4: Select patterns and apply cognitive principles
5. Step 5: Create the full page architecture blueprint and show it to me
6. Step 6-7: Implement it, respecting the existing design system

Show me the blueprint BEFORE you start coding so I can approve the architecture.
```

### Option B: Two-Phase Approach (Recommended — More Control)

**Phase 1 — Architecture Plan:**

```
Read .claude/skills/page-architect/SKILL.md and all three reference files.

Analyze the case detail page at src/app/cases/[id]/page.tsx

Follow Steps 0-5 of the Page Architect skill:
- Inventory the existing design system (theme, components, Tailwind config)
- Audit all the content on the page and classify each block
- Map each content block to the optimal UI pattern
- Design the full section-by-section blueprint with all fields

Present the complete blueprint including:
- Content audit table
- Section-by-section architecture with patterns, principles, transitions,
  backgrounds, and component approach
- Variety audit
- Emotional arc diagram

Do NOT write any code yet. Just the plan.
```

**Phase 2 — Implementation (after you approve the plan):**

```
Implement the approved page architecture blueprint.

Rules:
- Preserve the existing design system (colors, fonts, component library)
- Build each section as described in the blueprint
- Follow the variety requirements (no same pattern twice in a row,
  alternating backgrounds, density oscillation)
- Run the Step 7 review checklist before presenting the result
- Use the existing data fetching — don't change the API, just the presentation

If you need to create new reusable components (like StatBlock, TimelineNode,
WitnessCard, PullQuote), put them in src/components/case/ or wherever
components live in this project.
```

### Option C: Agent Teams Parallel Approach

If you're using Claude Code Agent Teams, you could split implementation:

```
Use the page architecture blueprint to implement the case detail page transformation.

Delegate to teammates:
- Teammate 1: Build the hero hook section + case metadata bar (Sections 1-2)
- Teammate 2: Build the narrative chapter components + financial impact card (Sections 3-5)
- Teammate 3: Build the timeline + climax reveal section (Sections 6-7)
- Teammate 4: Build witness cards + pattern warning + resolution (Sections 8-10)

File ownership:
- Teammate 1 owns: src/components/case/HeroSection.tsx, CaseMetadataBar.tsx
- Teammate 2 owns: src/components/case/ChapterSection.tsx, FinancialImpact.tsx
- Teammate 3 owns: src/components/case/CaseTimeline.tsx, RevealSection.tsx
- Teammate 4 owns: src/components/case/WitnessGrid.tsx, PatternWarning.tsx, Resolution.tsx

The main page component (src/app/cases/[id]/page.tsx) is owned by the
orchestrator and imports all section components.

All teammates must read the page-architect skill FIRST and match the existing
design system.
```

---

## Step 4: Iterate

After the first implementation, follow up with:

```
Review the rendered page against the Step 7 checklist in the Page Architect skill.

Check:
- Is there pattern variety across sections?
- Does the first viewport hook attention with data?
- Are there any remaining walls of text?
- Do backgrounds alternate between sections?
- Does the emotional arc feel right (tension building to climax to resolution)?

Fix anything that fails the checklist.
```

---

## Quick Reference: File Paths

| What | Where |
|------|-------|
| Skill entry point | `.claude/skills/page-architect/SKILL.md` |
| Pattern library | `.claude/skills/page-architect/references/pattern-selection-guide.md` |
| Psychology reference | `.claude/skills/page-architect/references/cognitive-principles.md` |
| Story structure guide | `.claude/skills/page-architect/references/narrative-architecture.md` |
| Project instructions | `CLAUDE.md` (project root) |

---

## Tips

- **Always have Claude read ALL reference files** before coding. The skill is designed
  with progressive disclosure — SKILL.md gives the framework, reference files give the
  depth. Without the references, Claude will default to generic patterns.

- **Approve the blueprint before implementation.** The architecture plan is the most
  important deliverable. Bad architecture with good styling still looks bad.

- **Point Claude at your actual component files.** The more context it has about your
  existing design system, the better the output will match your app.

- **Use "show me the blueprint" as a checkpoint.** This prevents Claude from diving
  into code before the structure is right.
