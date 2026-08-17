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

function managedBlackout(record, cycleName) {
  const notes = String(record?.fields?.Notes || '')
  return notes.includes(`Added through ${cycleName}.`)
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
    const participantResponses = responses.filter(record => (
      linkedIds(record.fields?.Participant).includes(participant.id)
    ))

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
        respondedAt: fields['Responded At'] || '',
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

  const optionId = firstLinkedId(responseRecord.fields?.Option)
  const option = context.optionMap.get(optionId)
  const bandId = firstLinkedId(responseRecord.fields?.Band)
    || firstLinkedId(option?.fields?.Band)
  const dateKey = localDateKey(option?.fields?.Start)

  if (!option || !bandId || !dateKey) {
    return { ok: false, status: 500, error: 'This availability date is incomplete.' }
  }

  const previous = responseSnapshot(responseRecord)
  if (snapshotsMatch(previous, answer)) {
    return {
      ok: true,
      status: 200,
      data: {
        savedAt: responseRecord.fields?.['Responded At'] || new Date().toISOString(),
        participantStatus: context.participant.fields?.Status || 'In Progress',
        answer,
        notificationQueued: false,
        changed: false,
      },
    }
  }

  try {
    const now = new Date().toISOString()
    const cycleName = context.cycle.fields?.['Cycle Name'] || 'monthly availability check'
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
        noteParts.push(`Added through ${cycleName}.`)

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

      if (linkedBlackout && managedBlackout(linkedBlackout, cycleName)) {
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

    const resultingResponses = context.responses.map(record => (
      record.id === responseRecord.id
        ? answer.response
        : record.fields?.Response || 'Pending'
    ))
    const isComplete = resultingResponses.every(value => value !== 'Pending')
    const participantStatus = isComplete ? 'Complete' : 'In Progress'
    const participantFields = {
      Status: participantStatus,
      'Last Opened At': now,
    }

    if (isComplete && !context.participant.fields?.['Completed At']) {
      participantFields['Completed At'] = now
    }

    await updateRecords(TABLES.AVAILABILITY_PARTICIPANTS, [{
      id: context.participant.id,
      fields: participantFields,
    }])

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

// Legacy bulk save retained for anyone who still has the earlier test page open.
// The live dashboard uses saveAvailabilityItemByToken instead.
export async function saveAvailabilityByToken(token, rawAnswers) {
  const answers = Array.isArray(rawAnswers) ? rawAnswers : []

  if (answers.length === 0 || answers.length > 50) {
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
