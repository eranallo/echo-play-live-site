import { createAiRunLog, createApprovalItem, getAdminCampaignContext } from '@/lib/admin/airtable'

export const WORK_LANES = {
  advance: {
    label: 'Show Advance',
    shortLabel: 'Advance',
    helper: 'Call sheet, venue questions, timeline, readiness gaps.',
    review: false,
    risk: 'Low',
    group: 'Show Ops',
  },
  promo: {
    label: 'Promo Plan',
    shortLabel: 'Promo',
    helper: 'Event copy, caption angles, listing language, promo cadence.',
    review: true,
    risk: 'Medium',
    group: 'Marketing',
  },
  design: {
    label: 'Design Brief',
    shortLabel: 'Design',
    helper: 'Canva-ready creative brief, asset checklist, size requirements.',
    review: true,
    risk: 'Medium',
    group: 'Creative',
  },
  booking: {
    label: 'Booking / Venue CRM',
    shortLabel: 'Booking',
    helper: 'Venue-facing next step, outreach draft, deal questions.',
    review: true,
    risk: 'High',
    group: 'Revenue',
  },
  finance: {
    label: 'Finance / Settlement',
    shortLabel: 'Finance',
    helper: 'Settlement checklist, payout review, missing money fields.',
    review: false,
    risk: 'Medium',
    group: 'Finance',
  },
  content: {
    label: 'Content Capture',
    shortLabel: 'Content',
    helper: 'Shot list, creator assignments, reel plan, post-show assets.',
    review: true,
    risk: 'Medium',
    group: 'Content',
  },
  web: {
    label: 'Web / SEO',
    shortLabel: 'Web',
    helper: 'Public listing audit, metadata suggestions, ticket-link checks.',
    review: true,
    risk: 'Medium',
    group: 'Website',
  },
  merch: {
    label: 'Merch Ops',
    shortLabel: 'Merch',
    helper: 'Merch setup, inventory, POS, table flow, settlement notes.',
    review: false,
    risk: 'Low',
    group: 'Show Ops',
  },
}

export function workLaneOptions() {
  return Object.entries(WORK_LANES).map(([kind, lane]) => ({ kind, ...lane }))
}

function row(rows, label) {
  return rows?.find(item => item[0] === label)?.[1] || 'TBD'
}

function clean(value, fallback = 'TBD') {
  if (value === null || value === undefined || value === '' || value === '—') return fallback
  return String(value)
}

function compact(items) {
  return items.filter(item => item !== null && item !== undefined && item !== '' && item !== '—')
}

function unique(items) {
  return [...new Set(compact(items))]
}

function facts(context) {
  const show = context.show
  const band = context.band?.fields || {}
  const venue = context.venue?.fields || {}
  const venueName = show.venue || venue['Venue Name'] || 'Venue TBD'
  const bandName = show.band || band['Band Name'] || 'Band TBD'
  const ticket = show.ticketPrice || (show.ticketUrl ? 'Ticket link available' : 'Ticket info TBD')
  const missing = show.missingFlags || []

  return {
    showId: show.id,
    title: show.title || `${bandName} at ${venueName}`,
    band: bandName,
    venue: venueName,
    date: show.dateLabel,
    start: show.startTime,
    end: row(show.logistics, 'End'),
    loadIn: row(show.logistics, 'Load-In'),
    soundCheck: row(show.logistics, 'Sound Check'),
    indoorOutdoor: row(show.logistics, 'Indoor / Outdoor'),
    age: show.ageRestriction,
    ticket,
    ticketUrl: show.ticketUrl || '',
    status: show.status,
    missing,
    logistics: show.logistics || [],
    people: show.people || [],
    deal: show.deal || [],
    assets: show.assets || [],
    notes: show.notes || [],
    eventDescription: show.eventDescription || '',
    genre: band.Genre || band.Tagline || band['Band Type'] || 'live music',
    bandTagline: band.Tagline || '',
    bandEmail: band.Email || band['Booking Email'] || '',
    venueAddress: venue.Address || '',
    venueContact: venue['Booking Contact'] || venue.Contact || venue.Email || '',
    venuePhone: venue.Phone || '',
    venueCity: venue.City || '',
  }
}

