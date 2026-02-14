/**
 * Anti-Gaming Utilities
 *
 * Rate limiting, engagement proof, and CAPTCHA stubs for the Court of Public Record.
 * These are client-side stubs that will be enhanced with server-side validation later.
 */

// ============= RATE LIMITING =============

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Client-side rate limiter. Tracks action counts per key within a time window.
 * For production, this should be backed by Redis or Supabase edge functions.
 */
export function checkRateLimit(
    key: string,
    maxActions: number = 10,
    windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now()
    const entry = rateLimitStore.get(key)

    if (!entry || now > entry.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
        return { allowed: true, remaining: maxActions - 1, resetIn: windowMs }
    }

    if (entry.count >= maxActions) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: entry.resetAt - now,
        }
    }

    entry.count++
    return {
        allowed: true,
        remaining: maxActions - entry.count,
        resetIn: entry.resetAt - now,
    }
}

// Preset rate limits for different actions
export const RATE_LIMITS = {
    vote: { maxActions: 5, windowMs: 60_000 },      // 5 votes per minute
    comment: { maxActions: 10, windowMs: 60_000 },   // 10 comments per minute
    report: { maxActions: 3, windowMs: 300_000 },    // 3 reports per 5 minutes
    caseFile: { maxActions: 2, windowMs: 3600_000 },  // 2 cases per hour
} as const

// ============= ENGAGEMENT PROOF =============

/**
 * Tracks how long a user has been on the page.
 * Voting requires minimum engagement time to prevent drive-by votes.
 */
export function createEngagementTracker(minTimeMs: number = 30_000) {
    const startTime = Date.now()

    return {
        getElapsed: () => Date.now() - startTime,
        isEngaged: () => (Date.now() - startTime) >= minTimeMs,
        getRemainingMs: () => Math.max(0, minTimeMs - (Date.now() - startTime)),
    }
}

// ============= CAPTCHA STUB =============

/**
 * CAPTCHA verification stub. In production, integrate with hCaptcha or Cloudflare Turnstile.
 * Returns true for now — will be replaced with actual verification.
 */
export async function verifyCaptcha(_token?: string): Promise<boolean> {
    // STUB: Always returns true
    // TODO: Integrate with hCaptcha/Turnstile in production
    return true
}

/**
 * Generate a simple honeypot field name for forms.
 * Bots typically fill in all fields, so a hidden field catches them.
 */
export function getHoneypotFieldName(): string {
    return 'website_url'  // Common bot-trap field name
}

export function isHoneypotTriggered(formData: Record<string, any>): boolean {
    return !!formData[getHoneypotFieldName()]
}

// ============= SCROLL DEPTH TRACKING =============

/**
 * Tracks scroll depth to verify user actually read the case.
 * Returns percentage of page scrolled (0-100).
 */
export function createScrollTracker() {
    let maxScroll = 0

    const handler = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        const pct = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0
        maxScroll = Math.max(maxScroll, pct)
    }

    if (typeof window !== 'undefined') {
        window.addEventListener('scroll', handler, { passive: true })
    }

    return {
        getMaxScroll: () => maxScroll,
        hasReadMajority: () => maxScroll >= 60,
        destroy: () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('scroll', handler)
            }
        },
    }
}
