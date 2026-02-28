# Court of Public Record — Claude Alignment

> Auto-loaded every session. Keep under 100 lines.

## Project

**Court of Public Record (CPR)** — Social accountability platform. Plaintiffs file cases against defendants. Convergence (2+ independent plaintiffs) activates a case. The public investigates, votes, and delivers a permanent verdict.

**Stack:** Next.js 16.1.6 · App Router · React 19 · TypeScript · Supabase (PostgreSQL + Auth + Storage) · Tailwind v4 · shadcn/ui · Radix UI

**Dev:** `npm run dev` → localhost:3000

---

## Hard Rules — Never Violate

### Icons
- **Heroicons ONLY** — `@heroicons/react/24/outline`
- Never use `lucide-react`. Never use emoji in code.

### RBAC / Permissions
- All permission checks resolve from the **database via API** — never cache roles or permissions in localStorage, sessionStorage, cookies, or any browser store
- Hook: `usePermissions()` → `hasPermission()`, `hasRole()`, `isAdmin`
- Gate: `<PermissionGate permission="vote">` for declarative gating

### UI Patterns
- **Primary buttons:** `bg-primary text-primary-foreground`
- **Secondary/cancel:** `bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground` — no borders
- **Theme colors:** always CSS vars (`hsl(var(--primary))`), never hardcoded hex/rgb
- **Tables:** `rounded-lg border bg-card overflow-hidden`, sticky headers `z-40 bg-muted`, alternating rows `bg-card` / `bg-secondary`

### Git / PowerShell
- **Never use `&&`** to chain commands — run each separately
- **Never embed newlines in `git commit -m "..."`** — single line only or it hangs silently
- Use Bash tool for each git command individually

### i18n
- Missing translation key returns the raw key string at runtime — **zero build warnings**
- Always grep for every `t()` call added to a component against the locale files before committing
- 7 locales: `en`, `es`, `pt`, `fr`, `de`, `ja`, `ar` (ar is RTL). Admin pages: English only.

### HMR / Dev Server
- Module-level constants require a **full dev server restart** — hot reload only patches component boundaries
- If changes appear absent and console shows WebSocket failures → restart dev server immediately

---

## Case Lifecycle

`draft → pending → admin_review → investigation → judgment → verdict → restitution`

Voting opens at: `judgment` | `investigation` | `pending_convergence`
Voting closes: first of — deadline OR 400 votes · Scale 1–10 · Guilty: ≥ 6

---

## Key File Paths

| What | Where |
|------|-------|
| Permissions API | `src/app/api/auth/user-permissions/route.ts` |
| Permissions hook | `src/hooks/usePermissions.ts` |
| Permission gate | `src/components/auth/PermissionGate.tsx` |
| New Case Form | `src/app/cases/new/page.tsx` (12-step wizard) |
| Root layout | `src/app/layout.tsx` |
| Supabase client | `src/lib/supabase/client.ts` (browser) / `server.ts` |
| Vote page | `src/app/vote/page.tsx` |
| Admin dashboard | `src/app/admin/page.tsx` |
| i18n provider | `src/i18n/index.tsx` |

---

## Alignment System

- **Pearls:** `.agent/alignment/pearls.md` — 20 universal principles, 6 categories
- **On session start:** run `/boot` to load pearls + pull latest
- **On session end:** run `/harvest` if significant iterative work occurred
- **Pearl invocations:** log as `⚡ Pearl invoked: "[Title]" — [what changed]`
- **Full spec:** `docs/cpr_full_spec.md` (50+ design decisions)
- **UI patterns:** `CODING_PATTERNS.md`
- **RBAC docs:** `PERMISSIONS.md`