function baseOutput(kind, context, instruction) {
  const lane = WORK_LANES[kind]
  const f = facts(context)

  return {
    title: `${lane.label} — ${f.title}`,
    lane: lane.label,
    specialist: {
      kind,
      label: lane.label,
      group: lane.group,
      risk: lane.risk,
      approvalRequired: lane.review,
    },
    show: f,
    missing: f.missing,
    instruction: instruction || '',
    review: lane.review,
  }
}

function commonReadout(f) {
  const readout = []
  if (f.missing.length) readout.push(`${f.missing.length} open show-detail item${f.missing.length === 1 ? '' : 's'}: ${f.missing.join(', ')}.`)
  if (f.ticket === 'Ticket info TBD') readout.push('Ticket language is not ready for public copy yet.')
  if (f.start === 'Time TBD') readout.push('Start time still needs to be confirmed before publishing or sending external copy.')
  if (!readout.length) readout.push('Core show details look usable for this lane.')
  return readout
}

function buildAdvance(context, instruction) {
  const output = baseOutput('advance', context, instruction)
  const f = output.show

  return {
    ...output,
    summary: `Show-readiness plan for ${f.band} at ${f.venue}.`,
    executiveReadout: commonReadout(f),
    work: {
      callSheet: {
        date: f.date,
        venue: f.venue,
        address: clean(f.venueAddress),
        loadIn: f.loadIn,
        soundCheck: f.soundCheck,
        start: f.start,
        end: f.end,
        indoorOutdoor: f.indoorOutdoor,
        dayOfContact: clean(f.venueContact),
      },
      readinessChecklist: [
        'Confirm load-in window and parking / unload path.',
        'Confirm soundcheck time and whether house audio is providing support.',
        'Confirm final members playing, sound engineer, merch person, and support roles.',
        'Confirm merch table location, power, and settlement process.',
        'Confirm set length, changeover expectations, and hard curfew.',
      ],
      venueQuestions: [
        'Who is the day-of contact and best phone number?',
        'Where should the band unload and park?',
        'What time can we access stage and merch area?',
        'Is production provided, and what does the house need from us?',
        'Where should merch set up and who handles settlement?',
      ],
    },
    recommendedNextActions: unique([
      f.loadIn === 'TBD' && 'Ask venue for load-in time.',
      f.soundCheck === 'TBD' && 'Ask venue for soundcheck time.',
      !f.venueAddress && 'Add venue address to Airtable.',
      'Send / confirm the final advance once the open items are filled.',
    ]),
  }
}

function buildPromo(context, instruction) {
  const output = baseOutput('promo', context, instruction)
  const f = output.show
  const ticketLine = f.ticketUrl ? `${f.ticket} · ${f.ticketUrl}` : f.ticket

  return {
    ...output,
    summary: `Clean promo package for ${f.band} at ${f.venue}. Queued for review before public use.`,
    executiveReadout: commonReadout(f),
    work: {
      eventCopy: {
        title: `${f.band} at ${f.venue}`,
        short: `${f.band} plays ${f.venue} on ${f.date}. ${ticketLine}.`,
        medium: `${f.band} is coming to ${f.venue} on ${f.date}. Expect a full-band set built for ${f.genre}. Show time: ${f.start}. ${ticketLine}.`,
        listing: `${f.band}\n${f.venue}\n${f.date}\nShow: ${f.start}\nAge: ${f.age}\nTickets: ${ticketLine}`,
      },
      captionAngles: [
        'Straight announcement with date, venue, and ticket link.',
        'Song-era / audience nostalgia angle tailored to the band.',
        'Final-week reminder focused on logistics and urgency.',
        'Day-of post with show time, parking / arrival note, and ticket link.',
      ],
      cadence: [
        'Announcement post after assets and ticket link are confirmed.',
        'Story countdown 7 days out.',
        'Reminder post 3–4 days out.',
        'Day-of story and feed reminder.',
      ],
    },
    recommendedNextActions: unique([
      f.missing.includes('Graphic') && 'Run Design Brief or create the graphic before announcement.',
      f.missing.includes('Ticket Info') && 'Confirm ticket price or ticket URL before publishing.',
      f.missing.includes('FB Event') && 'Create or update the Facebook event after copy is approved.',
      'Review copy in the approval queue before posting publicly.',
    ]),
  }
}

