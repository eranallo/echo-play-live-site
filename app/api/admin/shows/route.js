import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { createAdminShow } from '@/lib/admin/airtable'
import { adminUnauthorized, isAdminAuthorized } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  if (!isAdminAuthorized(request)) return adminUnauthorized()

  try {
    const body = await request.json()
    const show = await createAdminShow(body?.fields || body || {})
    revalidateTag('admin-shows', { expire: 0 })
    return NextResponse.json({ ok: true, show })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown show creation error.',
    }, { status: 400 })
  }
}
