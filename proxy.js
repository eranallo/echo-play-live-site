import { NextResponse } from 'next/server'

const ADMIN_REALM = 'Echo Play Live Admin'
const PROTECTED_PREFIXES = ['/admin', '/api/admin', '/portal', '/api/portal']

function unauthorized() {
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${ADMIN_REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

export function proxy(request) {
  const pathname = request.nextUrl.pathname

  if (!PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  const expectedUsername = process.env.ADMIN_USERNAME
  const expectedPassword = process.env.ADMIN_PASSWORD

  // Fail closed. If credentials are not configured in Vercel, protected pages and APIs are not accessible.
  if (!expectedUsername || !expectedPassword) {
    return unauthorized()
  }

  const authorization = request.headers.get('authorization') || ''

  if (!authorization.startsWith('Basic ')) {
    return unauthorized()
  }

  let decoded = ''

  try {
    decoded = atob(authorization.slice('Basic '.length))
  } catch {
    return unauthorized()
  }

  const separatorIndex = decoded.indexOf(':')

  if (separatorIndex === -1) {
    return unauthorized()
  }

  const username = decoded.slice(0, separatorIndex)
  const password = decoded.slice(separatorIndex + 1)

  if (username !== expectedUsername || password !== expectedPassword) {
    return unauthorized()
  }

  const response = NextResponse.next()
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/portal/:path*', '/api/portal/:path*'],
}
