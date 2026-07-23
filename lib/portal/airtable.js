import { createHash } from 'node:crypto'
import { daysUntilDate, formatDateOnly, isUpcomingDate } from '@/lib/date'
import {
  BLACKOUT_REASONS,
  acknowledgmentSummary,
  buildAcknowledgmentSnapshot,
  buildShowReadiness,
  displayList,
  findAvailabilityConflicts,
  formatSongDuration,
  linkedIds,
  memberRolesForShow,
  selectName,
  stableStringify,
} from '@/lib/portal/model.mjs'
import { formatDuration, formatPortalTime, normalizeRunOfShowSegments } from '@/lib/portal/runOfShow.mjs'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE || 'appYUOoJgvRyZ7fLB'
const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || process.env.AIRTABLE_TOKEN

const TABLES = {
  bands: 'BANDS',
  members: 'MEMBERS',
  crew: 'CREW',
  shows: 'SHOWS',
  venues: 'VENUES',
  blackouts: 'BLACKOUT DATES',
  setlists: 'SETLISTS',
  songs: 'SONGS',
  showSegments: 'SHOW SEGMENTS',
  acknowledgments: 'SHOW ACKNOWLEDGMENTS',
}

const GENERIC_PORTAL_ERROR = 'Portal information could not be loaded right now.'

function assertToken() {
  if (!AIRTABLE_API_TOKEN) {
    throw new Error('Missing portal data credential.')
  }
}

function tableUrl(table, params = {}) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`)

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  }

  return url
}

function recordUrl(table, id) {
  return new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}/${id}`)
}

async function airtableFetch(url, options = {}, attempt = 0) {
  assertToken()

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_TOKEN.trim()}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    cache: 'no-store',
  })

  if (response.status === 429 && attempt < 3) {
    await new Promise(resolve => setTimeout(resolve, 350 * (2 ** attempt)))
    return airtableFetch(url, options, attempt + 1)
  }

  if (!response.ok) {
    console.warn('[portal] Airtable request failed:', response.status)
    throw new Error(GENERIC_PORTAL_ERROR)
  }

  return response.json()
}

async function fetchRecords(table, params = {}) {
  const records = []
  let offset

  do {
    const url = tableUrl(table, {
      pageSize: '100',
      ...params,
      ...(offset ? { offset } : {}),
    })
    const data = await airtableFetch(url)
    records.push(...(data.records || []))
    offset = data.offset
  } while (offset && records.length < 500)

  return records
}

async function fetchRecord(table, id) {
  return airtableFetch(recordUrl(table, id))
}

async function createRecord(table, fields) {
  const data = await airtableFetch(tableUrl(table), {
    method: 'POST',
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  })
  return data.records?.[0] || null
}

async function updateRecord(table, id, fields) {
  return airtableFetch(recordUrl(table, id), {
    method: 'PATCH',
    body: JSON.stringify({ fields, typecast: true }),
  })
}

function includesLinked(value, id) {
  return linkedIds(value).includes(id)
}

function firstImage(value) {
  return Array.isArray(value) && value[0]?.url ? value[0].url : null
}

function getName(record, fields = ['Name', 'Member Name', 'Crew Name', 'Venue Name', 'Band Name']) {
  const recordFields = record?.fields || {}
  for (const field of fields) {
    if (recordFields[field]) return String(recordFields[field])
  }
  return '—'
}

function sortByDate(a, b) {
  const ad = a.fields?.Date || ''
  const bd = b.fields?.Date || ''
  return ad > bd ? 1 : ad < bd ? -1 : 0
}

function formatDate(value) {
  return formatDateOnly(value)
}

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
  }).format(date)
}

function mapById(records) {
  return new Map((records || []).map(record => [record.id, record]))
}

function linkedNames(ids, map, nameFields) {
  return linkedIds(ids).map(id => getName(map.get(id), nameFields)).filter(Boolean)
}

function safePortalError(error, fallback) {
  console.warn('[portal]', error?.message || fallback || GENERIC_PORTAL_ERROR)
  return fallback || GENERIC_PORTAL_ERROR
}

