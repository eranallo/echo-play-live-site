import { NextResponse } from 'next/server'
import { generateChiefOfStaffBrief } from '@/lib/admin/chiefOfStaff'
import { adminUnauthorized, isAdminAuthorized } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  if (!isAdminAuthorized(request)) return adminUnauthorized()
  try {
    const result = await generateChiefOfStaffBrief({ logRun: true })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Chief of Staff brief failed.',
    }, { status: 500 })
  }
}
