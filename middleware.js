import { NextResponse } from 'next/server'

const ADMIN_REALM = 'Echo Play Live Admin'

function logAuthEvent(reason, details = {}) {
  // Safe diagnostics only. Do not log passwords, full auth headers, or env values.
  console.info('[admin-auth]', JSON.stringify({ reason, ...details }))
}

function unauthorized(reason, details = {}) {
  logAuthEvent(reason, details)

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${ADMIN_REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Admin-Auth-Reason': reason,
    },
  })
}

export function middleware(request) {
  const pathname = request.nextUrl.pathname

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const expectedUsername = process.env.ADMIN_USERNAME
  const expectedPassword = process.env.ADMIN_PASSWORD

  // Fail closed. If credentials are not configured in Vercel, /admin is not accessible.
  if (!expectedUsername || !expectedPassword) {
    return unauthorized('missing-env', {
      hasUsernameEnv: Boolean(expectedUsername),
      hasPasswordEnv: Boolean(expectedPassword),
      path: pathname,
    })
  }

  const authorization = request.headers.get('authorization') || ''

  if (!authorization.startsWith('Basic ')) {
    return unauthorized('missing-basic-header', {
      path: pathname,
      hasAuthHeader: Boolean(authorization),
    })
  }

  let decoded = ''

  try {
    decoded = atob(authorization.slice('Basic '.length))
  } catch {
    return unauthorized('invalid-basic-encoding', { path: pathname })
  }

  const separatorIndex = decoded.indexOf(':')

  if (separatorIndex === -1) {
    return unauthorized('invalid-basic-format', { path: pathname })
  }

  const username = decoded.slice(0, separatorIndex)
  const password = decoded.slice(separatorIndex + 1)
  const usernameMatches = username === expectedUsername
  const passwordMatches = password === expectedPassword

  if (!usernameMatches || !passwordMatches) {
    return unauthorized('credential-mismatch', {
      path: pathname,
      usernameMatches,
      passwordProvided: Boolean(password),
    })
  }

  logAuthEvent('authorized', { path: pathname })

  const response = NextResponse.next()
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
