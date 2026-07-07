import { NextResponse } from 'next/server'
import { approveSaveEventDescription } from '@/lib/admin/airtable'

export const dynamic = 'force-dynamic'

export async function POST(_request, { params }) {
  try {
    const resolvedParams = await params
    const approvalId = resolvedParams?.id

    if (!approvalId) {
      return NextResponse.json({ ok: false, error: 'Missing approval ID.' }, { status: 400 })
    }

    const updated = await approveSaveEventDescription(approvalId)

    return NextResponse.json({ ok: true, updated })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown approval execution error.',
    }, { status: 500 })
  }
}