function normalizePerson(record, type = 'member') {
  const fields = record.fields || {}
  const name = type === 'member'
    ? getName(record, ['Member Name', 'Name'])
    : getName(record, ['Name', 'Crew Name', 'Member Name'])

  return {
    id: record.id,
    type,
    name,
    role: type === 'crew'
      ? selectName(fields.Role)
      : displayList(fields.Instruments).join(', '),
    active: fields.Active !== false,
    photo: firstImage(fields['Profile Photo'] || fields.Photo || fields['Logo/Photo']),
    phone: fields.Phone || '',
    email: fields.Email || '',
    company: fields['Company / Vendor'] || '',
    notes: fields.Notes || '',
    fields,
  }
}

function normalizeVenue(record) {
  const fields = record?.fields || {}
  return {
    id: record?.id || '',
    name: getName(record, ['Venue Name', 'Name']),
    address: fields.Address || '',
    ageRestriction: selectName(fields['Age Restriction'], 'TBD'),
    contactName: fields['Primary Contact Name'] || '',
    contactPhone: fields['Contact Phone'] || '',
    contactEmail: fields['Contact Email'] || '',
    website: fields.Website || '',
    stageSpecs: fields['Stage Specs'] || '',
    parkingNotes: fields['Parking Notes'] || '',
    greenRoom: fields['Green Room'] === true,
    houseConsole: fields['House Console'] || '',
    paSystem: fields['PA System'] || '',
    fohLocation: selectName(fields['FOH Location']),
    powerDrops: fields['Power Drops'] || '',
    soundNotes: fields['Sound Notes'] || '',
    photo: firstImage(fields.Photo),
  }
}

function normalizeShow(record, maps = {}) {
  const fields = record.fields || {}
  const venueIds = linkedIds(fields.Venue)
  const bandIds = linkedIds(fields.Band)
  const venueRecord = maps.venues?.get(venueIds[0])
  const venue = normalizeVenue(venueRecord)

  return {
    id: record.id,
    name: fields['Show Name'] || '',
    date: fields.Date || '',
    dateLabel: formatDate(fields.Date),
    daysUntil: daysUntilDate(fields.Date),
    bandIds,
    bandNames: linkedNames(bandIds, maps.bands, ['Band Name', 'Name']),
    venueId: venueIds[0] || '',
    venueName: venueRecord ? venue.name : 'Venue TBD',
    venueAddress: fields['Venue Address'] || fields.Address?.[0] || fields.Address || venue.address || '',
    trailerLoadIn: formatPortalTime(fields['Trailer Load-In Time'], ''),
    loadIn: formatPortalTime(fields['Load-In Time'], ''),
    soundCheck: formatPortalTime(fields['Sound Check Time'], ''),
    start: formatPortalTime(fields['Start Time'], ''),
    end: formatPortalTime(fields['End Time'], ''),
    indoorOutdoor: selectName(fields['Indoor / Outdoor'] || fields['Indoor/Outdoor']),
    ageRestriction: selectName(fields['Age Restriction']) || venue.ageRestriction || 'TBD',
    ticketPrice: fields['Ticket Price'] || '',
    ticketUrl: fields['Ticket URL'] || '',
    showNotes: fields['Show Notes'] || '',
    soundNotes: fields['Sound Notes'] || '',
    merchNotes: fields['Merch Notes'] || '',
    productionNotes: fields['Production Notes'] || '',
    driveFolder: fields['Drive Folder'] || '',
    memberIds: linkedIds(fields['Members Playing']),
    memberNames: linkedNames(fields['Members Playing'], maps.members, ['Member Name', 'Name']),
    soundEngineerIds: linkedIds(fields['Sound Engineer']),
    soundEngineerNames: linkedNames(fields['Sound Engineer'], maps.crew, ['Name', 'Crew Name']),
    merchPersonIds: linkedIds(fields['Merch Person']),
    merchPersonNames: linkedNames(fields['Merch Person'], maps.crew, ['Name', 'Crew Name']),
    setlistIds: linkedIds(fields.SETLISTS || fields.Setlist || fields.Setlists),
    segmentIds: linkedIds(fields['SHOW SEGMENTS']),
    raw: fields,
  }
}

function normalizedSetDuration(value) {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw === 'number') return formatDuration(raw / 60)
  return raw ? String(raw) : ''
}

