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
export const revalidate = 3600 // 1 hour at the route level

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
      { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400' } }
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
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  )
}
