import { bandsList } from '@/lib/bands'
import { rateLimit } from '@/lib/ratelimit'
import { sendInquiry } from '@/lib/inquiry-service.mjs'
import { reserveBookingSend } from '@/lib/booking-quota.mjs'
export async function POST(request) {
  const headers = { 'Cache-Control': 'no-store' }
  const origin = request.headers.get('origin')
  let sameOrigin = !origin
  try {
    if (origin) {
      const parsed = new URL(origin)
      sameOrigin =
        ['http:', 'https:'].includes(parsed.protocol) && parsed.host === request.headers.get('host')
    }
  } catch {}
  if (!sameOrigin)
    return Response.json(
      { error: 'Please submit your inquiry from this website.' },
      { status: 403, headers },
    )
  if (!request.headers.get('content-type')?.includes('application/json'))
    return Response.json({ error: 'Expected a JSON inquiry.' }, { status: 415, headers })
  const limited = rateLimit(request, { capacity: 5, refillMs: 120000, scope: 'inquiry' })
  if (!limited.ok)
    return Response.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { ...headers, 'Retry-After': String(limited.retryAfter) } },
    )
  if (Number(request.headers.get('content-length')) > 12000)
    return Response.json({ error: 'Inquiry is too long.' }, { status: 413, headers })
  let body
  try {
    const text = await request.text()
    if (text.length > 12000)
      return Response.json({ error: 'Inquiry is too long.' }, { status: 413, headers })
    body = JSON.parse(text)
  } catch {
    return Response.json({ error: 'Please send a valid inquiry.' }, { status: 400, headers })
  }
  const result = await sendInquiry(body, {
    bands: bandsList,
    apiKey: process.env.VERCEL_ENV === 'production' ? process.env.RESEND_API_KEY : undefined,
    from: process.env.BOOKING_EMAIL_FROM,
    reserve: reserveBookingSend,
    log: (event) => console.info('[booking-email]', event),
  })
  return Response.json(result.body, { status: result.status, headers })
}
