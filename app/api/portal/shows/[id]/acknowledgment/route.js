import { NextResponse } from 'next/server'
import { acknowledgePortalShow } from '@/lib/portal/airtable'
import { isPortalAuthorized, portalUnauthorized } from '@/lib/portal/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  if (!isPortalAuthorized(request)) return portalUnauthorized()

  try {
    const resolvedParams = await params
    const body = await request.json()
    const result = await acknowledgePortalShow({
      showId: resolvedParams?.id,
      personType: body?.personType,
      personId: body?.personId,
      expectedFingerprint: body?.fingerprint,
    })

    return NextResponse.json(result, {
      status: result.status || (result.ok ? 200 : 400),
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'The acknowledgment could not be saved.' },
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      }
    )
  }
}
