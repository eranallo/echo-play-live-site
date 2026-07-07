import { createAiRunLog, getAdminOpsFoundation, getAdminShowsOverview } from '@/lib/admin/airtable'

const SPECIALISTS = [
  {
    name: 'Show Campaign Agent',
    lane: 'Marketing',
    owns: ['event descriptions', 'social captions', 'campaign plans', 'promo angles'],
  },
  {
    name: 'Show Advance Agent',
    lane: 'Operations',
    owns: ['load-in details', 'call sheets', 'venue questions', 'day-of readiness'],
  },
  {
    name: 'Creative / Canva Agent',
    lane: 'Creative',
    owns: ['graphic briefs', 'asset checklists', 'export sizes', 'revision notes'],
  },
  {
    name: 'Booking / Venue CRM Agent',
    lane: 'Booking',
    owns: ['venue follow-ups', 'booking history', 'relationship notes', 'pitching bands'],
  },
  {
    name: 'Web Developer Agent',
    lane: 'Website',
    owns: ['website updates', 'public event pages', 'portal/admin improvements'],
  },
  {
    name: 'Finance / Settlement Agent',
    lane: 'Finance',
    owns: ['expenses', 'payouts', 'settlement checks', 'profitability review'],
  },
]

function daysUntil(dateValue) {
  if (!dateValue) return null
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return Math.ceil((date - today) / 86400000)
}

function classifyUrgency(days) {
  if (days === null) return 'Unknown'
  if (days < 0) return 'Past'
  if (days <= 3) return 'Critical'
  if (days <= 10) return 'High'
  if (days <= 21) return 'Medium'
  return 'Normal'
}

function specialistForFlag(flag) {
  const normalized = flag.toLowerCase()
  if (normalized.includes('graphic')) return 'Creative / Canva Agent'
  if (normalized.includes('fb') || normalized.includes('bandsintown') || normalized.includes('ticket')) return 'Show Campaign Agent'
  if (normalized.includes('contract')) return 'Booking / Venue CRM Agent'
  if (normalized.includes('start') || normalized.includes('age')) return 'Show Advance Agent'
  return 'Chief of Staff'
}

function buildShowPriorities(shows) {
  const priorities = []

  for (const show of shows || []) {
    const days = daysUntil(show.date)
    const urgency = classifyUrgency(days)

    for (const flag of show.missingFlags || []) {
      priorities.push({
        title: `${flag} needed`,
        ownerSpecialist: specialistForFlag(flag),
        urgency,
        showId: show.id,
        showLabel: `${show.band} at ${show.venue}`,
        dateLabel: show.dateLabel,
        reason: `${flag} is missing or incomplete for ${show.band} at ${show.venue}.`,
        recommendedAction: `Open the show detail and resolve ${flag}.`,
        approvalRequired: ['Contract', 'Ticket Info'].includes(flag),
      })
    }
  }

  const rank = { Critical: 0, High: 1, Medium: 2, Normal: 3, Unknown: 4, Past: 5 }
  return priorities.sort((a, b) => (rank[a.urgency] ?? 9) - (rank[b.urgency] ?? 9)).slice(0, 18)
}

function groupBySpecialist(priorities) {
  return SPECIALISTS.map(specialist => {
    const items = priorities.filter(item => item.ownerSpecialist === specialist.name)
    return {
      ...specialist,
      openItems: items.length,
      topItems: items.slice(0, 5),
    }
  })
}

