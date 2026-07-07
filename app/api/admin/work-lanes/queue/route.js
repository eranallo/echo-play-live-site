import { NextResponse } from 'next/server'
import { routeWorkAction } from '@/lib/admin/specialistPlaceholder'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const result = await routeWorkAction({ action: body?.action, source: 'admin_ui' })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || 'Queue failed.' }, { status: 500 })
  }
}
