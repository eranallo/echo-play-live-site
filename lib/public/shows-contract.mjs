import { createHash } from 'node:crypto'

export const PUBLIC_SHOW_TIME_ZONE = 'America/Chicago'
export const PUBLIC_SHOW_SCHEMA_VERSION = 1

export const SHOW_FIELD_IDS = Object.freeze({
  publish: 'fldvzh4YwqSor47Ta',
  date: 'fldFeuTq62vFKhiRf',
  bands: 'fld5t4DAMQEDz1k8s',
  venue: 'fldh5T0QyJF0a7tFH',
  status: 'fld0heDE2MEcp9FF1',
  startTime: 'fldzBwLiifwQHk7Xn',
  doorsTime: 'fldzfOqCYc451HARH',
  ticketUrl: 'fldXYjjv1978gheNB',
  reservationUrl: 'fldsUQYgcYRACqLAY',
  headliner: 'fldwgnNNbI7KJv2Yc',
  calendarEventId: 'fld9afSkMjIVGmoOv',
})

export const BAND_FIELD_IDS = Object.freeze({
  name: 'fldjFKclWNjTuGOi5',
})

export const VENUE_FIELD_IDS = Object.freeze({
  name: 'fldhQR4NRmOtrywrj',
  address: 'fldwFdn1PdJfIVt8G',
  ageRestriction: 'fldN11XAkovT17ouy',
})

export const SHOW_SOURCE_FIELD_IDS = Object.freeze(Object.values(SHOW_FIELD_IDS))
export const BAND_SOURCE_FIELD_IDS = Object.freeze(Object.values(BAND_FIELD_IDS))
export const VENUE_SOURCE_FIELD_IDS = Object.freeze(Object.values(VENUE_FIELD_IDS))

const RECORD_ID_PATTERN = /^rec[A-Za-z0-9]{14}$/
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const OFFSET_PATTERN = /^[A-Za-z0-9._~\/-]{1,512}$/
const ISO_INSTANT_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/
const PLACEHOLDER_VENUE_PATTERN = /^(?:venue\s+)?(?:tba|tbd)$/i
const ALLOWED_STATUSES = new Set(['Confirmed', 'Cancelled'])

function plainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function validRecordId(value) {
  return typeof value === 'string' && RECORD_ID_PATTERN.test(value)
}

function uniqueRecordIds(value) {
  if (!Array.isArray(value) || value.length === 0 || !value.every(validRecordId)) return null
  const unique = [...new Set(value)]
  return unique.length === value.length ? unique : null
}

function datePartsInTimeZone(value, timeZone = PUBLIC_SHOW_TIME_ZONE) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return byType.year && byType.month && byType.day
    ? `${byType.year}-${byType.month}-${byType.day}`
    : null
}

export function chicagoDate(value = new Date()) {
  return datePartsInTimeZone(value, PUBLIC_SHOW_TIME_ZONE)
}

export function validDateOnly(value) {
  if (typeof value !== 'string') return false
  const match = DATE_ONLY_PATTERN.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const candidate = new Date(Date.UTC(year, month - 1, day))

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  )
}

export function buildPublicShowFormula(today) {
  if (!validDateOnly(today)) throw new Error('INVALID_CHICAGO_DATE')
  return `AND({Publish to Website}=TRUE(),{Date}>='${today}',OR({Status}='Confirmed',{Status}='Cancelled'))`
}

export function validOffset(value) {
  return typeof value === 'string' && OFFSET_PATTERN.test(value)
}

function normalizeStartTime(value, showDate) {
  if (value === undefined || value === null || value === '') return { ok: true, value: null }
  if (typeof value !== 'string' || !ISO_INSTANT_PATTERN.test(value)) return { ok: false }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return { ok: false }
  if (datePartsInTimeZone(parsed, PUBLIC_SHOW_TIME_ZONE) !== showDate) return { ok: false }

  return { ok: true, value: parsed.toISOString() }
}

function normalizeCalendarEventId(value) {
  if (value === undefined || value === null || value === '') return { ok: true, value: null }
  if (typeof value !== 'string') return { ok: false }
  const normalized = value.trim()
  if (!normalized) return { ok: true, value: null }
  if (normalized.length > 512 || /[\u0000-\u001f\u007f]/.test(normalized)) return { ok: false }
  return { ok: true, value: normalized }
}