function buildDesign(context, instruction) {
  const output = baseOutput('design', context, instruction)
  const f = output.show

  return {
    ...output,
    summary: `Creative production brief for ${f.band} at ${f.venue}. Queued for review before design work is treated as final.`,
    executiveReadout: commonReadout(f),
    work: {
      creativeBrief: {
        objective: `Create a show graphic system for ${f.band} at ${f.venue}.`,
        tone: 'Band-forward, readable on phone, visually tied to the act without burying the event details.',
        requiredText: compact([f.band, f.venue, f.date, f.start, f.ticket, f.age]),
        optionalText: compact([f.venueCity, f.indoorOutdoor]),
        assetNeeds: [
          'Current band logo / wordmark.',
          'Approved band photo or performance image.',
          'Venue logo only if venue requests it.',
          'Ticket URL or QR code only if needed for print / coaster / flyer use.',
        ],
        deliverableSizes: ['Square 1:1', 'Feed 4:5', 'Story / Reel 9:16', 'Facebook event header', 'Facebook page header if needed'],
      },
      qualityRules: [
        'Date, venue, and band must be readable at phone size.',
        'Keep essential text inside safe margins.',
        'Avoid fake crowd/hands/artifacts and avoid overusing generic AI texture.',
        'Design should feel like a real show asset, not a backend instruction sheet.',
      ],
    },
    recommendedNextActions: unique([
      f.missing.includes('Graphic') && 'Create and approve graphics before promotion is released.',
      'Confirm which band image is approved for this specific show.',
      'Send finished assets to approval queue before publishing.',
    ]),
  }
}

function buildBooking(context, instruction) {
  const output = baseOutput('booking', context, instruction)
  const f = output.show

  return {
    ...output,
    summary: `Venue-facing booking follow-up package for ${f.band} at ${f.venue}. External communication requires approval.`,
    executiveReadout: [
      ...commonReadout(f),
      'Do not send this automatically. Use it as a draft for Evan review.',
    ],
    work: {
      crmSnapshot: {
        venue: f.venue,
        contact: clean(f.venueContact),
        phone: clean(f.venuePhone),
        status: f.status,
        dealType: row(f.deal, 'Deal Type'),
        performanceRate: row(f.deal, 'Performance Rate'),
      },
      nextTouch: {
        purpose: 'Confirm remaining show details and keep the relationship warm.',
        suggestedSubject: `${f.band} at ${f.venue} — details check`,
        draft: `Hi there — checking in on ${f.band} at ${f.venue} on ${f.date}. I wanted to confirm the remaining show details so we can keep everything clean on our end.\n\nCould you confirm load-in, soundcheck, day-of contact, parking / unload, and merch setup?\n\nThanks!`,
      },
      dealQuestions: [
        'Is the deal type final?',
        'Is the guarantee / rate final?',
        'Who handles ticketing and settlement?',
        'Are there hospitality, comps, guest list, or food details to confirm?',
      ],
    },
    recommendedNextActions: unique([
      f.missing.includes('Contract') && 'Confirm contract status before treating the date as fully locked.',
      f.loadIn === 'TBD' && 'Ask for load-in in the next venue touch.',
      f.soundCheck === 'TBD' && 'Ask for soundcheck in the next venue touch.',
      'Review the draft before sending from Gmail.',
    ]),
  }
}

