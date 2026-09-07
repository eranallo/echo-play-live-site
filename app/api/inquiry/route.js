import { bandsList } from '@/lib/bands'
import { rateLimit } from '@/lib/ratelimit'
import { TABLES, tableUrl } from '@/lib/airtable'
import { saveInquiry } from '@/lib/inquiry-service.mjs'
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
  const result = await saveInquiry(body, {
    bands: bandsList,
    token: process.env.AIRTABLE_API_TOKEN || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
    url: tableUrl(TABLES.INQUIRIES),
  })
  return Response.json(result.body, { status: result.status, headers })
}