function normalizeHeadliner(value, bandIds) {
  if (value === undefined || value === null) return { ok: true, bandIds: [] }

  const linkedIds = uniqueRecordIds(value)
  if (!linkedIds || linkedIds.some((id) => !bandIds.includes(id))) return { ok: false }
  return { ok: true, bandIds: linkedIds }
}

export function prepareShowRows(records, today) {
  const rows = []
  const reasons = {}

  function reject(reason) {
    reasons[reason] = (reasons[reason] || 0) + 1
  }

  for (const record of records || []) {
    if (!plainObject(record) || !validRecordId(record.id) || !plainObject(record.fields)) {
      reject('invalid_record')
      continue
    }

    const fields = record.fields
    if (fields[SHOW_FIELD_IDS.publish] !== true) {
      reject('not_published')
      continue
    }

    const date = fields[SHOW_FIELD_IDS.date]
    if (!validDateOnly(date) || date < today) {
      reject('invalid_or_past_date')
      continue
    }

    const status = fields[SHOW_FIELD_IDS.status]
    if (!ALLOWED_STATUSES.has(status)) {
      reject('invalid_status')
      continue
    }

    const bandIds = uniqueRecordIds(fields[SHOW_FIELD_IDS.bands])
    if (!bandIds) {
      reject('invalid_band_relation')
      continue
    }

    const venueIds = uniqueRecordIds(fields[SHOW_FIELD_IDS.venue])
    if (!venueIds || venueIds.length !== 1) {
      reject('invalid_venue_relation')
      continue
    }

    const startTime = normalizeStartTime(fields[SHOW_FIELD_IDS.startTime], date)
    if (!startTime.ok) {
      reject('invalid_start_time')
      continue
    }

    const calendarEventId = normalizeCalendarEventId(fields[SHOW_FIELD_IDS.calendarEventId])
    if (!calendarEventId.ok) {
      reject('invalid_calendar_identity')
      continue
    }

    const headliner = normalizeHeadliner(fields[SHOW_FIELD_IDS.headliner], bandIds)
    if (!headliner.ok) {
      reject('invalid_headliner')
      continue
    }

    rows.push({
      sourceId: record.id,
      date,
      bandIds,
      venueId: venueIds[0],
      status,
      startTime: startTime.value,
      doorsTime: (() => {
        const doors = normalizeStartTime(fields[SHOW_FIELD_IDS.doorsTime], date)
        return doors.ok && doors.value && (!startTime.value || doors.value <= startTime.value) ? doors.value : null
      })(),
      calendarEventId: calendarEventId.value,
      headlinerBandIds: headliner.bandIds,
      ticketUrl: fields[SHOW_FIELD_IDS.ticketUrl],
      reservationUrl: fields[SHOW_FIELD_IDS.reservationUrl],
    })
  }

  return { rows, reasons }
}

function normalizeHttpsUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' || url.username || url.password) return null
    return url.toString()
  } catch {
    return null
  }
}

function opaquePublicId(namespace, privateIdentity) {
  const digest = createHash('sha256')
    .update(`echo-play-live:public-show:v1:${namespace}:${privateIdentity}`)
    .digest()
    .subarray(0, 16)
    .toString('base64url')
  return `show_${digest}`
}

function approvedBandMap(approvedBands) {
  const map = new Map()
  for (const band of approvedBands || []) {
    if (!band || band.hidden || !validRecordId(band.airtableId)) continue
    if (typeof band.name !== 'string' || !band.name.trim()) continue
    if (typeof band.slug !== 'string' || !band.slug.trim()) continue
    map.set(band.airtableId, { name: band.name.trim(), slug: band.slug.trim() })
  }
  return map
}

function orderedBands(items, headlinerSlug) {
  const sorted = [...items].sort((left, right) => {
    const slugOrder = left.slug.localeCompare(right.slug)
    return slugOrder || left.name.localeCompare(right.name)
  })

  if (!headlinerSlug) return sorted
  return sorted.sort((left, right) => {
    if (left.slug === headlinerSlug) return -1
    if (right.slug === headlinerSlug) return 1
    return 0
  })
}

