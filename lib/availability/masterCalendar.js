import { TABLES, authHeaders, tableUrl } from '@/lib/airtable'

const TIME_ZONE = 'America/Chicago'
const ROLLING_MONTHS = 12
const HISTORY_MONTHS = 12
const MAX_RECORDS = 8000
const RESPONSE_CHOICES = new Set(['Available', 'Maybe', 'Unavailable'])
const REASON_CHOICES = new Set(['Personal', 'Family', 'Vacation', 'Other Gig', 'Other'])
const BOOKED_SHOW_STATUSES = new Set(['Confirmed'])
const BOOKED_LIFECYCLE_STAGES = new Set(['Confirmed', 'Advancing', 'Ready'])
const CANCELED_SHOW_STATUSES = new Set(['Cancelled', 'Canceled'])
const MANAGED_BLACKOUT_MARKER = 'Added through the master EPL availability dashboard.'

function getApiToken() {
  return process.env.AIRTABLE_API_TOKEN
    || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
    || process.env.AIRTABLE_TOKEN
    || ''
}

function assertConfigured() {
  if (!getApiToken()) throw new Error('Availability is not configured on the server.')
}

function linkedIds(value) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
}

function firstLinkedId(value) {
  return linkedIds(value)[0] || null
}

function cleanText(value, max = 500) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function validToken(value) {
  return typeof value === 'string'
    && value.length >= 20
    && value.length <= 200
    && /^[A-Za-z0-9_-]+$/.test(value)
}

async function airtableRequest(url, options = {}) {
  assertConfigured()

  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(getApiToken().trim()),
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const detail = await response.text()
    console.error('[master-availability] Airtable request failed:', response.status, detail.slice(0, 600))
    throw new Error('Availability information could not be saved right now.')
  }

  return response.json()
}

async function listRecords(tableId) {
  const records = []
  let offset = null

  do {
    const url = new URL(tableUrl(tableId))
    url.searchParams.set('pageSize', '100')
    if (offset) url.searchParams.set('offset', offset)

    const data = await airtableRequest(url)
    records.push(...(data.records || []))
    offset = data.offset || null
  } while (offset && records.length < MAX_RECORDS)

  return records
}

async function createRecords(tableId, records) {
  const created = []

  for (let index = 0; index < records.length; index += 10) {
    const chunk = records.slice(index, index + 10)
    const data = await airtableRequest(tableUrl(tableId), {
      method: 'POST',
      body: JSON.stringify({ records: chunk, typecast: true }),
    })
    created.push(...(data.records || []))
  }

  return created
}

async function updateRecords(tableId, records) {
  const updated = []

  for (let index = 0; index < records.length; index += 10) {
    const chunk = records.slice(index, index + 10)
    const data = await airtableRequest(tableUrl(tableId), {
      method: 'PATCH',
      body: JSON.stringify({ records: chunk, typecast: true }),
    })
    updated.push(...(data.records || []))
  }

  return updated
}

async function deleteRecord(tableId, recordId) {
  if (!recordId) return null
  return airtableRequest(`${tableUrl(tableId)}/${recordId}`, { method: 'DELETE' })
}

function mapById(records) {
  return new Map((records || []).map(record => [record.id, record]))
}

function dateParts(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return { year: values.year, month: values.month, day: values.day }
}

function localDateKey(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parts = dateParts(value)
  return parts ? `${parts.year}-${parts.month}-${parts.day}` : ''
}

function todayKey() {
  return localDateKey(new Date().toISOString())
}

function monthKeyFromDateKey(dateKey) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey || '') ? dateKey.slice(0, 7) : ''
}

