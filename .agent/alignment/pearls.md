<!-- 54 lines / ~150 max -->
# Organizational Pearls of Wisdom

> General principles extracted from real work sessions. These apply to ALL future work regardless of project.
> Read by agents on boot via `/boot`. Maintained by the `wisdom-harvest` skill.

## Browser Automation

| Pearl | Rule | Maturity | Added |
|-------|------|----------|-------|
| Verify DOM before selecting | Run a debug probe to dump actual element tags and classes before writing any selector — assumptions about DOM structure are the #1 cause of silent failures | Established | 2026-02-19 |
| Extract before transform | Read all data from the DOM before clicking buttons that trigger CSS changes, page transitions, or layout shifts — state transforms destroy evidence | Established | 2026-02-19 |
| Observable waits only | Replace every sleep() or fixed delay with a WebDriverWait condition that checks actual observable state | Established | 2026-02-19 |
| Native PDF over external tools | Use CDP Page.printToPDF instead of installing pdfkit or wkhtmltopdf — fewer dependencies, fewer failure points | Confirmed | 2026-02-19 |

## Windows Compatibility

| Pearl | Rule | Maturity | Added |
|-------|------|----------|-------|
| ASCII-only subprocess output | Never use Unicode characters (checkmarks, arrows, emoji) in print() statements that run inside subprocesses — Windows charmap encoding will crash | Established | 2026-02-19 |
| Declare OS and path format | Explicitly state the target OS and path style in every skill — models default to their training bias (Linux paths) and silently produce wrong commands | Established | 2026-02-19 |
| PowerShell uses semicolons not && | PowerShell does not support && as a command separator — use semicolons (;) to chain commands | Seed | 2026-02-19 |

## Multi-Model Dispatch

| Pearl | Rule | Maturity | Added |
|-------|------|----------|-------|
| Parse commands from markdown fences | When dispatching to any model, extract the executable command from markdown code fences in the response — all models wrap commands in triple backticks | Confirmed | 2026-02-19 |
| Cheapest model for routine tasks | Use cost-per-run comparison tables to pick the cheapest model that passes the skill — reserve expensive models for tasks requiring deeper reasoning | Confirmed | 2026-02-19 |

## Iterative Refinement

| Pearl | Rule | Maturity | Added |
|-------|------|----------|-------|
| Recursive self-critique with a target | Set a numeric satisfaction threshold (e.g., 93%) and iterate until you reach it — open-ended "make it better" loops never converge | Established | 2026-02-19 |
| Additive enhancement only | After each test or model run, add what you learned to the documentation — never remove existing rules, only add | Established | 2026-02-19 |
| Consistency grep after every change | After modifying any code or documentation, grep the entire file for stale references to the old approach — one contradictory line wastes more debugging time than no documentation | Established | 2026-02-19 |

## Documentation & Skills

| Pearl | Rule | Maturity | Added |
|-------|------|----------|-------|
| No nested code fences | Avoid nesting markdown code fences — use blockquotes or inline code for embedded examples inside code blocks | Seed | 2026-02-19 |
| Dense formats scale better | When designing a living document with a token budget, choose the densest readable format (tables > heading blocks) because format density determines capacity | Seed | 2026-02-19 |
| Silent context loading | Agent workflows that load context should silently internalize it, not echo it back — echoing wastes tokens and annoys the user | Seed | 2026-02-19 |

## General Engineering

| Pearl | Rule | Maturity | Added |
|-------|------|----------|-------|
| git pull is safe for untracked files | git pull only affects tracked files — local untracked work is never deleted or overwritten by a pull | Seed | 2026-02-19 |
| Append-only for merge safety | Design shared files so edits are row appends rather than in-place modifications — this makes Git merge conflicts trivial to resolve | Seed | 2026-02-19 |