function buildFinance(context, instruction) {
  const output = baseOutput('finance', context, instruction)
  const f = output.show

  return {
    ...output,
    summary: `Finance and settlement readiness check for ${f.band} at ${f.venue}.`,
    executiveReadout: commonReadout(f),
    work: {
      settlementSnapshot: {
        dealType: row(f.deal, 'Deal Type'),
        ticketPrice: row(f.deal, 'Ticket Price'),
        performanceRate: row(f.deal, 'Performance Rate'),
        eplPercent: row(f.deal, 'EPL Percent'),
        trailerCost: row(f.deal, 'Trailer Cost'),
        audioEngineerCost: row(f.deal, 'Audio Engineer Cost'),
        socialAdsSpend: row(f.deal, 'Social Ads Spend'),
        totalExpenses: row(f.deal, 'Total Expenses'),
        netIncome: row(f.deal, 'Net Income'),
        bandPayout: row(f.deal, 'Band Payout'),
      },
      settlementChecklist: [
        'Confirm guarantee / door split / payout terms before show day.',
        'Confirm who collects, who counts, and when settlement happens.',
        'Track trailer, audio, ad spend, merch costs, and other expenses before payout.',
        'Confirm band payout after all costs and EPL share are accounted for.',
      ],
      riskNotes: unique([
        row(f.deal, 'Performance Rate') === '—' && 'Performance rate is missing.',
        row(f.deal, 'Deal Type') === '—' && 'Deal type is missing.',
        row(f.deal, 'Band Payout') === '—' && 'Band payout is not calculated yet.',
      ]),
    },
    recommendedNextActions: unique([
      'Fill any missing deal fields before settlement week.',
      'Do not mark payout final until all expenses are entered.',
      'Use this as an internal review, not a public or venue-facing note.',
    ]),
  }
}

function buildContent(context, instruction) {
  const output = baseOutput('content', context, instruction)
  const f = output.show

  return {
    ...output,
    summary: `Content capture plan for ${f.band} at ${f.venue}. Queued for review because it can turn into public posts.`,
    executiveReadout: commonReadout(f),
    work: {
      captureBrief: {
        goal: 'Leave the show with usable proof of energy, crowd response, and band quality.',
        primaryFormats: ['Vertical phone video', 'Wide crowd/stage clip', 'Behind-the-scenes setup', 'Post-show recap photo set'],
        mustCapture: [
          'Venue exterior / marquee if available.',
          'Crowd singing or reacting.',
          'Hero moment from the strongest song section.',
          'Band member closeups with good lighting.',
          'Merch table / fan interaction if appropriate.',
        ],
      },
      reelPlan: [
        'Hook: 1–2 seconds of the biggest crowd or chorus moment.',
        'Middle: 2–3 fast cuts showing band, crowd, and venue.',
        'End: band name, venue, and next-show CTA.',
      ],
      assignments: [
        'Assign one person for vertical clips near the front / side.',
        'Assign one person for room-wide crowd proof if possible.',
        'Collect footage before leaving the venue so assets are not lost in text threads.',
      ],
    },
    recommendedNextActions: unique([
      'Confirm who is responsible for capture before show day.',
      'Create a Drive folder or upload destination for show assets.',
      'Review any recap copy before posting publicly.',
    ]),
  }
}

