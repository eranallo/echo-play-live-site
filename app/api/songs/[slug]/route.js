// Phase 18: Per-band songs catalog endpoint.
//
// GET /api/songs/{slug} → JSON list of enriched live songs for the band.
// Used by components/SongsSection to lazy-load the catalog on band pages.
// (The band page is a client component, so we can't fetch at render time
// without round-tripping through here.)
//
// Healthy catalogs are edge-cached for 60 seconds. Empty responses must
// not be cached because the data source also returns [] on temporary errors.
// Airtable fetches and Spotify enrichment keep their own explicit caches.

import { NextResponse } from 'next/server'
import { getSongsForBand } from '@/lib/songs'
import { bands } from '@/lib/bands'

export const runtime = 'nodejs'
// Evaluate the response policy on each origin request instead of letting
// the full-route cache retain an empty response. Explicit data caches remain.
export const revalidate = 0

export async function GET(request, { params }) {
  const { slug } = await params
  if (!bands[slug]) {
    return NextResponse.json({ error: 'Band not found' }, { status: 404 })
  }
  const songs = await getSongsForBand(slug)
  return NextResponse.json(
    { slug: slug, count: songs.length, songs },
    {
      headers: {
        // Keep a healthy catalog fast; let an empty response recover on
        // the next request instead of serving it as stale for another day.
        'Cache-Control': songs.length
          ? 'public, s-maxage=60, stale-while-revalidate=86400'
          : 'no-store',
      },
    }
  )
}
