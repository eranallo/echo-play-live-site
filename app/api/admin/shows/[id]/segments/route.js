import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { createAdminShowSegment } from '@/lib/admin/airtable'
import { adminUnauthorized, isAdminAuthorized } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  if (!isAdminAuthorized(request)) return adminUnauthorized()

  try {
    const { id: showId } = await params
    const body = await request.json()
    const segment = await createAdminShowSegment(showId, body)
    revalidateTag('admin-show-detail', { expire: 0 })
    revalidateTag('admin-shows', { expire: 0 })
    return NextResponse.json({ ok: true, segment })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown segment creation error.',
    }, { status: 400 })
  }
}
