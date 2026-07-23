export const SHOW_TIME_ZONE = 'America/Chicago'
export const RUN_OF_SHOW_LOCALE = 'en-US'

export const SEGMENT_TYPES = [
  'Performance',
  'Break',
  'Production',
  'Guest / Support',
  'Wedding / Program',
  'Travel / Logistics',
  'Other',
]

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(RUN_OF_SHOW_LOCALE, {
  timeZone: SHOW_TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit',
})

const SEGMENT_DATE_FORMATTER = new Intl.DateTimeFormat(RUN_OF_SHOW_LOCALE, {
  timeZone: SHOW_TIME_ZONE,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

function parseDateTime(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function numberValue(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function selectName(value) {
  if (!value) return 'Other'
  if (typeof value === 'object' && value.name) return value.name
  return String(value)
}

export function formatPortalTime(value, fallback = 'TBD') {
  const date = parseDateTime(value)
  return date ? DATE_TIME_FORMATTER.format(date) : fallback
}

export function formatDuration(minutes) {
  const total = numberValue(minutes)
  if (total === null || total <= 0) return ''

  const rounded = Math.round(total)
  const hours = Math.floor(rounded / 60)
  const remaining = rounded % 60

  if (!hours) return `${remaining} min`
  if (!remaining) return `${hours} hr${hours === 1 ? '' : 's'}`
  return `${hours} hr ${remaining} min`
}

function calculatedDuration(start, end) {
  if (!start || !end || end <= start) return null
  return Math.round((end.getTime() - start.getTime()) / 60000)
}

function derivedEnd(start, durationMinutes) {
  if (!start || !durationMinutes || durationMinutes <= 0) return null
  return new Date(start.getTime() + durationMinutes * 60000)
}

export function normalizeRunOfShowSegment(record) {
  const fields = record?.fields || {}
  const start = parseDateTime(fields['Start Time'])
  const suppliedEnd = parseDateTime(fields['End Time'])
  const suppliedDuration = numberValue(fields['Duration Minutes'])
  const durationMinutes = suppliedDuration || calculatedDuration(start, suppliedEnd)
  const end = suppliedEnd || derivedEnd(start, durationMinutes)
  const startLabel = formatPortalTime(start, '')
  const endLabel = formatPortalTime(end, '')

  return {
    id: record?.id || `segment-${fields.Order || fields['Segment Name'] || 'unknown'}`,
    name: fields['Segment Name'] || 'Untitled Segment',
    type: selectName(fields['Segment Type']),
    startTime: fields['Start Time'] || '',
    endTime: fields['End Time'] || '',
    startTimestamp: start?.getTime() ?? null,
    endTimestamp: end?.getTime() ?? null,
    startLabel,
    endLabel,
    timeLabel: startLabel
      ? `${startLabel}${endLabel ? ` – ${endLabel}` : ''}`
      : 'Time TBD',
    dateLabel: start ? SEGMENT_DATE_FORMATTER.format(start) : '',
    order: numberValue(fields.Order),
    details: fields.Details || '',
    durationMinutes,
    durationLabel: formatDuration(durationMinutes),
  }
}

export function sortRunOfShowSegments(segments) {
  return [...segments].sort((a, b) => {
    const aHasOrder = Number.isFinite(a.order)
    const bHasOrder = Number.isFinite(b.order)

    if (aHasOrder && bHasOrder && a.order !== b.order) return a.order - b.order
    if (aHasOrder !== bHasOrder) return aHasOrder ? -1 : 1

    const aTime = Number.isFinite(a.startTimestamp) ? a.startTimestamp : Number.POSITIVE_INFINITY
    const bTime = Number.isFinite(b.startTimestamp) ? b.startTimestamp : Number.POSITIVE_INFINITY
    if (aTime !== bTime) return aTime - bTime

    return a.name.localeCompare(b.name)
  })
}

export function normalizeRunOfShowSegments(records = []) {
  return sortRunOfShowSegments(records.map(normalizeRunOfShowSegment))
}

export function segmentTypeSlug(type) {
  const normalized = selectName(type).toLowerCase()
  if (normalized === 'guest / support') return 'guest-support'
  if (normalized === 'wedding / program') return 'wedding-program'
  if (normalized === 'travel / logistics') return 'travel-logistics'
  return normalized.replace(/[^a-z0-9]+/g, '-') || 'other'
}
