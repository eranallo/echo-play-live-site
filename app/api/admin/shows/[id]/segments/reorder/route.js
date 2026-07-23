import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { reorderAdminShowSegments } from '@/lib/admin/airtable'
import { adminUnauthorized, isAdminAuthorized } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(request, { params }) {
  if (!isAdminAuthorized(request)) return adminUnauthorized()

  try {
    const { id: showId } = await params
    const body = await request.json()
    const result = await reorderAdminShowSegments(showId, body?.orderedIds || [])
    revalidateTag('admin-show-detail', { expire: 0 })
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown segment reorder error.',
    }, { status: 400 })
  }
}
