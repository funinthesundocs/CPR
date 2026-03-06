import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('footer_stats')

    const responseData = {
      casesCount: data?.cases_count || 0,
      plaintiffsCount: data?.plaintiffs_count || 0,
      votesCastCount: data?.votes_cast_count || 0
    }

    if (error) {
      console.error('Error fetching footer stats:', error)
      // Return default values on error with short cache (1 min) to reduce hit
      return NextResponse.json(responseData, {
        headers: {
          'Cache-Control': 'public, max-age=60'
        }
      })
    }

    // Cache successfully fetched stats for 1 hour (3600 seconds)
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (err) {
    console.error('Unexpected error in footer stats:', err)
    return NextResponse.json({
      casesCount: 0,
      plaintiffsCount: 0,
      votesCastCount: 0
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60'
      }
    })
  }
}
