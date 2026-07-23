export const SHOW_LIFECYCLE_STAGES = [
  'Inquiry',
  'Tentative',
  'Confirmed',
  'Advancing',
  'Ready',
  'Completed',
  'Reconciled',
  'Cancelled',
]

export const SHOW_SEGMENT_TYPES = [
  'Performance',
  'Break',
  'Production',
  'Guest / Support',
  'Wedding / Program',
  'Travel / Logistics',
  'Other',
]

export const PREP_STATE_OPTIONS = ['To Do', 'Complete', 'Not Needed']

const LEGACY_STAGE_MAP = {
  Hold: 'Tentative',
}

const DEFAULT_FUNNEL = ['Contract', 'Graphic', 'Bandsintown', 'Facebook Event']

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0
  return value !== null && value !== undefined && String(value).trim() !== ''
}

export function selectName(value, fallback = '') {
  if (!hasValue(value)) return fallback
  if (typeof value === 'object' && value?.name) return String(value.name)
  return String(value)
}

export function selectNames(value) {
  if (!value) return []
  return (Array.isArray(value) ? value : [value]).map(item => selectName(item)).filter(Boolean)
}

export function linkedIds(value) {
  if (!value) return []
  return (Array.isArray(value) ? value : [value])
    .map(item => (typeof item === 'object' && item?.id ? item.id : item))
    .filter(Boolean)
}

export function lifecycleStage(fields = {}) {
  const canonical = selectName(fields['Lifecycle Stage'])
  if (canonical) return canonical
  const legacy = selectName(fields.Status, 'Inquiry')
  return LEGACY_STAGE_MAP[legacy] || legacy
}

export function prepStateComplete(value) {
  return ['Complete', 'Completed', 'Not Needed'].includes(selectName(value))
}

export function prepState(value) {
  return selectName(value, 'To Do')
}

export function funnelSteps(fields = {}) {
  const selected = selectNames(fields['Funnel Plan'])
  return selected.length ? selected : DEFAULT_FUNNEL
}

export function daysUntil(value, now = new Date()) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return Math.ceil((date - start) / 86400000)
}

function checklistItem(label, complete, weight, group, field, applicable = true) {
  return { label, complete: applicable ? Boolean(complete) : true, weight, group, field, applicable }
}

function campaignChecklist(fields = {}, socialPosts = []) {
  const funnel = new Set(funnelSteps(fields))
  const items = [
    checklistItem('Contract', prepStateComplete(fields['Contract Signed']), 5, 'Booking', 'Contract Signed', funnel.has('Contract')),
    checklistItem('Graphic', prepStateComplete(fields['Graphic Created']), 5, 'Campaign', 'Graphic Created', funnel.has('Graphic')),
    checklistItem('Facebook Event', prepStateComplete(fields['Facebook Event Created']), 5, 'Campaign', 'Facebook Event Created', funnel.has('Facebook Event')),
    checklistItem('Bandsintown', prepStateComplete(fields['Bandsintown Posted']), 5, 'Campaign', 'Bandsintown Posted', funnel.has('Bandsintown')),
    checklistItem('Ads', prepStateComplete(fields['Ads Running']), 4, 'Campaign', 'Ads Running', funnel.has('Ads')),
    checklistItem('Trailer', prepStateComplete(fields['Trailer Reserved']), 4, 'Logistics', 'Trailer Reserved', funnel.has('Trailer')),
  ]

  if (socialPosts.length) {
    const readyStates = new Set(['Approved', 'Scheduled', 'Published', 'Skipped'])
    const complete = socialPosts.every(post => readyStates.has(selectName(post?.fields?.Status)))
    items.push(checklistItem('Social campaign', complete, 5, 'Campaign', 'SOCIAL POSTS'))
  }

  return items
}

