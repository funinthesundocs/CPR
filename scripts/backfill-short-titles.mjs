/**
 * backfill-short-titles.mjs
 *
 * Fetches every timeline_event with a NULL short_title, generates a 1-3 word
 * dramatic label using the Anthropic API, and writes it back to Supabase.
 *
 * Usage:
 *   node scripts/backfill-short-titles.mjs
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ANTHROPIC_API_KEY
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = new URL('../.env.local', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const envLines = readFileSync(envPath, 'utf-8').split(/\r?\n/)
const env = {}
for (const line of envLines) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim().replace(/\r$/, '').replace(/^["']|["']$/g, '')
}

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SUPABASE_SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
const ANTHROPIC_API_KEY = env['ANTHROPIC_API_KEY']

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !ANTHROPIC_API_KEY) {
  console.error('Missing required env vars. Check .env.local for NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ── Generate short title via Anthropic API ───────────────────────────────────
async function generateShortTitle(description, eventType) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 20,
      messages: [
        {
          role: 'user',
          content: `You are writing two-word chapter titles for a timeline of alleged fraud and misconduct.

STRICT FORMAT: Always exactly two words. First word is always "THE". Second word is one powerful noun that captures the event.

Event type: ${eventType || 'incident'}
Event description: ${description}

Examples: THE MEETING, THE BETRAYAL, THE ARREST, THE CLIMAX, THE ESCAPE, THE LIE, THE HOOK, THE COLLAPSE, THE SILENCE, THE VERDICT, THE DEMAND, THE THREAT, THE TRANSFER, THE DISAPPEARANCE.

Respond with ONLY the two words in ALL CAPS. No punctuation, no quotes, no explanation.`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic API error: ${response.status} ${err}`)
  }

  const data = await response.json()
  return data.content[0].text.trim()
}

// ── Main ─────────────────────────────────────────────────────────────────────
const { data: events, error } = await supabase
  .from('timeline_events')
  .select('id, description, event_type, short_title')
  .is('short_title', null)

if (error) {
  console.error('Failed to fetch timeline events:', error.message)
  process.exit(1)
}

if (!events || events.length === 0) {
  console.log('No timeline events missing short_title. Nothing to do.')
  process.exit(0)
}

console.log(`Found ${events.length} event(s) without short_title. Generating...`)
console.log()

let success = 0
let failed = 0

for (const event of events) {
  try {
    const shortTitle = await generateShortTitle(event.description, event.event_type)
    const { error: updateError } = await supabase
      .from('timeline_events')
      .update({ short_title: shortTitle })
      .eq('id', event.id)

    if (updateError) throw new Error(updateError.message)

    console.log(`[OK]  ${event.id.slice(0, 8)}... -> "${shortTitle}"`)
    success++
  } catch (err) {
    console.error(`[FAIL] ${event.id.slice(0, 8)}... -> ${err.message}`)
    failed++
  }

  // Small delay to avoid rate limiting
  await new Promise(r => setTimeout(r, 200))
}

console.log()
console.log(`Done. ${success} updated, ${failed} failed.`)
