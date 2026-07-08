import { NextResponse } from 'next/server'
import { createAdminTask } from '@/lib/admin/airtable'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const task = await createAdminTask({
      title: body?.title,
      status: body?.status || 'Todo',
      priority: body?.priority || 'Normal',
      dueDate: body?.dueDate || '',
      owner: body?.owner || '',
      source: body?.source || 'Manual',
      relatedShow: body?.relatedShow || '',
      notes: body?.notes || '',
    })

    return NextResponse.json({ ok: true, task })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown task creation error.',
    }, { status: 500 })
  }
}
