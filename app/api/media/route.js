import { NextResponse } from 'next/server'
import { galleryApiPayload } from '@/lib/public/gallery.mjs'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const payload = galleryApiPayload(searchParams.get('band'))
  if (!payload) return NextResponse.json({ error: 'Invalid band' }, { status: 400 })
  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
