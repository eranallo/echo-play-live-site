import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { approveSaveEventDescription } from '@/lib/admin/airtable'
import { adminUnauthorized, isAdminAuthorized } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  if (!isAdminAuthorized(request)) return adminUnauthorized()
  try {
    const resolvedParams = await params
    const approvalId = resolvedParams?.id

    if (!approvalId) {
      return NextResponse.json({ ok: false, error: 'Missing approval ID.' }, { status: 400 })
    }

    const updated = await approveSaveEventDescription(approvalId)
    revalidateTag('admin-ops', { expire: 0 })
    revalidateTag('admin-show-detail', { expire: 0 })

    return NextResponse.json({ ok: true, updated })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown approval execution error.',
    }, { status: 500 })
  }
}
