// Public API: returns active musicians, optionally filtered to a single band.
//
// Used by the band page's Lineup section (band page is a client component, so
// it fetches musicians via this route rather than calling the server-side
// helper directly). The /musicians routes call getMusicians() at build time
// and don't go through this API.
//
// IMPORTANT: this route deliberately does NOT cache its response. The
// underlying `getMusicians()` call uses Next.js's fetch cache with a 30-min
// revalidation window, so performance is fine. Caching the route's response
// on top of that creates a layered cache that drifts away from /musicians
// (which is also ISR-cached) — symptoms: photo missing on band lineup but
// present on /musicians, or stale roles after Airtable edits.

import { NextResponse } from 'next/server'
import { getMusicians } from '@/lib/musicians'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const bandSlug = searchParams.get('band')

  const all = await getMusicians()
  const members = bandSlug
    ? all.filter(m => m.bands.some(b => b.slug === bandSlug))
    : all

  // Return only the fields the public band page needs (no email/phone/notes).
  // When filtered to a band, override `instruments` with the per-band role
  // for that band — that's what the band page's Lineup card should show.
  const slim = members.map(m => {
    const perBandRole = bandSlug && m.roleByBand?.[bandSlug] ? m.roleByBand[bandSlug] : null
    const instrumentsForView = perBandRole
      ? perBandRole.split(/\s*\/\s*|\s*,\s*/).map(s => s.trim()).filter(Boolean)
      : m.instruments

    return {
      slug: m.slug,
      name: m.name,
      instruments: instrumentsForView,
      bands: m.bands.map(b => ({ slug: b.slug, name: b.name, color: b.color, shortName: b.shortName })),
      photo: m.photo ? { thumb: m.photo.thumb } : null,
      // also expose roleByBand for callers that need the full map (unfiltered queries)
      roleByBand: m.roleByBand || {},
    }
  })

  return NextResponse.json({ members: slim })
}
