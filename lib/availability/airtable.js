import { TABLES, authHeaders, tableUrl } from '@/lib/airtable'

const TIME_ZONE = 'America/Chicago'
const ROLLING_MONTHS = 12
const MAX_RECORDS = 5000
const CLOSED_CYCLE_STATUSES = new Set(['Closed', 'Finalized', 'Canceled'])
const RESPONSE_CHOICES = new Set(['Available', 'Maybe', 'Unavailable'])
const REASON_CHOICES = new Set(['Personal', 'Family', 'Vacation', 'Other Gig', 'Other'])

function getApiToken() {
  return process.env.AIRTABLE_API_TOKEN
    || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
    || process.env.AIRTABLE_TOKEN
    || ''
}

function assertConfigured() {
  if (!getApiToken()) {
    throw new Error('Availability is not configured on the server.')
  }
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
    console.error('[availability] Airtable request failed:', response.status, detail.slice(0, 500))
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

async function upsertRecords(tableId, records, fieldsToMergeOn) {
  const upserted = []

  for (let index = 0; index < records.length; index += 10) {
    const chunk = records.slice(index, index + 10)
    const data = await airtableRequest(tableUrl(tableId), {
      method: 'PATCH',
      body: JSON.stringify({
        records: chunk,
        performUpsert: { fieldsToMergeOn },
        typecast: true,
      }),
    })
    upserted.push(...(data.records || []))
  }

  return upserted
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
  return airtableRequest(`${tableUrl(tableId)}/${recordId}`, {
    method: 'DELETE',
  })
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
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  const parts = dateParts(value)
  return parts ? `${parts.year}-${parts.month}-${parts.day}` : ''
}

function todayKey() {
  return localDateKey(new Date().toISOString())
}

function monthKeyFromDateKey(dateKey) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey || '')
    ? dateKey.slice(0, 7)
    : ''
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

function formatDate(value) {
  if (!value) return 'Date not set'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date not set'

  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
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

  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    return ''
  }

  const wallClockUtc = Date.UTC(year, month - 1, day, hour, minute, 0)
  let instant = new Date(wallClockUtc)

  for (let pass = 0; pass < 2; pass += 1) {
    const offset = timeZoneOffsetMs(instant, TIME_ZONE)
    instant = new Date(wallClockUtc - offset)
  }

  return instant.toISOString()
}

function compactUtc(isoValue) {
  return new Date(isoValue)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace('.000', '')
}

function calendarInstanceId(seriesId, startIso) {
  return seriesId && startIso
    ? `${seriesId}_${compactUtc(startIso)}`
    : ''
}

function dashboardUrl(token) {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL
    || process.env.SITE_URL
    || 'https://echoplay.live'
  ).replace(/\/+$/, '')

  return `${siteUrl}/availability/${token}`
}

function practiceRule(record) {
  const fields = record?.fields || {}
  if (fields['Availability Dashboard Enabled'] !== true) return null

  const cadence = fields['Practice Cadence']
  const intervalDays = cadence === 'Weekly'
    ? 7
    : cadence === 'Every Other Week'
      ? 14
      : 0

  const anchorDate = fields['Practice Anchor Date'] || ''
  const startTime = fields['Practice Start Time'] || ''
  const durationHours = Number(fields['Practice Duration Hours'] || 0)

  if (
    !intervalDays
    || !/^\d{4}-\d{2}-\d{2}$/.test(anchorDate)
    || !/^\d{2}:\d{2}$/.test(startTime)
    || durationHours <= 0
  ) {
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
    calendarSeriesId: fields['Practice Calendar Series ID'] || '',
  }
}

