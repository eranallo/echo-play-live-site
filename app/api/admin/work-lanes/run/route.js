import { NextResponse } from 'next/server'
import { runWorkLane } from '@/lib/admin/specialistPlaceholder'
import { adminUnauthorized, isAdminAuthorized } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  if (!isAdminAuthorized(request)) return adminUnauthorized()
  try {
    const body = await request.json()
    const kind = body?.kind
    const showId = body?.showId
    const instruction = body?.instruction || ''

    const result = await runWorkLane({ kind, showId, instruction, source: 'admin_ui' })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || 'Work lane failed.' }, { status: 500 })
  }
}
