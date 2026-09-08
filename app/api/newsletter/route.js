import { rateLimit } from '@/lib/ratelimit'
import { subscribeFan } from '@/lib/newsletter-service.mjs'
export async function POST(request) {
  const headers = { 'Cache-Control': 'no-store' }
  const reply = (body, status) => Response.json(body, { status, headers })
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Please sign up from this website.' }, 403)
  if (!request.headers.get('content-type')?.includes('application/json')) return reply({ error: 'Please send a valid signup.' }, 415)
  const limited = rateLimit(request, { capacity: 10, refillMs: 60000, scope: 'newsletter' })
  if (!limited.ok) return reply({ error: 'Please wait a moment before trying again.' }, 429)
  if (Number(request.headers.get('content-length')) > 2000) return reply({ error: 'Please check your signup details.' }, 413)
  let body
  try {
    const text = await request.text()
    if (text.length > 2000) return reply({ error: 'Please check your signup details.' }, 413)
    body = JSON.parse(text)
  } catch { return reply({ error: 'Please check your signup details.' }, 400) }
  const result = await subscribeFan(body)
  return reply(result.body, result.status)
}