function occurrenceDateKeys(rule, startMonthKey, count = ROLLING_MONTHS) {
  const windowStart = new Date(`${startMonthKey}-01T00:00:00.000Z`)
  const endMonthKey = addMonths(startMonthKey, count)
  const windowEnd = new Date(`${endMonthKey}-01T00:00:00.000Z`)
  const anchor = new Date(`${rule.anchorDate}T00:00:00.000Z`)
  const intervalMs = rule.intervalDays * 24 * 60 * 60 * 1000

  let occurrence = anchor
  if (occurrence < windowStart) {
    const steps = Math.ceil((windowStart.getTime() - occurrence.getTime()) / intervalMs)
    occurrence = new Date(occurrence.getTime() + steps * intervalMs)
  }

  const keys = []
  while (occurrence < windowEnd) {
    keys.push(occurrence.toISOString().slice(0, 10))
    occurrence = new Date(occurrence.getTime() + intervalMs)
  }

  return keys
}

function blackoutApplies(record, memberId, bandId, optionDate) {
  const fields = record?.fields || {}
  if (!linkedIds(fields.Member).includes(memberId)) return false

  const start = fields.Date || ''
  const end = fields['End Date'] || start
  if (!start || !optionDate || optionDate < start || optionDate > end) return false

  const affectedBands = linkedIds(fields['Affects Bands'])
  return affectedBands.length === 0 || affectedBands.includes(bandId)
}

function exactBlackout(record, memberId, bandId, dateKey) {
  const fields = record?.fields || {}
  if (!linkedIds(fields.Member).includes(memberId)) return false
  if ((fields.Date || '') !== dateKey) return false

  const affectedBands = linkedIds(fields['Affects Bands'])
  return affectedBands.length === 0 || affectedBands.includes(bandId)
}

function managedBlackout(record, dashboardName) {
  const notes = String(record?.fields?.Notes || '')
  return notes.includes(`Added through ${dashboardName}.`)
}

function cycleMonthKey(record) {
  const month = record?.fields?.Month || ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(month)) return month.slice(0, 7)
  return ''
}

function optionBandId(record) {
  return firstLinkedId(record?.fields?.Band)
}

function optionDateKey(record) {
  return localDateKey(record?.fields?.Start)
}

function responseMemberId(record) {
  return firstLinkedId(record?.fields?.Member)
}

function responseOptionId(record) {
  return firstLinkedId(record?.fields?.Option)
}

function participantMemberId(record) {
  return firstLinkedId(record?.fields?.Member)
}

function participantCycleId(record) {
  return firstLinkedId(record?.fields?.Cycle)
}

