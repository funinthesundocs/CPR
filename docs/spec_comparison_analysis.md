# CPR Spec Comparison — Our Plan vs Partner's Plan

> **Analysis Date**: Feb 13, 2026
> **Our Spec**: [cpr_full_spec.md](file:///c:/Antigravity/CPR/docs/cpr_full_spec.md)
> **Partner Spec**: [CPR-AI-Ready-Spec.md](file:///c:/Antigravity/CPR/docs/partner_plan/CPR-AI-Ready-Spec.md)

---

## Executive Summary

Your partner took our `cpr_full_spec.md`, ran it through Perplexity, and transformed it into a **build kit for a different AI tool** (Antigravity.ai). The core architecture — schema, tables, business rules — is **95% identical**. They preserved nearly every decision we made. The differences are about **how to build it**, not **what to build**.

---

## ✅ Where Both Plans Agree (The Foundation Is Solid)

These are locked in across both specs. No debate needed.

| Area | Agreement |
|---|---|
| **42 tables, 11 layers** | Identical table count, identical layer structure (A-K) |
| **Schema columns** | Partner converted our spec into actual `CREATE TABLE` SQL — matches exactly |
| **Case lifecycle** | Same flow: draft → pending → admin_review → investigation → judgment → verdict → restitution |
| **Voting rules** | 1-10 scale, ≥6 guilty, ≤5 innocent, 400 votes or deadline, hidden results |
| **Restitution model** | Nominal + punitive (capped 2x) = max 3x |
| **7 languages** | Same list: en, th, ar, vi, zh, es, ja |
| **Translation strategy** | Microsoft free tier + LibreTranslate self-hosted + IDE review |
| **Dead Man's Switch** | Identical flow: push check-in → missed count → emergency contacts |
| **Safety tiers** | Same 4 tiers: Open, Shielded, Protected, Proxy |
| **Evidence hashing** | SHA-256 per upload, identical approach |
| **Trust Score** | Activity (0-60) + Verdict Accuracy (0-40) = 0-100 |
| **11 roles** | Same roles, same permissions |
| **All alignment answers** | Partner marked them "Immutable Business Rules" — fully locked |
| **Indexing strategy** | Partner copied our exact index SQL |
| **File storage buckets** | Same 6 buckets, same size limits, same access policies |
| **PWA** | next-pwa, offline forms, push notifications |
| **PDF export** | Full case file with SHA-256 hashes + QR code |

> [!NOTE]
> **Bottom line: Your partner accepted our architecture design completely.** The Perplexity refinement didn't change _what_ we're building — it changed _how_ to hand it to another AI tool.

---

## 🔀 Key Differences

### Difference 1: Build Approach

| | Our Plan | Partner's Plan |
|---|---|---|
| **Tool** | Gemini (you and me, iterative) | Antigravity.ai (copy-paste prompts) |
| **Method** | Deep collaboration, design-first, build after approval | 4-phase speed run: paste prompt → wait → check → next |
| **Timeline** | Days/weeks of careful architecture | "90 minutes total" |
| **Quality control** | We discuss every tradeoff | "If broken, reply: fix X" |

> [!WARNING]
> **My assessment**: The 90-minute claim is unrealistic for a 42-table system with RLS, Edge Functions, realtime, PWA, i18n, and PDF export. A speed run will produce a fragile prototype with missing edge cases. Our iterative approach produces a production-ready system. **However**, the partner's phase structure is smart — we should adopt the 4-phase sequence for our build order.

**Recommendation**: Build with our iterative approach, but use their 4-phase sequence as our build order:
1. Database first (schema + indexes + RLS)
2. Core pages (defendant page + case form + home)
3. Voting + realtime
4. Safety + i18n + PWA + PDF

---

### Difference 2: Open Decision Stubs

Partner made decisions on 3 things we left open:

| Decision | We Said | Partner Says | My Recommendation |
|---|---|---|---|
| **Convergence matching** | "How aggressive?" (left for partner) | Exact name match, case-insensitive | **Start with exact match**, add trigram fuzzy later. Simpler = fewer false positives. ✅ Agree with partner |
| **Case numbering** | "Sequential or random?" (left for partner) | `C-{first 8 chars of UUID}` | **I disagree.** UUID prefix is ugly (`C-a7f8b3c2`). Sequential `C-0001` is cleaner, more professional, and tells users how many cases exist. Sequential builds trust. |
| **ISR revalidation** | "What triggers rebuild?" (left for partner) | 30-second time-based revalidation | **Acceptable for MVP.** Eventually should be webhook-triggered on case updates, but 30s is fine to start. ✅ Agree |

---

### Difference 3: CSS Framework

| | Our Plan | Partner's Plan |
|---|---|---|
| **Styling** | Vanilla CSS (per our standard) | **Tailwind CSS + shadcn/ui** |

> [!IMPORTANT]
> Partner specified Tailwind + shadcn/ui repeatedly across all phase prompts. This directly contradicts our standard approach (vanilla CSS). However, for a 42-table platform with dozens of pages, Tailwind + shadcn/ui will be **significantly faster** to build. Every form, table, modal, sidebar, and button would need manual CSS otherwise.

**Recommendation**: **Use Tailwind + shadcn/ui for this project.** The scale justifies it. Building 20+ pages with vanilla CSS would triple the timeline. 

---

### Difference 4: Partner Added Anti-Gaming Items We Didn't Have

Partner added 2 anti-gaming measures we didn't specify:

| New Item | What It Does | My Take |
|---|---|---|
| **Rate limiting**: Max 10 votes/hour/user | Prevents rapid-fire voting from same account | ✅ Smart, easy to implement, should include |
| **Trust Score gating**: Low trust users flagged for review | New users' votes get extra scrutiny | ⚠️ Interesting but complex. Could discourage new users. Better as a future flag for admins than a hard gate. |

**Recommendation**: Adopt rate limiting (10 votes/hour). Defer trust score gating to post-launch.

---

### Difference 5: Partner Added Observer Role

| | Our Plan | Partner's Plan |
|---|---|---|
| **Roles** | 10 roles (no observer) | **11 roles** (added "observer") |

Partner added an "observer" role: follows case, no active participation, read-only.

**My take**: This already exists conceptually — it's a `case_follower` without any other role. An explicit "observer" role adds a row to `case_roles` unnecessarily when `case_followers` already handles it. However, if we want to show observers on the case page ("12 observers"), the `case_followers` table already does this.

**Recommendation**: Don't add observer as a separate role. `case_followers` table fulfills this.

---

### Difference 6: Performance Targets

Partner added explicit performance targets we didn't specify:

| Page | Max Query Time | Notes |
|---|---|---|
| Defendant Page | <50ms | 1 table (cached) |
| Case Page | <200ms | 5 tables |
| Browse Defendants | <100ms | 1 table |
| Voting Dashboard | <150ms | 2 tables |
| User Profile | <120ms | 3 tables |
| Search Results | <180ms | 2 tables |

Plus caching specifics:
- Defendant pages: ISR 30s via `defendant_page_cache`
- Case lists: on-demand ISR, revalidate on case update
- User profiles: CDN cache 5min
- Static content: permanent CDN cache

**My take**: Great addition. We had the page-to-query map but not explicit latency targets.

**Recommendation**: ✅ Adopt these targets. They're reasonable and give us benchmarks to verify against.

---

### Difference 7: Admin Additions

Partner added 2 items we had as open questions:

| Item | Partner Decided |
|---|---|
| **Admin onboarding** | Listed as remaining partner decision ("How many initial admins?") |
| **Launch strategy** | Listed as remaining partner decision ("Private beta or public?") |

**Recommendation**: Good to have these flagged. We should decide before build.

---

### Difference 8: Next.js Version

| | Our Plan | Partner's Plan |
|---|---|---|
| **Version** | Next.js (no version specified) | **Next.js 16** |

**My take**: Next.js 16 doesn't exist yet as of Feb 2026. This is likely a Perplexity hallucination. Current latest is Next.js 15. We should use **Next.js 15 (latest stable)**.

**Recommendation**: Use Next.js 15. Correct the version reference.

---

## 🚫 Items Partner Removed (We Should Restore)

These were in our spec but are missing or reduced in the partner's version:

| Missing Item | Why It Matters | Restore? |
|---|---|---|
| **Defendant-centric URL explanation** | The visual flowchart showing "one defendant page → many plaintiff pages" was very clear in our partner review doc. Partner spec has routing tables but lost the visual hierarchy concept. | ✅ Keep our visual explanation for reference |
| **Attorney appointment flow detail** | Our spec had the full flow: join → client notification → approval. Partner's just says "appointed by client." | ✅ Keep our detailed flow |
| **Registration/onboarding details** | We specified forced name + bio, getting started guide. Partner reduced to one line. | ✅ Keep our detail |
| **Messaging friend requirement** | We specified "friends-only DMs, admin exempt." Partner mentions it in alignment but not in implementation. | ✅ Keep our requirement |
| **Content sanitization** | We had server-side DOMPurify for rich text. Partner doesn't mention it. | ✅ Restore — security critical |

---

## ✨ Items Partner Added (We Should Adopt)

| New Item | Value | Adopt? |
|---|---|---|
| **4-phase build structure** | Logical sequencing: DB → Pages → Voting → Safety/i18n | ✅ Yes |
| **Explicit SQL for all 42 tables** | Ready to execute — saves hours of SQL writing | ✅ Yes, but review/correct |
| **Performance targets** | Specific latency goals per page | ✅ Yes |
| **Rate limiting on votes** | 10/hour/user | ✅ Yes |
| **Troubleshooting guide** | "If broken, try X" patterns | ✅ Useful for debugging |
| **Success checklist per phase** | Clear verification checkmarks | ✅ Matches our verification approach |
| **Caching strategy specifics** | CDN TTLs per content type | ✅ Yes |

---

## 📋 Recommended Path Forward

### Use Our Spec As the Source of Truth
The partner's spec is a **reformatted copy** of ours, optimized for a different tool. Our `cpr_full_spec.md` remains the canonical reference.

### Adopt the Partner's Build Order
Their 4-phase structure is smart:

```
Phase 1: Database (schema + indexes + RLS)                    ← Foundation
Phase 2: Core Pages (defendant page + case form + home)        ← Visible progress
Phase 3: Voting + Realtime (voting + verdicts + notifications) ← Core feature
Phase 4: Safety + i18n (Dead Man's Switch + PWA + PDF + i18n)  ← Polish + safety
```

### Final Decisions Needed

| # | Decision | Options | My Recommendation |
|---|---|---|---|
| 1 | **CSS framework** | Vanilla CSS vs Tailwind + shadcn/ui | **Tailwind + shadcn/ui** (scale demands it) |
| 2 | **Case numbering** | Sequential `C-0001` vs UUID `C-a7f8b3c2` | **Sequential C-0001** (cleaner, builds trust) |
| 3 | **Convergence matching** | Exact vs fuzzy | **Start exact**, add fuzzy later |
| 4 | **Next.js version** | 15 vs "16" | **15** (16 doesn't exist) |
| 5 | **Observer role** | Separate role vs use case_followers | **case_followers** (no new role) |
| 6 | **Rate limiting** | Add 10 votes/hour? | **Yes** |
| 7 | **Build tool** | Gemini (here) vs Antigravity.ai | **Your call** — see below |

---

## The Big Question: Where Do We Build?

Your partner prepared this kit for **Antigravity.ai**. You and I have been working in **Gemini/VS Code**. 

| Factor | Build Here (Gemini) | Build in Antigravity |
|---|---|---|
| **Context** | I hold full context on every decision made over 1,000+ messages | Starts fresh, only has the spec |
| **Quality** | Iterative, discussion-based, catches edge cases | Copy-paste, hope for the best |
| **Speed** | Slower but thorough | Fast first output, lots of fixing |
| **Spec fidelity** | I wrote the spec — I know every nuance | Different AI interprets our spec |
| **Schema SQL** | Partner already generated the SQL — we can use it directly | Redundant generation |
| **Debugging** | I know why every table exists | "Fix: match spec section X" |

**My honest recommendation**: Build here. Use the partner's SQL as a head start. I hold the full context tree of why every decision was made.
