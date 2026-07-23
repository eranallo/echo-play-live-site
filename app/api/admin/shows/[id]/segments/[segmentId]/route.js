import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import {
  deleteAdminShowSegment,
  updateAdminShowSegment,
} from '@/lib/admin/airtable'
import { adminUnauthorized, isAdminAuthorized } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

function refresh() {
  revalidateTag('admin-show-detail', { expire: 0 })
  revalidateTag('admin-shows', { expire: 0 })
}

export async function PATCH(request, { params }) {
  if (!isAdminAuthorized(request)) return adminUnauthorized()

  try {
    const { id: showId, segmentId } = await params
    const body = await request.json()
    const segment = await updateAdminShowSegment(showId, segmentId, body)
    refresh()
    return NextResponse.json({ ok: true, segment })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown segment update error.',
    }, { status: 400 })
  }
}

export async function DELETE(request, { params }) {
  if (!isAdminAuthorized(request)) return adminUnauthorized()

  try {
    const { id: showId, segmentId } = await params
    const deleted = await deleteAdminShowSegment(showId, segmentId)
    refresh()
    return NextResponse.json({ ok: true, deleted })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown segment deletion error.',
    }, { status: 400 })
  }
}
