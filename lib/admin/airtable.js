const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appYUOoJgvRyZ7fLB'
const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN

const TABLES = {
  shows: process.env.AIRTABLE_SHOWS_TABLE || 'SHOWS',
  bands: process.env.AIRTABLE_BANDS_TABLE || 'BANDS',
  venues: process.env.AIRTABLE_VENUES_TABLE || 'VENUES',
  aiAgents: process.env.AIRTABLE_AI_AGENTS_TABLE || 'AI AGENTS',
  aiRuns: process.env.AIRTABLE_AI_RUNS_TABLE || 'AI RUNS',
  approvalQueue: process.env.AIRTABLE_APPROVAL_QUEUE_TABLE || 'APPROVAL QUEUE',
  tasks: process.env.AIRTABLE_TASKS_TABLE || 'TASKS',
}

const TASK_FIELDS = {
  name: process.env.AIRTABLE_TASK_NAME_FIELD || 'Name',
  status: process.env.AIRTABLE_TASK_STATUS_FIELD || 'Status',
  priority: process.env.AIRTABLE_TASK_PRIORITY_FIELD || 'Priority',
  dueDate: process.env.AIRTABLE_TASK_DUE_DATE_FIELD || 'Due Date',
  owner: process.env.AIRTABLE_TASK_OWNER_FIELD || 'Owner',
  source: process.env.AIRTABLE_TASK_SOURCE_FIELD || 'Source',
  relatedShow: process.env.AIRTABLE_TASK_RELATED_SHOW_FIELD || 'Related Show',
  notes: process.env.AIRTABLE_TASK_NOTES_FIELD || 'Notes',
  completedAt: process.env.AIRTABLE_TASK_COMPLETED_AT_FIELD || 'Completed At',
}

const DONE_TASK_STATUSES = new Set(['Done', 'Complete', 'Completed'])

export const ADMIN_SHOW_UPDATE_FIELDS = [
  'Show Notes',
  'Sound Notes',
  'Merch Notes',
  'Graphic Created',
  'Facebook Event Created',
  'Bandsintown Posted',
  'Promotion Released',
  'Contract Signed',
  'Ads Running',
  'Trailer Reserved',
  'Event Description',
]

function airtableTableUrl(table, params = {}) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`)

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  }

  return url
}

function airtableRecordUrl(table, recordId, params = {}) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}/${recordId}`)

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

function formatDateTime(value) {
  const date = dateValue(value)
  if (!date) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
  }).format(date)
}

function formatTime(value) {
  if (!value) return 'Time TBD'
  return String(value)
}

function formatPercent(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'number') return `${Math.round(value * 100)}%`
  return String(value)
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }
  return String(value)
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—'
  return String(value)
}

function getField(fields, name) {
  return fields?.[name]
}

function taskIsDone(status) {
  return DONE_TASK_STATUSES.has(String(status || '').trim())
}

function assertAirtableToken() {
  if (!AIRTABLE_API_TOKEN) {
    throw new Error('Missing Airtable server credential in Vercel.')
  }
}

