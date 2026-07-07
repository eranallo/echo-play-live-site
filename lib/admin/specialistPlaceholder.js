import { createAiRunLog, createApprovalItem, getAdminCampaignContext } from '@/lib/admin/airtable'

export const WORK_LANES = {
  advance: { label: 'Show Advance', review: false },
  promo: { label: 'Promo Plan', review: true },
  design: { label: 'Design Brief', review: true },
}

export function workLaneOptions() {
  return Object.entries(WORK_LANES).map(([kind, lane]) => ({ kind, ...lane }))
}

function row(rows, label) {
  return rows?.find(item => item[0] === label)?.[1] || 'TBD'
}

function facts(context) {
  const show = context.show
  const band = context.band?.fields || {}
  const venue = context.venue?.fields || {}
  return {
    showId: show.id,
    title: show.title,
    band: show.band,
    venue: show.venue,
    date: show.dateLabel,
    start: show.startTime,
    age: show.ageRestriction,
    ticket: show.ticketPrice || (show.ticketUrl ? 'Ticket link available' : 'Ticket info TBD'),
    missing: show.missingFlags || [],
    logistics: show.logistics || [],
    people: show.people || [],
    notes: show.notes || [],
    genre: band.Genre || band.Tagline || 'live music',
    address: venue.Address || '',
  }
}

function buildAdvance(context, instruction) {
  const f = facts(context)
  return {
    title: `Show Advance — ${f.title}`,
    lane: WORK_LANES.advance.label,
    summary: `Show-readiness plan for ${f.band} at ${f.venue}.`,
    show: f,
    callSheet: {
      date: f.date,
      venue: f.venue,
      address: f.address || 'TBD',
      loadIn: row(f.logistics, 'Load-In'),
      soundCheck: row(f.logistics, 'Sound Check'),
      start: f.start,
      end: row(f.logistics, 'End'),
    },
    checklist: ['Confirm load-in', 'Confirm soundcheck', 'Confirm players and crew', 'Confirm parking/unload', 'Confirm merch setup', 'Confirm day-of contact'],
    questions: ['Confirmed load-in?', 'Where should we park/unload?', 'Who is day-of contact?', 'Where does merch set up?'],
    instruction: instruction || '',
    review: false,
  }
}

function buildPromo(context, instruction) {
  const f = facts(context)
  return {
    title: `Promo Plan — ${f.title}`,
    lane: WORK_LANES.promo.label,
    summary: `Promo draft package for ${f.band} at ${f.venue}.`,
    show: f,
    copy: {
      title: `${f.band} at ${f.venue}`,
      long: `${f.band} comes to ${f.venue} on ${f.date} for a night built around ${f.genre}.\n\nShow time: ${f.start}\nAge restriction: ${f.age}\nTicket info: ${f.ticket}`,
      short: `${f.band} at ${f.venue} on ${f.date}. ${f.ticket}.`,
      caption: `${f.band} is coming to ${f.venue} on ${f.date}. ${f.ticket}.`,
    },
    plan: ['Announcement', 'Reminder', 'Story countdown', 'Listing copy'],
    missing: f.missing,
    instruction: instruction || '',
    review: true,
  }
}

function buildDesign(context, instruction) {
  const f = facts(context)
  return {
    title: `Design Brief — ${f.title}`,
    lane: WORK_LANES.design.label,
    summary: `Design brief for ${f.band} at ${f.venue}.`,
    show: f,
    brief: {
      concept: `Premium Echo Play Live show graphic for ${f.band} at ${f.venue}.`,
      requiredText: [f.band, f.venue, f.date, f.start, f.ticket, f.age].filter(Boolean),
      sizes: ['Square 1:1', 'Feed 4:5', 'Story 9:16', 'Event header'],
      assets: ['Band logo', 'Band photo', 'Background image', 'Ticket URL or QR if needed'],
      notes: ['Readable on phone', 'Strong hierarchy', 'Safe margins'],
    },
    missing: f.missing,
    instruction: instruction || '',
    review: true,
  }
}

export async function loadWorkContext(showId) {
  return getAdminCampaignContext(showId)
}

export async function saveWorkLog({ name, notes, review }) {
  const run = await createAiRunLog({ name, notes, status: 'Draft' }).catch(error => ({ id: null, error: error?.message }))
  let reviewRecord = null
  if (review) {
    reviewRecord = await createApprovalItem({ name: `${name} Review`, status: 'Pending', notes }).catch(error => ({ id: null, error: error?.message }))
  }
  return { run, reviewRecord }
}

export async function runWorkLane({ kind, showId, instruction = '', source = 'manual' }) {
  const context = await loadWorkContext(showId)
  if (!context.ok || !context.show) throw new Error(context.error || 'Show context could not be loaded.')
  const output = kind === 'advance' ? buildAdvance(context, instruction) : kind === 'promo' ? buildPromo(context, instruction) : buildDesign(context, instruction)
  const notes = JSON.stringify({ kind, source, showId, output }, null, 2)
  const saved = await saveWorkLog({ name: output.title, notes, review: output.review })
  return { ok: true, output, aiRunId: saved.run?.id || null, aiRunError: saved.run?.error || null, reviewItemId: saved.reviewRecord?.id || null, reviewError: saved.reviewRecord?.error || null }
}

export async function routeWorkAction({ action, source = 'chief_of_staff' }) {
  if (!action) throw new Error('Missing action.')
  const notes = JSON.stringify({ source, action, createdAt: new Date().toISOString() }, null, 2)
  const record = await createApprovalItem({ name: action.label || 'Routed Action', status: action.requiresApproval ? 'Pending' : 'Queued', notes })
  return { ok: true, reviewItemId: record?.id || null }
}