function normalizeSong(record) {
  const fields = record?.fields || {}
  return {
    id: record?.id || '',
    title: fields['Song Title'] || fields.Title || 'Untitled Song',
    artist: fields.Artist || fields['Original Artist'] || '',
    album: fields.Album || '',
    year: fields.Year ? String(fields.Year) : '',
    duration: formatSongDuration(fields.Duration),
    notes: fields.Notes || '',
  }
}

function normalizeSetlist(record, maps = {}, songMap = new Map()) {
  const fields = record?.fields || {}
  const songIds = linkedIds(fields.Songs)
  return {
    id: record?.id || '',
    name: fields['Set Name'] || 'Setlist',
    duration: normalizedSetDuration(fields.Duration || fields['Set Length']),
    notes: fields.Notes || '',
    lastUpdated: fields['Last Updated'] || '',
    lastUpdatedLabel: fields['Last Updated'] ? formatDate(fields['Last Updated']) : '',
    bandNames: linkedNames(fields.Band, maps.bands, ['Band Name', 'Name']),
    songIds,
    songs: songIds.map(id => normalizeSong(songMap.get(id) || { id, fields: {} })),
  }
}

function normalizeBlackout(record) {
  const fields = record?.fields || {}
  return {
    id: record?.id || '',
    date: fields.Date || '',
    dateLabel: formatDate(fields.Date),
    endDate: fields['End Date'] || '',
    endDateLabel: fields['End Date'] ? formatDate(fields['End Date']) : '',
    reason: selectName(fields.Reason),
    notes: fields.Notes || '',
  }
}

function indexLinkedRecords(records, field) {
  const index = new Map()
  for (const record of records || []) {
    for (const id of linkedIds(record.fields?.[field])) {
      const current = index.get(id) || []
      current.push(record)
      index.set(id, current)
    }
  }
  return index
}

function recordsForShow(showRecord, data, kind) {
  if (kind === 'segments') {
    const linked = linkedIds(showRecord.fields?.['SHOW SEGMENTS'])
    const direct = linked.map(id => data.maps.segments.get(id)).filter(Boolean)
    const reverse = data.segmentsByShow.get(showRecord.id) || []
    return [...new Map([...direct, ...reverse].map(record => [record.id, record])).values()]
  }

  const linked = linkedIds(showRecord.fields?.SETLISTS || showRecord.fields?.Setlist || showRecord.fields?.Setlists)
  const direct = linked.map(id => data.maps.setlists.get(id)).filter(Boolean)
  const reverse = data.setlistsByShow.get(showRecord.id) || []
  return [...new Map([...direct, ...reverse].map(record => [record.id, record])).values()]
}

function crewRolesForShow(showRecord, crewId) {
  return [
    includesLinked(showRecord.fields?.['Sound Engineer'], crewId) ? 'Sound Engineer' : null,
    includesLinked(showRecord.fields?.['Merch Person'], crewId) ? 'Merch' : null,
  ].filter(Boolean)
}

function assignmentRoles(showRecord, personRecord, personType, data) {
  if (personType === 'crew') return crewRolesForShow(showRecord, personRecord.id)
  const show = normalizeShow(showRecord, data.maps)
  return memberRolesForShow(personRecord.fields || {}, show.bandNames)
}

function personIsAssigned(showRecord, personId, personType) {
  if (personType === 'member') return includesLinked(showRecord.fields?.['Members Playing'], personId)
  if (personType === 'crew') {
    return includesLinked(showRecord.fields?.['Sound Engineer'], personId)
      || includesLinked(showRecord.fields?.['Merch Person'], personId)
  }
  return false
}

function acknowledgmentFingerprint(snapshot) {
  return createHash('sha256').update(stableStringify(snapshot)).digest('hex')
}

function findAcknowledgment(data, showId, personId, personType) {
  return data.acknowledgments.find(record => {
    const fields = record.fields || {}
    const sameShow = includesLinked(fields.Show, showId)
    const samePerson = personType === 'member'
      ? includesLinked(fields.Member, personId)
      : includesLinked(fields.Crew, personId)
    return sameShow && samePerson
  }) || null
}

