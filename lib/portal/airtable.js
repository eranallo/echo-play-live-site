import { daysUntilDate, formatDateOnly, isUpcomingDate, parseDateOnly, startOfToday } from '@/lib/date'

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

async function airtableFetch(url) {
  assertToken()

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_TOKEN.trim()}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

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
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}/${id}`)
  return airtableFetch(url)
}

function linkedIds(value) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
}

function includesLinked(value, id) {
  return linkedIds(value).includes(id)
}

function firstImage(value) {
  return Array.isArray(value) && value[0]?.url ? value[0].url : null
}

function getName(record, fields = ['Name', 'Member Name', 'Crew Name', 'Venue Name', 'Band Name']) {
  const f = record?.fields || {}
  for (const field of fields) {
    if (f[field]) return String(f[field])
  }
  return '—'
}

function dateValue(value) {
  return parseDateOnly(value)
}

function isUpcoming(value) {
  return isUpcomingDate(value)
}

function sortByDate(a, b) {
  const ad = a.fields?.Date || ''
  const bd = b.fields?.Date || ''
  return ad > bd ? 1 : ad < bd ? -1 : 0
}

function formatDate(value) {
  return formatDateOnly(value)
}

function formatTime(value) {
  if (!value) return 'TBD'
  return String(value)
}

function daysUntil(value) {
  return daysUntilDate(value)
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
  const f = record.fields || {}
  const name = type === 'member'
    ? getName(record, ['Member Name', 'Name'])
    : getName(record, ['Name', 'Crew Name', 'Member Name'])

  return {
    id: record.id,
    type,
    name,
    role: f.Role || f['Role/Instrument'] || (Array.isArray(f.Instruments) ? f.Instruments.join(', ') : f.Instruments) || '',
    active: f.Active !== false,
    photo: firstImage(f.Photo || f['Logo/Photo']),
    fields: f,
  }
}

function normalizeShow(record, maps = {}) {
  const f = record.fields || {}
  const venueIds = linkedIds(f.Venue)
  const bandIds = linkedIds(f.Band)
  const venue = maps.venues?.get(venueIds[0])

  return {
    id: record.id,
    date: f.Date || '',
    dateLabel: formatDate(f.Date),
    daysUntil: daysUntil(f.Date),
    bandNames: linkedNames(bandIds, maps.bands, ['Band Name', 'Name']),
    venueName: getName(venue, ['Venue Name', 'Name']) || 'Venue TBD',
    venueAddress: f['Venue Address'] || venue?.fields?.Address || '',
    venueCity: venue?.fields?.City || '',
    venueState: venue?.fields?.State || '',
    loadIn: formatTime(f['Load-In Time']),
    soundCheck: formatTime(f['Sound Check Time']),
    start: formatTime(f['Start Time']),
    end: formatTime(f['End Time']),
    indoorOutdoor: f['Indoor / Outdoor'] || f['Indoor/Outdoor'] || '',
    ageRestriction: f['Age Restriction'] || venue?.fields?.['Age Restriction'] || 'TBD',
    ticketPrice: f['Ticket Price'] || '',
    ticketUrl: f['Ticket URL'] || '',
    showNotes: f['Show Notes'] || '',
    soundNotes: f['Sound Notes'] || '',
    merchNotes: f['Merch Notes'] || '',
    memberNames: linkedNames(f['Members Playing'], maps.members, ['Member Name', 'Name']),
    soundEngineerNames: linkedNames(f['Sound Engineer'], maps.crew, ['Name', 'Crew Name']),
    merchPersonNames: linkedNames(f['Merch Person'], maps.crew, ['Name', 'Crew Name']),
    setlistIds: linkedIds(f.SETLISTS || f.Setlist || f.Setlists),
    raw: f,
  }
}

async function getBasePortalData() {
  const [members, crew, shows, venues, bands, blackouts] = await Promise.all([
    fetchRecords(TABLES.members),
    fetchRecords(TABLES.crew).catch(() => []),
    fetchRecords(TABLES.shows),
    fetchRecords(TABLES.venues),
    fetchRecords(TABLES.bands),
    fetchRecords(TABLES.blackouts).catch(() => []),
  ])

  return {
    members,
    crew,
    shows,
    venues,
    bands,
    blackouts,
    maps: {
      members: mapById(members),
      crew: mapById(crew),
      shows: mapById(shows),
      venues: mapById(venues),
      bands: mapById(bands),
    },
  }
}

export async function getPortalDirectory() {
  try {
    const data = await getBasePortalData()
    const upcomingShows = data.shows.filter(show => isUpcoming(show.fields?.Date)).length

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
      .filter(show => includesLinked(show.fields?.['Members Playing'], memberId) && isUpcoming(show.fields?.Date))
      .sort(sortByDate)
      .map(show => normalizeShow(show, data.maps))

    const blackouts = data.blackouts
      .filter(record => includesLinked(record.fields?.Member, memberId))
      .sort(sortByDate)
      .map(record => ({
        id: record.id,
        date: record.fields?.Date || '',
        dateLabel: formatDate(record.fields?.Date),
        endDate: record.fields?.['End Date'] || '',
        reason: record.fields?.Reason || '',
      }))

    return {
      ok: true,
      error: null,
      person: normalizePerson(memberRecord, 'member'),
      shows: assigned,
      nextShow: assigned[0] || null,
      blackouts,
    }
  } catch (error) {
    return { ok: false, error: safePortalError(error, 'Member portal failed to load.'), person: null, shows: [], blackouts: [] }
  }
}

export async function getCrewPortal(crewId) {
  try {
    const data = await getBasePortalData()
    const crewRecord = data.maps.crew.get(crewId)
    if (!crewRecord) throw new Error('Crew member not found.')

    const assigned = data.shows
      .filter(show => {
        const sound = includesLinked(show.fields?.['Sound Engineer'], crewId)
        const merch = includesLinked(show.fields?.['Merch Person'], crewId)
        return (sound || merch) && isUpcoming(show.fields?.Date)
      })
      .sort(sortByDate)
      .map(show => {
        const normalized = normalizeShow(show, data.maps)
        return {
          ...normalized,
          roles: [
            includesLinked(show.fields?.['Sound Engineer'], crewId) ? 'Sound' : null,
            includesLinked(show.fields?.['Merch Person'], crewId) ? 'Merch' : null,
          ].filter(Boolean),
        }
      })

    const blackouts = data.blackouts
      .filter(record => includesLinked(record.fields?.Crew, crewId))
      .sort(sortByDate)
      .map(record => ({
        id: record.id,
        date: record.fields?.Date || '',
        dateLabel: formatDate(record.fields?.Date),
        endDate: record.fields?.['End Date'] || '',
        reason: record.fields?.Reason || '',
      }))

    return {
      ok: true,
      error: null,
      person: normalizePerson(crewRecord, 'crew'),
      shows: assigned,
      nextShow: assigned[0] || null,
      blackouts,
    }
  } catch (error) {
    return { ok: false, error: safePortalError(error, 'Crew portal failed to load.'), person: null, shows: [], blackouts: [] }
  }
}

export async function getPortalShow(showId) {
  try {
    const data = await getBasePortalData()
    const showRecord = data.maps.shows.get(showId) || await fetchRecord(TABLES.shows, showId)
    const show = normalizeShow(showRecord, data.maps)

    let setlist = null
    if (show.setlistIds.length) {
      const [setlistRecords, songRecords] = await Promise.all([
        Promise.all(show.setlistIds.map(id => fetchRecord(TABLES.setlists, id).catch(() => null))),
        fetchRecords(TABLES.songs).catch(() => []),
      ])
      const songMap = mapById(songRecords)
      const primary = setlistRecords.find(Boolean)
      if (primary) {
        const songIds = linkedIds(primary.fields?.Songs)
        setlist = {
          id: primary.id,
          name: primary.fields?.['Set Name'] || 'Setlist',
          length: primary.fields?.['Set Length'] || '',
          songs: songIds.map(id => {
            const song = songMap.get(id)
            return {
              id,
              title: song?.fields?.['Song Title'] || song?.fields?.Title || 'Untitled Song',
              artist: song?.fields?.Artist || '',
            }
          }),
        }
      }
    }

    return { ok: true, error: null, show, setlist }
  } catch (error) {
    return { ok: false, error: safePortalError(error, 'Portal show failed to load.'), show: null, setlist: null }
  }
}
