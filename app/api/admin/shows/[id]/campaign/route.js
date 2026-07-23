import { NextResponse } from 'next/server'
import { generateShowCampaignDraft } from '@/lib/admin/campaign'
import { adminUnauthorized, isAdminAuthorized } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  if (!isAdminAuthorized(request)) return adminUnauthorized()
  try {
    const resolvedParams = await params
    const showId = resolvedParams?.id

    if (!showId) {
      return NextResponse.json({ ok: false, error: 'Missing show ID.' }, { status: 400 })
    }

    const result = await generateShowCampaignDraft(showId)

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown campaign draft error.',
    }, { status: 500 })
  }
}
