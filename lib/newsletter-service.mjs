import { newsletterForm } from './public/newsletter-config.mjs'

export async function subscribeFan(body, { fetchImpl = fetch } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { status: 400, body: { error: 'Please check your signup details.' } }
  if (body.website) return { status: 400, body: { error: 'Please check your signup details.' } }
  if (typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
      typeof body.city !== 'string' || body.city.length > 100 || !Array.isArray(body.bands) || body.bands.length > 4 ||
      body.bands.some(band => !Object.hasOwn(newsletterForm.bands, band))) return { status: 400, body: { error: 'Please check your email, city and band choices.' } }
  // Mailchimp's own embedded-form script uses this public JSONP endpoint.
  // Read JSON only; never execute provider code or reflect provider HTML/PII.
  const url = new URL(newsletterForm.action.replace('/post?', '/post-json?'))
  url.searchParams.set('c', 'eplSignup')
  url.searchParams.set('EMAIL', body.email.trim())
  url.searchParams.set('CITY', body.city.trim())
  url.searchParams.set(newsletterForm.honeypot, '')
  for (const band of new Set(body.bands)) url.searchParams.set(newsletterForm.bands[band].name, '1')
  try {
    const response = await fetchImpl(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(12000) })
    if (!response.ok) throw new Error('unavailable')
    const text = await response.text()
    if (text.length > 20000) throw new Error('invalid_response')
    const match = text.match(/^\s*eplSignup\((\{[\s\S]*\})\);?\s*$/)
    if (!match) throw new Error('invalid_response')
    const result = JSON.parse(match[1])
    if (result.result === 'success') {
      const message = String(result.msg || '').replace(/<[^>]*>/g, '')
      const status = /confirm|confirmation|click.*link/i.test(message) ? 'pending' : /^thank you for subscribing[.!]?$/i.test(message.trim()) ? 'subscribed' : 'accepted'
      return { status: 200, body: { status } }
    }
    if (/already subscribed/i.test(String(result.msg))) return { status: 409, body: { error: 'That address is already on the list. You can update your preferences using the link in any of our emails.', hosted: true } }
    return { status: 422, body: { error: 'Mailchimp needs one more step to finish. Use the button below to continue securely.', hosted: true } }
  } catch {
    return { status: 503, body: { error: 'We couldn’t confirm your signup. You can finish directly with Mailchimp below.', hosted: true } }
  }
}