function buildWeb(context, instruction) {
  const output = baseOutput('web', context, instruction)
  const f = output.show

  return {
    ...output,
    summary: `Public website and SEO readiness check for ${f.band} at ${f.venue}. Queued for review before site/publishing changes.`,
    executiveReadout: commonReadout(f),
    work: {
      listingAudit: {
        shouldPublish: f.missing.includes('Ticket Info') || f.start === 'Time TBD' ? 'Hold until core details are complete.' : 'Ready for public review if Publish to Website is enabled.',
        requiredForPublic: ['Band', 'Venue', 'Date', 'Start Time', 'Ticket Info', 'Age Restriction'],
        currentGaps: f.missing,
      },
      seoDraft: {
        title: `${f.band} at ${f.venue} | Echo Play Live`,
        description: `${f.band} performs at ${f.venue} on ${f.date}. Show time ${f.start}. ${f.ticket}.`,
        structuredDataNotes: 'Use real date, venue, ticket link, and public gate only. Do not expose internal notes.',
      },
      qaChecklist: [
        'Confirm public page does not show backend notes or instructions.',
        'Confirm ticket label has only one dollar sign and links correctly.',
        'Confirm page is mobile-readable and not dependent on JavaScript for core content.',
        'Confirm the show should be public before enabling Publish to Website.',
      ],
    },
    recommendedNextActions: unique([
      f.missing.includes('Ticket Info') && 'Fix ticket information before publishing.',
      f.start === 'Time TBD' && 'Confirm start time before publishing.',
      'Review website copy before making public changes.',
    ]),
  }
}

function buildMerch(context, instruction) {
  const output = baseOutput('merch', context, instruction)
  const f = output.show

  return {
    ...output,
    summary: `Merch readiness plan for ${f.band} at ${f.venue}.`,
    executiveReadout: commonReadout(f),
    work: {
      setupPlan: {
        arrival: 'Confirm merch table location during advance.',
        display: 'Keep offer visible, prices simple, and payment QR / POS easy to reach.',
        staffing: row(f.people, 'Merch Person'),
      },
      checklist: [
        'Confirm merch person and arrival time.',
        'Confirm inventory count before leaving for venue.',
        'Bring card reader / Square terminal, backup battery, bags, tape, markers, and price sign.',
        'Photograph starting inventory if needed.',
        'Close out sales and cash count before load-out.',
      ],
      salesNotes: [
        'Use simple bundles if inventory supports it.',
        'Track comps or giveaways separately from sales.',
        'Add merch notes back to the show record after settlement.',
      ],
    },
    recommendedNextActions: unique([
      row(f.people, 'Merch Person') === '—' && 'Assign a merch person.',
      'Confirm POS device and backup payment method before show day.',
      'Update Merch Notes after the show.',
    ]),
  }
}

const BUILDERS = {
  advance: buildAdvance,
  promo: buildPromo,
  design: buildDesign,
  booking: buildBooking,
  finance: buildFinance,
  content: buildContent,
  web: buildWeb,
  merch: buildMerch,
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
  if (!kind || !BUILDERS[kind]) {
    throw new Error(`Unknown work lane: ${kind || 'missing'}`)
  }

  const context = await loadWorkContext(showId)
  if (!context.ok || !context.show) throw new Error(context.error || 'Show context could not be loaded.')

  const output = BUILDERS[kind](context, instruction)
  const notes = JSON.stringify({ kind, source, showId, output, createdAt: new Date().toISOString() }, null, 2)
  const saved = await saveWorkLog({ name: output.title, notes, review: output.review })

  return {
    ok: true,
    output,
    aiRunId: saved.run?.id || null,
    aiRunError: saved.run?.error || null,
    reviewItemId: saved.reviewRecord?.id || null,
    reviewError: saved.reviewRecord?.error || null,
  }
}

export async function routeWorkAction({ action, source = 'chief_of_staff' }) {
  if (!action) throw new Error('Missing action.')
  const notes = JSON.stringify({ source, action, createdAt: new Date().toISOString() }, null, 2)
  const record = await createApprovalItem({ name: action.label || 'Routed Action', status: action.requiresApproval ? 'Pending' : 'Queued', notes })
  return { ok: true, reviewItemId: record?.id || null }
}
