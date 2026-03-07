# Organizational Pearls of Wisdom

> General principles extracted from real work sessions. These apply to ALL future work regardless of project.
> Maintained by the `wisdom-harvest` skill (see `.agent/skills/wisdom-harvest/SKILL.md`).

---

## How to Log a Pearl Invocation

When a pearl **prevents a mistake or shapes a decision**, log it inline in your response:

```
⚡ Pearl invoked: "[Pearl Title]" — [one sentence on what you were about to do and what you did instead]
```

The harvest process reads these logs and increments the `Uses` counter for that pearl.
**This is how the system learns which pearls earn their keep.**

---

## Pruning Guide (when pearls exceed 40 rows)

Prune in this order — lowest score = first to go:

| Score | Criteria |
|-------|----------|
| 0 pts | Uses = 0 |
| +1 pt | Maturity ≥ Confirmed |
| +2 pts | Maturity = Established |
| +1 pt | Uses ≥ 2 |
| +2 pts | Uses ≥ 5 |

**Never prune:** Established pearls with Uses ≥ 1. **Always prune first:** Seed + Uses = 0 + Added > 90 days ago.

---

## Browser Automation

| Pearl | Rule | Maturity | Added | Uses |
|-------|------|----------|-------|------|
| Verify DOM before selecting | Run a debug probe to dump actual element tags and classes before writing any selector — assumptions about DOM structure are the #1 cause of silent failures | Established | 2026-02-19 | 0 |
| Extract before transform | Read all data from the DOM before clicking buttons that trigger CSS changes, page transitions, or layout shifts — state transforms destroy evidence | Established | 2026-02-19 | 0 |
| Observable waits only | Replace every sleep() or fixed delay with a condition that checks actual observable state — magic numbers are lies that work today and fail tomorrow | Established | 2026-02-19 | 0 |

## Windows Compatibility

| Pearl | Rule | Maturity | Added | Uses |
|-------|------|----------|-------|------|
| ASCII-only subprocess output | Never use Unicode characters (checkmarks, arrows, emoji) in print() statements that run inside subprocesses — Windows charmap encoding will crash | Established | 2026-02-19 | 0 |
| Declare OS and path format | Explicitly state the target OS and path style in every skill or instruction — models default to their training bias (usually Linux) and silently produce wrong commands | Established | 2026-02-19 | 0 |
| PowerShell multi-line -m hangs silently | Never use embedded newlines inside a git commit -m "..." on PowerShell — the shell enters multi-line input mode and the command produces no output while appearing to still run | Seed | 2026-02-20 | 1 |

## Iterative Refinement

| Pearl | Rule | Maturity | Added | Uses |
|-------|------|----------|-------|------|
| Answer questions directly before working | When a user asks a direct question, answer it completely before starting any work or implementation — skipping to work wastes context and user patience | Seed | 2026-03-02 | 0 |
| Recursive self-critique with a target | Set a numeric satisfaction threshold (e.g., 93%) and iterate until you reach it — open-ended "make it better" loops never converge | Established | 2026-02-19 | 0 |
| Additive enhancement only | After each test or iteration, add what you learned to the documentation — never remove existing rules, only add new ones | Established | 2026-02-19 | 0 |
| Consistency grep after every change | After modifying any code or documentation, grep the entire file for stale references to the old approach — one contradictory line wastes more debugging time than no documentation | Established | 2026-02-19 | 0 |
| Trace data through full pipeline | Before assuming data is missing or a feature broken, trace a single record through the complete pipeline (input → storage → retrieval → display) — the actual failure is often in a different layer than suspected | Confirmed | 2026-03-02 | 0 |
| Don't ask false-choice questions | If you can complete the sentence "Option X is better because [principle]", then X is not a choice, it's the answer — asking "which do you prefer" when you already know the technical winner is just deferring your own reasoning to the user | Seed | 2026-03-05 | 0 |

## General Engineering

| Pearl | Rule | Maturity | Added | Uses |
|-------|------|----------|-------|------|
| Never assume response format | When consuming output from any external system (model API, CLI tool, webhook), parse the structured content out of the raw response before executing — raw output always contains wrapper formatting that will break downstream commands | Confirmed | 2026-02-19 | 0 |
| Flat columns over JSONB blobs | Store form submission fields as individual named columns rather than JSONB objects — display pages reference flat columns directly, while JSONB field renames break silently at runtime with no build error | Confirmed | 2026-02-20 | 0 |

