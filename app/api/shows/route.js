import { NextResponse } from 'next/server'
import { bandNameToSlug, bands } from '@/lib/bands'

const AIRTABLE_BASE = 'appYUOoJgvRyZ7fLB'
const AIRTABLE_TABLE = 'tblSFV8wY62hD7kCW'

export async function GET() {
  try {
    const token = process.env.AIRTABLE_API_TOKEN
    if (!token) {
      return NextResponse.json({ shows: [], error: 'No token' }, { status: 200 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Fetch upcoming confirmed/booked shows from Airtable
    const params = new URLSearchParams({
      'filterByFormula': `AND({Date} >= '${today}', OR({Status} = 'Confirmed', {Status} = 'Booked', {Status} = 'Announced'))`,
      'sort[0][field]': 'Date',
      'sort[0][direction]': 'asc',
      'fields[]': ['Date', 'Status', 'Band', 'Venue', 'Set Time', 'Load-In Time'],
      'maxRecords': '20',
    })

    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (!res.ok) {
      console.error('Airtable shows fetch failed:', res.status)
      return NextResponse.json({ shows: [] }, { status: 200 })
    }

    const data = await res.json()

    // Also fetch venue details for any linked venues
    const venueIds = [...new Set(
      data.records
        .flatMap(r => r.fields['Venue'] || [])
        .filter(Boolean)
    )]

    let venueMap = {}
    if (venueIds.length > 0) {
      const venueParams = new URLSearchParams()
      venueIds.forEach(id => venueParams.append('records[]', id))
      const venueRes = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/tbleV69KlU8tygF5B?${venueParams}&fields[]=Venue Name&fields[]=Address`,
        {
          headers: { Authorization: `Bearer ${token}` },
          next: { revalidate: 3600 },
        }
      )
      if (venueRes.ok) {
        const venueData = await venueRes.json()
        venueData.records?.forEach(v => {
          venueMap[v.id] = v.fields['Venue Name'] || 'TBA'
        })
      }
    }

    // Also fetch band names for linked bands
    const bandIds = [...new Set(
      data.records
        .flatMap(r => r.fields['Band'] || [])
        .filter(Boolean)
    )]

    let bandMap = {}
    if (bandIds.length > 0) {
      const bandParams = new URLSearchParams()
      bandIds.forEach(id => bandParams.append('records[]', id))
      const bandRes = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/tble6HQKSixIUdGcH?${bandParams}&fields[]=Band Name&fields[]=Bandsintown URL`,
        {
          headers: { Authorization: `Bearer ${token}` },
          next: { revalidate: 3600 },
        }
      )
      if (bandRes.ok) {
        const bandData = await bandRes.json()
        bandData.records?.forEach(b => {
          bandMap[b.id] = {
            name: b.fields['Band Name'],
            bandsintownUrl: b.fields['Bandsintown URL'] || null,
          }
        })
      }
    }

    // Shape the shows
    const shows = data.records.map(record => {
      const f = record.fields
      const bandIds = f['Band'] || []
      const bandInfo = bandIds.map(id => bandMap[id]).filter(Boolean)
      const primaryBand = bandInfo[0]
      const bandName = primaryBand?.name || 'Echo Play Live'
      const slug = bandNameToSlug[bandName] || null
      const bandData = slug ? bands[slug] : null

      const venueId = (f['Venue'] || [])[0]
      const venueName = venueId ? venueMap[venueId] : 'TBA'

      // Format date nicely
      const dateObj = f['Date'] ? new Date(f['Date'] + 'T00:00:00') : null
      const dateFormatted = dateObj
        ? dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        : 'TBA'

      return {
        id: record.id,
        date: f['Date'] || null,
        dateFormatted,
        venue: venueName,
        setTime: f['Set Time'] || null,
        status: f['Status'] || 'Confirmed',
        bandName,
        bandSlug: slug,
        bandColor: bandData?.color || '#F5C518',
        bandsintownUrl: primaryBand?.bandsintownUrl || null,
      }
    })

    return NextResponse.json({ shows })
  } catch (err) {
    console.error('Shows API error:', err)
    return NextResponse.json({ shows: [] }, { status: 200 })
  }
}
