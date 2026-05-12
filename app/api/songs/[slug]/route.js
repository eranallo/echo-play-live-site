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
export const revalidate = 3600

export async function GET(request, { params }) {
  if (!bands[params.slug]) {
    return NextResponse.json({ error: 'Band not found' }, { status: 404 })
  }
  const songs = await getSongsForBand(params.slug)
  return NextResponse.json(
    { slug: params.slug, count: songs.length, songs },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  )
}
