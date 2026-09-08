import { createHash } from 'node:crypto'
import { BOOKING_EMAIL } from './public/booking.mjs'

const LIMITS = { name:80, email:120, band:80, eventType:60, date:10, venue:120, message:2000, attendance:7, budget:80, production:400, inquirySource:80 }
const TYPES = new Set(['', 'Bar / Venue Show', 'Festival', 'Private Event', 'Corporate Event', 'Other'])
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
const EMAIL = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))

export function validateInquiry(body, bands = []) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error:'Please check your inquiry details.' }
  if (body.website) return { error:'Please check your inquiry details.' }
  const data = {}
  for (const [key, max] of Object.entries(LIMITS)) {
    if (body[key] != null && typeof body[key] !== 'string') return { error:'Please check your inquiry details.' }
    const value = (body[key] || '').trim()
    if (value.length > max) return { error:`Please shorten the ${key} field.` }
    data[key] = value
  }
  if (!data.name || /[\r\n\x00-\x1f]/.test(data.name)) return { error:'Please enter your name.' }
  if (!EMAIL.test(data.email)) return { error:'A valid email address is required.' }
  if (!data.message) return { error:'Please tell us a little about your event.' }
  if (data.band && !bands.some(band => band.name === data.band && !band.hidden)) return { error:'Please select a band from the list.' }
  if (!TYPES.has(data.eventType)) return { error:'Please select an event type from the list.' }
  if (data.date && (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(data.date)) || new Date(data.date).toISOString().slice(0,10) !== data.date)) return { error:'Please choose a valid date.' }
  if (data.attendance && (!/^[1-9]\d{0,6}$/.test(data.attendance) || Number(data.attendance)>1000000)) return { error:'Please enter a whole number for your expected audience, or leave it blank.' }
  if (typeof body.requestId !== 'string' || !UUID.test(body.requestId)) return { error:'Please refresh this page before sending your inquiry.' }
  return { data, requestId:body.requestId.toLowerCase() }
}

export function bookingMessage(data, requestId) {
  // Stable content and key let the provider deduplicate an uncertain retry.
  // No contact details enter the reference, analytics or application logs.
  const fingerprint = createHash('sha256').update(JSON.stringify(data)).digest('hex')
  const reference = `EPL-${createHash('sha256').update(`${requestId}:${fingerprint}`).digest('hex').slice(0,12).toUpperCase()}`
  const rows = [['Reference',reference],['Name',data.name],['Email',data.email],['Band',data.band || 'Help me choose'],['Event type',data.eventType || 'To discuss'],['Preferred date',data.date || 'To discuss'],['Venue / city',data.venue || 'To discuss'],['Expected audience',data.attendance || 'Not sure yet'],['Budget',data.budget || 'To discuss'],['Sound, lighting & stage',data.production || 'To discuss'],['Source',data.inquirySource || 'Contact page']]
  const text = `New booking inquiry\n\n${rows.map(([label,value])=>`${label}: ${value}`).join('\n')}\n\nEvent details\n${data.message}\n\nReply to this email to reach ${data.name}.\nSent through https://echoplay.live/contact\n`
  const html = `<div style="font-family:Arial,sans-serif;color:#171717;max-width:640px;margin:auto;padding:28px"><img src="https://echoplay.live/press/epl-logo-black-1024.png" alt="Echo Play Live" width="88" height="88"><h1 style="font-size:26px">New booking inquiry</h1><p>Reply to this email to reach ${escapeHtml(data.name)}.</p><table role="presentation" style="width:100%;border-collapse:collapse">${rows.map(([label,value])=>`<tr><td style="padding:10px 12px 10px 0;border-bottom:1px solid #e6e6e6;vertical-align:top;width:35%"><strong>${escapeHtml(label)}</strong></td><td style="padding:10px 0;border-bottom:1px solid #e6e6e6;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('')}</table><h2 style="font-size:18px;margin-top:28px">Event details</h2><p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(data.message)}</p><p style="font-size:12px;color:#666">Sent through echoplay.live · ${reference}</p></div>`
  return { reference, idempotencyKey:`booking/${requestId}/${fingerprint}`, subject:`Booking inquiry · ${data.band || 'Echo Play Live'}${data.date ? ` · ${data.date}` : ''} · ${reference}`, text, html }
}

export async function sendInquiry(body, { bands = [], apiKey, from, reserve, fetchImpl = fetch, now = () => new Date(), log = () => {} } = {}) {
  const parsed = validateInquiry(body,bands)
  if (parsed.error) return { status:400, body:{error:parsed.error} }
  if (!apiKey || !/^Echo Play Live website <bookings@notify\.echoplay\.live>$/.test(from || '')) return { status:503, body:{error:'Email delivery is temporarily unavailable. Your details are still here; please email Evan below.'} }
  const message = bookingMessage(parsed.data,parsed.requestId)
  try {
    if (!reserve) throw new Error('quota_unconfigured')
    await reserve()
  } catch {
    log({event:'limited'})
    return {status:503,body:{error:'The booking form is temporarily unavailable. Your details are still here; please email Evan below.'}}
  }
  try {
    const response = await fetchImpl('https://api.resend.com/emails', {
      method:'POST', cache:'no-store', redirect:'error', signal:AbortSignal.timeout(10000),
      headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':message.idempotencyKey},
      body:JSON.stringify({from,to:[BOOKING_EMAIL],reply_to:parsed.data.email,subject:message.subject,text:message.text,html:message.html,tags:[{name:'source',value:'website-booking'}]}),
    })
    if (!response.ok) throw new Error('provider_rejected')
    const result = await response.json()
    if (typeof result.id !== 'string' || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(result.id)) throw new Error('invalid_receipt')
    log({event:'accepted'})
    return {status:200,body:{success:true,status:'accepted',bookingEmail:BOOKING_EMAIL,reference:message.reference,receivedAt:now().toISOString()}}
  } catch {
    log({event:'unconfirmed'})
    return {status:502,body:{error:'We couldn’t confirm that your inquiry was sent. Your details are still here. You can try again or email Evan below.'}}
  }
}
