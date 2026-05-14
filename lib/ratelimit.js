// Phase 38b — Per-IP token bucket rate limiter for the mutating API routes.
//
// In-memory map keyed by IP. Persists for the lifetime of a warm Vercel
// instance (several minutes on free tier) and resets on cold start. That's
// good enough for v1: it blocks burst floods from a single IP, which is the
// realistic abuse pattern. A determined attacker rotating IPs slowly bypasses
// this; that's a more advanced threat best handled by Vercel Firewall or
// Cloudflare in front. Upgrade to Vercel KV-backed buckets later if needed.
//
// Usage:
//   import { rateLimit } from '@/lib/ratelimit'
//   const limited = rateLimit(request, { capacity: 5, refillMs: 60_000, scope: 'inquiry' })
//   if (!limited.ok) {
//     return NextResponse.json(
//       { error: 'Too many requests' },
//       { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
//     )
//   }

const _buckets = new Map()

let _opsSinceGC = 0
function maybeGC(now) {
  if (++_opsSinceGC < 100) return
  _opsSinceGC = 0
  const oneHourAgo = now - 60 * 60 * 1000
  for (const [k, entry] of _buckets) {
    if (entry.lastRefill < oneHourAgo) _buckets.delete(k)
  }
}

function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const xri = request.headers.get('x-real-ip')
  if (xri) return xri.trim()
  return 'unknown'
}

/**
 * Token bucket rate-limit check.
 *
 * @param {Request} request - the incoming Next.js Request object
 * @param {Object} opts
 * @param {number} opts.capacity - max tokens (also the initial bucket size)
 * @param {number} opts.refillMs - milliseconds to refill ONE token
 * @param {string} [opts.scope] - namespace prefix so different routes don't
 *   share buckets (e.g., "inquiry" vs "song-request")
 * @returns {{ ok: true, remaining: number } | { ok: false, retryAfter: number }}
 */
export function rateLimit(request, opts) {
  const { capacity, refillMs, scope = 'default' } = opts
  if (!capacity || !refillMs) {
    throw new Error('rateLimit: capacity and refillMs required')
  }

  const now = Date.now()
  maybeGC(now)

  const ip = getClientIp(request)
  const key = `${scope}:${ip}`

  let entry = _buckets.get(key)
  if (!entry) {
    entry = { tokens: capacity, lastRefill: now }
    _buckets.set(key, entry)
  } else {
    const elapsed = now - entry.lastRefill
    const refills = Math.floor(elapsed / refillMs)
    if (refills > 0) {
      entry.tokens = Math.min(capacity, entry.tokens + refills)
      entry.lastRefill += refills * refillMs
    }
  }

  if (entry.tokens >= 1) {
    entry.tokens -= 1
    return { ok: true, remaining: entry.tokens }
  }

  const msUntilNextToken = refillMs - (now - entry.lastRefill)
  const retryAfter = Math.max(1, Math.ceil(msUntilNextToken / 1000))
  return { ok: false, retryAfter }
}
