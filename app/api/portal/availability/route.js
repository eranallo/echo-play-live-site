import { NextResponse } from 'next/server'
import { createPortalBlackout } from '@/lib/portal/airtable'
import { isPortalAuthorized, portalUnauthorized } from '@/lib/portal/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  if (!isPortalAuthorized(request)) return portalUnauthorized()

  try {
    const body = await request.json()
    const result = await createPortalBlackout(body || {})
    return NextResponse.json(result, {
      status: result.status || (result.ok ? 201 : 400),
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'The blackout date could not be saved.' },
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
