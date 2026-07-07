import { NextResponse } from 'next/server'
import { ADMIN_SHOW_UPDATE_FIELDS, updateAdminShowFields } from '@/lib/admin/airtable'

export const dynamic = 'force-dynamic'

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params
    const showId = resolvedParams?.id

    if (!showId) {
      return NextResponse.json({ ok: false, error: 'Missing show ID.' }, { status: 400 })
    }

    const body = await request.json()
    const fields = body?.fields || {}
    const disallowed = Object.keys(fields).filter(field => !ADMIN_SHOW_UPDATE_FIELDS.includes(field))

    if (disallowed.length > 0) {
      return NextResponse.json({
        ok: false,
        error: `Disallowed field update: ${disallowed.join(', ')}`,
      }, { status: 400 })
    }

    const updated = await updateAdminShowFields(showId, fields)

    return NextResponse.json({ ok: true, updated })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown show update error.',
    }, { status: 500 })
  }
}
