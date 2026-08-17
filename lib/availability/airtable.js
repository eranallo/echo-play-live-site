import { TABLES, authHeaders, tableUrl } from '@/lib/airtable'

const TIME_ZONE = 'America/Chicago'
const MAX_RECORDS = 500
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
    console.error('[availability] Airtable request failed:', response.status, detail.slice(0, 300))
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

function formatDue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
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

async function loadContext(token) {
  if (!validToken(token)) {
    return { ok: false, status: 404, error: 'This availability link is not valid.' }
  }

  try {
    const participants = await listRecords(TABLES.AVAILABILITY_PARTICIPANTS)
    const participant = participants.find(record => record.fields?.['Secure Token'] === token)

    if (!participant) {
      return { ok: false, status: 404, error: 'This availability link is not valid.' }
    }

    const expiresAt = participant.fields?.['Token Expires At']
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      return { ok: false, status: 410, error: 'This availability link has expired.' }
    }

    const memberId = firstLinkedId(participant.fields?.Member)
    const cycleId = firstLinkedId(participant.fields?.Cycle)

    if (!memberId || !cycleId) {
      return { ok: false, status: 500, error: 'This availability request is incomplete.' }
    }

    const [members, cycles, responses, options, bands, blackouts] = await Promise.all([
      listRecords(TABLES.MEMBERS),
      listRecords(TABLES.AVAILABILITY_CYCLES),
      listRecords(TABLES.AVAILABILITY_RESPONSES),
      listRecords(TABLES.AVAILABILITY_OPTIONS),
      listRecords(TABLES.BANDS),
      listRecords(TABLES.BLACKOUTS),
    ])

    const member = mapById(members).get(memberId)
    const cycle = mapById(cycles).get(cycleId)
    const optionMap = mapById(options)
    const bandMap = mapById(bands)
    const participantResponses = responses.filter(record => linkedIds(record.fields?.Participant).includes(participant.id))

    if (!member || !cycle || participantResponses.length === 0) {
      return { ok: false, status: 500, error: 'This availability request is incomplete.' }
    }

    const cycleStatus = cycle.fields?.Status || 'Draft'
    if (CLOSED_CYCLE_STATUSES.has(cycleStatus)) {
      return { ok: false, status: 410, error: 'This availability check is closed.' }
    }

    return {
      ok: true,
      participant,
      member,
      cycle,
      responses: participantResponses,
      optionMap,
      bandMap,
      blackouts,
      memberId,
      cycleId,
    }
  } catch (error) {
    console.error('[availability] load failed:', error)
    return { ok: false, status: 500, error: 'Availability information could not be loaded right now.' }
  }
}

