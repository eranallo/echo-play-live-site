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

const RISKY_ACTIONS = [
  'sending emails',
  'posting publicly',
  'publishing website changes',
  'confirming bookings',
  'changing financial fields',
  'changing deal terms',
  'deleting records',
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

function specialistForQuestion(question) {
  const text = question.toLowerCase()
  if (text.includes('graphic') || text.includes('canva') || text.includes('flyer') || text.includes('art')) return 'Creative / Canva Agent'
  if (text.includes('campaign') || text.includes('caption') || text.includes('facebook') || text.includes('instagram') || text.includes('bandsintown') || text.includes('promo')) return 'Show Campaign Agent'
  if (text.includes('load') || text.includes('soundcheck') || text.includes('advance') || text.includes('call sheet') || text.includes('day of')) return 'Show Advance Agent'
  if (text.includes('venue') || text.includes('booking') || text.includes('follow') || text.includes('contract')) return 'Booking / Venue CRM Agent'
  if (text.includes('website') || text.includes('portal') || text.includes('page') || text.includes('site')) return 'Web Developer Agent'
  if (text.includes('payout') || text.includes('settlement') || text.includes('finance') || text.includes('expense') || text.includes('money')) return 'Finance / Settlement Agent'
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

function findReferencedShows(question, shows) {
  const text = question.toLowerCase()
  const dateMatches = text.match(/\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g) || []

  return (shows || []).filter(show => {
    const haystack = [show.band, show.venue, show.dateLabel, show.startTime, show.status]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    if (dateMatches.some(date => haystack.includes(date.replace(/-/g, '/')) || haystack.includes(date.replace(/\//g, '-')))) return true

    const bandWords = String(show.band || '').toLowerCase().split(/\s+/).filter(word => word.length > 3)
    const venueWords = String(show.venue || '').toLowerCase().split(/\s+/).filter(word => word.length > 3)
    return [...bandWords, ...venueWords].some(word => text.includes(word))
  }).slice(0, 6)
}

function filterPrioritiesForQuestion(question, priorities) {
  const text = question.toLowerCase()

  if (text.includes('graphic') || text.includes('flyer') || text.includes('canva')) {
    return priorities.filter(item => item.title.toLowerCase().includes('graphic'))
  }
  if (text.includes('facebook') || text.includes('fb')) {
    return priorities.filter(item => item.title.toLowerCase().includes('fb'))
  }
  if (text.includes('bandsintown')) {
    return priorities.filter(item => item.title.toLowerCase().includes('bandsintown'))
  }
  if (text.includes('contract')) {
    return priorities.filter(item => item.title.toLowerCase().includes('contract'))
  }
  if (text.includes('ticket')) {
    return priorities.filter(item => item.title.toLowerCase().includes('ticket'))
  }
  if (text.includes('today') || text.includes('priority') || text.includes('attention') || text.includes('behind')) {
    return priorities
  }

  return []
}

function buildSuggestedActions({ question, referencedShows, priorities }) {
  const ownerSpecialist = specialistForQuestion(question)
  const firstShow = referencedShows?.[0]
  const firstPriority = priorities?.[0]

  return [
    firstShow ? {
      label: 'Open Show Detail',
      type: 'open_show',
      href: `/admin/shows/${firstShow.id}`,
      description: `Open ${firstShow.band} at ${firstShow.venue}.`,
      requiresApproval: false,
    } : null,
    firstShow ? {
      label: 'Generate Campaign Draft',
      type: 'run_specialist',
      href: `/admin/shows/${firstShow.id}`,
      description: 'Use the Show Campaign Agent on this show detail page.',
      specialist: 'Show Campaign Agent',
      requiresApproval: true,
    } : null,
    firstPriority ? {
      label: `Route to ${firstPriority.ownerSpecialist}`,
      type: 'route_specialist',
      href: firstPriority.showId ? `/admin/shows/${firstPriority.showId}` : '/admin/chief-of-staff',
      description: firstPriority.recommendedAction,
      specialist: firstPriority.ownerSpecialist,
      requiresApproval: Boolean(firstPriority.approvalRequired),
    } : {
      label: `Route to ${ownerSpecialist}`,
      type: 'route_specialist',
      href: '/admin/chief-of-staff',
      description: `Have ${ownerSpecialist} handle the next specific task in this lane.`,
      specialist: ownerSpecialist,
      requiresApproval: false,
    },
  ].filter(Boolean)
}

function buildDeterministicChat({ question, context, fallbackBrief }) {
  const shows = context.showsOverview?.shows || []
  const priorities = buildShowPriorities(shows)
  const matchingPriorities = filterPrioritiesForQuestion(question, priorities).slice(0, 8)
  const referencedShows = findReferencedShows(question, shows)
  const pendingApprovals = context.opsFoundation?.approvals?.filter(item => item.status === 'Pending') || []
  const ownerSpecialist = specialistForQuestion(question)
  const text = question.toLowerCase()

  let answer

  if (text.includes('approval')) {
    answer = pendingApprovals.length
      ? `You have ${pendingApprovals.length} approval item${pendingApprovals.length === 1 ? '' : 's'} waiting. I would review the oldest or most show-critical item first before creating more campaign output.`
      : 'I do not see pending approvals in the current support-table snapshot.'
  } else if (matchingPriorities.length) {
    const top = matchingPriorities[0]
    answer = `The top item I see is ${top.title} for ${top.showLabel}. I would route that to ${top.ownerSpecialist}. ${top.reason}`
  } else if (referencedShows.length) {
    const show = referencedShows[0]
    const showPriorities = priorities.filter(item => item.showId === show.id)
    answer = showPriorities.length
      ? `${show.band} at ${show.venue} has ${showPriorities.length} open item${showPriorities.length === 1 ? '' : 's'}. The first one I would handle is ${showPriorities[0].title}, routed to ${showPriorities[0].ownerSpecialist}.`
      : `${show.band} at ${show.venue} does not show major readiness flags in the current dashboard snapshot. I would still review the show detail before making public or financial changes.`
  } else if (text.includes('today') || text.includes('attention') || text.includes('priority') || text.includes('behind')) {
    answer = fallbackBrief.todayFocus || fallbackBrief.executiveSummary
  } else {
    answer = `I would route this to ${ownerSpecialist}. I can answer from the current show dashboard, approval queue, recent run logs, and specialist lanes, but I will not execute risky actions without approval.`
  }

  const selectedPriorities = matchingPriorities.length
    ? matchingPriorities
    : referencedShows.length
      ? priorities.filter(item => referencedShows.some(show => show.id === item.showId)).slice(0, 8)
      : priorities.slice(0, 5)

  const specialistRouting = [
    {
      specialist: ownerSpecialist,
      reason: ownerSpecialist === 'Chief of Staff'
        ? 'This is a coordination or triage request.'
        : `The request appears to belong in the ${ownerSpecialist} lane.`,
      actions: selectedPriorities.slice(0, 3).map(item => item.recommendedAction),
    },
    ...Array.from(new Set(selectedPriorities.map(item => item.ownerSpecialist)))
      .filter(name => name !== ownerSpecialist)
      .slice(0, 3)
      .map(name => ({
        specialist: name,
        reason: 'This specialist owns one or more related open items.',
        actions: selectedPriorities.filter(item => item.ownerSpecialist === name).slice(0, 3).map(item => item.recommendedAction),
      })),
  ]

  return {
    answer,
    mode: 'deterministic',
    referencedShows: referencedShows.map(show => ({
      id: show.id,
      label: `${show.band} at ${show.venue}`,
      dateLabel: show.dateLabel,
      href: `/admin/shows/${show.id}`,
    })),
    specialistRouting,
    suggestedActions: buildSuggestedActions({ question, referencedShows, priorities: selectedPriorities }),
    approvalWarnings: RISKY_ACTIONS.map(action => `Approval required before ${action}.`),
    followUpQuestions: [
      'Do you want me to focus on one show or the whole week?',
      'Should I route this to a specialist next?',
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

async function generateChatWithOpenAI({ question, history, context, fallbackBrief, fallbackChat }) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const prompt = `You are the Echo Play Live Chief of Staff Agent inside Evan's private admin dashboard. Answer the user's question conversationally, but act like an operations coordinator.

Return valid JSON only with this exact shape:
{"answer":"","referencedShows":[],"specialistRouting":[],"suggestedActions":[],"approvalWarnings":[],"followUpQuestions":[]}.

Rules:
- Use only the provided context. Do not invent show facts.
- Be practical, direct, and operations-focused.
- Route work to the best specialist when useful.
- Do not execute risky work. Risky work includes ${RISKY_ACTIONS.join(', ')}.
- If a risky action is requested, offer to draft or queue it for approval.
- If a show is referenced, include a referencedShows item with id, label, dateLabel, and href when available.
- Suggested actions should be button-like objects: {"label":"","type":"","href":"","description":"","specialist":"","requiresApproval":true/false}.

User question:
${question}

Recent chat history:
${JSON.stringify(history || [], null, 2)}

Current admin context:
${JSON.stringify({
    shows: context.showsOverview?.shows || [],
    approvals: context.opsFoundation?.approvals || [],
    runs: context.opsFoundation?.runs || [],
    agents: context.opsFoundation?.agents || [],
    specialists: SPECIALISTS,
    fallbackBrief,
    fallbackChat,
  }, null, 2)}`

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
    throw new Error(`Chief of Staff chat failed (${response.status}): ${text.slice(0, 240)}`)
  }

  const data = await response.json()
  const text = data.output_text || data.output?.flatMap(item => item.content || []).map(item => item.text).filter(Boolean).join('\n')
  if (!text) throw new Error('Chief of Staff chat returned no text.')

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

export async function askChiefOfStaff({ question, history = [], logRun = true }) {
  const cleanQuestion = String(question || '').trim()

  if (!cleanQuestion) {
    throw new Error('Ask the Chief of Staff a question first.')
  }

  if (cleanQuestion.length > 2000) {
    throw new Error('Question is too long. Keep the request under 2,000 characters.')
  }

  const context = await getChiefOfStaffContext()
  const fallbackBrief = buildDeterministicBrief(context)
  const fallbackChat = buildDeterministicChat({ question: cleanQuestion, context, fallbackBrief })
  let chat = null
  let usedFallback = false
  let generationWarning = null

  try {
    chat = await generateChatWithOpenAI({
      question: cleanQuestion,
      history: Array.isArray(history) ? history.slice(-8) : [],
      context,
      fallbackBrief,
      fallbackChat,
    })
  } catch (error) {
    generationWarning = error?.message || 'Chief of Staff chat generation failed.'
  }

  if (!chat) {
    usedFallback = true
    chat = fallbackChat
  }

  const result = {
    answer: chat.answer || fallbackChat.answer,
    mode: usedFallback ? 'deterministic' : 'ai',
    usedFallback,
    generationWarning,
    referencedShows: Array.isArray(chat.referencedShows) ? chat.referencedShows : fallbackChat.referencedShows,
    specialistRouting: Array.isArray(chat.specialistRouting) ? chat.specialistRouting : fallbackChat.specialistRouting,
    suggestedActions: Array.isArray(chat.suggestedActions) ? chat.suggestedActions : fallbackChat.suggestedActions,
    approvalWarnings: Array.isArray(chat.approvalWarnings) ? chat.approvalWarnings : fallbackChat.approvalWarnings,
    followUpQuestions: Array.isArray(chat.followUpQuestions) ? chat.followUpQuestions : fallbackChat.followUpQuestions,
  }

  let aiRun = null

  if (logRun) {
    aiRun = await createAiRunLog({
      name: 'Chief of Staff Chat',
      status: usedFallback ? 'Draft' : 'Complete',
      notes: JSON.stringify({
        agent: 'Chief of Staff Agent',
        question: cleanQuestion,
        mode: result.mode,
        usedFallback,
        generationWarning,
        answer: result.answer,
        referencedShows: result.referencedShows,
        suggestedActions: result.suggestedActions,
      }, null, 2),
    }).catch(error => ({ id: null, error: error?.message }))
  }

  return {
    ok: true,
    response: result,
    aiRunId: aiRun?.id || null,
    aiRunError: aiRun?.error || null,
  }
}