## Frontend & Full-Stack

| Pearl | Rule | Maturity | Added | Uses |
|-------|------|----------|-------|------|
| Audit display pages after form redesign | Whenever a data entry form's schema is redesigned, immediately audit every page that reads its submitted data — stale field references render nothing silently with no compile-time error | Seed | 2026-02-20 | 0 |
| HMR skips module-level constants | Any value computed at module load time requires a full dev server restart to reflect source file changes — hot reload only patches component boundaries, not module-scope initialization | Seed | 2026-02-20 | 2 |
| i18n key mismatches invisible at build time | A missing translation key returns the raw key string at runtime with zero build warnings — grep the translation file for every t() call after adding new keys to a component | Seed | 2026-02-20 | 2 |
| Dead HMR connection silences all new files | When a dev server's WebSocket HMR connection drops, new source files are never delivered to the browser — always restart the dev server when changes appear absent and the console shows WebSocket failures | Seed | 2026-02-20 | 0 |
| False-default gates hide UI on first render | A React boolean state that gates UI visibility should default to `true` (then disable if unsupported), not `false` (then enable if supported) — the false-default causes a blank first render that persists if the enabling effect never fires | Seed | 2026-02-20 | 0 |
| Check capability lazily not eagerly | Detect browser capabilities (microphone, camera, geolocation, clipboard) on first user interaction rather than on component mount — eager detection causes blank UI if the async check races with the first render | Seed | 2026-02-20 | 0 |
| Admin UI/API namespace split | When adding middleware admin route guards, explicitly protect both the UI namespace (/admin/*) and the API namespace (/api/admin/*) — they share no prefix and a guard on one does not cover the other | Seed | 2026-02-28 | 0 |
| CSS Grid for cross-row column alignment | When independent sibling rows must have elements aligned at the same horizontal position, use CSS Grid with fixed column widths on each row — Flexbox flex-1 distributes space within one container and cannot align elements across separate sibling containers | Seed | 2026-03-03 | 0 |
| icon-only button breaks with adjacent content | When adding label text next to a trigger icon in shadcn, switch from `size="icon"` to `size="sm"` with explicit padding — `size="icon"` locks the button to a square and clips both the icon and any sibling text | Seed | 2026-03-04 | 0 |
| Sticky needs an explicit scroll container | When `position: sticky` fails inside a sidebar layout, make the scrollable column a proper scroll container (`h-svh overflow-y-auto`) — a flex child with only `min-h-svh` and no defined height has no scroll context, so sticky silently degrades to relative | Seed | 2026-03-04 | 0 |
| Audit shared component callers before style changes | Before modifying default styles or adding inline overrides to a shared UI component, check every caller — a change that fixes one use case silently breaks all others | Seed | 2026-03-03 | 0 |
| Async useEffect needs cancellation token not init guard | In async useEffect functions with expensive initialization (dynamic imports, third-party lib setup), use a cancellation token checked after every await — React.StrictMode cleanup fires before async resumption, making boolean init-guard flags ineffective | Seed | 2026-03-03 | 0 |
| Check component layout before parent wrappers | When a component has unexpected spacing or padding, check the component's own layout properties (max-w, mx-auto, p-*, px-*, etc.) FIRST before tracing up to parent providers or wrapper components — the culprit is almost always on the component itself | Seed | 2026-03-05 | 0 |
| Stat cards need live query data, not stale columns | Any UI stat that displays a count must explicitly trace to a live query result — never read from a DB profile column (e.g. case_count) that has no trigger updating it; use the array already fetched in state instead | Seed | 2026-03-05 | 2 |
| Ask what the entity IS before designing its card | Before planning a UI card or list item, ask: "What does this entity represent in the real world and what fields are definitionally required to identify it?" — a case needs both parties, a transaction needs amount and parties, a message needs sender and recipient. Missing a definitionally required field is not a gap to find later; it is a failure to understand the subject. | Seed | 2026-03-05 | 1 |
| Participation card shows entity's parties, not viewer | A card representing a shared entity (case, order, event) must populate its identity fields from that entity's canonical parties — never from the logged-in user viewing it, even when the card appears in "My X" lists | Seed | 2026-03-06 | 0 |
| Theme provider CSS vars include function wrapper | Theme providers often store CSS variables as complete values (e.g., `hsl(221 83% 53%)` or `hsl()` function syntax) rather than raw values — using `hsl(var(--primary))` double-wraps and breaks; use `var(--primary)` directly instead | Seed | 2026-03-06 | 1 |

## Debugging Methodology

| Pearl | Rule | Maturity | Added | Uses |
|-------|------|----------|-------|------|
| Debug by distance to symptom | Start debugging closest to where the problem appears, then expand outward — the cause is usually nearest the symptom, not in distant parents or dependencies | Seed | 2026-03-05 | 0 |
| Assume simplest cause first | When multiple explanations fit the symptoms, the one requiring fewer steps is usually right — apply Occam's Razor to eliminate deep theories before checking simple local issues | Seed | 2026-03-05 | 0 |
| Change one variable at a time | Fix one thing, verify it caused the difference, then move to the next — never fix five things at once and claim credit for three | Seed | 2026-03-05 | 0 |
| State assumptions before searching | Declare what you think is broken BEFORE looking for evidence — prevents motivated reasoning where you see confirmation instead of contradiction | Seed | 2026-03-05 | 0 |
| Stop reading when you have answer | Before opening another file, ask: did my previous reads already answer this question — file-hopping when lost consumes context with zero return | Seed | 2026-03-05 | 0 |

## Artifact Pipeline

| Pearl | Rule | Maturity | Added | Uses |
|-------|------|----------|-------|------|
| Never overwrite curated media with auto-generated | Before downloading any binary artifact (audio, video, image) to a destination that may already contain a manually curated file, confirm with the user which source is authoritative — auto-generated NotebookLM audio is never a substitute for recorded interviews or custom-produced media | Seed | 2026-03-04 | 0 |
| One canonical folder per entity | When artifacts for the same entity end up in two folders with similar names, stop immediately and ask which to keep before touching either — silent merges lose the authoritative file permanently | Seed | 2026-03-04 | 0 |

## Database & Auth

| Pearl | Rule | Maturity | Added | Uses |
|-------|------|----------|-------|------|
| Check triggers before assuming INSERT fails | Before concluding a NOT NULL column with no visible default will break an INSERT, query pg_trigger for that table — a BEFORE INSERT trigger may auto-populate it silently | Seed | 2026-02-20 | 0 |
| RLS self-referencing join is always true | A WHERE join that compares a table alias to itself (e.g. cp.id = cp.id) creates a constant-true condition, silently granting every row to every user — always verify every join predicate references a different table | Seed | 2026-02-20 | 0 |
| RLS-disabled can be intentional for catalog tables | RBAC configuration tables (roles, permissions, mappings) legitimately disable RLS because all users need read access — flag disabled-RLS as a finding but verify intent before treating it as a vulnerability | Seed | 2026-02-20 | 0 |
| Read code before writing migrations | Before writing a SQL migration or query that references columns in an existing table, read the codebase code that already queries that table to confirm actual column names — spec documents drift from reality silently and cause failed migrations | Seed | 2026-03-01 | 0 |
| Query DB before parsing field content | Before writing logic that parses a text field (location, address, tags) for structured values, query actual DB rows to see what the field really contains — fields named like structured data often hold free-text prose at runtime | Seed | 2026-03-03 | 1 |
| PostgREST joins require explicit FK in schema | Supabase's nested query JOIN syntax (e.g. table(columns)) only works when the foreign key is explicitly declared in the database schema — PostgREST cannot infer relationships from matching column names alone | Seed | 2026-03-01 | 1 |
| Service-role key required for storage operations | Supabase anon keys cannot create buckets or modify storage settings — always use service-role key for any storage admin operations (bucket creation, bucket config, file metadata) | Seed | 2026-03-02 | 0 |
| Anon storage uploads need API wrapper | Supabase anon keys fail silently on file uploads to buckets with RLS policies enabled — create an API route using service-role key to accept file uploads from the browser client | Seed | 2026-03-03 | 0 |
| Key batch DB updates by natural field not insertion order | When batch-patching database rows that have a natural ordering field (e.g., date), key the update map by that field rather than array index or created_at — insertion order rarely matches logical sequence and applies data to the wrong records | Seed | 2026-03-03 | 0 |