export function publicVenueDetails(fields) {
  const address = fields[VENUE_FIELD_IDS.address]
  const age = fields[VENUE_FIELD_IDS.ageRestriction]
  // Optional public facts only. No contacts, operational notes, rates or private IDs.
  return {
    ...(typeof address === 'string' && address.trim().length <= 300 && /\d/.test(address) && !/[\r\n<>]/.test(address) ? { address: address.trim() } : {}),
    ...(['All Ages', 'All ages', '18+', '21+'].includes(age) ? { ageRestriction: age } : {}),
  }
}

function normalizedRow(row, bandNamesById, venueNamesById, publicBandsById, venueDetailsById) {
  const venueName = venueNamesById.get(row.venueId)
  if (
    typeof venueName !== 'string' ||
    !venueName.trim() ||
    PLACEHOLDER_VENUE_PATTERN.test(venueName.trim())
  ) {
    return { ok: false, reason: 'invalid_public_venue' }
  }

  const bands = []
  for (const bandId of row.bandIds) {
    const hydratedName = bandNamesById.get(bandId)
    const approvedBand = publicBandsById.get(bandId)
    if (
      !approvedBand ||
      typeof hydratedName !== 'string' ||
      hydratedName.trim() !== approvedBand.name
    ) {
      return { ok: false, reason: 'invalid_public_band' }
    }
    bands.push(approvedBand)
  }

  const headlinerSlugs = []
  for (const bandId of row.headlinerBandIds) {
    const approvedBand = publicBandsById.get(bandId)
    if (!approvedBand || !row.bandIds.includes(bandId)) {
      return { ok: false, reason: 'invalid_public_headliner' }
    }
    headlinerSlugs.push(approvedBand.slug)
  }

  if (new Set(headlinerSlugs).size > 1) return { ok: false, reason: 'conflicting_headliner' }

  return {
    ok: true,
    row: {
      ...row,
      bands,
      venueName: venueName.trim(),
      venueDetails: publicVenueDetails(venueDetailsById.get(row.venueId) || {}),
      headlinerSlug: headlinerSlugs[0] || null,
      safeTicketUrl: normalizeHttpsUrl(row.ticketUrl),
      safeReservationUrl: normalizeHttpsUrl(row.reservationUrl),
    },
  }
}

function oneValue(rows, getter) {
  const values = [
    ...new Set(
      rows.map(getter).filter((value) => value !== null && value !== undefined && value !== ''),
    ),
  ]
  return values.length <= 1 ? { ok: true, value: values[0] || null } : { ok: false, value: null }
}

function buildPublicShow(rows, groupKey) {
  const date = oneValue(rows, (row) => row.date)
  const venueId = oneValue(rows, (row) => row.venueId)
  const venueName = oneValue(rows, (row) => row.venueName)
  const status = oneValue(rows, (row) => row.status)
  const startTime = oneValue(rows, (row) => row.startTime)
  const doorsTime = oneValue(rows, (row) => row.doorsTime)
  const ticketUrl = oneValue(rows, (row) => row.safeTicketUrl)
  const reservationUrl = oneValue(rows, (row) => row.safeReservationUrl)
  const headliner = oneValue(rows, (row) => row.headlinerSlug)

  if (
    ![date, venueId, venueName, status, startTime, ticketUrl, reservationUrl, headliner].every(
      (item) => item.ok,
    )
  ) {
    return { ok: false, reason: 'conflicting_group_facts' }
  }

  const bandBySlug = new Map()
  for (const row of rows) {
    for (const band of row.bands) bandBySlug.set(band.slug, band)
  }
  const bands = orderedBands([...bandBySlug.values()], headliner.value)
  if (!bands.length) return { ok: false, reason: 'invalid_public_band' }

  const canceled = status.value === 'Cancelled'
  const ticket =
    !canceled && ticketUrl.value
      ? { label: 'Buy Tickets', url: ticketUrl.value, priceLabel: null }
      : null
  const reservation = !canceled && reservationUrl.value
    ? { label: 'Table Reservation', url: reservationUrl.value }
    : null

  const separator = groupKey.indexOf(':')
  const namespace = groupKey.slice(0, separator)
  const privateIdentity = groupKey.slice(separator + 1)

  return {
    ok: true,
    show: {
      id: opaquePublicId(namespace, privateIdentity),
      date: date.value,
      timeZone: PUBLIC_SHOW_TIME_ZONE,
      startTime: startTime.value,
      ...(doorsTime.ok && doorsTime.value ? { doorsTime: doorsTime.value } : {}),
      bands,
      venue: { name: venueName.value, ...rows[0].venueDetails },
      state: canceled ? 'canceled' : 'scheduled',
      ticket,
      reservation,
      // Keep legacy price fields null for older clients. Pricing belongs to
      // the destination page and is no longer fetched from Airtable here.
      ticketNote: null,
    },
  }
}

