import { createHash } from 'node:crypto'
import { normalizeRunOfShowSegments } from '../portal/runOfShow.mjs'

export const SHOW_DOCUMENT_KINDS = [
  {
    id: 'run-of-show',
    label: 'Run of Show',
    shortLabel: 'Run of Show',
    audience: 'Venue, artists, crew',
    description: 'The complete show-day timeline, call times, transitions, and production notes.',
  },
  {
    id: 'venue-advance',
    label: 'Venue Advance Sheet',
    shortLabel: 'Venue Advance',
    audience: 'Venue and promoter',
    description: 'Schedule, access, production, hospitality, merch, contacts, and open advancement details.',
  },
  {
    id: 'artist-call-sheet',
    label: 'Artist Call Sheet',
    shortLabel: 'Call Sheet',
    audience: 'Artists and crew',
    description: 'Where to be, when to arrive, who is assigned, and what everyone needs for show day.',
  },
  {
    id: 'private-event-schedule',
    label: 'Wedding / Private-Event Schedule',
    shortLabel: 'Private Event',
    audience: 'Client, planner, venue, artists',
    description: 'A client-friendly schedule for ceremony, announcements, dinner, performances, and breaks.',
  },
  {
    id: 'production-notes',
    label: 'Production Notes',
    shortLabel: 'Production',
    audience: 'Venue production, engineer, crew',
    description: 'Stage, PA, power, FOH, sound, load-in, and show-specific technical notes.',
  },
  {
    id: 'contact-sheet',
    label: 'Contact Sheet',
    shortLabel: 'Contacts',
    audience: 'Show leadership',
    description: 'Event, venue, artist, and assigned crew contacts in one clean reference.',
  },
  {
    id: 'settlement-summary',
    label: 'Settlement Summary',
    shortLabel: 'Settlement',
    audience: 'Echo Play Live and show partners',
    description: 'Deal terms, revenue, expenses, payouts, attendance, merch, and reconciliation notes.',
  },
  {
    id: 'show-recap',
    label: 'Show Recap',
    shortLabel: 'Recap',
    audience: 'Internal team and selected partners',
    description: 'Outcome, attendance, financial snapshot, lessons learned, and next-show improvements.',
  },
  {
    id: 'document-package',
    label: 'Complete Show Package',
    shortLabel: 'Full Package',
    audience: 'All show stakeholders',
    description: 'Every Phase 5 document combined into one branded, email-ready PDF.',
  },
]

export const SHOW_DOCUMENT_KIND_IDS = new Set(SHOW_DOCUMENT_KINDS.map(kind => kind.id))

const DOCUMENT_KIND_MAP = new Map(SHOW_DOCUMENT_KINDS.map(kind => [kind.id, kind]))
const PACKAGE_CHILDREN = SHOW_DOCUMENT_KINDS
  .map(kind => kind.id)
  .filter(id => id !== 'document-package')

function fields(record) {
  return record?.fields || {}
}

function linkedIds(value) {
  if (!Array.isArray(value)) return []
  return value
    .map(item => typeof item === 'string' ? item : item?.id)
    .filter(Boolean)
}

function selectName(value, fallback = '') {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && value.name) return value.name
  return fallback
}

function displayList(value) {
  if (!Array.isArray(value)) return value ? [String(value)] : []
  return value
    .map(item => typeof item === 'string' ? item : item?.name || '')
    .filter(Boolean)
}

function recordName(record, names) {
  const data = fields(record)
  for (const name of names) {
    if (data[name]) return String(data[name])
  }
  return ''
}

