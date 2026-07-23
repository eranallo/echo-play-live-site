import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { markApprovalStatus } from '@/lib/admin/airtable'
import { adminUnauthorized, isAdminAuthorized } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

const ALLOWED_STATES = new Set(['Approved', 'Rejected', 'Changes Requested'])

export async function PATCH(request, { params }) {
  if (!isAdminAuthorized(request)) return adminUnauthorized()

  try {
    const { id: approvalId } = await params
    const body = await request.json()
    const status = body?.status
    if (!ALLOWED_STATES.has(status)) {
      return NextResponse.json({ ok: false, error: 'Invalid approval decision.' }, { status: 400 })
    }
    const updated = await markApprovalStatus(approvalId, status, body?.notes || '')
    revalidateTag('admin-ops', { expire: 0 })
    return NextResponse.json({ ok: true, updated })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown approval update error.',
    }, { status: 400 })
  }
}
