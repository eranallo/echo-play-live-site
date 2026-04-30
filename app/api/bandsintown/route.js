import { NextResponse } from 'next/server'
import { bandsList } from '@/lib/bands'

const APP_ID = 'echo-play-live'

// Extract numeric Bandsintown ID from a Bandsintown URL
// e.g. https://www.bandsintown.com/a/15624564 -> 15624564
function extractBandsintownId(url) {
  if (!url) return null
  const match = url.match(/\/a\/(\d+)/)
  return match ? match[1] : null
}

export async function GET() {
  try {
    const results = []

    for (const band of bandsList) {
      const btUrl = band.social?.bandsintown
      const artistId = extractBandsintownId(btUrl)
      if (!artistId) continue

      try {
        const res = await fetch(
          `https://rest.bandsintown.com/artists/id_${artistId}/events?app_id=${APP_ID}&date=upcoming`,
          {
            headers: { Accept: 'application/json' },
            next: { revalidate: 1800 }, // cache 30 mins
          }
        )

        if (!res.ok) continue

        const events = await res.json()
        if (!Array.isArray(events)) continue

        for (const event of events) {
          const dateObj = event.datetime ? new Date(event.datetime) : null
          const dateFormatted = dateObj
            ? dateObj.toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
              })
            : 'TBA'

          const setTime = dateObj
            ? dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            : null

          results.push({
            id: `bt_${event.id}`,
            source: 'bandsintown',
            date: event.datetime ? event.datetime.split('T')[0] : null,
            dateFormatted,
            setTime,
            venue: event.venue?.name || 'TBA',
            venueCity: event.venue?.city || '',
            venueRegion: event.venue?.region || '',
            bandName: band.name,
            bandSlug: band.slug,
            bandColor: band.color,
            bandsintownUrl: event.url || btUrl,
            ticketUrl: event.offers?.[0]?.url || null,
            status: 'Confirmed',
          })
        }
      } catch (err) {
        console.error(`Bandsintown fetch failed for ${band.name}:`, err)
      }
    }

    // Sort by date ascending
    results.sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return a.date.localeCompare(b.date)
    })

    return NextResponse.json({ shows: results, count: results.length })
  } catch (err) {
    console.error('Bandsintown API error:', err)
    return NextResponse.json({ shows: [], error: err.message }, { status: 200 })
  }
}
