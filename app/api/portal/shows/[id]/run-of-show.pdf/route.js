import { timingSafeEqual } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { getPortalRunOfShow } from '@/lib/portal/airtable'
import { renderRunOfShowPdf } from '@/lib/portal/runOfShowPdf.mjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function safeEqual(actual, expected) {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)
  return actualBuffer.length === expectedBuffer.length
    && timingSafeEqual(actualBuffer, expectedBuffer)
}

function isAuthorized(request) {
  const expectedUsername = process.env.ADMIN_USERNAME
  const expectedPassword = process.env.ADMIN_PASSWORD
  const header = request.headers.get('authorization') || ''

  if (!expectedUsername || !expectedPassword || !header.startsWith('Basic ')) return false

  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8')
    const separator = decoded.indexOf(':')
    if (separator < 0) return false

    return safeEqual(decoded.slice(0, separator), expectedUsername)
      && safeEqual(decoded.slice(separator + 1), expectedPassword)
  } catch {
    return false
  }
}

function filenameFor(show) {
  const venue = String(show.venueName || 'show')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const date = String(show.date || 'date-tbd').replace(/[^0-9-]/g, '')
  return `echo-play-live-${date}-${venue || 'show'}-run-of-show.pdf`
}

export async function GET(request, { params }) {
  if (!isAuthorized(request)) {
    return new NextResponse('Authentication required.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Echo Play Live Portal", charset="UTF-8"',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }

  const { id } = await params
  const detail = await getPortalRunOfShow(id)

  if (!detail.ok || !detail.show) {
    return NextResponse.json(
      { error: detail.error || 'Run of show could not be loaded.' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  const logoBytes = await fs.readFile(logoPath).catch(() => null)
  const pdfBytes = await renderRunOfShowPdf({
    show: detail.show,
    segments: detail.segments,
    logoBytes,
  })

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filenameFor(detail.show)}"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
