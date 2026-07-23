import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createAdminTask } from '@/lib/admin/airtable'
import { adminUnauthorized, isAdminAuthorized } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  if (!isAdminAuthorized(request)) return adminUnauthorized()
  try {
    const body = await request.json()
    const task = await createAdminTask({
      title: body?.title,
      status: body?.status || 'To Do',
      priority: body?.priority || 'Normal',
      dueDate: body?.dueDate || '',
      owner: body?.owner || '',
      source: body?.source || 'Manual',
      relatedShow: body?.relatedShow || '',
      notes: body?.notes || '',
    })
    revalidateTag('admin-ops', { expire: 0 })

    return NextResponse.json({ ok: true, task })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown task creation error.',
    }, { status: 500 })
  }
}