function baseChecklist(fields = {}, { segmentCount = 0, setlistCount = 0, socialPosts = [] } = {}) {
  const stage = lifecycleStage(fields)
  const staffing = linkedIds(fields['Members Playing'])
  const soundAssigned = linkedIds(fields['Sound Engineer']).length > 0 || hasValue(fields['Sound Provider'])

  return [
    checklistItem('Show date', hasValue(fields.Date), 4, 'Booking', 'Date'),
    checklistItem('Band', linkedIds(fields.Band).length > 0, 4, 'Booking', 'Band'),
    checklistItem('Venue', linkedIds(fields.Venue).length > 0, 4, 'Booking', 'Venue'),
    checklistItem('Lifecycle confirmed', !['Inquiry', 'Tentative'].includes(stage), 3, 'Booking', 'Lifecycle Stage'),
    checklistItem('Venue load-in', hasValue(fields['Load-In Time']), 5, 'Logistics', 'Load-In Time'),
    checklistItem('Soundcheck', hasValue(fields['Sound Check Time']), 4, 'Logistics', 'Sound Check Time'),
    checklistItem('Show start', hasValue(fields['Start Time']), 5, 'Logistics', 'Start Time'),
    checklistItem('Show end', hasValue(fields['End Time']), 4, 'Logistics', 'End Time'),
    checklistItem('Playing members', staffing.length > 0, 8, 'Staffing', 'Members Playing'),
    checklistItem('Sound assignment', soundAssigned, 5, 'Staffing', 'Sound Engineer'),
    checklistItem('Production notes', hasValue(fields['Production Notes']), 4, 'Staffing', 'Production Notes'),
    checklistItem('Run of show', segmentCount > 0, 7, 'Run of Show', 'SHOW SEGMENTS'),
    checklistItem('Setlist', setlistCount > 0, 5, 'Documents', 'SETLISTS'),
    checklistItem('Drive folder', hasValue(fields['Drive Folder']), 5, 'Documents', 'Drive Folder'),
    checklistItem('Event description', hasValue(fields['Event Description']), 4, 'Campaign', 'Event Description'),
    checklistItem('Publish date', hasValue(fields['Publish Date']), 3, 'Campaign', 'Publish Date'),
    checklistItem('Promotion released', prepStateComplete(fields['Promotion Released']), 4, 'Campaign', 'Promotion Released'),
    ...campaignChecklist(fields, socialPosts),
  ]
}

function warningSeverity(item, days, fields) {
  if (['Date', 'Band', 'Venue'].includes(item.field)) return 'Critical'
  if (item.field === 'Lifecycle Stage' && days !== null && days <= 30) return 'High'
  if (['Members Playing', 'Load-In Time', 'Start Time'].includes(item.field) && days !== null && days <= 14) return 'High'
  if (item.field === 'SHOW SEGMENTS' && days !== null && days <= 7) return 'High'

  const publishDate = fields['Publish Date'] ? new Date(fields['Publish Date']) : null
  const publishPassed = publishDate && !Number.isNaN(publishDate.getTime()) && publishDate < new Date()
  if (item.group === 'Campaign' && publishPassed) return 'High'
  return 'Open'
}

export function buildOperationalReadiness(fields = {}, context = {}) {
  const checklist = baseChecklist(fields, context)
  const applicable = checklist.filter(item => item.applicable)
  const possible = applicable.reduce((sum, item) => sum + item.weight, 0)
  const earned = applicable.reduce((sum, item) => sum + (item.complete ? item.weight : 0), 0)
  const score = possible ? Math.round((earned / possible) * 100) : 0
  const days = daysUntil(fields.Date, context.now)
  const warnings = applicable
    .filter(item => !item.complete)
    .map(item => ({
      label: item.label,
      field: item.field,
      group: item.group,
      severity: warningSeverity(item, days, fields),
    }))
    .sort((a, b) => {
      const rank = { Critical: 0, High: 1, Open: 2 }
      return rank[a.severity] - rank[b.severity] || a.group.localeCompare(b.group)
    })

  const groupNames = [...new Set(applicable.map(item => item.group))]
  const groups = groupNames.map(name => {
    const items = applicable.filter(item => item.group === name)
    const groupPossible = items.reduce((sum, item) => sum + item.weight, 0)
    const groupEarned = items.reduce((sum, item) => sum + (item.complete ? item.weight : 0), 0)
    return {
      name,
      score: groupPossible ? Math.round((groupEarned / groupPossible) * 100) : 100,
      complete: items.filter(item => item.complete).length,
      total: items.length,
    }
  })

  const campaignItems = applicable.filter(item => item.group === 'Campaign')
  const staffingItems = applicable.filter(item => item.group === 'Staffing')

  return {
    score,
    label: score >= 90 ? 'Ready' : score >= 70 ? 'Advancing' : score >= 45 ? 'Needs work' : 'At risk',
    checklist,
    warnings,
    groups,
    needsAttention: warnings.length > 0,
    campaignReady: campaignItems.length > 0 && campaignItems.every(item => item.complete),
    staffingReady: staffingItems.length > 0 && staffingItems.every(item => item.complete),
    daysUntil: days,
  }
}

export function normalizeSegmentInput(input = {}) {
  const name = String(input.name || input['Segment Name'] || '').trim()
  if (!name) throw new Error('Segment name is required.')

  const type = SHOW_SEGMENT_TYPES.includes(input.type) ? input.type : 'Other'
  const duration = input.durationMinutes === '' || input.durationMinutes === null || input.durationMinutes === undefined
    ? null
    : Number(input.durationMinutes)
  const order = input.order === '' || input.order === null || input.order === undefined
    ? null
    : Number(input.order)

  if (duration !== null && (!Number.isFinite(duration) || duration <= 0 || duration > 1440)) {
    throw new Error('Duration must be between 1 and 1,440 minutes.')
  }
  if (order !== null && !Number.isFinite(order)) throw new Error('Segment order must be a number.')

  return {
    name,
    type,
    startTime: input.startTime || '',
    endTime: input.endTime || '',
    order,
    details: String(input.details || ''),
    durationMinutes: duration,
  }
}
