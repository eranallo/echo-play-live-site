// Only public route/context values belong in website measurement.
export const eventNames = Object.freeze({
  'Review source': 'review_source_opened', 'QR download': 'qr_download',
  'Upload started': 'upload_started', 'Upload resumed': 'upload_resumed', 'Upload completed': 'upload_completed',
  'Upload interrupted': 'upload_interrupted', 'Upload paused': 'upload_paused',
  'Press pack download': 'press_pack_download', 'Podcast player opened': 'podcast_player_opened',
  'Newsletter confirmed': 'newsletter_confirmed',
  'Newsletter accepted': 'newsletter_accepted',
  'Ticket click': 'ticket_click', 'Table reservation click': 'table_reservation_click', 'Press download': 'press_download',
  'Calendar download': 'calendar_download', 'Follow band': 'follow_band',
  'Share show': 'share_show', 'Share link hub': 'share_link_hub',
  'Hub shows': 'hub_shows', 'Hub next show': 'hub_next_show',
  'Hub link': 'hub_link', 'Hub social': 'hub_social',
  'Performance player opened': 'performance_player_opened',
  'Booking inquiry sent': 'generate_lead', 'Newsletter form submitted': 'newsletter_form_submitted',
  'Photo download': 'press_photo_download', 'Logo download': 'press_logo_download',
  'Bio download': 'press_bio_download',
  'Band chooser inquiry': 'band_chooser_inquiry',
  'Song vote saved': 'song_vote_saved',
})
export function publicEvent(name, context = {}) {
  const event = Object.hasOwn(eventNames, name) ? eventNames[name] : null
  if (!event) return null
  const fields = {}
  if (['standard', 'poster', 'table', 'merch'].includes(context.placement)) fields.placement = context.placement
  if (['elite', 'jambi', 'the-dick-beldings', 'so-long-goodnight', 'echo-play-live'].includes(context.band)) fields.band = context.band
  if (typeof context.show === 'string' && /^show_[A-Za-z0-9_-]{20,30}$/.test(context.show)) fields.show = context.show
  if (typeof context.video === 'string' && /^[A-Za-z0-9_-]{11}$/.test(context.video)) fields.video = context.video
  return { name: event, fields }
}
export function withoutQuery(url) {
  try { const parsed = new URL(url); return `${parsed.origin}${parsed.pathname}` } catch { return '' }
}

export function publicCampaign(url) {
  const campaign = {}
  try {
    const query = new URL(url).searchParams
    for (const [key, field] of [['utm_source', 'campaign_source'], ['utm_medium', 'campaign_medium'], ['utm_campaign', 'campaign_name'], ['utm_content', 'campaign_content']]) {
      const value = query.get(key)
      if (value && /^[A-Za-z0-9_.-]{1,80}$/.test(value)) campaign[field] = value
    }
  } catch {}
  return campaign
}