async function airtableFetch(url, options = {}) {
  assertAirtableToken()

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_TOKEN.trim()}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Airtable request failed (${response.status}): ${text.slice(0, 240)}`)
  }

  return response.json()
}

async function fetchAirtableRecords(table, params = {}) {
  const records = []
  let offset

  do {
    const url = airtableTableUrl(table, {
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

async function safeFetchAirtableRecords(table, params = {}) {
  try {
    const records = await fetchAirtableRecords(table, params)
    return { ok: true, table, records, error: null, missing: false }
  } catch (error) {
    const message = error?.message || 'Unknown Airtable error'
    const missing = message.includes('404') || message.includes('NOT_FOUND') || message.includes('TABLE_NOT_FOUND')
    return { ok: false, table, records: [], error: message, missing }
  }
}

async function fetchAirtableRecord(table, recordId) {
  return airtableFetch(airtableRecordUrl(table, recordId))
}

async function updateAirtableRecord(table, recordId, fields) {
  return airtableFetch(airtableRecordUrl(table, recordId), {
    method: 'PATCH',
    body: JSON.stringify({ fields, typecast: true }),
  })
}

async function createAirtableRecord(table, fields) {
  const data = await airtableFetch(airtableTableUrl(table), {
    method: 'POST',
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
  })

  return data.records?.[0]
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

function getChecklist(fields) {
  return [
    ['Contract Signed', asBoolean(fields['Contract Signed'])],
    ['Graphic Created', asBoolean(fields['Graphic Created'])],
    ['Trailer Reserved', asBoolean(fields['Trailer Reserved'])],
    ['Facebook Event Created', asBoolean(fields['Facebook Event Created'])],
    ['Bandsintown Posted', asBoolean(fields['Bandsintown Posted'])],
    ['Promotion Released', asBoolean(fields['Promotion Released'])],
    ['Ads Running', asBoolean(fields['Ads Running'])],
  ].map(([label, complete]) => ({ label, complete }))
}

function normalizeShowRecord(record, bandMap, venueMap) {
  const fields = record.fields || {}
  const bandIds = normalizeLinkedIds(fields.Band)
  const venueIds = normalizeLinkedIds(fields.Venue)
  const missingFlags = getMissingFlags(fields)

  return {
    id: record.id,
    date: fields.Date || null,
    dateLabel: formatDate(fields.Date),
    bandIds,
    venueIds,
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
}

function normalizeAgentRecord(record) {
  const fields = record.fields || {}
  return {
    id: record.id,
    name: fields['Agent Name'] || fields.Name || 'Unnamed Agent',
    type: fields['Agent Type'] || '—',
    status: fields.Status || '—',
    version: fields.Version || '—',
    purpose: fields.Purpose || fields.Notes || '',
  }
}

function normalizeApprovalRecord(record) {
  const fields = record.fields || {}
  return {
    id: record.id,
    item: fields['Approval Item'] || fields.Name || 'Untitled Approval',
    actionType: fields['Action Type'] || '—',
    status: fields.Status || '—',
    riskLevel: fields['Risk Level'] || '—',
    createdAt: formatDateTime(fields['Created At'] || fields.Created || record.createdTime),
    proposedChange: fields['Proposed Change'] || fields.Notes || '',
  }
}

function normalizeRunRecord(record) {
  const fields = record.fields || {}
  return {
    id: record.id,
    name: fields['Run Name'] || fields['User Request'] || fields.Name || 'Untitled Run',
    agent: formatValue(fields.Agent),
    status: fields['Approval Status'] || fields.Status || '—',
    createdAt: formatDateTime(fields['Created At'] || fields.Created || record.createdTime),
    outputSummary: fields['Output Summary'] || fields.Notes || '',
  }
}

function normalizeTaskRecord(record) {
  const fields = record.fields || {}
  const status = fields[TASK_FIELDS.status] || fields.Status || 'Todo'
  return {
    id: record.id,
    type: 'Airtable',
    title: fields[TASK_FIELDS.name] || fields['Task Name'] || fields.Name || fields.Title || 'Untitled Task',
    status,
    isDone: taskIsDone(status),
    priority: fields[TASK_FIELDS.priority] || fields.Priority || 'Normal',
    dueDate: fields[TASK_FIELDS.dueDate] || fields.Due || null,
    dueLabel: formatDate(fields[TASK_FIELDS.dueDate] || fields.Due),
    owner: formatValue(fields[TASK_FIELDS.owner] || fields.Owner || fields.Assignee),
    source: fields[TASK_FIELDS.source] || fields.Source || fields['Created By'] || 'Manual',
    relatedShow: formatValue(fields[TASK_FIELDS.relatedShow] || fields.Show || fields['Related Show']),
    notes: fields[TASK_FIELDS.notes] || fields.Notes || fields.Description || '',
    completedAt: formatDateTime(fields[TASK_FIELDS.completedAt] || fields['Completed At']),
  }
}

function safeJsonParse(text) {
  if (!text || typeof text !== 'string') return null
  const jsonStart = text.indexOf('{')
  if (jsonStart === -1) return null

  try {
    return JSON.parse(text.slice(jsonStart))
  } catch {
    return null
  }
}

export async function getAdminShowsOverview() {
  if (!AIRTABLE_API_TOKEN) {
    return {
      ok: false,
      error: 'Missing Airtable server credential in Vercel.',
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
      .map(record => normalizeShowRecord(record, bandMap, venueMap))

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

export async function getAdminOpsFoundation() {
  if (!AIRTABLE_API_TOKEN) {
    return {
      ok: false,
      error: 'Missing Airtable server credential in Vercel.',
      tables: [],
      approvals: [],
      runs: [],
      agents: [],
      tasks: [],
      counts: { tablesReady: 0, pendingApprovals: 0, recentRuns: 0, activeAgents: 0, openTasks: 0 },
    }
  }

  const [agentsResult, approvalsResult, runsResult, tasksResult] = await Promise.all([
    safeFetchAirtableRecords(TABLES.aiAgents, { maxRecords: '12' }),
    safeFetchAirtableRecords(TABLES.approvalQueue, { maxRecords: '12' }),
    safeFetchAirtableRecords(TABLES.aiRuns, { maxRecords: '12' }),
    safeFetchAirtableRecords(TABLES.tasks, { maxRecords: '50' }),
  ])

  const agents = agentsResult.records.map(normalizeAgentRecord)
  const approvals = approvalsResult.records.map(normalizeApprovalRecord)
  const runs = runsResult.records.map(normalizeRunRecord)
  const tasks = tasksResult.records.map(normalizeTaskRecord)
  const openTasks = tasks.filter(task => !task.isDone)
  const tables = [
    {
      label: 'AI AGENTS',
      ready: agentsResult.ok,
      missing: agentsResult.missing,
      records: agents.length,
      error: agentsResult.error,
    },
    {
      label: 'APPROVAL QUEUE',
      ready: approvalsResult.ok,
      missing: approvalsResult.missing,
      records: approvals.length,
      error: approvalsResult.error,
    },
    {
      label: 'AI RUNS',
      ready: runsResult.ok,
      missing: runsResult.missing,
      records: runs.length,
      error: runsResult.error,
    },
    {
      label: 'TASKS',
      ready: tasksResult.ok,
      missing: tasksResult.missing,
      records: tasks.length,
      error: tasksResult.error,
    },
  ]

  return {
    ok: tables.filter(table => !table.missing).every(table => table.ready),
    error: tables.find(table => !table.ready && !table.missing)?.error || null,
    tables,
    approvals,
    runs,
    agents,
    tasks,
    counts: {
      tablesReady: tables.filter(table => table.ready).length,
      pendingApprovals: approvals.filter(item => item.status === 'Pending').length,
      recentRuns: runs.length,
      activeAgents: agents.filter(agent => agent.status === 'Active').length,
      openTasks: openTasks.length,
    },
  }
}

export async function getAdminShowDetail(showId) {
  if (!AIRTABLE_API_TOKEN) {
    return {
      ok: false,
      error: 'Missing Airtable server credential in Vercel.',
      show: null,
    }
  }

  try {
    const [bandMap, venueMap, record] = await Promise.all([
      getRecordNameMap(TABLES.bands, 'Band Name'),
      getRecordNameMap(TABLES.venues, 'Venue Name'),
      fetchAirtableRecord(TABLES.shows, showId),
    ])

    const fields = record.fields || {}
    const show = normalizeShowRecord(record, bandMap, venueMap)

    return {
      ok: true,
      error: null,
      show: {
        ...show,
        title: `${show.band} at ${show.venue}`,
        eventDescription: fields['Event Description'] || '',
        editableNotes: {
          showNotes: fields['Show Notes'] || '',
          soundNotes: fields['Sound Notes'] || '',
          merchNotes: fields['Merch Notes'] || '',
        },
        checklist: getChecklist(fields),
        logistics: [
          ['Date', show.dateLabel],
          ['Load-In', formatValue(fields['Load-In Time'])],
          ['Sound Check', formatValue(fields['Sound Check Time'])],
          ['Start', show.startTime],
          ['End', formatValue(fields['End Time'])],
          ['Indoor / Outdoor', formatValue(fields['Indoor / Outdoor'] || fields['Indoor/Outdoor'])],
          ['Age Restriction', show.ageRestriction],
        ],
        deal: [
          ['Deal Type', formatValue(fields['Deal Type'])],
          ['Ticket Price', formatValue(fields['Ticket Price'])],
          ['Ticket URL', formatValue(fields['Ticket URL'])],
          ['Performance Rate', formatCurrency(fields['Performance Rate'])],
          ['EPL Percent', formatPercent(fields['EPL Percent'])],
          ['Trailer Cost', formatCurrency(fields['Trailer Cost'])],
          ['Audio Engineer Cost', formatCurrency(fields['Audio Engineer Cost'])],
          ['Social Ads Spend', formatCurrency(fields['Social Ads Spend'])],
          ['Total Expenses', formatCurrency(fields['Total Expenses'])],
          ['Net Income', formatCurrency(fields['Net Income'])],
          ['Band Payout', formatCurrency(fields['Band Payout'])],
        ],
        people: [
          ['Members Playing', formatValue(fields['Members Playing'])],
          ['Sound Provider', formatValue(fields['Sound Provider'])],
          ['Sound Engineer', formatValue(fields['Sound Engineer'])],
          ['Merch Person', formatValue(fields['Merch Person'])],
          ['Headliner', formatValue(fields.Headliner)],
        ],
        assets: [
          ['Drive Folder ID', formatValue(fields['Drive Folder ID'])],
          ['Calendar Event ID', formatValue(fields['Calendar Event ID'])],
          ['Event Description', formatValue(fields['Event Description'])],
        ],
        notes: [
          ['Show Notes', formatValue(fields['Show Notes'])],
          ['Sound Notes', formatValue(fields['Sound Notes'])],
          ['Merch Notes', formatValue(fields['Merch Notes'])],
        ],
      },
    }
  } catch (error) {
    return {
      ok: false,
      error: error?.message || 'Unknown Airtable error',
      show: null,
    }
  }
}

export async function getAdminCampaignContext(showId) {
  const detail = await getAdminShowDetail(showId)
  if (!detail.ok || !detail.show) return detail

  const show = detail.show
  const [bandRecord, venueRecord] = await Promise.all([
    show.bandIds?.[0] ? fetchAirtableRecord(TABLES.bands, show.bandIds[0]).catch(() => null) : null,
    show.venueIds?.[0] ? fetchAirtableRecord(TABLES.venues, show.venueIds[0]).catch(() => null) : null,
  ])

  return {
    ok: true,
    error: null,
    show,
    band: bandRecord ? { id: bandRecord.id, fields: bandRecord.fields || {} } : null,
    venue: venueRecord ? { id: venueRecord.id, fields: venueRecord.fields || {} } : null,
  }
}

export async function updateAdminShowFields(showId, incomingFields) {
  const sanitized = {}

  for (const [fieldName, value] of Object.entries(incomingFields || {})) {
    if (!ADMIN_SHOW_UPDATE_FIELDS.includes(fieldName)) continue
    sanitized[fieldName] = value
  }

  if (Object.keys(sanitized).length === 0) {
    throw new Error('No allowed show fields were provided for update.')
  }

  const updated = await updateAirtableRecord(TABLES.shows, showId, sanitized)
  return { id: updated.id, fields: updated.fields || {} }
}

function buildTaskFields(input = {}, mode = 'create') {
  const title = input.title || input.name || input.taskName
  const fields = {}

  if (title !== undefined) fields[TASK_FIELDS.name] = String(title).trim()
  if (input.status !== undefined) fields[TASK_FIELDS.status] = input.status || 'Todo'
  if (input.priority !== undefined) fields[TASK_FIELDS.priority] = input.priority || 'Normal'
  if (input.dueDate !== undefined && input.dueDate !== '') fields[TASK_FIELDS.dueDate] = input.dueDate
  if (input.owner !== undefined && input.owner !== '') fields[TASK_FIELDS.owner] = input.owner
  if (input.source !== undefined && input.source !== '') fields[TASK_FIELDS.source] = input.source
  if (input.relatedShow !== undefined && input.relatedShow !== '') fields[TASK_FIELDS.relatedShow] = input.relatedShow
  if (input.notes !== undefined) fields[TASK_FIELDS.notes] = input.notes || ''
  if (input.completedAt !== undefined && input.completedAt !== '') fields[TASK_FIELDS.completedAt] = input.completedAt

  if (mode === 'create' && !fields[TASK_FIELDS.name]) {
    throw new Error('Task title is required.')
  }

  return fields
}

function minimalTaskFields(input = {}) {
  const title = input.title || input.name || input.taskName
  const fields = {
    [TASK_FIELDS.name]: String(title || 'Untitled Task').trim(),
  }
  if (input.status !== undefined) fields[TASK_FIELDS.status] = input.status || 'Todo'
  if (input.notes !== undefined) fields[TASK_FIELDS.notes] = input.notes || ''
  return fields
}

export async function createAdminTask(input = {}) {
  const fields = buildTaskFields({ status: 'Todo', priority: 'Normal', source: 'Manual', ...input }, 'create')

  try {
    const record = await createAirtableRecord(TABLES.tasks, fields)
    return normalizeTaskRecord(record)
  } catch (error) {
    try {
      const record = await createAirtableRecord(TABLES.tasks, minimalTaskFields(input))
      return normalizeTaskRecord(record)
    } catch {
      throw new Error(`Could not create task in Airtable. Confirm a TASKS table exists with fields like Name, Status, Priority, Due Date, Source, Notes, and Completed At. Original error: ${error?.message || 'Unknown error'}`)
    }
  }
}

export async function updateAdminTask(taskId, updates = {}) {
  if (!taskId) throw new Error('Missing task ID.')
  const fields = buildTaskFields(updates, 'update')
  if (Object.keys(fields).length === 0) throw new Error('No task fields were provided for update.')

  try {
    const record = await updateAirtableRecord(TABLES.tasks, taskId, fields)
    return normalizeTaskRecord(record)
  } catch (error) {
    if (fields[TASK_FIELDS.completedAt] !== undefined) {
      const retryFields = { ...fields }
      delete retryFields[TASK_FIELDS.completedAt]
      const record = await updateAirtableRecord(TABLES.tasks, taskId, retryFields)
      return normalizeTaskRecord(record)
    }
    throw error
  }
}

export async function completeAdminTask(taskId) {
  return updateAdminTask(taskId, {
    status: 'Done',
    completedAt: new Date().toISOString(),
  })
}

export async function createAiRunLog({ name, notes, status = 'Complete' }) {
  const record = await createAirtableRecord(TABLES.aiRuns, {
    Name: name,
    Notes: notes,
    Status: status,
  })

  return record
}

export async function createApprovalItem({ name, notes, status = 'Pending' }) {
  const record = await createAirtableRecord(TABLES.approvalQueue, {
    Name: name,
    Notes: notes,
    Status: status,
  })

  return record
}

export async function getApprovalItem(approvalId) {
  const record = await fetchAirtableRecord(TABLES.approvalQueue, approvalId)
  const fields = record.fields || {}
  const payload = safeJsonParse(fields.Notes)

  return {
    id: record.id,
    name: fields.Name || 'Untitled Approval',
    status: fields.Status || '—',
    notes: fields.Notes || '',
    payload,
  }
}

export async function markApprovalStatus(approvalId, status, extraNotes) {
  const existing = await getApprovalItem(approvalId)
  const notes = extraNotes ? `${existing.notes}\n\n${extraNotes}` : existing.notes
  const updated = await updateAirtableRecord(TABLES.approvalQueue, approvalId, {
    Status: status,
    Notes: notes,
  })

  return { id: updated.id, fields: updated.fields || {} }
}

export async function approveSaveEventDescription(approvalId) {
  const approval = await getApprovalItem(approvalId)

  if (!approval.payload || approval.payload.actionType !== 'save_event_description') {
    throw new Error('This approval item is not a save-event-description approval.')
  }

  const { showId, eventDescription } = approval.payload

  if (!showId || !eventDescription) {
    throw new Error('Approval item is missing show ID or event description.')
  }

  const updatedShow = await updateAdminShowFields(showId, {
    'Event Description': eventDescription,
  })

  await markApprovalStatus(approvalId, 'Approved', `\nApproved and saved Event Description at ${new Date().toISOString()}.`)

  return { ok: true, show: updatedShow }
}