function acknowledgmentState(data, show, segments, setlists, person, personType, roles) {
  const snapshot = buildAcknowledgmentSnapshot({
    show,
    segments,
    setlists,
    personType,
    personId: person.id,
    roles,
  })
  const fingerprint = acknowledgmentFingerprint(snapshot)
  const record = findAcknowledgment(data, show.id, person.id, personType)
  const savedFingerprint = record?.fields?.['Content Fingerprint'] || ''
  const current = Boolean(record && savedFingerprint === fingerprint)

  return {
    recordId: record?.id || '',
    fingerprint,
    current,
    status: current ? 'acknowledged' : 'review',
    acknowledgedAt: current ? record.fields?.['Acknowledged At'] || '' : '',
    acknowledgedAtLabel: current ? formatDateTime(record.fields?.['Acknowledged At']) : '',
  }
}

function assignmentForShow(showRecord, personRecord, personType, data) {
  const show = normalizeShow(showRecord, data.maps)
  const roles = assignmentRoles(showRecord, personRecord, personType, data)
  const segments = normalizeRunOfShowSegments(recordsForShow(showRecord, data, 'segments'))
  const setlists = recordsForShow(showRecord, data, 'setlists')
    .map(record => normalizeSetlist(record, data.maps))
  const readiness = buildShowReadiness({
    show,
    segmentCount: segments.length,
    setlistCount: setlists.length,
    personType,
    roles,
  })
  const acknowledgment = acknowledgmentState(data, show, segments, setlists, personRecord, personType, roles)

  return {
    ...show,
    roles,
    readiness,
    acknowledgment,
  }
}

async function getBasePortalData() {
  const [members, crew, shows, venues, bands, blackouts, setlists, segments, acknowledgments] = await Promise.all([
    fetchRecords(TABLES.members),
    fetchRecords(TABLES.crew).catch(() => []),
    fetchRecords(TABLES.shows),
    fetchRecords(TABLES.venues),
    fetchRecords(TABLES.bands),
    fetchRecords(TABLES.blackouts).catch(() => []),
    fetchRecords(TABLES.setlists).catch(() => []),
    fetchRecords(TABLES.showSegments).catch(() => []),
    fetchRecords(TABLES.acknowledgments).catch(() => []),
  ])

  return {
    members,
    crew,
    shows,
    venues,
    bands,
    blackouts,
    setlists,
    segments,
    acknowledgments,
    maps: {
      members: mapById(members),
      crew: mapById(crew),
      shows: mapById(shows),
      venues: mapById(venues),
      bands: mapById(bands),
      setlists: mapById(setlists),
      segments: mapById(segments),
    },
    setlistsByShow: indexLinkedRecords(setlists, 'Show'),
    segmentsByShow: indexLinkedRecords(segments, 'Show'),
  }
}

function buildContact(record, type, role = '') {
  const person = normalizePerson(record, type === 'Band' ? 'member' : 'crew')
  return {
    id: person.id,
    name: person.name,
    type,
    role: role || person.role,
    phone: person.phone,
    email: person.email,
    company: person.company,
    photo: person.photo,
  }
}

function buildShowContacts(showRecord, data) {
  const memberContacts = linkedIds(showRecord.fields?.['Members Playing'])
    .map(id => data.maps.members.get(id))
    .filter(Boolean)
    .map(record => buildContact(record, 'Band', memberRolesForShow(
      record.fields || {},
      normalizeShow(showRecord, data.maps).bandNames
    ).join(' • ')))

  const crewIds = [...new Set([
    ...linkedIds(showRecord.fields?.['Sound Engineer']),
    ...linkedIds(showRecord.fields?.['Merch Person']),
  ])]
  const crewContacts = crewIds
    .map(id => data.maps.crew.get(id))
    .filter(Boolean)
    .map(record => buildContact(record, 'Crew', crewRolesForShow(showRecord, record.id).join(' • ')))

  return [...memberContacts, ...crewContacts]
}

export async function getPortalDirectory() {
  try {
    const data = await getBasePortalData()
    const upcomingShows = data.shows.filter(show => isUpcomingDate(show.fields?.Date)).length

    return {
      ok: true,
      error: null,
      members: data.members.map(record => normalizePerson(record, 'member')).filter(person => person.active),
      crew: data.crew.map(record => normalizePerson(record, 'crew')).filter(person => person.active),
      counts: { upcomingShows },
    }
  } catch (error) {
    return { ok: false, error: safePortalError(error), members: [], crew: [], counts: { upcomingShows: 0 } }
  }
}

