import { NextResponse } from 'next/server'
import { bands } from '@/lib/bands'

const AIRTABLE_BASE = 'appYUOoJgvRyZ7fLB'
const AIRTABLE_TABLE = 'tbliRPed3vD70R476'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, band, eventType, date, venue, message } = body

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