function addMonths(monthKey, amount) {
  const [year, month] = String(monthKey).split('-').map(Number)
  if (!year || !month) return ''
  const date = new Date(Date.UTC(year, month - 1 + amount, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function rollingMonthKeys(startMonthKey, count = ROLLING_MONTHS) {
  return Array.from({ length: count }, (_, index) => addMonths(startMonthKey, index))
}

function dateKeyToUtc(dateKey) {
  return new Date(`${dateKey}T12:00:00.000Z`)
}

function addDaysKey(dateKey, amount) {
  const date = dateKeyToUtc(dateKey)
  date.setUTCDate(date.getUTCDate() + amount)
  return date.toISOString().slice(0, 10)
}

function daysInMonth(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function dateKeysForMonth(monthKey) {
  return Array.from({ length: daysInMonth(monthKey) }, (_, index) => (
    `${monthKey}-${String(index + 1).padStart(2, '0')}`
  ))
}

function weekdayIndex(dateKey) {
  return dateKeyToUtc(dateKey).getUTCDay()
}

function isWeekendDate(dateKey) {
  const weekday = weekdayIndex(dateKey)
  return weekday === 0 || weekday === 5 || weekday === 6
}

function weekendKey(dateKey) {
  const weekday = weekdayIndex(dateKey)
  if (weekday === 5) return addDaysKey(dateKey, 2)
  if (weekday === 6) return addDaysKey(dateKey, 1)
  if (weekday === 0) return dateKey
  return ''
}

function formatMonth(monthKey, short = false) {
  const [year, month] = String(monthKey).split('-').map(Number)
  if (!year || !month) return 'Month not set'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: short ? 'short' : 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

function formatDate(dateKey) {
  if (!dateKey) return 'Date not set'
  const date = dateKeyToUtc(dateKey)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatTime(value) {
  if (!value) return 'TBD'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'TBD'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatTimeRange(start, end) {
  if (!start && !end) return 'Time TBD'
  if (!end) return formatTime(start)
  return `${formatTime(start)} to ${formatTime(end)}`
}

function timeZoneOffsetMs(instant, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant)

  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  )
  return asUtc - instant.getTime()
}

function localDateTimeToIso(dateKey, timeValue) {
  const [year, month, day] = String(dateKey).split('-').map(Number)
  const [hour, minute] = String(timeValue).split(':').map(Number)
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return ''

  const wallClockUtc = Date.UTC(year, month - 1, day, hour, minute, 0)
  let instant = new Date(wallClockUtc)
  for (let pass = 0; pass < 2; pass += 1) {
    instant = new Date(wallClockUtc - timeZoneOffsetMs(instant, TIME_ZONE))
  }
  return instant.toISOString()
}

function practiceRule(record) {
  const fields = record?.fields || {}
  if (fields['Availability Dashboard Enabled'] !== true) return null

  const cadence = fields['Practice Cadence']
  const intervalDays = cadence === 'Weekly' ? 7 : cadence === 'Every Other Week' ? 14 : 0
  const anchorDate = fields['Practice Anchor Date'] || ''
  const startTime = fields['Practice Start Time'] || ''
  const durationHours = Number(fields['Practice Duration Hours'] || 0)

  if (!intervalDays || !/^\d{4}-\d{2}-\d{2}$/.test(anchorDate) || !/^\d{2}:\d{2}$/.test(startTime) || durationHours <= 0) {
    return null
  }

  return {
    bandId: record.id,
    bandName: fields['Band Name'] || 'Echo Play Live',
    intervalDays,
    anchorDate,
    startTime,
    durationHours,
    location: fields['Practice Location'] || '',
  }
}

function buildPracticeEvents(bands, startMonthKey, monthCount, memberMap = null) {
  const windowStart = `${startMonthKey}-01`
  const windowEnd = `${addMonths(startMonthKey, monthCount)}-01`
  const events = []

  for (const band of bands) {
    const rule = practiceRule(band)
    if (!rule) continue

    let dateKey = rule.anchorDate
    while (dateKey < windowStart) dateKey = addDaysKey(dateKey, rule.intervalDays)

    while (dateKey < windowEnd) {
      const start = localDateTimeToIso(dateKey, rule.startTime)
      const end = start ? new Date(new Date(start).getTime() + rule.durationHours * 3600000).toISOString() : ''
      const memberIds = memberMap
        ? [...memberMap.values()].filter(member => linkedIds(member.fields?.['Primary Bands']).includes(rule.bandId)).map(member => member.id)
        : []

      events.push({
        id: `practice:${rule.bandId}:${dateKey}`,
        kind: 'practice',
        dateKey,
        bandId: rule.bandId,
        bandName: rule.bandName,
        title: `${rule.bandName} Practice`,
        start,
        end,
        timeLabel: formatTimeRange(start, end),
        location: rule.location,
        memberIds,
      })

      dateKey = addDaysKey(dateKey, rule.intervalDays)
    }
  }

  return events
}

function showCountsTowardLimit(fields) {
  return BOOKED_SHOW_STATUSES.has(fields.Status)
    || BOOKED_LIFECYCLE_STAGES.has(fields['Lifecycle Stage'])
}

function showCanceled(fields) {
  return CANCELED_SHOW_STATUSES.has(fields.Status)
    || CANCELED_SHOW_STATUSES.has(fields['Lifecycle Stage'])
}

function normalizeShows(shows, members, bandMap, venueMap) {
  const activeMembers = members.filter(record => record.fields?.Active !== false)

  return shows.map(record => {
    const fields = record.fields || {}
    if (showCanceled(fields)) return null

    const dateKey = localDateKey(fields.Date || fields['Start Time'])
    if (!dateKey) return null

    const bandIds = linkedIds(fields.Band)
    const explicitMemberIds = linkedIds(fields['Members Playing'])
    const memberIds = explicitMemberIds.length > 0
      ? explicitMemberIds
      : activeMembers
          .filter(member => linkedIds(member.fields?.['Primary Bands']).some(id => bandIds.includes(id)))
          .map(member => member.id)

    const venueId = firstLinkedId(fields.Venue)
    const venue = venueMap.get(venueId)
    const bandNames = bandIds.map(id => bandMap.get(id)?.fields?.['Band Name']).filter(Boolean)

    return {
      id: record.id,
      kind: 'show',
      dateKey,
      title: fields['Show Name'] || `${bandNames.join(' + ') || 'EPL'} Show`,
      bandIds,
      bandNames,
      venueId,
      venueName: venue?.fields?.['Venue Name'] || 'Venue TBD',
      venueAddress: venue?.fields?.Address || '',
      status: fields.Status || fields['Lifecycle Stage'] || 'Scheduled',
      lifecycleStage: fields['Lifecycle Stage'] || '',
      start: fields['Start Time'] || '',
      end: fields['End Time'] || '',
      timeLabel: formatTimeRange(fields['Start Time'], fields['End Time']),
      memberIds,
      explicitMemberIds,
      rosterAssumed: explicitMemberIds.length === 0,
      countsTowardLimit: showCountsTowardLimit(fields),
      isHold: fields.Status === 'Hold' || fields['Lifecycle Stage'] === 'Tentative',
    }
  }).filter(Boolean)
}

function responseTimestamp(record) {
  const value = record?.fields?.['Responded At'] || record?.createdTime || ''
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

function generalResponseMap(responses) {
  const map = new Map()

  for (const record of responses) {
    const fields = record.fields || {}
    if (fields['Entry Type'] !== 'General Day' || !fields['Availability Date']) continue
    const memberId = firstLinkedId(fields.Member)
    const dateKey = fields['Availability Date']
    if (!memberId || !dateKey) continue

    const key = `${memberId}:${dateKey}`
    const existing = map.get(key)
    if (!existing || responseTimestamp(record) >= responseTimestamp(existing)) map.set(key, record)
  }

  return map
}

function blackoutsForDate(blackouts, memberId, dateKey) {
  return blackouts.filter(record => {
    const fields = record.fields || {}
    if (!linkedIds(fields.Member).includes(memberId)) return false
    const start = fields.Date || ''
    const end = fields['End Date'] || start
    return Boolean(start && dateKey >= start && dateKey <= end)
  })
}

function managedBlackout(record) {
  return String(record?.fields?.Notes || '').includes(MANAGED_BLACKOUT_MARKER)
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function memberRules(member) {
  const fields = member?.fields || {}
  return {
    maxWeekendCommitments: numberOrNull(fields['Max Weekend Commitments / Month']),
    maxShows: numberOrNull(fields['Max Shows / Month']),
    mode: fields['Booking Limit Mode'] || 'Warning Only',
    notes: fields['Availability Rule Notes'] || '',
  }
}

function dayResponseState(record, globalBlackout) {
  const fields = record?.fields || {}
  if (record) {
    return {
      recordId: record.id,
      response: fields.Response || 'Pending',
      reason: fields.Reason || '',
      notes: fields.Notes || '',
      respondedAt: fields['Responded At'] || '',
      hardBlackout: fields['Hard Blackout'] === true,
      linkedBlackoutId: firstLinkedId(fields['Linked Blackout']),
      source: 'Dashboard',
    }
  }

  if (globalBlackout) {
    return {
      recordId: null,
      response: 'Unavailable',
      reason: globalBlackout.fields?.Reason || 'Personal',
      notes: globalBlackout.fields?.Notes || '',
      respondedAt: '',
      hardBlackout: true,
      linkedBlackoutId: globalBlackout.id,
      source: 'Blackout',
    }
  }

  return {
    recordId: null,
    response: 'Pending',
    reason: '',
    notes: '',
    respondedAt: '',
    hardBlackout: false,
    linkedBlackoutId: null,
    source: 'Unanswered',
  }
}

function buildMemberDay({ member, dateKey, responseMap, blackouts, practices, shows, bandMap, editable }) {
  const memberId = member.id
  const responseRecord = responseMap.get(`${memberId}:${dateKey}`)
  const dateBlackouts = blackoutsForDate(blackouts, memberId, dateKey)
  const globalBlackout = dateBlackouts.find(record => linkedIds(record.fields?.['Affects Bands']).length === 0) || null
  const state = dayResponseState(responseRecord, globalBlackout)
  const dayPractices = practices.filter(event => event.dateKey === dateKey && event.memberIds.includes(memberId))
  const dayShows = shows.filter(event => event.dateKey === dateKey && event.memberIds.includes(memberId))
  const bookedShows = dayShows.filter(show => show.countsTowardLimit)
  const conflict = (
    (bookedShows.length > 0 && state.response !== 'Available')
    || (dayPractices.length > 0 && state.response === 'Unavailable')
  )

  const bandSpecificBlackouts = dateBlackouts
    .filter(record => linkedIds(record.fields?.['Affects Bands']).length > 0)
    .map(record => ({
      id: record.id,
      reason: record.fields?.Reason || 'Blackout',
      notes: record.fields?.Notes || '',
      bandIds: linkedIds(record.fields?.['Affects Bands']),
      bandNames: linkedIds(record.fields?.['Affects Bands'])
        .map(id => bandMap.get(id)?.fields?.['Band Name'])
        .filter(Boolean),
    }))

  return {
    dateKey,
    monthKey: monthKeyFromDateKey(dateKey),
    day: Number(dateKey.slice(8, 10)),
    weekday: weekdayIndex(dateKey),
    weekend: isWeekendDate(dateKey),
    weekendKey: weekendKey(dateKey),
    dateLabel: formatDate(dateKey),
    editable,
    ...state,
    practices: dayPractices,
    shows: dayShows,
    booked: bookedShows.length > 0,
    conflict,
    bandSpecificBlackouts,
    globalBlackout: globalBlackout ? {
      id: globalBlackout.id,
      reason: globalBlackout.fields?.Reason || 'Blackout',
      notes: globalBlackout.fields?.Notes || '',
      managed: managedBlackout(globalBlackout),
    } : null,
  }
}

function buildLimitSummary(member, monthKey, days, shows) {
  const rules = memberRules(member)
  const availableWeekendKeys = [...new Set(days
    .filter(day => day.response === 'Available' && day.weekendKey)
    .map(day => day.weekendKey))]
  const bookedWeekendKeys = [...new Set(shows
    .filter(show => show.countsTowardLimit && show.memberIds.includes(member.id) && monthKeyFromDateKey(show.dateKey) === monthKey && weekendKey(show.dateKey))
    .map(show => weekendKey(show.dateKey)))]
  const committedWeekendKeys = [...new Set([...availableWeekendKeys, ...bookedWeekendKeys])]
  const bookedShows = shows.filter(show => (
    show.countsTowardLimit
    && show.memberIds.includes(member.id)
    && monthKeyFromDateKey(show.dateKey) === monthKey
  ))

  const weekendCount = committedWeekendKeys.length
  const showCount = bookedShows.length
  const weekendOver = rules.maxWeekendCommitments !== null && weekendCount > rules.maxWeekendCommitments
  const weekendAt = rules.maxWeekendCommitments !== null && weekendCount === rules.maxWeekendCommitments
  const showOver = rules.maxShows !== null && showCount > rules.maxShows
  const showAt = rules.maxShows !== null && showCount === rules.maxShows
  const warnings = []

  if (weekendOver) warnings.push(`${weekendCount} committed weekends exceeds the limit of ${rules.maxWeekendCommitments}.`)
  else if (weekendAt) warnings.push(`Weekend limit reached: ${weekendCount} of ${rules.maxWeekendCommitments}.`)

  if (showOver) warnings.push(`${showCount} booked shows exceeds the limit of ${rules.maxShows}.`)
  else if (showAt) warnings.push(`Show limit reached: ${showCount} of ${rules.maxShows}.`)

  return {
    ...rules,
    monthKey,
    availableWeekendKeys,
    bookedWeekendKeys,
    committedWeekendKeys,
    availableWeekends: availableWeekendKeys.length,
    bookedWeekends: bookedWeekendKeys.length,
    committedWeekends: weekendCount,
    bookedShows: showCount,
    weekendAtLimit: weekendAt,
    weekendOverLimit: weekendOver,
    showAtLimit: showAt,
    showOverLimit: showOver,
    remainingWeekendCommitments: rules.maxWeekendCommitments === null
      ? null
      : Math.max(0, rules.maxWeekendCommitments - weekendCount),
    remainingShows: rules.maxShows === null ? null : Math.max(0, rules.maxShows - showCount),
    warnings,
  }
}

async function loadBaseData() {
  const [members, bands, shows, venues, blackouts, responses, participants] = await Promise.all([
    listRecords(TABLES.MEMBERS),
    listRecords(TABLES.BANDS),
    listRecords(TABLES.SHOWS),
    listRecords(TABLES.VENUES),
    listRecords(TABLES.BLACKOUTS),
    listRecords(TABLES.AVAILABILITY_RESPONSES),
    listRecords(TABLES.AVAILABILITY_PARTICIPANTS).catch(() => []),
  ])

  return { members, bands, shows, venues, blackouts, responses, participants }
}

function memberByToken(data, token) {
  const direct = data.members.find(record => record.fields?.['Availability Dashboard Token'] === token)
  if (direct) return direct

  const participant = data.participants.find(record => record.fields?.['Secure Token'] === token)
  const memberId = firstLinkedId(participant?.fields?.Member)
  return memberId ? data.members.find(record => record.id === memberId) || null : null
}

function historyMonthKeysForMember({ member, responseMap, shows, practices, currentMonthKey }) {
  const keys = new Set()

  for (const [key] of responseMap) {
    if (!key.startsWith(`${member.id}:`)) continue
    const dateKey = key.slice(member.id.length + 1)
    const monthKey = monthKeyFromDateKey(dateKey)
    if (monthKey && monthKey < currentMonthKey) keys.add(monthKey)
  }

  shows.filter(show => show.memberIds.includes(member.id)).forEach(show => {
    const monthKey = monthKeyFromDateKey(show.dateKey)
    if (monthKey && monthKey < currentMonthKey) keys.add(monthKey)
  })

  practices.filter(event => event.memberIds.includes(member.id)).forEach(event => {
    const monthKey = monthKeyFromDateKey(event.dateKey)
    if (monthKey && monthKey < currentMonthKey) keys.add(monthKey)
  })

  return [...keys].sort().reverse().slice(0, HISTORY_MONTHS)
}

function monthPayload({ member, monthKey, responseMap, blackouts, practices, shows, bandMap, currentMonthKey, today, readOnly = false }) {
  const days = dateKeysForMonth(monthKey).map(dateKey => buildMemberDay({
    member,
    dateKey,
    responseMap,
    blackouts,
    practices,
    shows,
    bandMap,
    editable: !readOnly && dateKey >= today,
  }))

  return {
    key: monthKey,
    label: formatMonth(monthKey),
    shortLabel: formatMonth(monthKey, true),
    isCurrent: monthKey === currentMonthKey,
    readOnly,
    firstWeekday: weekdayIndex(`${monthKey}-01`),
    days,
    limitSummary: buildLimitSummary(member, monthKey, days, shows),
  }
}

export async function getMasterAvailabilityByToken(token) {
  if (!validToken(token)) return { ok: false, status: 404, error: 'This private availability link is not valid.' }

  try {
    const data = await loadBaseData()
    const member = memberByToken(data, token)
    if (!member) return { ok: false, status: 404, error: 'This private availability link is not valid.' }

    const memberMap = mapById(data.members.filter(record => record.fields?.Active !== false))
    const bandMap = mapById(data.bands)
    const venueMap = mapById(data.venues)
    const currentMonthKey = monthKeyFromDateKey(todayKey())
    const monthKeys = rollingMonthKeys(currentMonthKey)
    const historyStartMonth = addMonths(currentMonthKey, -HISTORY_MONTHS)
    const practices = buildPracticeEvents(data.bands, historyStartMonth, HISTORY_MONTHS + ROLLING_MONTHS, memberMap)
    const shows = normalizeShows(data.shows, data.members, bandMap, venueMap)
    const responseMap = generalResponseMap(data.responses)
    const historyKeys = historyMonthKeysForMember({ member, responseMap, shows, practices, currentMonthKey })
    const today = todayKey()

    const months = monthKeys.map(monthKey => monthPayload({
      member,
      monthKey,
      responseMap,
      blackouts: data.blackouts,
      practices,
      shows,
      bandMap,
      currentMonthKey,
      today,
    }))

    const historyMonths = historyKeys.map(monthKey => monthPayload({
      member,
      monthKey,
      responseMap,
      blackouts: data.blackouts,
      practices,
      shows,
      bandMap,
      currentMonthKey,
      today,
      readOnly: true,
    }))

    const bandIds = linkedIds(member.fields?.['Primary Bands'])
    const bandNames = bandIds.map(id => bandMap.get(id)?.fields?.['Band Name']).filter(Boolean)
    const activeDays = months.flatMap(month => month.days).filter(day => day.editable)
    const answeredDays = activeDays.filter(day => day.response !== 'Pending').length
    const conflictDays = activeDays.filter(day => day.conflict).length

    return {
      ok: true,
      status: 200,
      data: {
        memberId: member.id,
        memberName: member.fields?.['Member Name'] || 'Band Member',
        memberEmail: member.fields?.Email || '',
        bandIds,
        bandNames,
        rules: memberRules(member),
        currentMonthKey,
        todayKey: today,
        rangeLabel: `${formatMonth(monthKeys[0])} to ${formatMonth(monthKeys[monthKeys.length - 1])}`,
        months,
        historyMonths,
        summary: {
          activeDays: activeDays.length,
          answeredDays,
          unansweredDays: activeDays.length - answeredDays,
          conflicts: conflictDays,
        },
      },
    }
  } catch (error) {
    console.error('[master-availability] load failed:', error)
    return { ok: false, status: 500, error: 'The availability calendar could not be loaded right now.' }
  }
}

function normalizeAnswer(rawAnswer) {
  const dateKey = cleanText(rawAnswer?.dateKey, 10)
  const response = cleanText(rawAnswer?.response, 30)
  const reason = cleanText(rawAnswer?.reason, 40)
  const notes = cleanText(rawAnswer?.notes, 500)
  const hardBlackout = rawAnswer?.hardBlackout === true

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return { ok: false, error: 'Choose a valid date.' }
  if (!RESPONSE_CHOICES.has(response)) return { ok: false, error: 'Choose Available, Maybe, or Unavailable.' }
  if ((response === 'Maybe' || response === 'Unavailable') && !REASON_CHOICES.has(reason)) {
    return { ok: false, error: 'Choose a reason for Maybe or Unavailable.' }
  }

  return {
    ok: true,
    answer: {
      dateKey,
      response,
      reason: response === 'Available' ? '' : reason,
      notes,
      hardBlackout: response === 'Unavailable' && hardBlackout,
    },
  }
}

function responseSnapshot(record) {
  const fields = record?.fields || {}
  return {
    response: fields.Response || 'Pending',
    reason: fields.Reason || '',
    notes: fields.Notes || '',
    hardBlackout: fields['Hard Blackout'] === true,
    linkedBlackoutId: firstLinkedId(fields['Linked Blackout']),
  }
}

function exactGlobalBlackout(blackouts, memberId, dateKey) {
  return blackouts.find(record => {
    const fields = record.fields || {}
    return linkedIds(fields.Member).includes(memberId)
      && fields.Date === dateKey
      && (fields['End Date'] || fields.Date) === dateKey
      && linkedIds(fields['Affects Bands']).length === 0
  }) || null
}

function proposedResponseMap(responseMap, memberId, dateKey, answer, existingRecord) {
  const next = new Map(responseMap)
  next.set(`${memberId}:${dateKey}`, {
    id: existingRecord?.id || 'proposed',
    createdTime: new Date().toISOString(),
    fields: {
      ...(existingRecord?.fields || {}),
      Member: [memberId],
      'Availability Date': dateKey,
      'Entry Type': 'General Day',
      'Applies EPL-Wide': true,
      Response: answer.response,
      Reason: answer.reason,
      Notes: answer.notes,
      'Hard Blackout': answer.hardBlackout,
      'Responded At': new Date().toISOString(),
    },
  })
  return next
}

async function queueChangeNotification({ member, answer, previous, practices, shows, bandMap, now }) {
  const bookedConflict = shows.some(show => show.countsTowardLimit) && answer.response !== 'Available'
  const practiceConflict = practices.length > 0 && answer.response === 'Unavailable'
  const changedExisting = previous.response !== 'Pending' && previous.response !== answer.response

  if (!changedExisting && !bookedConflict && !practiceConflict) return false

  try {
    const memberName = member.fields?.['Member Name'] || 'Band member'
    const memberEmail = member.fields?.Email || ''
    const affectedBandIds = [...new Set([
      ...practices.map(item => item.bandId),
      ...shows.flatMap(item => item.bandIds),
    ])]
    const eventLines = []

    practices.forEach(item => eventLines.push(`Practice: ${item.title} (${item.timeLabel})`))
    shows.forEach(item => eventLines.push(`Show: ${item.title} at ${item.venueName} (${item.status})`))

    const lines = [
      `${memberName} updated EPL availability for ${formatDate(answer.dateKey)}.`,
      `Previous answer: ${previous.response}`,
      `New answer: ${answer.response}`,
    ]
    if (answer.reason) lines.push(`Reason: ${answer.reason}`)
    if (answer.notes) lines.push(`Note: ${answer.notes}`)
    if (eventLines.length) lines.push('', ...eventLines)

    const critical = bookedConflict || practiceConflict
    const subjectPrefix = critical ? 'Scheduling conflict' : 'Availability changed'

    await createRecords(TABLES.COMMUNICATIONS, [{
      fields: {
        Date: localDateKey(now),
        Type: 'Email',
        Direction: 'Inbound',
        Subject: `${subjectPrefix}: ${memberName} | ${formatDate(answer.dateKey)}`,
        Notes: lines.join('\n'),
        'Follow-Up Required': critical || answer.response !== 'Available',
        'Logged By': 'Master Availability Dashboard',
        Category: 'Other',
        'Source Channel': 'Form',
        'Sender Name': memberName,
        'Sender Email': memberEmail || null,
        'Full Message': lines.join('\n'),
        'Confidence Score': 1,
        'Triage Status': critical || answer.response !== 'Available' ? 'Needs Review' : 'Auto-classified',
        'Linked Band': affectedBandIds,
        'Linked Member': [member.id],
        'Linked Show': shows.map(show => show.id),
        'Source Message ID': `master-availability:${member.id}:${answer.dateKey}:${Date.now()}`,
        'Triaged At': now,
      },
    }])

    return true
  } catch (error) {
    console.error('[master-availability] notification queue failed:', error)
    return false
  }
}

export async function saveMasterAvailabilityDay(token, rawAnswer) {
  if (!validToken(token)) return { ok: false, status: 404, error: 'This private availability link is not valid.' }

  const parsed = normalizeAnswer(rawAnswer)
  if (!parsed.ok) return { ok: false, status: 400, error: parsed.error }

  try {
    const data = await loadBaseData()
    const member = memberByToken(data, token)
    if (!member) return { ok: false, status: 404, error: 'This private availability link is not valid.' }

    const answer = parsed.answer
    const currentMonthKey = monthKeyFromDateKey(todayKey())
    const lastMonthKey = addMonths(currentMonthKey, ROLLING_MONTHS - 1)
    const answerMonthKey = monthKeyFromDateKey(answer.dateKey)

    if (answer.dateKey < todayKey() || answerMonthKey < currentMonthKey || answerMonthKey > lastMonthKey) {
      return { ok: false, status: 400, error: 'Only dates in the active rolling calendar can be edited.' }
    }

    const activeMembers = data.members.filter(record => record.fields?.Active !== false)
    const memberMap = mapById(activeMembers)
    const bandMap = mapById(data.bands)
    const venueMap = mapById(data.venues)
    const monthPractices = buildPracticeEvents(data.bands, answerMonthKey, 1, memberMap)
    const allShows = normalizeShows(data.shows, data.members, bandMap, venueMap)
    const practices = monthPractices.filter(event => event.dateKey === answer.dateKey && event.memberIds.includes(member.id))
    const shows = allShows.filter(show => show.dateKey === answer.dateKey && show.memberIds.includes(member.id))
    const responseMap = generalResponseMap(data.responses)
    const existingRecord = responseMap.get(`${member.id}:${answer.dateKey}`) || null
    const previous = responseSnapshot(existingRecord)
    const beforeMonthDays = dateKeysForMonth(answerMonthKey).map(dateKey => buildMemberDay({
      member,
      dateKey,
      responseMap,
      blackouts: data.blackouts,
      practices: monthPractices,
      shows: allShows,
      bandMap,
      editable: true,
    }))
    const beforeSummary = buildLimitSummary(member, answerMonthKey, beforeMonthDays, allShows)
    const afterResponseMap = proposedResponseMap(responseMap, member.id, answer.dateKey, answer, existingRecord)
    const afterMonthDays = dateKeysForMonth(answerMonthKey).map(dateKey => buildMemberDay({
      member,
      dateKey,
      responseMap: afterResponseMap,
      blackouts: data.blackouts,
      practices: monthPractices,
      shows: allShows,
      bandMap,
      editable: true,
    }))
    const afterSummary = buildLimitSummary(member, answerMonthKey, afterMonthDays, allShows)
    const rules = memberRules(member)

    if (
      rules.mode === 'Hard Limit'
      && answer.response === 'Available'
      && afterSummary.weekendOverLimit
      && afterSummary.committedWeekends > beforeSummary.committedWeekends
    ) {
      return {
        ok: false,
        status: 409,
        error: `This would exceed your ${rules.maxWeekendCommitments}-weekend limit for ${formatMonth(answerMonthKey)}.`,
        data: { limitSummary: afterSummary },
      }
    }

    const now = new Date().toISOString()
    let linkedBlackoutId = previous.linkedBlackoutId
    let warning = ''
    const exactBlackout = exactGlobalBlackout(data.blackouts, member.id, answer.dateKey)

    if (answer.hardBlackout) {
      if (exactBlackout) {
        linkedBlackoutId = exactBlackout.id
      } else {
        const created = await createRecords(TABLES.BLACKOUTS, [{
          fields: {
            Member: [member.id],
            Date: answer.dateKey,
            'End Date': answer.dateKey,
            Reason: answer.reason,
            Notes: [answer.notes, MANAGED_BLACKOUT_MARKER].filter(Boolean).join('\n\n'),
          },
        }])
        linkedBlackoutId = created[0]?.id || null
      }
    } else if (linkedBlackoutId) {
      const linked = data.blackouts.find(record => record.id === linkedBlackoutId)
      if (linked && managedBlackout(linked)) await deleteRecord(TABLES.BLACKOUTS, linkedBlackoutId)
      else if (linked) warning = 'A separately managed blackout is still on file for this date.'
      linkedBlackoutId = null
    } else if (answer.response === 'Available' && exactBlackout && !managedBlackout(exactBlackout)) {
      warning = 'A separately managed blackout is still on file for this date.'
    }

    const fields = {
      'Response Name': `${member.fields?.['Member Name'] || 'Member'} - ${answer.dateKey}`,
      Member: [member.id],
      Response: answer.response,
      Reason: answer.reason || null,
      Notes: answer.notes || null,
      'Responded At': now,
      Source: 'Portal',
      'Hard Blackout': answer.hardBlackout,
      'Linked Blackout': linkedBlackoutId ? [linkedBlackoutId] : [],
      'Availability Date': answer.dateKey,
      'Entry Type': 'General Day',
      'Applies EPL-Wide': true,
    }

    let savedRecord
    if (existingRecord) {
      savedRecord = (await updateRecords(TABLES.AVAILABILITY_RESPONSES, [{ id: existingRecord.id, fields }]))[0]
    } else {
      savedRecord = (await createRecords(TABLES.AVAILABILITY_RESPONSES, [{ fields }]))[0]
    }

    const notificationQueued = await queueChangeNotification({
      member,
      answer,
      previous,
      practices,
      shows,
      bandMap,
      now,
    })

    return {
      ok: true,
      status: 200,
      data: {
        savedAt: now,
        recordId: savedRecord?.id || existingRecord?.id || null,
        answer: { ...answer, linkedBlackoutId },
        limitSummary: afterSummary,
        warning,
        notificationQueued,
      },
    }
  } catch (error) {
    console.error('[master-availability] save failed:', error)
    return { ok: false, status: 500, error: 'This availability change could not be saved right now.' }
  }
}

function adminMemberState({ member, dateKey, responseMap, blackouts, practices, shows, bandMap }) {
  const day = buildMemberDay({ member, dateKey, responseMap, blackouts, practices, shows, bandMap, editable: false })

  return {
    memberId: member.id,
    response: day.response,
    reason: day.reason,
    notes: day.notes,
    source: day.source,
    conflict: day.conflict,
    booked: day.booked,
    practiceBandIds: day.practices.map(item => item.bandId),
    showIds: day.shows.map(item => item.id),
    globalBlackout: Boolean(day.globalBlackout),
  }
}

export async function getAdminAvailabilityDashboard() {
  try {
    const data = await loadBaseData()
    const members = data.members.filter(record => record.fields?.Active !== false)
    const memberMap = mapById(members)
    const bandMap = mapById(data.bands)
    const venueMap = mapById(data.venues)
    const currentMonthKey = monthKeyFromDateKey(todayKey())
    const monthKeys = rollingMonthKeys(currentMonthKey)
    const practices = buildPracticeEvents(data.bands, currentMonthKey, ROLLING_MONTHS, memberMap)
    const shows = normalizeShows(data.shows, data.members, bandMap, venueMap)
    const responseMap = generalResponseMap(data.responses)

    const memberPayload = members.map(member => {
      const bandIds = linkedIds(member.fields?.['Primary Bands'])
      return {
        id: member.id,
        name: member.fields?.['Member Name'] || 'Member',
        email: member.fields?.Email || '',
        bandIds,
        bandNames: bandIds.map(id => bandMap.get(id)?.fields?.['Band Name']).filter(Boolean),
        rules: memberRules(member),
      }
    })

    const months = monthKeys.map(monthKey => {
      const dateKeys = dateKeysForMonth(monthKey)
      const monthPractices = practices.filter(event => monthKeyFromDateKey(event.dateKey) === monthKey)
      const monthShows = shows.filter(show => monthKeyFromDateKey(show.dateKey) === monthKey)
      const stats = {}

      for (const member of members) {
        const days = dateKeys.map(dateKey => buildMemberDay({
          member,
          dateKey,
          responseMap,
          blackouts: data.blackouts,
          practices: monthPractices,
          shows: monthShows,
          bandMap,
          editable: false,
        }))
        stats[member.id] = buildLimitSummary(member, monthKey, days, monthShows)
      }

      return {
        key: monthKey,
        label: formatMonth(monthKey),
        shortLabel: formatMonth(monthKey, true),
        isCurrent: monthKey === currentMonthKey,
        firstWeekday: weekdayIndex(`${monthKey}-01`),
        stats,
        days: dateKeys.map(dateKey => ({
          dateKey,
          day: Number(dateKey.slice(8, 10)),
          weekday: weekdayIndex(dateKey),
          weekend: isWeekendDate(dateKey),
          dateLabel: formatDate(dateKey),
          practices: monthPractices.filter(item => item.dateKey === dateKey),
          shows: monthShows.filter(item => item.dateKey === dateKey),
          members: members.map(member => adminMemberState({
            member,
            dateKey,
            responseMap,
            blackouts: data.blackouts,
            practices: monthPractices,
            shows: monthShows,
            bandMap,
          })),
        })),
      }
    })

    return {
      ok: true,
      status: 200,
      data: {
        currentMonthKey,
        todayKey: todayKey(),
        rangeLabel: `${formatMonth(monthKeys[0])} to ${formatMonth(monthKeys[monthKeys.length - 1])}`,
        bands: data.bands
          .filter(record => record.fields?.Active !== false)
          .map(record => ({ id: record.id, name: record.fields?.['Band Name'] || 'Band' })),
        members: memberPayload,
        months,
      },
    }
  } catch (error) {
    console.error('[master-availability] admin load failed:', error)
    return { ok: false, status: 500, error: 'The EPL availability dashboard could not be loaded right now.', data: null }
  }
}
