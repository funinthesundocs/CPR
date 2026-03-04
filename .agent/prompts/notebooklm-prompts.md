# NotebookLM Query Prompts
> Reusable prompts for generating defendant page content via `notebook_query`.
> Use these verbatim — they are tuned for CPR's tone, length, and engagement goals.

---

## 1. Notebook Summary (`notebook-summary.txt`)

```
Write a 3-paragraph summary of this case for a public accountability platform.

Paragraph 1 — The Hook: Open with a single powerful sentence that captures who this
person is and what they are accused of doing. Follow with 2-3 sentences establishing
the core deception — what they promised, what they actually delivered, and who was
harmed. Make the reader feel the weight of it immediately.

Paragraph 2 — The Pattern: Describe how the scheme operated. The method, the
manipulation, the geography, the scale. Name the pattern of behavior across multiple
victims. This is where the reader realizes this was not a mistake — it was deliberate
and repeated.

Paragraph 3 — The Stakes: Why this case matters beyond the individual victims. What
it reveals about the defendant's character. Where things stand now and what the public
record shows. End with a sentence that makes the reader want to keep reading.

Tone: Journalistic. Factual. Serious weight without sensationalism. Write in third
person. No legal disclaimers, no hedging language like "allegedly" or "claims." This
is a summary of documented testimony and evidence, not a news article.

Length: 220-260 words total. No headers. Plain paragraphs only.
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
