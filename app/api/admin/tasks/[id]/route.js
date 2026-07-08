import { NextResponse } from 'next/server'
import { completeAdminTask, updateAdminTask } from '@/lib/admin/airtable'

export const dynamic = 'force-dynamic'

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params
    const taskId = resolvedParams?.id

    if (!taskId) {
      return NextResponse.json({ ok: false, error: 'Missing task ID.' }, { status: 400 })
    }

    const body = await request.json()
    const action = body?.action

    const task = action === 'complete'
      ? await completeAdminTask(taskId)
      : await updateAdminTask(taskId, body?.fields || body || {})

    return NextResponse.json({ ok: true, task })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown task update error.',
    }, { status: 500 })
  }
}