async function ensureRollingWindow({
  member,
  members,
  bands,
  cycles,
  options,
  participants,
  responses,
}) {
  const currentMonthKey = monthKeyFromDateKey(todayKey())
  const monthKeys = rollingMonthKeys(currentMonthKey)
  const rules = bands.map(practiceRule).filter(Boolean)
  const allEnabledBandIds = rules.map(rule => rule.bandId)
  const memberId = member.id
  const memberBandIds = new Set(linkedIds(member.fields?.['Primary Bands']))
  const memberRules = rules.filter(rule => memberBandIds.has(rule.bandId))

  const cycleByMonth = new Map(
    cycles
      .map(record => [cycleMonthKey(record), record])
      .filter(([key]) => Boolean(key))
  )

  const missingCycleRecords = monthKeys
    .filter(monthKey => !cycleByMonth.has(monthKey))
    .map(monthKey => ({
      fields: {
        'Cycle Name': `${formatMonth(monthKey)} Availability`,
        Month: `${monthKey}-01`,
        Status: 'Open',
        Bands: allEnabledBandIds,
        Notes: 'Automatically maintained by the rolling practice-availability dashboard.',
      },
    }))

  if (missingCycleRecords.length > 0) {
    const createdCycles = await upsertRecords(
      TABLES.AVAILABILITY_CYCLES,
      missingCycleRecords,
      ['Cycle Name']
    )

    cycles.push(...createdCycles)
    for (const record of createdCycles) {
      cycleByMonth.set(cycleMonthKey(record), record)
    }
  }

  const cycleBandUpdates = []
  for (const monthKey of monthKeys) {
    const cycle = cycleByMonth.get(monthKey)
    if (!cycle) continue

    const existing = new Set(linkedIds(cycle.fields?.Bands))
    const missing = allEnabledBandIds.filter(id => !existing.has(id))
    if (missing.length > 0) {
      cycleBandUpdates.push({
        id: cycle.id,
        fields: { Bands: [...existing, ...missing] },
      })
      cycle.fields = {
        ...(cycle.fields || {}),
        Bands: [...existing, ...missing],
      }
    }
  }

  if (cycleBandUpdates.length > 0) {
    await updateRecords(TABLES.AVAILABILITY_CYCLES, cycleBandUpdates)
  }

  const optionByBandDate = new Map(
    options
      .map(record => {
        const bandId = optionBandId(record)
        const dateKey = optionDateKey(record)
        return bandId && dateKey ? [`${bandId}|${dateKey}`, record] : null
      })
      .filter(Boolean)
  )

  const activeMemberIdsByBand = new Map()
  for (const rule of rules) {
    const memberIds = members
      .filter(record => (
        record.fields?.Active !== false
        && linkedIds(record.fields?.['Primary Bands']).includes(rule.bandId)
      ))
      .map(record => record.id)

    activeMemberIdsByBand.set(rule.bandId, memberIds)
  }

  const missingOptionRecords = []
  for (const rule of rules) {
    for (const dateKey of occurrenceDateKeys(rule, currentMonthKey)) {
      const key = `${rule.bandId}|${dateKey}`
      if (optionByBandDate.has(key)) continue

      const monthKey = monthKeyFromDateKey(dateKey)
      const cycle = cycleByMonth.get(monthKey)
      if (!cycle) continue

      const start = localDateTimeToIso(dateKey, rule.startTime)
      if (!start) continue

      const end = new Date(
        new Date(start).getTime() + rule.durationHours * 60 * 60 * 1000
      ).toISOString()

      missingOptionRecords.push({
        fields: {
          'Option Name': `${rule.bandName} Practice - ${formatDate(start)}`,
          Cycle: [cycle.id],
          Band: [rule.bandId],
          'Event Type': 'Rehearsal',
          Start: start,
          End: end,
          Location: rule.location,
          Status: 'Candidate',
          'Required Members': activeMemberIdsByBand.get(rule.bandId) || [],
          'Calendar Event ID': calendarInstanceId(rule.calendarSeriesId, start),
          Notes: 'Generated from the recurring practice schedule stored on the band record.',
        },
      })
    }
  }

  if (missingOptionRecords.length > 0) {
    const createdOptions = await upsertRecords(
      TABLES.AVAILABILITY_OPTIONS,
      missingOptionRecords,
      ['Option Name']
    )

    options.push(...createdOptions)
    for (const record of createdOptions) {
      const bandId = optionBandId(record)
      const dateKey = optionDateKey(record)
      if (bandId && dateKey) optionByBandDate.set(`${bandId}|${dateKey}`, record)
    }
  }

  if (memberRules.length === 0) {
    return { cycles, options, participants, responses, currentMonthKey, monthKeys }
  }

  const participantByCycleMember = new Map(
    participants
      .map(record => {
        const cycleId = participantCycleId(record)
        const linkedMemberId = participantMemberId(record)
        return cycleId && linkedMemberId
          ? [`${cycleId}|${linkedMemberId}`, record]
          : null
      })
      .filter(Boolean)
  )

  const permanentToken = member.fields?.['Availability Dashboard Token'] || ''
  const permanentUrl = member.fields?.['Availability Dashboard URL']
    || (permanentToken ? dashboardUrl(permanentToken) : '')

  const missingParticipantRecords = []
  for (const monthKey of monthKeys) {
    const cycle = cycleByMonth.get(monthKey)
    if (!cycle) continue

    const key = `${cycle.id}|${memberId}`
    if (participantByCycleMember.has(key)) continue

    missingParticipantRecords.push({
      fields: {
        'Participant Name': `${formatMonth(monthKey)} - ${member.fields?.['Member Name'] || 'Band Member'}`,
        Cycle: [cycle.id],
        Member: [memberId],
        Status: 'Preparing',
        'Personalized URL': permanentUrl || null,
        'Reminder Count': 0,
        'Internal Notes': 'Monthly tracking record for the permanent rolling availability dashboard.',
      },
    })
  }

  if (missingParticipantRecords.length > 0) {
    const createdParticipants = await upsertRecords(
      TABLES.AVAILABILITY_PARTICIPANTS,
      missingParticipantRecords,
      ['Participant Name']
    )

    participants.push(...createdParticipants)
    for (const record of createdParticipants) {
      const cycleId = participantCycleId(record)
      const linkedMemberId = participantMemberId(record)
      if (cycleId && linkedMemberId) {
        participantByCycleMember.set(`${cycleId}|${linkedMemberId}`, record)
      }
    }
  }

  const participantUrlUpdates = participants
    .filter(record => (
      participantMemberId(record) === memberId
      && permanentUrl
      && record.fields?.['Personalized URL'] !== permanentUrl
    ))
    .map(record => ({
      id: record.id,
      fields: { 'Personalized URL': permanentUrl },
    }))

  if (participantUrlUpdates.length > 0) {
    await updateRecords(TABLES.AVAILABILITY_PARTICIPANTS, participantUrlUpdates)
  }

  const responseByMemberOption = new Map(
    responses
      .map(record => {
        const linkedMemberId = responseMemberId(record)
        const optionId = responseOptionId(record)
        return linkedMemberId && optionId
          ? [`${linkedMemberId}|${optionId}`, record]
          : null
      })
      .filter(Boolean)
  )

  const missingResponseRecords = []
  for (const option of options) {
    const bandId = optionBandId(option)
    if (!memberBandIds.has(bandId)) continue

    const dateKey = optionDateKey(option)
    const monthKey = monthKeyFromDateKey(dateKey)
    if (!monthKeys.includes(monthKey)) continue

    const cycleId = firstLinkedId(option.fields?.Cycle)
      || cycleByMonth.get(monthKey)?.id
    const participant = participantByCycleMember.get(`${cycleId}|${memberId}`)
    if (!participant) continue

    const key = `${memberId}|${option.id}`
    if (responseByMemberOption.has(key)) continue

    missingResponseRecords.push({
      fields: {
        'Response Name': `${member.fields?.['Member Name'] || 'Band Member'} - ${option.fields?.['Option Name'] || dateKey}`,
        Participant: [participant.id],
        Option: [option.id],
        Member: [memberId],
        Band: [bandId],
        Response: 'Pending',
      },
    })
  }

  if (missingResponseRecords.length > 0) {
    const createdResponses = await upsertRecords(
      TABLES.AVAILABILITY_RESPONSES,
      missingResponseRecords,
      ['Response Name']
    )

    responses.push(...createdResponses)
  }

  return { cycles, options, participants, responses, currentMonthKey, monthKeys }
}

