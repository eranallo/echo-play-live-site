const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export const BLACKOUT_REASONS = [
  'Personal',
  'Other Gig',
  'Vacation',
  'Illness',
  'Family',
  'Other',
]

export function selectName(value, fallback = '') {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value === 'object' && value.name) return String(value.name)
  return String(value)
}

export function linkedIds(value) {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map(item => (typeof item === 'object' && item?.id ? item.id : item))
      .filter(Boolean)
  }
  return [typeof value === 'object' && value?.id ? value.id : value].filter(Boolean)
}

export function displayList(value) {
  if (!value) return []
  const values = Array.isArray(value) ? value : [value]
  return values.map(item => selectName(item)).filter(Boolean)
}

export function formatSongDuration(value) {
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds <= 0) return ''

  const rounded = Math.round(seconds)
  const minutes = Math.floor(rounded / 60)
  const remainder = rounded % 60
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

export function parseCalendarDate(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  const raw = String(value).trim()
  const match = raw.match(DATE_ONLY_PATTERN)
  if (match) {
    const [, year, month, day] = match
    return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0)
  }

  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function blackoutIncludesDate(showDate, startDate, endDate) {
  const show = parseCalendarDate(showDate)
  const start = parseCalendarDate(startDate)
  const end = parseCalendarDate(endDate || startDate)
  if (!show || !start || !end) return false

  show.setHours(12, 0, 0, 0)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return show >= start && show <= end
}

export function findAvailabilityConflicts(shows = [], blackouts = []) {
  return shows.flatMap(show => {
    const conflict = blackouts.find(item => blackoutIncludesDate(show.date, item.date, item.endDate))
    return conflict ? [{ show, blackout: conflict }] : []
  })
}

export function memberRolesForShow(memberFields = {}, bandNames = []) {
  const roles = bandNames.flatMap(bandName => {
    const role = selectName(memberFields[`Role - ${bandName}`])
    return role ? [`${bandName}: ${role}`] : []
  })

  if (roles.length) return roles

  const instruments = displayList(memberFields.Instruments)
  return instruments.length ? instruments : ['Band Member']
}

export function buildShowReadiness({
  show,
  segmentCount = 0,
  setlistCount = 0,
  personType = '',
  roles = [],
} = {}) {
  const critical = []
  const pending = []

  if (!show?.venueAddress) critical.push('Venue address')
  if (!show?.loadIn) critical.push('Venue load-in')
  if (!show?.start) critical.push('Show start')
  if (!show?.bandNames?.length) critical.push('Band assignment')
  if (!show?.memberNames?.length) critical.push('Playing members')

  if (!show?.soundCheck) pending.push('Soundcheck')
  if (!show?.end) pending.push('Show end')
  if (!segmentCount) pending.push('Run of show')
  if (personType === 'member' && !setlistCount) pending.push('Setlist')
  if (!show?.driveFolder) pending.push('Show documents')
  if (!show?.productionNotes) pending.push('Production notes')

  const normalizedRoles = roles.map(role => String(role).toLowerCase())
  if (personType === 'crew' && normalizedRoles.some(role => role.includes('sound')) && !show?.soundNotes) {
    pending.push('Sound notes')
  }
  if (personType === 'crew' && normalizedRoles.some(role => role.includes('merch')) && !show?.merchNotes) {
    pending.push('Merch notes')
  }

  const all = [...critical, ...pending]
  return {
    critical,
    pending,
    all,
    count: all.length,
    needsAttention: all.length > 0,
    label: all.length ? `${all.length} detail${all.length === 1 ? '' : 's'} pending` : 'Show ready',
  }
}

export function buildAcknowledgmentSnapshot({
  show,
  segments = [],
  setlists = [],
  personType = '',
  personId = '',
  roles = [],
} = {}) {
  return {
    version: 1,
    personType,
    personId,
    roles,
    show: {
      id: show?.id || '',
      date: show?.date || '',
      bands: show?.bandNames || [],
      venue: show?.venueName || '',
      address: show?.venueAddress || '',
      trailerLoadIn: show?.trailerLoadIn || '',
      loadIn: show?.loadIn || '',
      soundCheck: show?.soundCheck || '',
      start: show?.start || '',
      end: show?.end || '',
      members: show?.memberNames || [],
      soundEngineers: show?.soundEngineerNames || [],
      merchPeople: show?.merchPersonNames || [],
      showNotes: show?.showNotes || '',
      soundNotes: show?.soundNotes || '',
      merchNotes: show?.merchNotes || '',
      productionNotes: show?.productionNotes || '',
      driveFolder: show?.driveFolder || '',
    },
    segments: segments.map(segment => ({
      id: segment.id,
      name: segment.name,
      type: segment.type,
      start: segment.startTime,
      end: segment.endTime,
      order: segment.order,
      duration: segment.durationMinutes,
      details: segment.details,
    })),
    setlists: setlists.map(setlist => ({
      id: setlist.id,
      name: setlist.name,
      lastUpdated: setlist.lastUpdated || '',
      songIds: setlist.songIds || setlist.songs?.map(song => song.id) || [],
      notes: setlist.notes || '',
    })),
  }
}

export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

export function acknowledgmentSummary(show, roles = []) {
  const roleText = roles.length ? roles.join(', ') : 'Assigned'
  return [
    `${show?.dateLabel || 'Date TBD'} — ${show?.venueName || 'Venue TBD'}`,
    `Role: ${roleText}`,
    'Reviewed: schedule, venue, assignments, notes, setlists, documents, and run of show.',
  ].join('\n')
}