function buildDeterministicBrief({ showsOverview, opsFoundation }) {
  const shows = showsOverview?.shows || []
  const priorities = buildShowPriorities(shows)
  const pendingApprovals = opsFoundation?.approvals?.filter(item => item.status === 'Pending') || []
  const critical = priorities.filter(item => item.urgency === 'Critical')
  const high = priorities.filter(item => item.urgency === 'High')
  const needsAttention = shows.filter(show => show.needsAttention)

  return {
    generatedAt: new Date().toISOString(),
    mode: 'deterministic',
    executiveSummary: shows.length
      ? `${shows.length} upcoming shows are loaded. ${needsAttention.length} need attention. ${pendingApprovals.length} approval items are pending.`
      : 'No upcoming shows are currently loaded for the Chief of Staff brief.',
    todayFocus: critical.length
      ? `Focus first on ${critical.length} critical show-readiness items happening within the next few days.`
      : high.length
        ? `Focus on ${high.length} high-priority items due within the next ten days.`
        : 'No critical show-readiness fires detected. Use this window to clean up campaign and advance details.',
    health: {
      upcomingShows: shows.length,
      showsNeedingAttention: needsAttention.length,
      pendingApprovals: pendingApprovals.length,
      recentRuns: opsFoundation?.runs?.length || 0,
      activeAgents: opsFoundation?.counts?.activeAgents || 0,
      supportTablesReady: `${opsFoundation?.counts?.tablesReady || 0}/3`,
    },
    priorities,
    specialistQueue: groupBySpecialist(priorities),
    risks: [
      critical.length ? `${critical.length} critical show items are close to show day.` : null,
      pendingApprovals.length ? `${pendingApprovals.length} approval items are waiting for review.` : null,
      needsAttention.length > 5 ? `${needsAttention.length} upcoming shows need attention; triage is recommended before creating new campaigns.` : null,
    ].filter(Boolean),
    quickWins: priorities
      .filter(item => ['Graphic needed', 'FB Event needed', 'Bandsintown needed'].includes(item.title))
      .slice(0, 6)
      .map(item => ({
        label: item.title,
        showLabel: item.showLabel,
        ownerSpecialist: item.ownerSpecialist,
        action: item.recommendedAction,
      })),
    approvalsToReview: pendingApprovals.slice(0, 8),
    nextActions: [
      priorities[0] ? `Send ${priorities[0].ownerSpecialist} to handle: ${priorities[0].title} for ${priorities[0].showLabel}.` : 'Review upcoming shows and confirm that the dashboard is loading current Airtable data.',
      pendingApprovals[0] ? `Review pending approval: ${pendingApprovals[0].item}.` : 'No pending approval item is currently first in line.',
      'Keep risky actions in approval mode: emails, public posts, website publishing, booking confirmations, and financial updates.',
    ],
  }
}

async function generateWithOpenAI(context) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const prompt = `You are the Echo Play Live Chief of Staff Agent. You coordinate specialist agents for a live music company. Use only the provided data. Do not invent facts. Return valid JSON only with this exact shape: {"executiveSummary":"","todayFocus":"","health":{},"priorities":[],"specialistQueue":[],"risks":[],"quickWins":[],"approvalsToReview":[],"nextActions":[]}.

Rules:
- Assign each priority to the best specialist.
- Do not recommend sending emails, posting publicly, publishing website changes, confirming bookings, or changing financial fields without approval.
- Keep recommendations practical and concise.
- Prioritize show readiness, campaign gaps, approval queue items, and operational blockers.

Context:
${JSON.stringify(context, null, 2)}`

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: prompt,
      text: {
        format: {
          type: 'json_object',
        },
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Chief of Staff generation failed (${response.status}): ${text.slice(0, 240)}`)
  }

  const data = await response.json()
  const text = data.output_text || data.output?.flatMap(item => item.content || []).map(item => item.text).filter(Boolean).join('\n')
  if (!text) throw new Error('Chief of Staff returned no text.')

  return JSON.parse(text)
}

export async function getChiefOfStaffContext() {
  const [showsOverview, opsFoundation] = await Promise.all([
    getAdminShowsOverview(),
    getAdminOpsFoundation(),
  ])

  return {
    showsOverview,
    opsFoundation,
    specialists: SPECIALISTS,
  }
}

export async function generateChiefOfStaffBrief({ logRun = false } = {}) {
  const context = await getChiefOfStaffContext()
  const fallback = buildDeterministicBrief(context)
  let brief = null
  let usedFallback = false
  let generationWarning = null

  try {
    brief = await generateWithOpenAI({
      shows: context.showsOverview?.shows || [],
      counts: context.showsOverview?.counts || {},
      approvals: context.opsFoundation?.approvals || [],
      runs: context.opsFoundation?.runs || [],
      agents: context.opsFoundation?.agents || [],
      specialists: SPECIALISTS,
      fallbackAnalysis: fallback,
    })
  } catch (error) {
    generationWarning = error?.message || 'Chief of Staff AI generation failed.'
  }

  if (!brief) {
    usedFallback = true
    brief = fallback
  }

  const result = {
    ...brief,
    generatedAt: brief.generatedAt || new Date().toISOString(),
    mode: usedFallback ? 'deterministic' : 'ai',
    usedFallback,
    generationWarning,
    specialists: SPECIALISTS,
  }

  let aiRun = null

  if (logRun) {
    aiRun = await createAiRunLog({
      name: 'Chief of Staff Brief',
      status: usedFallback ? 'Draft' : 'Complete',
      notes: JSON.stringify({
        agent: 'Chief of Staff Agent',
        generatedAt: result.generatedAt,
        mode: result.mode,
        usedFallback,
        generationWarning,
        executiveSummary: result.executiveSummary,
        todayFocus: result.todayFocus,
        health: result.health,
        priorityCount: Array.isArray(result.priorities) ? result.priorities.length : 0,
      }, null, 2),
    }).catch(error => ({ id: null, error: error?.message }))
  }

  return {
    ok: true,
    brief: result,
    aiRunId: aiRun?.id || null,
    aiRunError: aiRun?.error || null,
  }
}