async function loadContext(token) {
  if (!validToken(token)) {
    return { ok: false, status: 404, error: 'This availability link is not valid.' }
  }

  try {
    const members = await listRecords(TABLES.MEMBERS)
    const memberById = mapById(members)
    let member = members.find(record => (
      record.fields?.['Availability Dashboard Token'] === token
    ))

    let participants = null
    if (!member) {
      participants = await listRecords(TABLES.AVAILABILITY_PARTICIPANTS)
      const legacyParticipant = participants.find(record => (
        record.fields?.['Secure Token'] === token
      ))
      const legacyMemberId = participantMemberId(legacyParticipant)
      member = legacyMemberId ? memberById.get(legacyMemberId) : null
    }

    if (!member) {
      return { ok: false, status: 404, error: 'This availability link is not valid.' }
    }

    const [
      bands,
      cycles,
      options,
      responses,
      blackouts,
      loadedParticipants,
    ] = await Promise.all([
      listRecords(TABLES.BANDS),
      listRecords(TABLES.AVAILABILITY_CYCLES),
      listRecords(TABLES.AVAILABILITY_OPTIONS),
      listRecords(TABLES.AVAILABILITY_RESPONSES),
      listRecords(TABLES.BLACKOUTS),
      participants ? Promise.resolve(participants) : listRecords(TABLES.AVAILABILITY_PARTICIPANTS),
    ])

    const ensured = await ensureRollingWindow({
      member,
      members,
      bands,
      cycles,
      options,
      participants: loadedParticipants,
      responses,
    })

    const memberResponses = ensured.responses.filter(record => (
      responseMemberId(record) === member.id
    ))

    return {
      ok: true,
      member,
      members,
      bands,
      cycles: ensured.cycles,
      options: ensured.options,
      participants: ensured.participants,
      responses: memberResponses,
      blackouts,
      memberId: member.id,
      currentMonthKey: ensured.currentMonthKey,
      monthKeys: ensured.monthKeys,
      cycleMap: mapById(ensured.cycles),
      optionMap: mapById(ensured.options),
      bandMap: mapById(bands),
      participantMap: mapById(ensured.participants),
    }
  } catch (error) {
    console.error('[availability] load failed:', error)
    return { ok: false, status: 500, error: 'Availability information could not be loaded right now.' }
  }
}

