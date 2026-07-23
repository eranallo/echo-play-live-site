import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'

function safeEqual(actual, expected) {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)
  return actualBuffer.length === expectedBuffer.length
    && timingSafeEqual(actualBuffer, expectedBuffer)
}

export function isPortalAuthorized(request) {
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

export function portalUnauthorized() {
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Echo Play Live Portal", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
