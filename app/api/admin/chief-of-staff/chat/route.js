import { NextResponse } from 'next/server'
import { askChiefOfStaff } from '@/lib/admin/chiefOfStaff'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const question = body?.question
    const history = Array.isArray(body?.history) ? body.history : []

    const result = await askChiefOfStaff({ question, history, logRun: true })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Chief of Staff chat failed.',
    }, { status: 500 })
  }
}
