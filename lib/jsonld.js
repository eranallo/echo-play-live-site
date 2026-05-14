// Phase 39 — JSON-LD schema helpers + server-side data fetchers for SEO
// structured data.
//
// Each schema type is built as a plain JS object. Callers pass the result to
// `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />`.
// (Or use the JsonLd component re-exported below for ergonomics.)
//
// Why server-side: structured data must be in the initial HTML response so
// Google's crawler sees it. Layouts and async pages render it at server time;
// client components inherit it from their server-side parent layout.

import { TABLES, tableUrl } from '@/lib/airtable'
import { bandsList, bandNameToSlug } from '@/lib/bands'

const SITE_URL = 'https://echoplay.live'

// ── Breadcrumb ──────────────────────────────────────────────────────
//
// Items shape: [{ name: 'Home', url: '/' }, { name: 'Bands', url: '/bands' }, ...]
// The last item is the current page (Google convention).
//
// Returns a BreadcrumbList schema object suitable for <script type="application/ld+json">.
export function breadcrumbList(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

// ── FAQ ────────────────────────────────────────────────────────────
//
// qa shape: [{ q: 'How do I book?', a: 'Fill the form...' }, ...]
//
// Returns FAQPage schema. Note Google requires the answer text to ALSO appear
// visibly on the page — JSON-LD alone won't get the rich snippet unless the
// page actually displays the FAQ. So pages using this should render the same
// content in their visible HTML.
export function faqPage(qa) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

// ── Upcoming shows for /shows page Event JSON-LD ────────────────────
//
// Fetches from Airtable SHOWS table (filter: Date >= today AND Status in
// Confirmed/Booked/Announced). For each row, hydrates band + venue links and
// returns an Event schema object.
//
// On any error returns []. The shows page renders the JSON-LD only if there
// are events to include, so a fetch failure means no Event schema for that
// build cycle — graceful.
export async function getUpcomingShowsForJsonLd() {
  const token = process.env.AIRTABLE_API_TOKEN
  if (!token) return []

  try {
    // Step 1: fetch upcoming shows
    const today = new Date().toISOString().split('T')[0]
    const params = new URLSearchParams()
    params.append('filterByFormula',
      `AND({Date} >= '${today}', OR({Status} = 'Confirmed', {Status} = 'Booked', {Status} = 'Announced'))`
    )
    params.append('sort[0][field]', 'Date')
    params.append('sort[0][direction]', 'asc')
    params.append('fields[]', 'Date')
    params.append('fields[]', 'Band')
    params.append('fields[]', 'Venue')
    params.append('fields[]', 'Start Time')
    params.append('fields[]', 'Ticket URL')
    params.append('pageSize', '50')

    const showsRes = await fetch(`${tableUrl(TABLES.SHOWS)}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 1800 },
    })
    if (!showsRes.ok) return []
    const showsData = await showsRes.json()
    const shows = showsData.records || []
    if (shows.length === 0) return []

    // Step 2: collect unique venue + band IDs to batch-fetch
    const venueIds = [...new Set(shows.flatMap(s => s.fields?.Venue || []))]
    const bandIds = [...new Set(shows.flatMap(s => s.fields?.Band || []))]

    const venuesByid = {}
    if (venueIds.length > 0) {
      const vFormula = `OR(${venueIds.map(id => `RECORD_ID()='${id}'`).join(',')})`
      const vParams = new URLSearchParams()
      vParams.append('filterByFormula', vFormula)
      vParams.append('fields[]', 'Venue Name')
      vParams.append('fields[]', 'Address')
      const vRes = await fetch(`${tableUrl(TABLES.VENUES)}?${vParams}`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      })
      if (vRes.ok) {
        const vData = await vRes.json()
        for (const r of (vData.records || [])) {
          venuesByid[r.id] = r.fields
        }
      }
    }

    const bandsById = {}
    if (bandIds.length > 0) {
      const bFormula = `OR(${bandIds.map(id => `RECORD_ID()='${id}'`).join(',')})`
      const bParams = new URLSearchParams()
      bParams.append('filterByFormula', bFormula)
      bParams.append('fields[]', 'Band Name')
      const bRes = await fetch(`${tableUrl(TABLES.BANDS)}?${bParams}`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      })
      if (bRes.ok) {
        const bData = await bRes.json()
        for (const r of (bData.records || [])) {
          bandsById[r.id] = r.fields?.['Band Name']
        }
      }
    }

    // Step 3: map shows to Event schema objects
    const events = []
    for (const show of shows) {
      const f = show.fields || {}
      const date = f.Date
      const startTime = f['Start Time']
      const bandId = (f.Band || [])[0]
      const venueId = (f.Venue || [])[0]
      const bandName = bandsById[bandId]
      const venue = venuesByid[venueId]
      if (!date || !bandName || !venue) continue

      // Build ISO datetime: prefer Start Time if present, else date at 8pm local
      const startDate = startTime
        ? new Date(startTime).toISOString()
        : `${date}T20:00:00-05:00`  // 8pm Central, no DST adjustment (acceptable for v1)

      // Map band name to slug for performer URL
      const bandSlug = bandNameToSlug[bandName]
      const performerUrl = bandSlug ? `${SITE_URL}/bands/${bandSlug}` : SITE_URL

      events.push({
        '@context': 'https://schema.org',
        '@type': 'Event',
        '@id': `${SITE_URL}/shows#${show.id}`,
        name: `${bandName} at ${venue['Venue Name']}`,
        startDate,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: venue['Venue Name'],
          address: venue.Address || 'Dallas-Fort Worth, TX',
        },
        performer: {
          '@type': 'MusicGroup',
          name: bandName,
          url: performerUrl,
        },
        organizer: {
          '@type': 'Organization',
          name: 'Echo Play Live',
          url: SITE_URL,
        },
        ...(f['Ticket URL'] && {
          offers: {
            '@type': 'Offer',
            url: f['Ticket URL'],
            availability: 'https://schema.org/InStock',
          },
        }),
      })
    }
    return events
  } catch (err) {
    console.warn('[jsonld] getUpcomingShowsForJsonLd failed:', err?.message)
    return []
  }
}

// ── Convenience render component ───────────────────────────────────
//
// Usage:
//   <JsonLd data={breadcrumbList([...])} />
//
// Renders a single <script type="application/ld+json"> tag. Pass an array of
// data objects to render multiple scripts.
export function JsonLd({ data }) {
  if (!data) return null
  const items = Array.isArray(data) ? data : [data]
  return items.map((d, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
    />
  ))
}