function numeric(value) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseDocumentDate(value) {
  if (!value) return null
  const normalized = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T12:00:00.000Z`
    : value
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(value) {
  if (!value) return 'Date TBD'
  const date = parseDocumentDate(value)
  if (!date) return String(value)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Chicago',
  }).format(date)
}

export function formatDocumentDateTime(value, fallback = 'TBD') {
  if (!value) return fallback
  const date = parseDocumentDate(value)
  if (!date) return String(value)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
  }).format(date)
}

export function formatDocumentTime(value, fallback = 'TBD') {
  if (!value) return fallback
  const date = parseDocumentDate(value)
  if (!date) return String(value)
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
  }).format(date)
}

export function formatDocumentCurrency(value, fallback = '—') {
  const amount = numeric(value)
  if (amount === null) return fallback
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

function contactFromRecord(record, type, role = '') {
  const data = fields(record)
  return {
    id: record?.id || `${type}-${recordName(record, ['Name', 'Member Name'])}`,
    type,
    name: recordName(record, ['Member Name', 'Name', 'Crew Name']) || 'Name TBD',
    role: role || selectName(data.Role) || displayList(data.Instruments).join(', '),
    phone: data.Phone || '',
    email: data.Email || '',
    company: data['Company / Vendor'] || '',
  }
}

function getMemberRole(record, bandNames) {
  const data = fields(record)
  for (const bandName of bandNames) {
    const role = selectName(data[`Role - ${bandName}`])
    if (role) return role
  }
  return displayList(data.Instruments).join(', ')
}

function showCrewContacts(showFields, crewRecords) {
  const soundIds = new Set(linkedIds(showFields['Sound Engineer']))
  const merchIds = new Set(linkedIds(showFields['Merch Person']))
  return crewRecords.map(record => {
    const roles = [
      soundIds.has(record.id) ? 'Sound Engineer' : '',
      merchIds.has(record.id) ? 'Merch' : '',
    ].filter(Boolean)
    return contactFromRecord(record, 'Crew', roles.join(' / '))
  })
}

function normalizeVenue(record) {
  const data = fields(record)
  return {
    id: record?.id || '',
    name: recordName(record, ['Venue Name', 'Name']) || 'Venue TBD',
    address: data.Address || '',
    type: selectName(data['Venue Type']),
    ageRestriction: selectName(data['Age Restriction']),
    capacity: numeric(data.Capacity),
    contactName: data['Primary Contact Name'] || '',
    contactPhone: data['Contact Phone'] || '',
    contactEmail: data['Contact Email'] || data['Booking Email'] || '',
    website: data.Website || '',
    stageSpecs: data['Stage Specs'] || '',
    parkingNotes: data['Parking Notes'] || '',
    greenRoom: data['Green Room'] === true,
    houseConsole: data['House Console'] || '',
    paSystem: data['PA System'] || '',
    fohLocation: selectName(data['FOH Location']),
    powerDrops: data['Power Drops'] || '',
    micLocker: data['Mic Locker'] || '',
    soundNotes: data['Sound Notes'] || '',
  }
}

function normalizeSetlist(record) {
  const data = fields(record)
  return {
    id: record?.id || '',
    name: data['Set Name'] || 'Setlist',
    duration: Array.isArray(data.Duration) ? data.Duration[0] : data.Duration || '',
    notes: data.Notes || '',
    lastUpdated: data['Last Updated'] || '',
  }
}

function sum(records, field) {
  return records.reduce((total, record) => total + (numeric(fields(record)[field]) || 0), 0)
}

function truthy(value) {
  return value !== null && value !== undefined && value !== ''
}

function issue(label, severity = 'Needed') {
  return { label, severity }
}

function scheduleIssues(model) {
  const issues = []
  if (!model.date) issues.push(issue('Show date'))
  if (!model.schedule.loadIn) issues.push(issue('Venue load-in time'))
  if (!model.schedule.start) issues.push(issue('Show start time'))
  if (!model.schedule.end) issues.push(issue('Show end time', 'Helpful'))
  return issues
}

export function documentReadiness(model, kindId) {
  const schedule = scheduleIssues(model)
  const issues = []

  if (!model.bandNames.length) issues.push(issue('Band / artist'))
  if (!model.venue.name || model.venue.name === 'Venue TBD') issues.push(issue('Venue'))

  switch (kindId) {
    case 'run-of-show':
      issues.push(...schedule)
      if (!model.segments.length) issues.push(issue('Run of Show segments'))
      break
    case 'venue-advance':
      issues.push(...schedule)
      if (!model.venue.contactName && !model.venue.contactEmail && !model.venue.contactPhone) issues.push(issue('Venue contact'))
      if (!model.venue.address) issues.push(issue('Venue address'))
      if (!model.notes.advance) issues.push(issue('Advance notes', 'Helpful'))
      break
    case 'artist-call-sheet':
      issues.push(...schedule)
      if (!model.venue.address) issues.push(issue('Venue address'))
      if (!model.contacts.people.length) issues.push(issue('Assigned artists / crew'))
      break
    case 'private-event-schedule':
      issues.push(...schedule)
      if (!model.contacts.event.name && !model.contacts.event.phone && !model.contacts.event.email) issues.push(issue('Client / event contact'))
      if (!model.segments.length) issues.push(issue('Private-event schedule segments'))
      break
    case 'production-notes':
      if (!model.notes.production) issues.push(issue('Production notes'))
      if (!model.production.soundEngineerNames.length) issues.push(issue('Sound engineer', 'Helpful'))
      if (!model.venue.stageSpecs && !model.venue.paSystem && !model.venue.houseConsole) issues.push(issue('Venue production specs', 'Helpful'))
      break
    case 'contact-sheet':
      if (!model.contacts.people.length) issues.push(issue('Assigned artist / crew contacts'))
      if (!model.venue.contactName && !model.contacts.event.name) issues.push(issue('Venue or event contact'))
      break
    case 'settlement-summary':
      if (!model.finance.dealType) issues.push(issue('Deal type'))
      if (!truthy(model.finance.performanceRate) && !truthy(model.finance.grossTicketRevenue)) issues.push(issue('Final show revenue'))
      if (!model.notes.settlement) issues.push(issue('Settlement notes', 'Helpful'))
      break
    case 'show-recap':
      if (!truthy(model.outcome.actualAttendance)) issues.push(issue('Actual attendance'))
      if (!model.outcome.recap) issues.push(issue('Show recap'))
      if (!model.outcome.lessonsLearned) issues.push(issue('Lessons learned', 'Helpful'))
      break
    case 'document-package': {
      const combined = PACKAGE_CHILDREN.flatMap(child => documentReadiness(model, child).issues)
      const seen = new Set()
      return {
        ready: combined.filter(item => item.severity !== 'Helpful').length === 0,
        issues: combined.filter(item => {
          const key = `${item.label}:${item.severity}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        }),
      }
    }
    default:
      return { ready: false, issues: [issue('Unknown document type')] }
  }

  return {
    ready: issues.filter(item => item.severity !== 'Helpful').length === 0,
    issues,
  }
}

