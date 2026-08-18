import { NextResponse } from 'next/server'
import { saveAvailabilityByToken } from '@/lib/availability/airtable'
import { saveMasterAvailabilityDay } from '@/lib/availability/masterCalendar'
import { rateLimit } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic'

function json(body, status = 200, extraHeaders = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      ...extraHeaders,
    },
  })
}

export async function PATCH(request, { params }) {
  const limited = rateLimit(request, {
    capacity: 80,
    refillMs: 1_500,
    scope: 'master-availability-live',
  })

  if (!limited.ok) {
    return json(
      { error: 'Too many changes were made at once. Pause briefly and try again.' },
      429,
      { 'Retry-After': String(limited.retryAfter) }
    )
  }

  try {
    const resolvedParams = await params
    const token = resolvedParams?.token || ''
    const body = await request.json()
    const result = await saveMasterAvailabilityDay(token, body?.answer)

    if (!result.ok) {
      return json({ error: result.error, ...(result.data || {}) }, result.status || 400)
    }

    return json({ success: true, ...result.data })
  } catch (error) {
    console.error('[master-availability] API error:', error)
    return json({ error: 'This availability change could not be saved right now.' }, 500)
  }
}

// Temporary compatibility for anyone who still has an earlier submit-based preview open.
export async function POST(request, { params }) {
  const limited = rateLimit(request, {
    capacity: 8,
    refillMs: 60_000,
    scope: 'availability-legacy',
  })

  if (!limited.ok) {
    return json(
      { error: 'Too many attempts. Please try again shortly.' },
      429,
      { 'Retry-After': String(limited.retryAfter) }
    )
  }

  try {
    const resolvedParams = await params
    const token = resolvedParams?.token || ''
    const body = await request.json()
    const answers = Array.isArray(body?.answers) ? body.answers.slice(0, 50) : []
    const result = await saveAvailabilityByToken(token, answers)

    if (!result.ok) {
      return json({ error: result.error }, result.status || 400)
    }

    return json({ success: true, ...result.data })
  } catch (error) {
    console.error('[availability] legacy API error:', error)
    return json({ error: 'Availability could not be saved right now.' }, 500)
  }
}