function normalizedItems(context) {
  const currentDayKey = todayKey()

  return context.responses
    .map(record => {
      const fields = record.fields || {}
      const optionId = responseOptionId(record)
      const option = context.optionMap.get(optionId)
      if (!option) return null

      const optionFields = option.fields || {}
      const bandId = firstLinkedId(fields.Band) || optionBandId(option)
      const band = context.bandMap.get(bandId)
      const cycleId = firstLinkedId(optionFields.Cycle)
      const cycle = context.cycleMap.get(cycleId)
      const dateKey = optionDateKey(option)
      const monthKey = cycleMonthKey(cycle) || monthKeyFromDateKey(dateKey)
      const cycleStatus = cycle?.fields?.Status || 'Open'
      const conflict = context.blackouts.find(blackout => blackoutApplies(
        blackout,
        context.memberId,
        bandId,
        dateKey
      ))
      const isPastDate = Boolean(dateKey && dateKey < currentDayKey)
      const editable = !isPastDate && !CLOSED_CYCLE_STATUSES.has(cycleStatus)

      return {
        responseId: record.id,
        participantId: firstLinkedId(fields.Participant),
        optionId,
        cycleId,
        monthKey,
        monthLabel: formatMonth(monthKey),
        bandId,
        bandName: band?.fields?.['Band Name'] || 'Echo Play Live',
        optionName: optionFields['Option Name'] || 'Availability option',
        eventType: optionFields['Event Type'] || 'Rehearsal',
        start: optionFields.Start || '',
        end: optionFields.End || '',
        dateKey,
        dateLabel: formatDate(optionFields.Start),
        timeLabel: formatTimeRange(optionFields.Start, optionFields.End),
        location: optionFields.Location || '',
        status: optionFields.Status || 'Candidate',
        cycleStatus,
        response: fields.Response || 'Pending',
        reason: fields.Reason || '',
        notes: fields.Notes || '',
        respondedAt: fields['Responded At'] || '',
        hardBlackout: fields['Hard Blackout'] === true,
        linkedBlackoutId: firstLinkedId(fields['Linked Blackout']),
        existingBlackout: conflict ? {
          id: conflict.id,
          reason: conflict.fields?.Reason || 'Blackout on file',
          notes: conflict.fields?.Notes || '',
        } : null,
        editable,
        isPastDate,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.start.localeCompare(b.start))
}

function summarizeMonth(monthKey, items, currentMonthKey) {
  const answeredCount = items.filter(item => item.response !== 'Pending').length
  const unavailableCount = items.filter(item => item.response === 'Unavailable').length
  const maybeCount = items.filter(item => item.response === 'Maybe').length

  return {
    key: monthKey,
    label: formatMonth(monthKey),
    shortLabel: formatMonth(monthKey, true),
    isCurrent: monthKey === currentMonthKey,
    isPast: monthKey < currentMonthKey,
    itemCount: items.length,
    answeredCount,
    pendingCount: items.length - answeredCount,
    unavailableCount,
    maybeCount,
    items,
  }
}

export async function getAvailabilityByToken(token) {
  const context = await loadContext(token)
  if (!context.ok) return context

  const memberFields = context.member.fields || {}
  const items = normalizedItems(context)
  const rollingSet = new Set(context.monthKeys)

  const months = context.monthKeys.map(monthKey => (
    summarizeMonth(
      monthKey,
      items.filter(item => item.monthKey === monthKey),
      context.currentMonthKey
    )
  ))

  const historyKeys = [...new Set(
    items
      .map(item => item.monthKey)
      .filter(monthKey => monthKey && !rollingSet.has(monthKey) && monthKey < context.currentMonthKey)
  )].sort().reverse()

  const historyMonths = historyKeys.map(monthKey => (
    summarizeMonth(
      monthKey,
      items.filter(item => item.monthKey === monthKey),
      context.currentMonthKey
    )
  ))

  const rollingItems = months.flatMap(month => month.items)
  const answeredCount = rollingItems.filter(item => item.response !== 'Pending').length
  const rangeEndKey = context.monthKeys[context.monthKeys.length - 1]

  return {
    ok: true,
    status: 200,
    data: {
      memberId: context.memberId,
      memberName: memberFields['Member Name'] || 'Band Member',
      memberEmail: memberFields.Email || '',
      dashboardName: 'Practice Availability',
      currentMonthKey: context.currentMonthKey,
      rangeLabel: `${formatMonth(context.currentMonthKey)} to ${formatMonth(rangeEndKey)}`,
      months,
      historyMonths,
      answeredCount,
      totalCount: rollingItems.length,
      isPreview: process.env.VERCEL_ENV !== 'production',
    },
  }
}

function normalizedAnswer(rawAnswer) {
  const responseId = cleanText(rawAnswer?.responseId, 40)
  const response = cleanText(rawAnswer?.response, 30)
  const reason = cleanText(rawAnswer?.reason, 40)
  const notes = cleanText(rawAnswer?.notes, 500)
  const hardBlackout = response === 'Unavailable' && rawAnswer?.hardBlackout === true

  if (!responseId) {
    return { ok: false, error: 'This availability answer is missing its record ID.' }
  }

  if (!RESPONSE_CHOICES.has(response)) {
    return { ok: false, error: 'Choose Available, Maybe, or Unavailable.' }
  }

  if ((response === 'Maybe' || response === 'Unavailable') && !REASON_CHOICES.has(reason)) {
    return { ok: false, error: 'Choose a reason for Maybe or Unavailable.' }
  }

  return {
    ok: true,
    answer: {
      responseId,
      response,
      reason: response === 'Available' ? '' : reason,
      notes,
      hardBlackout,
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

function snapshotsMatch(left, right) {
  return left.response === right.response
    && left.reason === right.reason
    && left.notes === right.notes
    && left.hardBlackout === right.hardBlackout
}

async function queueChangeNotification({
  context,
  responseRecord,
  option,
  bandId,
  previous,
  answer,
  now,
}) {
  if (!TABLES.COMMUNICATIONS) return false

  const statusChanged = previous.response !== 'Pending'
    && previous.response !== answer.response
  const blackoutChanged = previous.response !== 'Pending'
    && previous.hardBlackout !== answer.hardBlackout

  if (!statusChanged && !blackoutChanged) {
    return false
  }

  try {
    const optionFields = option?.fields || {}
    const band = context.bandMap.get(bandId)
    const memberFields = context.member.fields || {}
    const memberName = memberFields['Member Name'] || 'Band member'
    const memberEmail = memberFields.Email || ''
    const bandName = band?.fields?.['Band Name'] || 'Echo Play Live'
    const dateLabel = formatDate(optionFields.Start)
    const timeLabel = formatTimeRange(optionFields.Start, optionFields.End)
    const needsReview = answer.response !== 'Available'
    const changeLines = [
      `${memberName} changed ${bandName} availability for ${dateLabel}, ${timeLabel}.`,
      `Previous answer: ${previous.response}`,
      `New answer: ${answer.response}`,
    ]

    if (answer.reason) changeLines.push(`Reason: ${answer.reason}`)
    if (answer.notes) changeLines.push(`Note: ${answer.notes}`)

    if (blackoutChanged) {
      changeLines.push(
        answer.hardBlackout
          ? 'A band-specific blackout was added.'
          : 'The dashboard blackout selection was removed.'
      )
    }

    await createRecords(TABLES.COMMUNICATIONS, [{
      fields: {
        Date: localDateKey(now),
        Type: 'Email',
        Direction: 'Inbound',
        Subject: `Availability changed: ${memberName} | ${bandName} | ${dateLabel}`,
        Notes: changeLines.join('\n'),
        'Follow-Up Required': needsReview,
        'Logged By': 'Availability Dashboard',
        Category: 'Other',
        'Source Channel': 'Form',
        'Sender Name': memberName,
        'Sender Email': memberEmail || null,
        'Full Message': changeLines.join('\n'),
        'Confidence Score': 1,
        'Triage Status': needsReview ? 'Needs Review' : 'Auto-classified',
        'Linked Band': bandId ? [bandId] : [],
        'Linked Member': [context.memberId],
        'Source Message ID': `availability:${responseRecord.id}:${Date.now()}`,
        'Triaged At': now,
      },
    }])

    return true
  } catch (error) {
    console.error('[availability] notification queue failed:', error)
    return false
  }
}

export async function saveAvailabilityItemByToken(token, rawAnswer) {
  const context = await loadContext(token)
  if (!context.ok) return context

  const parsed = normalizedAnswer(rawAnswer)
  if (!parsed.ok) {
    return { ok: false, status: 400, error: parsed.error }
  }

  const answer = parsed.answer
  const responseRecord = context.responses.find(record => record.id === answer.responseId)

  if (!responseRecord) {
    return {
      ok: false,
      status: 400,
      error: 'The submitted availability did not match this private dashboard.',
    }
  }

  const optionId = responseOptionId(responseRecord)
  const option = context.optionMap.get(optionId)
  const bandId = firstLinkedId(responseRecord.fields?.Band)
    || optionBandId(option)
  const dateKey = optionDateKey(option)
  const cycleId = firstLinkedId(option?.fields?.Cycle)
  const cycle = context.cycleMap.get(cycleId)

  if (!option || !bandId || !dateKey) {
    return { ok: false, status: 500, error: 'This availability date is incomplete.' }
  }

  if (dateKey < todayKey()) {
    return { ok: false, status: 409, error: 'Past practice dates are read-only.' }
  }

  if (CLOSED_CYCLE_STATUSES.has(cycle?.fields?.Status)) {
    return { ok: false, status: 409, error: 'This month is closed and can no longer be edited.' }
  }

  const previous = responseSnapshot(responseRecord)
  if (snapshotsMatch(previous, answer)) {
    return {
      ok: true,
      status: 200,
      data: {
        savedAt: responseRecord.fields?.['Responded At'] || new Date().toISOString(),
        answer,
        notificationQueued: false,
        changed: false,
      },
    }
  }

  try {
    const now = new Date().toISOString()
    const dashboardName = 'Practice Availability Dashboard'
    let linkedBlackoutId = previous.linkedBlackoutId
    let blackoutRemoved = false

    if (answer.hardBlackout) {
      const existingLinked = linkedBlackoutId
        ? context.blackouts.find(record => record.id === linkedBlackoutId)
        : null
      const exactExisting = existingLinked || context.blackouts.find(record => exactBlackout(
        record,
        context.memberId,
        bandId,
        dateKey
      ))

      if (exactExisting) {
        linkedBlackoutId = exactExisting.id
      } else {
        const noteParts = []
        if (answer.notes) noteParts.push(answer.notes)
        noteParts.push(`Added through ${dashboardName}.`)

        const created = await createRecords(TABLES.BLACKOUTS, [{
          fields: {
            Member: [context.memberId],
            Date: dateKey,
            'End Date': dateKey,
            Reason: answer.reason,
            'Affects Bands': [bandId],
            Notes: noteParts.join('\n\n'),
          },
        }])

        linkedBlackoutId = created[0]?.id || null
      }
    } else if (linkedBlackoutId) {
      const linkedBlackout = context.blackouts.find(record => record.id === linkedBlackoutId)

      if (linkedBlackout && managedBlackout(linkedBlackout, dashboardName)) {
        await deleteRecord(TABLES.BLACKOUTS, linkedBlackoutId)
        blackoutRemoved = true
      }

      linkedBlackoutId = null
    }

    await updateRecords(TABLES.AVAILABILITY_RESPONSES, [{
      id: responseRecord.id,
      fields: {
        Response: answer.response,
        Reason: answer.reason || null,
        Notes: answer.notes || null,
        'Responded At': now,
        Source: 'Portal',
        'Hard Blackout': answer.hardBlackout,
        'Linked Blackout': linkedBlackoutId ? [linkedBlackoutId] : [],
      },
    }])

    const participantId = firstLinkedId(responseRecord.fields?.Participant)
    const participant = context.participantMap.get(participantId)
    const participantResponses = context.responses.filter(record => (
      firstLinkedId(record.fields?.Participant) === participantId
    ))
    const resultingResponses = participantResponses.map(record => (
      record.id === responseRecord.id
        ? answer.response
        : record.fields?.Response || 'Pending'
    ))
    const isComplete = resultingResponses.length > 0
      && resultingResponses.every(value => value !== 'Pending')
    const participantStatus = isComplete ? 'Complete' : 'In Progress'

    if (participant) {
      const participantFields = {
        Status: participantStatus,
        'Last Opened At': now,
      }

      if (isComplete && !participant.fields?.['Completed At']) {
        participantFields['Completed At'] = now
      }

      await updateRecords(TABLES.AVAILABILITY_PARTICIPANTS, [{
        id: participant.id,
        fields: participantFields,
      }])
    }

    const notificationQueued = await queueChangeNotification({
      context,
      responseRecord,
      option,
      bandId,
      previous,
      answer,
      now,
    })

    return {
      ok: true,
      status: 200,
      data: {
        savedAt: now,
        participantStatus,
        answer,
        notificationQueued,
        linkedBlackoutId,
        blackoutRemoved,
        changed: true,
      },
    }
  } catch (error) {
    console.error('[availability] live save failed:', error)
    return { ok: false, status: 500, error: 'This availability change could not be saved right now.' }
  }
}

// Retained for anyone who still has an earlier submit-based preview open.
export async function saveAvailabilityByToken(token, rawAnswers) {
  const answers = Array.isArray(rawAnswers) ? rawAnswers : []

  if (answers.length === 0 || answers.length > 200) {
    return { ok: false, status: 400, error: 'Please answer every date before submitting.' }
  }

  let lastResult = null
  let blackoutCount = 0

  for (const rawAnswer of answers) {
    const result = await saveAvailabilityItemByToken(token, rawAnswer)
    if (!result.ok) return result
    lastResult = result
    if (result.data?.linkedBlackoutId) blackoutCount += 1
  }

  return {
    ok: true,
    status: 200,
    data: {
      completedAt: lastResult?.data?.savedAt || new Date().toISOString(),
      blackoutCount,
    },
  }
}