function normalizedItems(context) {
  return context.responses
    .map(record => {
      const fields = record.fields || {}
      const optionId = firstLinkedId(fields.Option)
      const option = context.optionMap.get(optionId)
      if (!option) return null

      const optionFields = option.fields || {}
      const bandId = firstLinkedId(fields.Band) || firstLinkedId(optionFields.Band)
      const band = context.bandMap.get(bandId)
      const dateKey = localDateKey(optionFields.Start)
      const conflict = context.blackouts.find(blackout => blackoutApplies(
        blackout,
        context.memberId,
        bandId,
        dateKey
      ))

      return {
        responseId: record.id,
        optionId,
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
        response: fields.Response || 'Pending',
        reason: fields.Reason || '',
        notes: fields.Notes || '',
        hardBlackout: fields['Hard Blackout'] === true,
        linkedBlackoutId: firstLinkedId(fields['Linked Blackout']),
        existingBlackout: conflict ? {
          id: conflict.id,
          reason: conflict.fields?.Reason || 'Blackout on file',
          notes: conflict.fields?.Notes || '',
        } : null,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.start.localeCompare(b.start))
}

export async function getAvailabilityByToken(token) {
  const context = await loadContext(token)
  if (!context.ok) return context

  const cycleFields = context.cycle.fields || {}
  const memberFields = context.member.fields || {}
  const items = normalizedItems(context)

  return {
    ok: true,
    status: 200,
    data: {
      participantId: context.participant.id,
      participantStatus: context.participant.fields?.Status || 'Preparing',
      memberId: context.memberId,
      memberName: memberFields['Member Name'] || 'Band Member',
      memberEmail: memberFields.Email || '',
      cycleId: context.cycleId,
      cycleName: cycleFields['Cycle Name'] || 'Monthly Availability',
      cycleStatus: cycleFields.Status || 'Draft',
      isPreview: (cycleFields.Status || 'Draft') === 'Draft',
      dueAt: cycleFields['Due At'] || '',
      dueLabel: formatDue(cycleFields['Due At']),
      items,
      answeredCount: items.filter(item => item.response !== 'Pending').length,
      totalCount: items.length,
    },
  }
}

export async function saveAvailabilityByToken(token, rawAnswers) {
  const context = await loadContext(token)
  if (!context.ok) return context

  const answers = Array.isArray(rawAnswers) ? rawAnswers : []
  const currentById = new Map(context.responses.map(record => [record.id, record]))
  const submittedById = new Map()

  for (const raw of answers) {
    const id = cleanText(raw?.responseId, 40)
    if (!id || submittedById.has(id) || !currentById.has(id)) {
      return { ok: false, status: 400, error: 'The submitted availability did not match this request.' }
    }

    const response = cleanText(raw?.response, 30)
    const reason = cleanText(raw?.reason, 40)
    const notes = cleanText(raw?.notes, 500)
    const hardBlackout = raw?.hardBlackout === true

    if (!RESPONSE_CHOICES.has(response)) {
      return { ok: false, status: 400, error: 'Please answer every date.' }
    }

    if ((response === 'Maybe' || response === 'Unavailable') && !REASON_CHOICES.has(reason)) {
      return { ok: false, status: 400, error: 'Please choose a reason for every Maybe or Unavailable answer.' }
    }

    submittedById.set(id, {
      response,
      reason: response === 'Available' ? '' : reason,
      notes,
      hardBlackout: response === 'Unavailable' && hardBlackout,
    })
  }

  if (submittedById.size !== currentById.size) {
    return { ok: false, status: 400, error: 'Please answer every date before submitting.' }
  }

  try {
    const now = new Date().toISOString()
    const cycleName = context.cycle.fields?.['Cycle Name'] || 'monthly availability check'
    const blackoutRequests = []
    const blackoutByResponseId = new Map()

    for (const [responseId, answer] of submittedById) {
      if (!answer.hardBlackout) continue

      const responseRecord = currentById.get(responseId)
      const optionId = firstLinkedId(responseRecord.fields?.Option)
      const option = context.optionMap.get(optionId)
      const bandId = firstLinkedId(responseRecord.fields?.Band) || firstLinkedId(option?.fields?.Band)
      const dateKey = localDateKey(option?.fields?.Start)

      if (!bandId || !dateKey) continue

      const existing = context.blackouts.find(record => exactBlackout(
        record,
        context.memberId,
        bandId,
        dateKey
      ))

      if (existing) {
        blackoutByResponseId.set(responseId, existing.id)
        continue
      }

      const noteParts = []
      if (answer.notes) noteParts.push(answer.notes)
      noteParts.push(`Added through ${cycleName}.`)

      blackoutRequests.push({
        responseId,
        fields: {
          Member: [context.memberId],
          Date: dateKey,
          'End Date': dateKey,
          Reason: answer.reason,
          'Affects Bands': [bandId],
          Notes: noteParts.join('\n\n'),
        },
      })
    }

    if (blackoutRequests.length > 0) {
      const created = await createRecords(
        TABLES.BLACKOUTS,
        blackoutRequests.map(request => ({ fields: request.fields }))
      )

      created.forEach((record, index) => {
        const request = blackoutRequests[index]
        if (request && record?.id) blackoutByResponseId.set(request.responseId, record.id)
      })
    }

    const responseUpdates = context.responses.map(record => {
      const answer = submittedById.get(record.id)
      const fields = {
        Response: answer.response,
        Reason: answer.reason || null,
        Notes: answer.notes || null,
        'Responded At': now,
        Source: 'Portal',
        'Hard Blackout': answer.hardBlackout,
      }

      if (answer.hardBlackout) {
        const blackoutId = blackoutByResponseId.get(record.id)
        fields['Linked Blackout'] = blackoutId ? [blackoutId] : []
      } else {
        fields['Linked Blackout'] = []
      }

      return { id: record.id, fields }
    })

    await updateRecords(TABLES.AVAILABILITY_RESPONSES, responseUpdates)
    await updateRecords(TABLES.AVAILABILITY_PARTICIPANTS, [{
      id: context.participant.id,
      fields: {
        Status: 'Complete',
        'Last Opened At': now,
        'Completed At': now,
      },
    }])

    return {
      ok: true,
      status: 200,
      data: {
        completedAt: now,
        blackoutCount: blackoutByResponseId.size,
      },
    }
  } catch (error) {
    console.error('[availability] save failed:', error)
    return { ok: false, status: 500, error: 'Availability could not be saved right now.' }
  }
}
