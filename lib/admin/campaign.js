import { createAiRunLog, createApprovalItem, getAdminCampaignContext } from '@/lib/admin/airtable'

function compact(value, fallback = '') {
  if (value === null || value === undefined || value === '') return fallback
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

function buildFallbackCampaign({ show, band, venue }) {
  const bandName = show.band || band?.fields?.['Band Name'] || 'TBD Band'
  const venueName = show.venue || venue?.fields?.['Venue Name'] || 'TBD Venue'
  const cityState = compact(venue?.fields?.Address, '')
  const ticketInfo = show.ticketPrice || (show.ticketUrl ? 'Tickets available online' : 'Ticket info TBD')
  const ageRestriction = show.ageRestriction || venue?.fields?.['Age Restriction'] || 'Age restriction TBD'
  const genre = compact(band?.fields?.Genre, '')
  const tagline = compact(band?.fields?.Tagline, '')

  const eventTitle = `${bandName} at ${venueName}`
  const angleParts = [genre, tagline].filter(Boolean)
  const campaignAngle = angleParts.length ? angleParts.join(' · ') : `Live music night with ${bandName}`

  return {
    campaign_summary: {
      show_name: eventTitle,
      band: bandName,
      venue: venueName,
      date: show.dateLabel,
      city_state: cityState,
      status: show.status,
      campaign_angle: campaignAngle,
    },
    confirmed_facts: [
      `Band: ${bandName}`,
      `Venue: ${venueName}`,
      `Date: ${show.dateLabel}`,
      `Start time: ${show.startTime}`,
      `Age restriction: ${ageRestriction}`,
      `Ticket info: ${ticketInfo}`,
    ],
    missing_information: show.missingFlags || [],
    copy: {
      event_title: eventTitle,
      long_event_description: `${bandName} hits ${venueName} on ${show.dateLabel} for a full night built around ${campaignAngle}.\n\nShow time: ${show.startTime}\nAge restriction: ${ageRestriction}\nTicket info: ${ticketInfo}\n\nBring your people, make a night of it, and come catch ${bandName} live.`,
      short_blurb: `${bandName} at ${venueName} on ${show.dateLabel}. ${ticketInfo}. ${ageRestriction}.`,
      facebook_caption: `${bandName} is coming to ${venueName} on ${show.dateLabel}.\n\n${ticketInfo}\n${ageRestriction}\nShow time: ${show.startTime}`,
      instagram_caption: `${bandName} live at ${venueName}. ${show.dateLabel}. ${ticketInfo}.`,
      venue_copromo_blurb: `${venueName} welcomes ${bandName} on ${show.dateLabel}.`,
      bandsintown_listing: `${bandName} live at ${venueName} on ${show.dateLabel}. ${ticketInfo}.`,
    },
    short_form_video: {
      reel_hooks: [
        `${bandName} is taking over ${venueName}`,
        `Your next night out is ${show.dateLabel}`,
        `Live music plans: locked in`,
      ],
      story_frames: [
        `${bandName}`,
        `${venueName}`,
        `${show.dateLabel} · ${show.startTime}`,
        `${ticketInfo} · ${ageRestriction}`,
      ],
    },
    graphics: {
      creative_direction: `Create a clean show promo for ${bandName} at ${venueName}. Keep the hierarchy clear: band, date, venue, ticket/age info, CTA.`,
      required_text: [bandName, venueName, show.dateLabel, show.startTime, ticketInfo, ageRestriction],
      sizes_needed: ['Square', '4:5 feed', '9:16 story/reel', 'Facebook event header'],
      asset_needs: ['Band logo/photo', 'Venue/show image if available'],
      layout_notes: 'Keep the design readable at phone size and avoid overcrowding.',
      revision_risks: ['Missing ticket info', 'Missing final art/photo assets'],
    },
    social_post_plan: [
      {
        post_name: `${bandName} show announcement`,
        channel: ['Facebook', 'Instagram'],
        post_type: 'Announcement',
        recommended_date: '',
        caption_draft: `${bandName} at ${venueName} on ${show.dateLabel}. ${ticketInfo}.`,
        media_type: 'Graphic',
        status: 'Draft',
      },
    ],
    approval_needed: [
      {
        action: 'Save generated event description to Airtable',
        risk_level: 'Low',
        reason: 'Generated copy should be reviewed before it becomes the show source of truth.',
      },
    ],
    recommended_next_actions: [
      'Review event description',
      'Confirm missing information',
      'Approve save to Airtable when ready',
    ],
  }
}

async function generateWithOpenAI(context) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const prompt = `You are the Echo Play Live Show Campaign Agent. Generate a complete but concise show campaign using only confirmed data. Return valid JSON only with this shape: {"campaign_summary":{},"confirmed_facts":[],"missing_information":[],"copy":{"event_title":"","long_event_description":"","short_blurb":"","facebook_caption":"","instagram_caption":"","venue_copromo_blurb":"","bandsintown_listing":""},"short_form_video":{"reel_hooks":[],"story_frames":[]},"graphics":{"creative_direction":"","required_text":[],"sizes_needed":[],"asset_needs":[],"layout_notes":"","revision_risks":[]},"social_post_plan":[],"approval_needed":[],"recommended_next_actions":[]}.\n\nContext:\n${JSON.stringify(context, null, 2)}`

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
    throw new Error(`OpenAI campaign generation failed (${response.status}): ${text.slice(0, 240)}`)
  }

  const data = await response.json()
  const text = data.output_text || data.output?.flatMap(item => item.content || []).map(item => item.text).filter(Boolean).join('\n')
  if (!text) throw new Error('OpenAI returned no campaign text.')

  return JSON.parse(text)
}

export async function generateShowCampaignDraft(showId) {
  const context = await getAdminCampaignContext(showId)

  if (!context.ok) {
    throw new Error(context.error || 'Show context could not be loaded.')
  }

  let usedFallback = false
  let campaign
  let generationWarning = null

  try {
    campaign = await generateWithOpenAI(context)
  } catch (error) {
    generationWarning = error?.message || 'AI generation failed; fallback campaign was used.'
  }

  if (!campaign) {
    usedFallback = true
    campaign = buildFallbackCampaign(context)
  }

  const eventDescription = campaign?.copy?.long_event_description || ''

  const runRecord = await createAiRunLog({
    name: `Show Campaign Draft — ${context.show.band}`,
    status: usedFallback ? 'Draft' : 'Complete',
    notes: JSON.stringify({
      agent: 'Show Campaign Agent',
      showId,
      show: context.show.title,
      usedFallback,
      generationWarning,
      summary: campaign.campaign_summary,
      missingInformation: campaign.missing_information,
    }, null, 2),
  }).catch(error => ({ id: null, error: error?.message }))

  const approvalPayload = {
    actionType: 'save_event_description',
    showId,
    aiRunId: runRecord?.id || null,
    eventDescription,
    campaignTitle: campaign?.copy?.event_title || context.show.title,
  }

  const approvalRecord = await createApprovalItem({
    name: `Approve Event Description — ${context.show.band}`,
    status: 'Pending',
    notes: `Review generated event description before saving to SHOWS.Event Description.\n\n${JSON.stringify(approvalPayload, null, 2)}`,
  }).catch(error => ({ id: null, error: error?.message }))

  return {
    campaign,
    usedFallback,
    generationWarning,
    aiRunId: runRecord?.id || null,
    aiRunError: runRecord?.error || null,
    approvalItemId: approvalRecord?.id || null,
    approvalError: approvalRecord?.error || null,
  }
}
