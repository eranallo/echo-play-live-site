import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { completeAdminTask, updateAdminTask } from '@/lib/admin/airtable'
import { adminUnauthorized, isAdminAuthorized } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(request, { params }) {
  if (!isAdminAuthorized(request)) return adminUnauthorized()
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
    revalidateTag('admin-ops', { expire: 0 })

    return NextResponse.json({ ok: true, task })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown task update error.',
    }, { status: 500 })
  }
}
