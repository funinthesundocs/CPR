# NotebookLM Query Prompts
> Reusable prompts for generating defendant page content via `notebook_query`.
> Use these verbatim — they are tuned for CPR's tone, length, and engagement goals.

---

## 1. Notebook Summary (`notebook-summary.txt`)

```
Write a summary of this case for a public accountability platform. It has two parts:

PART 1 — NARRATIVE SUMMARY (150 words exactly):

Paragraph 1 — The Hook: Open with a single powerful sentence that captures who this
person is and what they are accused of doing. Follow with 2-3 sentences establishing
the core deception — what they promised, what they actually delivered, and who was
harmed. Make the reader feel the weight of it immediately.

Paragraph 2 — The Pattern: Describe how the scheme operated. The method, the
manipulation, the geography, the scale. Name the pattern of behavior across multiple
victims. This is where the reader realizes this was not a mistake — it was deliberate
and repeated.

Tone: Journalistic. Factual. Serious weight without sensationalism. Write in third
person. No legal disclaimers, no hedging language like "allegedly" or "claims." This
is a summary of documented testimony and evidence, not a news article.

Length: 150 words total. No headers. Plain paragraphs only.

PART 2 — SUPPORTING DOCUMENTATION:

After the narrative, add a bulletized list of key supporting documentation from the
sources. Each bullet should be a single line identifying a specific document, filing,
testimony, record, or piece of evidence that substantiates the case. Format:

• [Document or evidence type]: [One-sentence description of what it establishes]

Include 6-10 bullets. Be specific — name the actual documents, dates, amounts, or
parties where known. No vague entries.
```

---

## 2. Tagline (`tagline.txt`)

Two options — use whichever lands harder for the specific defendant.

### Option A — Documentary Title
> Best when the defendant has a strong persona or identity to contrast against reality.

```
Write a single tagline for this defendant — 10 words maximum. It should read like
the title of a true crime documentary: evocative, specific, impossible to ignore.
Capture the contrast between who this person presented themselves as and what they
actually were. No punctuation at the end. No generic phrases. Make it specific to
this case and this person. One line only.
```

### Option B — Two-Word Verdict
> Best when the facts speak loudest. Two words. No more. Like a stamp on a file.

```
Write a two-word tagline for this defendant. Exactly two words — no more, no less.
It should read like a verdict stamped on a case file. Capture the essence of who
this person is and what they did in two words that hit like a closed door.
Examples of the format (not the content): "Calculated Predator." "Serial Architect."
"Manufactured Visionary." Make it specific to this defendant. Two words only.
```

---

## Usage

```
notebook_query(notebook_id, <prompt above>)
```

Save output directly to:
- Summary → `.agent/artifacts/[slug]/notebook-summary.txt`
- Tagline  → `.agent/artifacts/[slug]/tagline.txt`
