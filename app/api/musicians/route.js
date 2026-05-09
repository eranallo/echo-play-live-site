// Public API: returns the active musicians roster, optionally filtered to a band.
//
// Used by the band page's Lineup section (band page is a client component, so
// it fetches musicians via this route rather than calling the server-side
// helper directly). The /musicians routes still call getMusicians() at build
// time and don't go through this API.

import { NextResponse } from 'next/server'
import { getMusicians } from '@/lib/musicians'

export const revalidate = 1800

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const bandSlug = searchParams.get('band')

  const all = await getMusicians()
  const members = bandSlug
    ? all.filter(m => m.bands.some(b => b.slug === bandSlug))
    : all

  // Return only the fields the public band page needs (no email/phone/notes).
  const slim = members.map(m => ({
    slug: m.slug,
    name: m.name,
    instruments: m.instruments,
    bands: m.bands.map(b => ({ slug: b.slug, name: b.name, color: b.color, shortName: b.shortName })),
    photo: m.photo ? { thumb: m.photo.thumb } : null,
  }))

  return NextResponse.json({ members: slim })
}
