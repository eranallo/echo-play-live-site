import {
  SHOW_LIFECYCLE_STAGES,
  buildOperationalReadiness,
  lifecycleStage,
  linkedIds,
  normalizeSegmentInput,
  prepState,
  prepStateComplete,
  selectName,
  selectNames,
} from '@/lib/admin/operations.mjs'
import { normalizeRunOfShowSegments } from '@/lib/portal/runOfShow.mjs'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appYUOoJgvRyZ7fLB'
const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN

const TABLES = {
  shows: process.env.AIRTABLE_SHOWS_TABLE || 'SHOWS',
  bands: process.env.AIRTABLE_BANDS_TABLE || 'BANDS',
  venues: process.env.AIRTABLE_VENUES_TABLE || 'VENUES',
  members: process.env.AIRTABLE_MEMBERS_TABLE || 'MEMBERS',
  crew: process.env.AIRTABLE_CREW_TABLE || 'CREW',
  setlists: process.env.AIRTABLE_SETLISTS_TABLE || 'SETLISTS',
  showSegments: process.env.AIRTABLE_SHOW_SEGMENTS_TABLE || 'SHOW SEGMENTS',
  socialPosts: process.env.AIRTABLE_SOCIAL_POSTS_TABLE || 'SOCIAL POSTS',
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

const DONE_TASK_STATUSES = new Set(['Done', 'Complete', 'Completed', 'Cancelled'])

export const ADMIN_SHOW_UPDATE_FIELDS = [
  'Date',
  'Band',
  'Venue',
  'Lifecycle Stage',
  'Operational Owner',
  'Trailer Load-In Time',
  'Load-In Time',
  'Sound Check Time',
  'Start Time',
  'End Time',
  'Members Playing',
  'Sound Engineer',
  'Merch Person',
  'Publish Date',
  'Funnel Plan',
  'Ticket Price',
  'Ticket URL',
  'Drive Folder',
  'SETLISTS',
  'Production Notes',
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

export const ADMIN_SHOW_CREATE_FIELDS = ADMIN_SHOW_UPDATE_FIELDS

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

function linkedNames(ids, map, fallback = '—') {
  const names = (ids || []).map(id => map.get(id) || id).filter(Boolean)
  return names.length ? names.join(', ') : fallback
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

function taskIsDone(status) {
  return DONE_TASK_STATUSES.has(String(status || '').trim())
}

function assertAirtableToken() {
  if (!AIRTABLE_API_TOKEN) {
    throw new Error('Missing Airtable server credential in Vercel.')
  }
}

async function airtableFetch(url, options = {}, attempt = 0) {
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

  if (response.status === 429 && attempt < 3) {
    await new Promise(resolve => setTimeout(resolve, 350 * (2 ** attempt)))
    return airtableFetch(url, options, attempt + 1)
  }

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

async function updateAirtableRecords(table, records) {
  if (!records.length) return []
  const updated = []

  for (let index = 0; index < records.length; index += 10) {
    const chunk = records.slice(index, index + 10)
    const data = await airtableFetch(airtableTableUrl(table), {
      method: 'PATCH',
      body: JSON.stringify({ records: chunk, typecast: true }),
    })
    updated.push(...(data.records || []))
  }

  return updated
}

async function deleteAirtableRecord(table, recordId) {
  return airtableFetch(airtableRecordUrl(table, recordId), {
    method: 'DELETE',
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

function getChecklist(fields) {
  return [
    ['Contract Signed', fields['Contract Signed']],
    ['Graphic Created', fields['Graphic Created']],
    ['Trailer Reserved', fields['Trailer Reserved']],
    ['Facebook Event Created', fields['Facebook Event Created']],
    ['Bandsintown Posted', fields['Bandsintown Posted']],
    ['Promotion Released', fields['Promotion Released']],
    ['Ads Running', fields['Ads Running']],
  ].map(([label, value]) => ({
    label,
    state: prepState(value),
    complete: prepStateComplete(value),
  }))
}

function recordsByLinkedShow(records = [], fieldName = 'Show') {
  const grouped = new Map()
  for (const record of records) {
    for (const showId of linkedIds(record.fields?.[fieldName])) {
      const items = grouped.get(showId) || []
      items.push(record)
      grouped.set(showId, items)
    }
  }
  return grouped
}

function normalizeShowRecord(record, bandMap, venueMap, context = {}) {
  const fields = record.fields || {}
  const bandIds = normalizeLinkedIds(fields.Band)
  const venueIds = normalizeLinkedIds(fields.Venue)
  const readiness = buildOperationalReadiness(fields, context)
  const missingFlags = readiness.warnings.map(warning => warning.label)

  return {
    id: record.id,
    date: fields.Date || null,
    dateLabel: formatDate(fields.Date),
    bandIds,
    venueIds,
    band: firstLinkedName(bandIds, bandMap),
    venue: firstLinkedName(venueIds, venueMap),
    status: lifecycleStage(fields),
    legacyStatus: fields.Status || 'No Status',
    owner: fields['Operational Owner'] || 'Unassigned',
    startTime: formatTime(fields['Start Time']),
    ageRestriction: fields['Age Restriction'] || 'TBD',
    ticketPrice: fields['Ticket Price'] || '',
    ticketUrl: fields['Ticket URL'] || '',
    contractSigned: prepStateComplete(fields['Contract Signed']),
    graphicCreated: prepStateComplete(fields['Graphic Created']),
    facebookEventCreated: prepStateComplete(fields['Facebook Event Created']),
    bandsintownPosted: prepStateComplete(fields['Bandsintown Posted']),
    promotionReleased: prepStateComplete(fields['Promotion Released']),
    readiness,
    missingFlags,
    needsAttention: readiness.needsAttention,
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
  const status = selectName(fields['Approval State'] || fields.Status, 'Pending')
  return {
    id: record.id,
    item: fields['Approval Item'] || fields.Name || 'Untitled Approval',
    actionType: fields['Action Type'] || '—',
    status,
    riskLevel: selectName(fields['Risk Level'], 'Medium'),
    relatedShowIds: linkedIds(fields['Related Show']),
    createdAt: formatDateTime(fields['Requested At'] || fields['Created At'] || fields.Created || record.createdTime),
    proposedChange: fields['Proposed Change'] || fields.Notes || '',
    resolutionNotes: fields['Resolution Notes'] || '',
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
  const status = fields[TASK_FIELDS.status] || fields.Status || 'To Do'
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
    relatedShowIds: linkedIds(fields[TASK_FIELDS.relatedShow] || fields.Show || fields['Related Show']),
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
    const [bandMap, venueMap, showRecords, segmentRecords, socialPostRecords] = await Promise.all([
      getRecordNameMap(TABLES.bands, 'Band Name'),
      getRecordNameMap(TABLES.venues, 'Venue Name'),
      fetchAirtableRecords(TABLES.shows, {
        'sort[0][field]': 'Date',
        'sort[0][direction]': 'asc',
        maxRecords: '60',
      }),
      fetchAirtableRecords(TABLES.showSegments),
      fetchAirtableRecords(TABLES.socialPosts),
    ])
    const segmentsByShow = recordsByLinkedShow(segmentRecords)
    const socialPostsByShow = recordsByLinkedShow(socialPostRecords, 'Linked Show')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcoming = showRecords
      .filter(record => {
        const date = dateValue(record.fields?.Date)
        return !date || date >= today
      })
      .slice(0, 24)
      .map(record => normalizeShowRecord(record, bandMap, venueMap, {
        segmentCount: segmentsByShow.get(record.id)?.length || 0,
        setlistCount: linkedIds(record.fields?.SETLISTS).length,
        socialPosts: socialPostsByShow.get(record.id) || [],
      }))

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

export async function getAdminShowsIndex() {
  if (!AIRTABLE_API_TOKEN) {
    return { ok: false, error: 'Missing Airtable server credential in Vercel.', shows: [] }
  }

  try {
    const [bandMap, venueMap, showRecords, segmentRecords, socialPostRecords] = await Promise.all([
      getRecordNameMap(TABLES.bands, 'Band Name'),
      getRecordNameMap(TABLES.venues, 'Venue Name'),
      fetchAirtableRecords(TABLES.shows, {
        'sort[0][field]': 'Date',
        'sort[0][direction]': 'desc',
        maxRecords: '100',
      }),
      fetchAirtableRecords(TABLES.showSegments),
      fetchAirtableRecords(TABLES.socialPosts),
    ])
    const segmentsByShow = recordsByLinkedShow(segmentRecords)
    const socialPostsByShow = recordsByLinkedShow(socialPostRecords, 'Linked Show')

    return {
      ok: true,
      error: null,
      shows: showRecords.map(record => normalizeShowRecord(record, bandMap, venueMap, {
        segmentCount: segmentsByShow.get(record.id)?.length || 0,
        setlistCount: linkedIds(record.fields?.SETLISTS).length,
        socialPosts: socialPostsByShow.get(record.id) || [],
      })),
    }
  } catch (error) {
    return { ok: false, error: error?.message || 'Unknown Airtable error', shows: [] }
  }
}

async function recordOptions(table, labelField, params = {}) {
  const records = await fetchAirtableRecords(table, {
    [`fields[]`]: labelField,
    ...params,
  })
  return records
    .map(record => ({ id: record.id, label: record.fields?.[labelField] || record.id }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export async function getAdminShowFormOptions() {
  if (!AIRTABLE_API_TOKEN) {
    return {
      ok: false,
      error: 'Missing Airtable server credential in Vercel.',
      bands: [],
      venues: [],
      members: [],
      crew: [],
      setlists: [],
      lifecycleStages: SHOW_LIFECYCLE_STAGES,
    }
  }

  try {
    const [bands, venues, members, crew, setlists] = await Promise.all([
      recordOptions(TABLES.bands, 'Band Name'),
      recordOptions(TABLES.venues, 'Venue Name'),
      recordOptions(TABLES.members, 'Member Name'),
      recordOptions(TABLES.crew, 'Name'),
      recordOptions(TABLES.setlists, 'Set Name'),
    ])
    return {
      ok: true,
      error: null,
      bands,
      venues,
      members,
      crew,
      setlists,
      lifecycleStages: SHOW_LIFECYCLE_STAGES,
    }
  } catch (error) {
    return {
      ok: false,
      error: error?.message || 'Unknown Airtable error',
      bands: [],
      venues: [],
      members: [],
      crew: [],
      setlists: [],
      lifecycleStages: SHOW_LIFECYCLE_STAGES,
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
    const [
      bandMap,
      venueMap,
      memberMap,
      crewMap,
      setlistMap,
      record,
      segmentRecords,
      socialPostRecords,
      taskRecords,
    ] = await Promise.all([
      getRecordNameMap(TABLES.bands, 'Band Name'),
      getRecordNameMap(TABLES.venues, 'Venue Name'),
      getRecordNameMap(TABLES.members, 'Member Name'),
      getRecordNameMap(TABLES.crew, 'Name'),
      getRecordNameMap(TABLES.setlists, 'Set Name'),
      fetchAirtableRecord(TABLES.shows, showId),
      fetchAirtableRecords(TABLES.showSegments),
      fetchAirtableRecords(TABLES.socialPosts),
      fetchAirtableRecords(TABLES.tasks),
    ])

    const fields = record.fields || {}
    const segments = normalizeRunOfShowSegments(
      segmentRecords.filter(segment => linkedIds(segment.fields?.Show).includes(showId))
    )
    const socialPosts = socialPostRecords.filter(post => linkedIds(post.fields?.['Linked Show']).includes(showId))
    const tasks = taskRecords
      .filter(task => linkedIds(task.fields?.[TASK_FIELDS.relatedShow]).includes(showId))
      .map(normalizeTaskRecord)
    const show = normalizeShowRecord(record, bandMap, venueMap, {
      segmentCount: segments.length,
      setlistCount: linkedIds(fields.SETLISTS).length,
      socialPosts,
    })
    const memberIds = linkedIds(fields['Members Playing'])
    const soundEngineerIds = linkedIds(fields['Sound Engineer'])
    const merchPersonIds = linkedIds(fields['Merch Person'])
    const setlistIds = linkedIds(fields.SETLISTS)

    return {
      ok: true,
      error: null,
      show: {
        ...show,
        title: `${show.band} at ${show.venue}`,
        eventDescription: fields['Event Description'] || '',
        rawFields: fields,
        segments,
        socialPosts: socialPosts.map(post => ({
          id: post.id,
          name: post.fields?.['Post Name'] || 'Untitled Post',
          status: post.fields?.Status || 'Idea',
          scheduledDate: post.fields?.['Scheduled Date'] || '',
          channel: formatValue(post.fields?.Channel),
          mediaLink: post.fields?.['Media Link'] || '',
        })),
        tasks,
        editor: {
          date: fields.Date || '',
          bandIds: linkedIds(fields.Band),
          venueIds: linkedIds(fields.Venue),
          lifecycleStage: lifecycleStage(fields),
          operationalOwner: fields['Operational Owner'] || '',
          trailerLoadIn: fields['Trailer Load-In Time'] || '',
          loadIn: fields['Load-In Time'] || '',
          soundCheck: fields['Sound Check Time'] || '',
          startTime: fields['Start Time'] || '',
          endTime: fields['End Time'] || '',
          publishDate: fields['Publish Date'] || '',
          publishToWebsite: fields['Publish to Website'] === true,
          memberIds,
          soundEngineerIds,
          merchPersonIds,
          setlistIds,
          driveFolder: fields['Drive Folder'] || '',
          ticketPrice: fields['Ticket Price'] ?? '',
          ticketUrl: fields['Ticket URL'] || '',
          showNotes: fields['Show Notes'] || '',
          soundNotes: fields['Sound Notes'] || '',
          merchNotes: fields['Merch Notes'] || '',
          productionNotes: fields['Production Notes'] || '',
          funnelPlan: selectNames(fields['Funnel Plan']),
          prepStates: {
            'Contract Signed': prepState(fields['Contract Signed']),
            'Graphic Created': prepState(fields['Graphic Created']),
            'Trailer Reserved': prepState(fields['Trailer Reserved']),
            'Facebook Event Created': prepState(fields['Facebook Event Created']),
            'Bandsintown Posted': prepState(fields['Bandsintown Posted']),
            'Promotion Released': prepState(fields['Promotion Released']),
            'Ads Running': prepState(fields['Ads Running']),
          },
        },
        editableNotes: {
          showNotes: fields['Show Notes'] || '',
          soundNotes: fields['Sound Notes'] || '',
          merchNotes: fields['Merch Notes'] || '',
        },
        checklist: getChecklist(fields),
        logistics: [
          ['Date', show.dateLabel],
          ['Lifecycle', show.status],
          ['Owner', show.owner],
          ['Trailer Load-In', formatValue(fields['Trailer Load-In Time'])],
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
          ['Members Playing', linkedNames(memberIds, memberMap)],
          ['Sound Provider', formatValue(fields['Sound Provider'])],
          ['Sound Engineer', linkedNames(soundEngineerIds, crewMap)],
          ['Merch Person', linkedNames(merchPersonIds, crewMap)],
          ['Headliner', formatValue(fields.Headliner)],
        ],
        assets: [
          ['Drive Folder', formatValue(fields['Drive Folder'])],
          ['Setlists', linkedNames(setlistIds, setlistMap)],
          ['Run of Show Segments', String(segments.length)],
          ['Social Posts', String(socialPosts.length)],
          ['Calendar Event ID', formatValue(fields['Calendar Event ID'])],
          ['Event Description', formatValue(fields['Event Description'])],
        ],
        notes: [
          ['Show Notes', formatValue(fields['Show Notes'])],
          ['Sound Notes', formatValue(fields['Sound Notes'])],
          ['Merch Notes', formatValue(fields['Merch Notes'])],
          ['Production Notes', formatValue(fields['Production Notes'])],
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

const DATE_FIELDS = new Set([
  'Date',
  'Trailer Load-In Time',
  'Load-In Time',
  'Sound Check Time',
  'Start Time',
  'End Time',
  'Publish Date',
])

const LINK_FIELDS = new Set([
  'Band',
  'Venue',
  'Members Playing',
  'Sound Engineer',
  'Merch Person',
  'SETLISTS',
])

const LEGACY_STATUS_BY_LIFECYCLE = {
  Inquiry: 'Inquiry',
  Tentative: 'Hold',
  Confirmed: 'Confirmed',
  Advancing: 'Confirmed',
  Ready: 'Confirmed',
  Completed: 'Completed',
  Reconciled: 'Completed',
  Cancelled: 'Cancelled',
}

function sanitizeShowFields(incomingFields, allowedFields) {
  const sanitized = {}

  for (const [fieldName, value] of Object.entries(incomingFields || {})) {
    if (!allowedFields.includes(fieldName)) continue

    if (DATE_FIELDS.has(fieldName)) {
      sanitized[fieldName] = value || null
    } else if (LINK_FIELDS.has(fieldName)) {
      sanitized[fieldName] = linkedIds(value)
    } else if (fieldName === 'Funnel Plan') {
      sanitized[fieldName] = selectNames(value)
    } else if (fieldName === 'Ticket Price') {
      sanitized[fieldName] = value === '' || value === null || value === undefined ? null : Number(value)
    } else {
      sanitized[fieldName] = value
    }
  }

  if (sanitized['Lifecycle Stage']) {
    if (!SHOW_LIFECYCLE_STAGES.includes(sanitized['Lifecycle Stage'])) {
      throw new Error('Invalid show lifecycle stage.')
    }
    sanitized.Status = LEGACY_STATUS_BY_LIFECYCLE[sanitized['Lifecycle Stage']]
  }

  return sanitized
}

export async function updateAdminShowFields(showId, incomingFields) {
  const sanitized = sanitizeShowFields(incomingFields, ADMIN_SHOW_UPDATE_FIELDS)

  if (Object.keys(sanitized).length === 0) {
    throw new Error('No allowed show fields were provided for update.')
  }

  const updated = await updateAirtableRecord(TABLES.shows, showId, sanitized)
  return { id: updated.id, fields: updated.fields || {} }
}

export async function createAdminShow(incomingFields = {}) {
  const sanitized = sanitizeShowFields(incomingFields, ADMIN_SHOW_CREATE_FIELDS)

  if (!sanitized.Date) throw new Error('Show date is required.')
  if (!sanitized.Band?.length) throw new Error('Select a band.')
  if (!sanitized.Venue?.length) throw new Error('Select a venue.')
  if (!sanitized['Lifecycle Stage']) {
    sanitized['Lifecycle Stage'] = 'Inquiry'
    sanitized.Status = 'Inquiry'
  }
  if (!sanitized['Funnel Plan']?.length) {
    sanitized['Funnel Plan'] = ['Contract', 'Graphic', 'Bandsintown', 'Facebook Event']
  }

  const record = await createAirtableRecord(TABLES.shows, sanitized)
  return { id: record.id, fields: record.fields || {} }
}

async function getShowSegmentRecords(showId) {
  const records = await fetchAirtableRecords(TABLES.showSegments)
  return records.filter(record => linkedIds(record.fields?.Show).includes(showId))
}

function segmentFields(showId, input, includeShow = false) {
  const normalized = normalizeSegmentInput(input)
  const fields = {
    'Segment Name': normalized.name,
    'Segment Type': normalized.type,
    'Start Time': normalized.startTime || null,
    'End Time': normalized.endTime || null,
    Order: normalized.order,
    Details: normalized.details,
    'Duration Minutes': normalized.durationMinutes,
  }
  if (includeShow) fields.Show = [showId]
  return fields
}

export async function createAdminShowSegment(showId, input = {}) {
  if (!showId) throw new Error('Missing show ID.')
  const existing = await getShowSegmentRecords(showId)
  const nextOrder = existing.reduce((max, record) => Math.max(max, Number(record.fields?.Order) || 0), 0) + 1
  const fields = segmentFields(showId, {
    ...input,
    order: input.order === '' || input.order === undefined || input.order === null ? nextOrder : input.order,
  }, true)
  const record = await createAirtableRecord(TABLES.showSegments, fields)
  return normalizeRunOfShowSegments([record])[0]
}

export async function updateAdminShowSegment(showId, segmentId, input = {}) {
  if (!showId || !segmentId) throw new Error('Missing show or segment ID.')
  const record = await fetchAirtableRecord(TABLES.showSegments, segmentId)
  if (!linkedIds(record.fields?.Show).includes(showId)) throw new Error('Segment does not belong to this show.')
  const updated = await updateAirtableRecord(TABLES.showSegments, segmentId, segmentFields(showId, {
    ...input,
    order: input.order === '' || input.order === undefined || input.order === null
      ? record.fields?.Order
      : input.order,
  }))
  return normalizeRunOfShowSegments([updated])[0]
}

export async function deleteAdminShowSegment(showId, segmentId) {
  if (!showId || !segmentId) throw new Error('Missing show or segment ID.')
  const record = await fetchAirtableRecord(TABLES.showSegments, segmentId)
  if (!linkedIds(record.fields?.Show).includes(showId)) throw new Error('Segment does not belong to this show.')
  await deleteAirtableRecord(TABLES.showSegments, segmentId)
  return { id: segmentId }
}

export async function reorderAdminShowSegments(showId, orderedIds = []) {
  const records = await getShowSegmentRecords(showId)
  const validIds = new Set(records.map(record => record.id))
  const uniqueIds = [...new Set(orderedIds)]
  if (uniqueIds.length !== records.length || uniqueIds.some(id => !validIds.has(id))) {
    throw new Error('Segment order does not match this show.')
  }
  await updateAirtableRecords(TABLES.showSegments, uniqueIds.map((id, index) => ({
    id,
    fields: { Order: index + 1 },
  })))
  return { orderedIds: uniqueIds }
}

function buildTaskFields(input = {}, mode = 'create') {
  const title = input.title || input.name || input.taskName
  const fields = {}

  if (title !== undefined) fields[TASK_FIELDS.name] = String(title).trim()
  if (input.status !== undefined) fields[TASK_FIELDS.status] = input.status || 'To Do'
  if (input.priority !== undefined) fields[TASK_FIELDS.priority] = input.priority || 'Normal'
  if (input.dueDate !== undefined && input.dueDate !== '') fields[TASK_FIELDS.dueDate] = input.dueDate
  if (input.owner !== undefined && input.owner !== '') fields[TASK_FIELDS.owner] = input.owner
  if (input.source !== undefined && input.source !== '') fields[TASK_FIELDS.source] = input.source
  if (input.relatedShow !== undefined && input.relatedShow !== '') {
    fields[TASK_FIELDS.relatedShow] = linkedIds(input.relatedShow)
  }
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
  if (input.status !== undefined) fields[TASK_FIELDS.status] = input.status || 'To Do'
  if (input.notes !== undefined) fields[TASK_FIELDS.notes] = input.notes || ''
  return fields
}

export async function createAdminTask(input = {}) {
  const fields = buildTaskFields({ status: 'To Do', priority: 'Normal', source: 'Manual', ...input }, 'create')

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

export async function createApprovalItem({
  name,
  notes,
  status = 'Pending',
  actionType = '',
  riskLevel = 'Medium',
  relatedShow = '',
  proposedChange = '',
}) {
  const payload = safeJsonParse(notes)
  const showId = relatedShow || payload?.showId || ''
  const record = await createAirtableRecord(TABLES.approvalQueue, {
    Name: name,
    Notes: notes,
    'Approval State': status,
    'Action Type': actionType || payload?.actionType || '',
    'Risk Level': riskLevel,
    'Related Show': showId ? [showId] : [],
    'Proposed Change': proposedChange || notes || '',
    'Requested At': new Date().toISOString(),
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
    status: selectName(fields['Approval State'] || fields.Status, 'Pending'),
    notes: fields.Notes || '',
    payload,
  }
}

export async function markApprovalStatus(approvalId, status, extraNotes) {
  const existing = await getApprovalItem(approvalId)
  const resolutionNotes = extraNotes || ''
  const updated = await updateAirtableRecord(TABLES.approvalQueue, approvalId, {
    'Approval State': status,
    'Resolution Notes': resolutionNotes,
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
