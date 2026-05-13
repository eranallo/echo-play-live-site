// Phase 20: GET /api/discography/{slug}
//
// Returns the full discography of a tribute band's tributed artist, with
// each track flagged as performed/not performed. Used by the
// TributeDiscographySection client component on /bands/elite and
// /bands/jambi.
//
// Returns 404 if the band isn't a tribute (no tributeMode flag), or 200 with
// { albums: [] } if Spotify can't resolve the artist for some reason.

import { NextResponse } from 'next/server'
import { getTributeDiscography } from '@/lib/discography'
import { bands } from '@/lib/bands'

export const runtime = 'nodejs'
// Phase 20.2 hotfix: same lesson as /api/songs/[slug]. A 1-hour cache was
// pinning the discography view at zero whenever a cold-start request hit a
// transient failure. 60s gives the same self-heal window.
export const revalidate = 60

export async function GET(request, { params }) {
  const band = bands[params.slug]
  if (!band) {
    return NextResponse.json({ error: 'Band not found' }, { status: 404 })
  }
  if (!band.tributeMode) {
    return NextResponse.json(
      { error: `Band ${params.slug} is not a tribute band` },
      { status: 404 }
    )
  }
  const disco = await getTributeDiscography(params.slug)
  if (!disco) {
    return NextResponse.json(
      { slug: params.slug, albums: [], performedCount: 0, totalCount: 0 },
      { headers: { // Empty response (Spotify unreachable / artist not found): cache for
// only 30s so the page recovers quickly once Spotify is healthy.
'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' } }
    )
  }
  return NextResponse.json(
    {
      slug: params.slug,
      artist: disco.artist,
      albums: disco.albums,
      performedCount: disco.performedCount,
      totalCount: disco.totalCount,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400',
      },
    }
  )
}
