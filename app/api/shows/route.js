import { NextResponse } from 'next/server'
import { bandNameToSlug, bands } from '@/lib/bands'

const AIRTABLE_BASE = 'appYUOoJgvRyZ7fLB'
const AIRTABLE_SHOWS = 'tblSFV8wY62hD7kCW'
const AIRTABLE_VENUES = 'tbleV69KlU8tygF5B'
const AIRTABLE_BANDS = 'tble6HQKSixIUdGcH'

export async function GET() {
  try {
    const token = process.env.AIRTABLE_API_TOKEN
    if (!token) {
      return NextResponse.json({ shows: [], error: 'No token' }, { status: 200 })
    }

    const today = new Date().toISOString().split('T')[0]
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    // ── Fetch upcoming shows ──────────────────────────────
    // Use append() for each array param — URLSearchParams constructor
    // joins arrays with commas which breaks Airtable's API
    const params = new URLSearchParams()
    params.append('filterByFormula', `AND({Date} >= '${today}', OR({Status} = 'Confirmed', {Status} = 'Booked', {Status} = 'Announced'))`)
    params.append('sort[0][field]', 'Date')
    params.append('sort[0][direction]', 'asc')
    params.append('fields[]', 'Date')
    params.append('fields[]', 'Status')
    params.append('fields[]', 'Band')
    params.append('fields[]', 'Venue')
    params.append('fields[]', 'Start Time')
    params.append('fields[]', 'Load-In Time')
    params.append('maxRecords', '30')

    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_SHOWS}?${params}`,
      { headers, next: { revalidate: 1800 } }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('Airtable shows fetch failed:', res.status, err)
      return NextResponse.json({ shows: [] }, { status: 200 })
    }

    const data = await res.json()

    // ── Fetch venue names ─────────────────────────────────
    const venueIds = [...new Set(
      data.records.flatMap(r => r.fields['Venue'] || []).filter(Boolean)
    )]
    let venueMap = {}
    if (venueIds.length > 0) {
      const vParams = new URLSearchParams()
      venueIds.forEach(id => vParams.append('records[]', id))
      vParams.append('fields[]', 'Venue Name')
      vParams.append('fields[]', 'Address')
      const venueRes = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_VENUES}?${vParams}`,
        { headers, next: { revalidate: 3600 } }
      )
      if (venueRes.ok) {
        const venueData = await venueRes.json()
        venueData.records?.forEach(v => {
          venueMap[v.id] = v.fields['Venue Name'] || 'TBA'
        })
      }
    }

    // ── Fetch band names + Bandsintown URLs ───────────────
    const bandIds = [...new Set(
      data.records.flatMap(r => r.fields['Band'] || []).filter(Boolean)
    )]
    let bandMap = {}
    if (bandIds.length > 0) {
      const bParams = new URLSearchParams()
      bandIds.forEach(id => bParams.append('records[]', id))
      bParams.append('fields[]', 'Band Name')
      bParams.append('fields[]', 'Bandsintown URL')
      const bandRes = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_BANDS}?${bParams}`,
        { headers, next: { revalidate: 3600 } }
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

    // ── Shape the shows ───────────────────────────────────
    const shows = data.records.map(record => {
      const f = record.fields
      const bandInfo = (f['Band'] || []).map(id => bandMap[id]).filter(Boolean)
      const primaryBand = bandInfo[0]
      const bandName = primaryBand?.name || 'Echo Play Live'
      const slug = bandNameToSlug[bandName] || null
      const bandData = slug ? bands[slug] : null

      const venueId = (f['Venue'] || [])[0]
      const venueName = venueId ? (venueMap[venueId] || 'TBA') : 'TBA'

      const dateObj = f['Date'] ? new Date(f['Date'] + 'T00:00:00') : null
      const dateFormatted = dateObj
        ? dateObj.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
          })
        : 'TBA'

      // Parse set time from Start Time field (ISO datetime)
      let setTime = null
      if (f['Start Time']) {
        const d = new Date(f['Start Time'])
        if (!isNaN(d)) {
          let h = d.getHours(), min = d.getMinutes()
          const ap = h >= 12 ? 'PM' : 'AM'
          if (h > 12) h -= 12
          if (h === 0) h = 12
          setTime = min === 0 ? `${h} ${ap}` : `${h}:${String(min).padStart(2, '0')} ${ap}`
        }
      }

      return {
        id: record.id,
        source: 'airtable',
        date: f['Date'] || null,
        dateFormatted,
        venue: venueName,
        setTime,
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