export async function getMemberPortal(memberId) {
  try {
    const data = await getBasePortalData()
    const memberRecord = data.maps.members.get(memberId)
    if (!memberRecord) throw new Error('Member not found.')

    const assigned = data.shows
      .filter(show => personIsAssigned(show, memberId, 'member') && isUpcomingDate(show.fields?.Date))
      .sort(sortByDate)
      .map(show => assignmentForShow(show, memberRecord, 'member', data))

    const blackouts = data.blackouts
      .filter(record => includesLinked(record.fields?.Member, memberId))
      .sort(sortByDate)
      .map(normalizeBlackout)

    return {
      ok: true,
      error: null,
      person: normalizePerson(memberRecord, 'member'),
      shows: assigned,
      nextShow: assigned[0] || null,
      blackouts,
      conflicts: findAvailabilityConflicts(assigned, blackouts),
      needsReview: assigned.filter(show => !show.acknowledgment.current).length,
      needsInfo: assigned.filter(show => show.readiness.needsAttention).length,
    }
  } catch (error) {
    return {
      ok: false,
      error: safePortalError(error, 'Member portal failed to load.'),
      person: null,
      shows: [],
      blackouts: [],
      conflicts: [],
      needsReview: 0,
      needsInfo: 0,
    }
  }
}

export async function getCrewPortal(crewId) {
  try {
    const data = await getBasePortalData()
    const crewRecord = data.maps.crew.get(crewId)
    if (!crewRecord) throw new Error('Crew member not found.')

    const assigned = data.shows
      .filter(show => personIsAssigned(show, crewId, 'crew') && isUpcomingDate(show.fields?.Date))
      .sort(sortByDate)
      .map(show => assignmentForShow(show, crewRecord, 'crew', data))

    const blackouts = data.blackouts
      .filter(record => includesLinked(record.fields?.Crew, crewId))
      .sort(sortByDate)
      .map(normalizeBlackout)

    return {
      ok: true,
      error: null,
      person: normalizePerson(crewRecord, 'crew'),
      shows: assigned,
      nextShow: assigned[0] || null,
      blackouts,
      conflicts: findAvailabilityConflicts(assigned, blackouts),
      needsReview: assigned.filter(show => !show.acknowledgment.current).length,
      needsInfo: assigned.filter(show => show.readiness.needsAttention).length,
    }
  } catch (error) {
    return {
      ok: false,
      error: safePortalError(error, 'Crew portal failed to load.'),
      person: null,
      shows: [],
      blackouts: [],
      conflicts: [],
      needsReview: 0,
      needsInfo: 0,
    }
  }
}

export async function getPortalShow(showId, context = {}) {
  try {
    const data = await getBasePortalData()
    const showRecord = data.maps.shows.get(showId) || await fetchRecord(TABLES.shows, showId)
    const show = normalizeShow(showRecord, data.maps)
    const segmentRecords = recordsForShow(showRecord, data, 'segments')
    const segments = normalizeRunOfShowSegments(segmentRecords)
    const setlistRecords = recordsForShow(showRecord, data, 'setlists')
    const songs = setlistRecords.length ? await fetchRecords(TABLES.songs).catch(() => []) : []
    const songMap = mapById(songs)
    const setlists = setlistRecords.map(record => normalizeSetlist(record, data.maps, songMap))
    const venue = normalizeVenue(data.maps.venues.get(show.venueId))

    let personContext = null
    const personType = context.personType
    const personId = context.personId
    if (personType && personId) {
      const personRecord = personType === 'member'
        ? data.maps.members.get(personId)
        : data.maps.crew.get(personId)
      if (personRecord && personIsAssigned(showRecord, personId, personType)) {
        const roles = assignmentRoles(showRecord, personRecord, personType, data)
        personContext = {
          person: normalizePerson(personRecord, personType),
          roles,
          acknowledgment: acknowledgmentState(data, show, segments, setlists, personRecord, personType, roles),
        }
      }
    }

    const readiness = buildShowReadiness({
      show,
      segmentCount: segments.length,
      setlistCount: setlists.length,
      personType: personContext ? personType : '',
      roles: personContext?.roles || [],
    })

    return {
      ok: true,
      error: null,
      show,
      venue,
      contacts: buildShowContacts(showRecord, data),
      setlists,
      setlist: setlists[0] || null,
      segments,
      readiness,
      personContext,
    }
  } catch (error) {
    return {
      ok: false,
      error: safePortalError(error, 'Portal show failed to load.'),
      show: null,
      venue: null,
      contacts: [],
      setlists: [],
      setlist: null,
      segments: [],
      readiness: null,
      personContext: null,
    }
  }
}

