const LIMITS = {
  name: 80,
  email: 120,
  band: 80,
  eventType: 60,
  date: 10,
  venue: 120,
  message: 2000,
  inquirySource: 80,
}
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const BOOKER_TYPES = {
  'Bar / Venue Show': 'Venue/Bar',
  Festival: 'Festival',
  'Private Event': 'Private Event',
  'Corporate Event': 'Corporate',
  Other: 'Other',
}
const EVENT_TYPES = {
  'Bar / Venue Show': 'Regular Gig',
  Festival: 'Festival Set',
  'Corporate Event': 'Corporate Event',
  Other: 'Other',
}
const SOURCES = new Set([
  'Contact page',
  'TDB QR landing',
  'Elite QR landing',
  'Jambi QR landing',
  'SLGN QR landing',
  'EPL Hub QR landing',
  'Other',
])
const QR_SOURCES = {
  'qr-landing:the-dick-beldings': 'TDB QR landing',
  'qr-landing:elite': 'Elite QR landing',
  'qr-landing:jambi': 'Jambi QR landing',
  'qr-landing:so-long-goodnight': 'SLGN QR landing',
  'qr-landing:hub': 'EPL Hub QR landing',
}
const TYPES = new Set([
  '',
  'Bar / Venue Show',
  'Festival',
  'Private Event',
  'Corporate Event',
  'Other',
])
export function validateInquiry(body, bands = []) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return { error: 'Please send a valid inquiry.' }
  if (typeof body.website === 'string' && body.website.trim()) return { spam: true }
  const data = {}
  for (const [key, max] of Object.entries(LIMITS)) {
    if (body[key] != null && typeof body[key] !== 'string')
      return { error: 'Please check your inquiry details.' }
    const value = (body[key] || '').trim()
    if (value.length > max) return { error: `Please shorten the ${key} field.` }
    data[key] = value
  }
  if (!data.name) return { error: 'Your name is required.' }
  if (!EMAIL.test(data.email)) return { error: 'A valid email address is required.' }
  if (data.band && !bands.some((b) => b.name === data.band && !b.hidden))
    return { error: 'Please select a band from the list.' }
  if (!TYPES.has(data.eventType)) return { error: 'Please select an event type from the list.' }
  if (
    data.date &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
      Number.isNaN(Date.parse(data.date)) ||
      new Date(data.date).toISOString().slice(0, 10) !== data.date)
  )
    return { error: 'Please choose a valid date.' }
  return { data }
}
export async function saveInquiry(body, { bands = [], token, url, fetchImpl = fetch } = {}) {
  const parsed = validateInquiry(body, bands)
  if (parsed.error) return { status: 400, body: { error: parsed.error } }
  if (parsed.spam) return { status: 200, body: { success: true } }
  if (!token)
    return {
      status: 503,
      body: { error: 'We couldn’t save your inquiry right now. Please try again or email us.' },
    }
  const d = parsed.data
  const band = bands.find((b) => b.name === d.band)
  const fields = {
    'Booker Name': d.name,
    'Booker Email': d.email,
    'Submitted Date': new Date().toISOString().slice(0, 10),
    Status: 'New',
  }
  if (band) fields['Band(s) Requested'] = [band.airtableId]
  if (d.eventType) fields['Booker Type'] = BOOKER_TYPES[d.eventType]
  if (EVENT_TYPES[d.eventType]) fields['Event Type'] = EVENT_TYPES[d.eventType]
  fields['Inquiry Source'] = SOURCES.has(d.inquirySource)
    ? d.inquirySource
    : QR_SOURCES[d.inquirySource] || (d.inquirySource ? 'Other' : 'Contact page')
  fields['Inquiry Kind'] = 'EPL Booking'
  for (const [name, key] of [
    ['date', 'Requested Date'],
    ['venue', 'Event Location/Venue Name'],
    ['message', 'Special Requests'],
  ])
    if (d[name]) fields[key] = d[name]
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields, typecast: false }),
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok)
      return {
        status: 502,
        body: { error: 'We couldn’t save your inquiry. Please try again or email us.' },
      }
    const saved = await response.json()
    if (typeof saved.id !== 'string' || !/^rec[A-Za-z0-9]{14}$/.test(saved.id))
      return {
        status: 502,
        body: { error: 'We couldn’t confirm delivery. Please email us before sending again.' },
      }
    return {
      status: 200,
      body: { success: true, bookingEmail: band?.bookingEmail || 'eranallo@echoplay.live' },
    }
  } catch {
    return {
      status: 502,
      body: {
        error:
          'We couldn’t confirm delivery. Please email us before sending again to avoid a duplicate inquiry.',
      },
    }
  }
}