function contentFingerprint(model) {
  const source = {
    showId: model.id,
    sourceUpdated: model.sourceUpdated,
    date: model.date,
    bandNames: model.bandNames,
    venue: model.venue,
    schedule: model.schedule,
    segments: model.segments,
    contacts: model.contacts,
    production: model.production,
    finance: model.finance,
    notes: model.notes,
    outcome: model.outcome,
  }
  return createHash('sha256').update(JSON.stringify(source)).digest('hex')
}

export function buildDocumentVersion(model) {
  const date = String(model.sourceUpdated || model.date || 'undated')
    .slice(0, 10)
    .replace(/-/g, '')
  return `${date || 'undated'}-${contentFingerprint(model).slice(0, 8)}`
}

export function documentKind(kindId) {
  return DOCUMENT_KIND_MAP.get(kindId) || null
}

export function buildShowDocumentModel({
  showRecord,
  bandRecords = [],
  venueRecord = null,
  memberRecords = [],
  crewRecords = [],
  segmentRecords = [],
  setlistRecords = [],
  merchSalesRecords = [],
} = {}) {
  if (!showRecord?.id) throw new Error('A show record is required to build documents.')

  const data = fields(showRecord)
  const bandNames = bandRecords
    .map(record => recordName(record, ['Band Name', 'Name']))
    .filter(Boolean)
  const venue = normalizeVenue(venueRecord)
  const memberIds = new Set(linkedIds(data['Members Playing']))
  const assignedMembers = memberRecords
    .filter(record => !memberIds.size || memberIds.has(record.id))
    .map(record => contactFromRecord(record, 'Artist', getMemberRole(record, bandNames)))
  const assignedCrew = showCrewContacts(data, crewRecords)
  const eventContact = {
    type: 'Event',
    name: data['Event Contact Name'] || '',
    role: 'Client / Event Contact',
    phone: data['Event Contact Phone'] || '',
    email: data['Event Contact Email'] || '',
    company: '',
  }
  const venueContact = {
    type: 'Venue',
    name: venue.contactName,
    role: 'Venue Contact',
    phone: venue.contactPhone,
    email: venue.contactEmail,
    company: venue.name === 'Venue TBD' ? '' : venue.name,
  }

  const model = {
    id: showRecord.id,
    title: data['Show Name'] || `${bandNames.join(' + ') || 'Artist TBD'} at ${venue.name}`,
    date: data.Date || '',
    dateLabel: formatDate(data.Date),
    bandNames,
    venue,
    sourceUpdated: data['Document Source Updated'] || data.Date || showRecord.createdTime || '',
    sourceUpdatedLabel: formatDocumentDateTime(data['Document Source Updated'] || data.Date || showRecord.createdTime, 'TBD'),
    schedule: {
      trailerLoadIn: data['Trailer Load-In Time'] || '',
      loadIn: data['Load-In Time'] || '',
      soundCheck: data['Sound Check Time'] || '',
      doors: data['Doors Time'] || '',
      start: data['Start Time'] || '',
      end: data['End Time'] || '',
    },
    segments: normalizeRunOfShowSegments(segmentRecords),
    setlists: setlistRecords.map(normalizeSetlist),
    contacts: {
      event: eventContact,
      venue: venueContact,
      people: [...assignedMembers, ...assignedCrew],
    },
    production: {
      soundProvider: selectName(data['Sound Provider']),
      soundEngineerNames: assignedCrew.filter(contact => contact.role.includes('Sound Engineer')).map(contact => contact.name),
      merchPersonNames: assignedCrew.filter(contact => contact.role.includes('Merch')).map(contact => contact.name),
      indoorOutdoor: selectName(data['Indoor / Outdoor'] || data['Indoor/Outdoor']),
      ageRestriction: selectName(data['Age Restriction']) || venue.ageRestriction,
      driveFolder: data['Drive Folder'] || '',
    },
    finance: {
      dealType: selectName(data['Deal Type']),
      ticketPrice: numeric(data['Ticket Price']),
      performanceRate: numeric(data['Performance Rate']),
      grossTicketRevenue: numeric(data['Gross Ticket Revenue']),
      eplFee: numeric(data['EPL Percent']),
      trailerCost: numeric(data['Trailer Cost']),
      audioEngineerCost: numeric(data['Audio Engineer Cost']),
      socialAdsSpend: numeric(data['Social Ads Spend']),
      merchCost: numeric(data['Merch Cost']),
      otherExpenses: numeric(data['Other Expenses']),
      gas: numeric(data.Gas),
      lodging: numeric(data.Lodging),
      totalExpenses: numeric(data['Total Expenses']),
      netIncome: numeric(data['Net Income']),
      bandPayout: numeric(data['Band Payout']),
      merchRevenue: sum(merchSalesRecords, 'Total Revenue'),
      merchUnits: sum(merchSalesRecords, 'Quantity Sold'),
    },
    notes: {
      advance: data['Advance Notes'] || '',
      production: data['Production Notes'] || '',
      show: data['Show Notes'] || '',
      sound: data['Sound Notes'] || '',
      merch: data['Merch Notes'] || '',
      settlement: data['Settlement Notes'] || '',
    },
    outcome: {
      actualAttendance: numeric(data['Actual Attendance']),
      grossTicketRevenue: numeric(data['Gross Ticket Revenue']),
      recap: data['Show Recap'] || '',
      lessonsLearned: data['Lessons Learned'] || '',
    },
  }

  model.version = buildDocumentVersion(model)
  model.documents = SHOW_DOCUMENT_KINDS.map(kind => ({
    ...kind,
    ...documentReadiness(model, kind.id),
  }))
  return model
}

export function documentFilename(model, kindId) {
  const kind = documentKind(kindId)
  if (!kind) throw new Error('Unknown show document type.')
  const date = String(model.date || 'date-tbd').replace(/[^0-9-]/g, '') || 'date-tbd'
  const band = (model.bandNames[0] || 'echo-play-live')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `${date}-${band || 'echo-play-live'}-${kindId}.pdf`
}