export async function getPortalRunOfShow(showId) {
  try {
    const data = await getBasePortalData()
    const showRecord = data.maps.shows.get(showId) || await fetchRecord(TABLES.shows, showId)
    const segments = normalizeRunOfShowSegments(recordsForShow(showRecord, data, 'segments'))

    return {
      ok: true,
      error: null,
      show: normalizeShow(showRecord, data.maps),
      segments,
    }
  } catch (error) {
    return {
      ok: false,
      error: safePortalError(error, 'Run of show failed to load.'),
      show: null,
      segments: [],
    }
  }
}

export async function acknowledgePortalShow({
  showId,
  personType,
  personId,
  expectedFingerprint,
}) {
  if (!['member', 'crew'].includes(personType)) {
    return { ok: false, status: 400, error: 'A valid portal role is required.' }
  }

  const detail = await getPortalShow(showId, { personType, personId })
  if (!detail.ok || !detail.show) {
    return { ok: false, status: 404, error: detail.error || 'Show not found.' }
  }
  if (!detail.personContext) {
    return { ok: false, status: 403, error: 'This person is not assigned to the show.' }
  }

  const acknowledgment = detail.personContext.acknowledgment
  if (!expectedFingerprint || expectedFingerprint !== acknowledgment.fingerprint) {
    return {
      ok: false,
      status: 409,
      error: 'Show information changed while this page was open. Refresh and review the latest details.',
    }
  }

  const person = detail.personContext.person
  const now = new Date().toISOString()
  const fields = {
    'Acknowledgment Name': `${detail.show.name || `${detail.show.venueName} — ${detail.show.dateLabel}`} — ${person.name}`,
    Show: [showId],
    Member: personType === 'member' ? [personId] : [],
    Crew: personType === 'crew' ? [personId] : [],
    'Content Fingerprint': acknowledgment.fingerprint,
    'Acknowledged At': now,
    'Snapshot Summary': acknowledgmentSummary(detail.show, detail.personContext.roles),
  }

  const saved = acknowledgment.recordId
    ? await updateRecord(TABLES.acknowledgments, acknowledgment.recordId, fields)
    : await createRecord(TABLES.acknowledgments, fields)

  return {
    ok: true,
    status: 200,
    recordId: saved?.id || acknowledgment.recordId,
    fingerprint: acknowledgment.fingerprint,
    acknowledgedAt: now,
    acknowledgedAtLabel: formatDateTime(now),
  }
}

export async function createPortalBlackout({
  personType,
  personId,
  date,
  endDate,
  reason,
  notes,
}) {
  if (!['member', 'crew'].includes(personType)) {
    return { ok: false, status: 400, error: 'A valid portal role is required.' }
  }
  if (!/^rec[a-zA-Z0-9]{14}$/.test(String(personId || ''))) {
    return { ok: false, status: 400, error: 'A valid person is required.' }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) {
    return { ok: false, status: 400, error: 'Choose a valid start date.' }
  }
  if (endDate && (!/^\d{4}-\d{2}-\d{2}$/.test(String(endDate)) || endDate < date)) {
    return { ok: false, status: 400, error: 'End date must be on or after the start date.' }
  }
  if (!BLACKOUT_REASONS.includes(reason)) {
    return { ok: false, status: 400, error: 'Choose a valid reason.' }
  }

  const personRecord = await fetchRecord(personType === 'member' ? TABLES.members : TABLES.crew, personId)
    .catch(() => null)
  if (!personRecord || personRecord.fields?.Active === false) {
    return { ok: false, status: 404, error: 'Active portal person not found.' }
  }

  const fields = {
    Member: personType === 'member' ? [personId] : [],
    Crew: personType === 'crew' ? [personId] : [],
    Date: date,
    ...(endDate ? { 'End Date': endDate } : {}),
    Reason: reason,
    ...(notes?.trim() ? { Notes: notes.trim().slice(0, 2000) } : {}),
  }
  const record = await createRecord(TABLES.blackouts, fields)
  return {
    ok: true,
    status: 201,
    blackout: normalizeBlackout(record),
  }
}
