const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appYUOoJgvRyZ7fLB'
const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN

const TABLES = {
  shows: process.env.AIRTABLE_SHOWS_TABLE || 'SHOWS',
  bands: process.env.AIRTABLE_BANDS_TABLE || 'BANDS',
  venues: process.env.AIRTABLE_VENUES_TABLE || 'VENUES',
}

function airtableUrl(table, params = {}) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`)

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  }

  return url
}

function normalizeLinkedIds(value) {
  if (!Array.isArray(value)) return []
  return value.filter(Boolean)
}

function firstLinkedName(ids, map, fallback = '—') {
  const id = ids?.[0]
  return id ? map.get(id) || id : fallback
}

function asBoolean(value) {
  return value === true
}

function dateValue(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(value) {
  const date = dateValue(value)
  if (!date) return 'Date TBD'

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Chicago',
  }).format(date)
}

function formatTime(value) {
  if (!value) return 'Time TBD'
  return String(value)
}

function getField(fields, name) {
  return fields?.[name]
}

async function fetchAirtableRecords(table, params = {}) {
  if (!AIRTABLE_API_TOKEN) {
    throw new Error('Missing AIRTABLE_API_TOKEN or AIRTABLE_PERSONAL_ACCESS_TOKEN')
  }

  const records = []
  let offset

  do {
    const url = airtableUrl(table, {
      pageSize: '100',
      ...params,
      ...(offset ? { offset } : {}),
    })

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_TOKEN.trim()}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Airtable ${table} request failed (${response.status}): ${text.slice(0, 240)}`)
    }

    const data = await response.json()
    records.push(...(data.records || []))
    offset = data.offset
  } while (offset && records.length < 500)

  return records
}

async function getRecordNameMap(table, nameField) {
  const records = await fetchAirtableRecords(table, {
    [`fields[]`]: nameField,
  })

  return new Map(
    records.map(record => [record.id, record.fields?.[nameField] || record.id])
  )
}

function getMissingFlags(fields) {
  const flags = []

  if (!asBoolean(getField(fields, 'Contract Signed'))) flags.push('Contract')
  if (!asBoolean(getField(fields, 'Graphic Created'))) flags.push('Graphic')
  if (!asBoolean(getField(fields, 'Facebook Event Created'))) flags.push('FB Event')
  if (!asBoolean(getField(fields, 'Bandsintown Posted'))) flags.push('Bandsintown')

  if (!getField(fields, 'Start Time')) flags.push('Start Time')
  if (!getField(fields, 'Age Restriction')) flags.push('Age')

  const ticketPrice = getField(fields, 'Ticket Price')
  const ticketUrl = getField(fields, 'Ticket URL')
  const isFree = typeof ticketPrice === 'string' && ticketPrice.toLowerCase().includes('free')

  if (!ticketPrice && !ticketUrl && !isFree) flags.push('Ticket Info')

  return flags
}

export async function getAdminShowsOverview() {
  if (!AIRTABLE_API_TOKEN) {
    return {
      ok: false,
      error: 'Missing AIRTABLE_API_TOKEN or AIRTABLE_PERSONAL_ACCESS_TOKEN in Vercel.',
      shows: [],
      counts: { total: 0, needsAttention: 0 },
    }
  }

  try {
    const [bandMap, venueMap, showRecords] = await Promise.all([
      getRecordNameMap(TABLES.bands, 'Band Name'),
      getRecordNameMap(TABLES.venues, 'Venue Name'),
      fetchAirtableRecords(TABLES.shows, {
        'sort[0][field]': 'Date',
        'sort[0][direction]': 'asc',
        maxRecords: '24',
      }),
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcoming = showRecords
      .filter(record => {
        const date = dateValue(record.fields?.Date)
        return !date || date >= today
      })
      .slice(0, 12)
      .map(record => {
        const fields = record.fields || {}
        const bandIds = normalizeLinkedIds(fields.Band)
        const venueIds = normalizeLinkedIds(fields.Venue)
        const missingFlags = getMissingFlags(fields)

        return {
          id: record.id,
          date: fields.Date || null,
          dateLabel: formatDate(fields.Date),
          band: firstLinkedName(bandIds, bandMap),
          venue: firstLinkedName(venueIds, venueMap),
          status: fields.Status || 'No Status',
          startTime: formatTime(fields['Start Time']),
          ageRestriction: fields['Age Restriction'] || 'TBD',
          ticketPrice: fields['Ticket Price'] || '',
          ticketUrl: fields['Ticket URL'] || '',
          contractSigned: asBoolean(fields['Contract Signed']),
          graphicCreated: asBoolean(fields['Graphic Created']),
          facebookEventCreated: asBoolean(fields['Facebook Event Created']),
          bandsintownPosted: asBoolean(fields['Bandsintown Posted']),
          promotionReleased: asBoolean(fields['Promotion Released']),
          missingFlags,
          needsAttention: missingFlags.length > 0,
        }
      })

    return {
      ok: true,
      error: null,
      shows: upcoming,
      counts: {
        total: upcoming.length,
        needsAttention: upcoming.filter(show => show.needsAttention).length,
      },
    }
  } catch (error) {
    return {
      ok: false,
      error: error?.message || 'Unknown Airtable error',
      shows: [],
      counts: { total: 0, needsAttention: 0 },
    }
  }
}
