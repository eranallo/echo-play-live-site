import { NextResponse } from 'next/server'
import { bands } from '@/lib/bands'

const AIRTABLE_BASE = 'appYUOoJgvRyZ7fLB'
const AIRTABLE_TABLE = 'tbliRPed3vD70R476'

// Length caps (Phase 38c). Generous for legitimate use, tight enough to
// block multi-megabyte abuse payloads.
const LIMITS = {
  name: 80,
  email: 120,
  eventType: 60,
  date: 60,
  venue: 120,
  message: 2000,
}

// Permissive but real email shape check. Not RFC-compliant; blocks the most
// obvious garbage (no @, no dot, whitespace).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Normalize an inbound string field: coerce to string, trim, cap length.
function clean(value, max) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export async function POST(request) {
  try {
    const body = await request.json()

    // Honeypot first (cheapest reject path).
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ success: true, recordId: null, bookingEmail: '' })
    }

    // Normalize + cap every string field.
    const name = clean(body.name, LIMITS.name)
    const email = clean(body.email, LIMITS.email)
    const band = clean(body.band, 80)
    const eventType = clean(body.eventType, LIMITS.eventType)
    const date = clean(body.date, LIMITS.date)
    const venue = clean(body.venue, LIMITS.venue)
    const message = clean(body.message, LIMITS.message)

    // Required-field validation.
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const token = process.env.AIRTABLE_API_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Find the Airtable record ID for the selected band
    const bandEntry = Object.values(bands).find(b => b.name === band)
    const bandRecordId = bandEntry?.airtableId || null
    const bookingEmail = bandEntry?.bookingEmail || 'eranallo@echoplay.live'

    // Build Airtable record fields
    const fields = {
      'Booker Name': name,
      'Booker Email': email,
      'Submitted Date': new Date().toISOString().split('T')[0],
      'Status': 'New',
    }

    if (bandRecordId) {
      fields['Band(s) Requested'] = [bandRecordId]
    }
    if (eventType) {
      fields['Booker Type'] = eventType
    }
    if (date) {
      fields['Requested Date'] = date
    }
    if (venue) {
      fields['Event Location/Venue Name'] = venue
    }
    if (message) {
      fields['Special Requests'] = message
    }

    // Create record in Airtable
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    )

    if (!airtableRes.ok) {
      const err = await airtableRes.text()
      console.error('Airtable inquiry create failed:', err)
      return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 })
    }

    const airtableData = await airtableRes.json()

    return NextResponse.json({
      success: true,
      recordId: airtableData.id,
      bookingEmail,
    })
  } catch (err) {
    console.error('Inquiry API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