export function buildPublicShows({ rows, bandNamesById, venueNamesById, approvedBands, venueDetailsById = new Map() }) {
  const reasons = {}
  const validRows = []
  const blockedCalendarGroups = new Set()
  const publicBandsById = approvedBandMap(approvedBands)

  function reject(reason) {
    reasons[reason] = (reasons[reason] || 0) + 1
  }

  for (const row of rows || []) {
    const normalized = normalizedRow(row, bandNamesById, venueNamesById, publicBandsById, venueDetailsById)
    if (!normalized.ok) {
      reject(normalized.reason)
      if (row.calendarEventId) blockedCalendarGroups.add(row.calendarEventId)
      continue
    }
    validRows.push(normalized.row)
  }

  const groups = new Map()
  for (const row of validRows) {
    if (row.calendarEventId && blockedCalendarGroups.has(row.calendarEventId)) {
      reject('invalid_group_member')
      continue
    }
    const key = row.calendarEventId ? `calendar:${row.calendarEventId}` : `row:${row.sourceId}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }

  const shows = []
  for (const [key, groupRows] of groups) {
    const show = buildPublicShow(groupRows, key)
    if (!show.ok) {
      reject(show.reason)
      continue
    }
    shows.push(show.show)
  }

  shows.sort((left, right) => {
    const dateOrder = left.date.localeCompare(right.date)
    if (dateOrder) return dateOrder
    if (left.startTime && !right.startTime) return -1
    if (!left.startTime && right.startTime) return 1
    if (left.startTime && right.startTime) {
      const timeOrder = left.startTime.localeCompare(right.startTime)
      if (timeOrder) return timeOrder
    }
    return left.id.localeCompare(right.id)
  })

  return { shows, reasons }
}

export function publicShowToEventJsonLd(show, siteUrl = 'https://echoplay.live') {
  const addressParts = show.venue.address?.match(/^(.+),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/)
  const address = addressParts ? {
    '@type': 'PostalAddress', streetAddress: addressParts[1], addressLocality: addressParts[2],
    addressRegion: addressParts[3], postalCode: addressParts[4], addressCountry: 'US',
  } : show.venue.address
  const performers = show.bands.map((band) => ({
    '@type': 'MusicGroup',
    name: band.name,
    ...(band.slug ? { url: `${siteUrl}/bands/${band.slug}` } : {}),
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${siteUrl}/shows/${show.id}#event`,
    url: `${siteUrl}/shows/${show.id}`,
    name: `${show.bands.map((band) => band.name).join(' + ')} at ${show.venue.name}`,
    startDate: show.startTime || show.date,
    eventStatus:
      show.state === 'canceled'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    description: `${show.bands.map(band => band.name).join(' + ')} ${show.state === 'canceled' ? 'was scheduled to play' : 'plays'} at ${show.venue.name}. ${show.state === 'canceled' ? 'This show has been canceled.' : 'See the lineup and venue details.'}`,
    image: show.bands.filter(band => band.slug).map(band => `${siteUrl}/social/${band.slug}.png`),
    location: { '@type': 'Place', name: show.venue.name, ...(address ? { address } : {}) },
    ...(show.doorsTime ? { doorTime: show.doorsTime } : {}),
    performer: performers.length === 1 ? performers[0] : performers,
    organizer: { '@type': 'Organization', name: 'Echo Play Live', url: siteUrl },
    ...(show.state !== 'canceled' && show.ticket?.url
      ? { offers: { '@type': 'Offer', url: show.ticket.url } }
      : {}),
  }
}
