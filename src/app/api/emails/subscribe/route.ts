import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter for IP addresses
// Stores { ip: { count: number, resetAt: number } }
const ipRateLimits = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT = 5 // 5 requests
const RATE_LIMIT_WINDOW = 60000 // Per 60 seconds (1 minute)

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = ipRateLimits.get(ip)

  if (!record || now > record.resetAt) {
    // Window expired or first request
    ipRateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (record.count >= RATE_LIMIT) {
    return true
  }

  record.count++
  return false
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return ip.trim()
}

// Simple email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIp = getClientIp(request)
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again in 60 seconds.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = body

    // Validate email presence
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Insert into emails_subscribed table
    // ON CONFLICT DO NOTHING - silently handles duplicates
    const { data, error } = await supabase
      .from('emails_subscribed')
      .insert({
        email: email.trim().toLowerCase(),
        subscribed_at: new Date().toISOString(),
        source: 'footer',
        confirmed: false
      })
      .select()
      .single()

    if (error) {
      // Check if it's a unique constraint violation (already subscribed)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 400 }
        )
      }

      console.error('Error inserting email:', error)
      return NextResponse.json(
        { error: 'Failed to subscribe email' },
        { status: 500 }
      )
    }

    // TODO: In production, send confirmation email here
    // For now, just return success

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent',
      email: data?.email
    })
  } catch (err) {
    console.error('Unexpected error in email subscription:', err)
    return NextResponse.json(
      { error: 'Server error. Try again later.' },
      { status: 500 }
    )
  }
}
