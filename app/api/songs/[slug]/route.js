// Phase 18: Per-band songs catalog endpoint.
//
// GET /api/songs/{slug} → JSON list of enriched live songs for the band.
// Used by components/SongsSection to lazy-load the catalog on band pages.
// (The band page is a client component, so we can't fetch at render time
// without round-tripping through here.)
//
// Cache: 1h server-side (matches the songs.js revalidate window). Songs
// changes in Airtable propagate within an hour; force a fresh fetch by
// redeploying or wiping Vercel's data cache.

import { NextResponse } from 'next/server'
import { getSongsForBand } from '@/lib/songs'
import { bands } from '@/lib/bands'

export const runtime = 'nodejs'
// Phase 20.2 hotfix: dropped from 1h → 60s so a transient empty cache state
// (from a failed cold-start fetch, etc.) heals within a minute instead of
// dragging the catalog offline for an hour.
export const revalidate = 60

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
        // Edge cache: 60s fresh, 24h stale-while-revalidate. Bad cached
        // states (e.g., a network blip caching empty) age out within a
        // minute, while a healthy response stays fast for repeat visitors.
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400',
      },
    }
  )
}
