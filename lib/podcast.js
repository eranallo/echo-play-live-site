// Phase 15 — Echo Play Podcast helpers.
//
// Episodes are pulled live from the Buzzsprout RSS feed at build/request
// time (cached 1 hour). When Evan publishes a new episode on Buzzsprout, the
// page picks it up automatically on the next revalidation cycle — no code
// commit needed.
//
// If the feed is unreachable (network issue, build offline, Buzzsprout down),
// we fall back to a small hand-curated set so the page never renders empty.

// ──────────────────────────────────────────────────────────────────────
// STATIC METADATA — show-level info (rarely changes).
// ──────────────────────────────────────────────────────────────────────

export const podcast = {
  title: 'Echo Play Podcast',
  tagline: 'Cover bands, tributes, and the DFW music scene.',
  description: 'Welcome to our community of cover bands, tributes, and all other music addicts as we discuss the DFW music scene.',
  longDescription:
    "Evan Ranallo and Aaron Allen of The Dick Beldings sit down to talk about the DFW tribute and cover band scene — the venues, the road stories, the songs that shaped them, and the people behind the music. Recorded at Platinum Music Complex. Casual conversation, music industry insight, and a lot of laughs.",
  hosts: [
    { name: 'Evan Ranallo' },
    { name: 'Aaron Allen' },
  ],
  recordedAt: 'Platinum Music Complex · Fort Worth, TX',
  startYear: 2024,
  buzzsproutShowId: '2377760',
  artworkUrl: 'https://www.buzzsprout.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsiZGF0YSI6MTI2NDY2MTg4LCJwdXIiOiJibG9iX2lkIn19--4a07ae51d273a28df19c4382e64f92636c8251e4/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJyZXNpemVfdG9fZmlsbCI6WzgwMCw4MDAseyJjcm9wIjoiY2VudHJlIn1dLCJzYXZlciI6eyJxdWFsaXR5Ijo2MH0sImNvbG91cnNwYWNlIjoic3JnYiJ9LCJwdXIiOiJ2YXJpYXRpb24ifX0=--ec5d9a0b1f7e6c8e8c8d/EPP_E01.png',
  subscribe: {
    spotify: 'https://open.spotify.com/show/2wnp160etSbFFC0xbU3c4J',
    applePodcasts: 'https://podcasts.apple.com/us/podcast/echo-play-podcast/id1757629556',
    amazonMusic: 'https://music.amazon.com/podcasts/b731392d-607e-4cd6-b23d-0dfc27a1d37b',
    buzzsprout: 'https://echoplay.buzzsprout.com',
    rss: 'https://feeds.buzzsprout.com/2377760.rss',
  },
}

// ──────────────────────────────────────────────────────────────────────
// EPISODE FETCH — Buzzsprout RSS with 1-hour revalidation.
// ──────────────────────────────────────────────────────────────────────

const RSS_URL = 'https://feeds.buzzsprout.com/2377760.rss'

export async function getEpisodes() {
  try {
    const res = await fetch(RSS_URL, { next: { revalidate: 3600 } })
    if (!res.ok) {
      console.warn('[podcast] RSS fetch failed:', res.status)
      return STATIC_FALLBACK_EPISODES
    }
    const xml = await res.text()
    const parsed = parseEpisodes(xml)
    return parsed.length > 0 ? parsed : STATIC_FALLBACK_EPISODES
  } catch (err) {
    console.warn('[podcast] RSS fetch threw:', err?.message)
    return STATIC_FALLBACK_EPISODES
  }
}

// Parse a Buzzsprout/iTunes-format RSS feed into normalized episode objects.
function parseEpisodes(xml) {
  const items = []
  const itemRegex = /<item[\s\S]*?<\/item>/g
  const matches = xml.match(itemRegex) || []

  for (const item of matches) {
    const title = textOf(item, 'title') || textOf(item, 'itunes:title')
    const pubDate = textOf(item, 'pubDate')
    const duration = textOf(item, 'itunes:duration')
    const descriptionHtml = textOf(item, 'description') || textOf(item, 'itunes:summary') || ''
    const episodeNum = textOf(item, 'itunes:episode')
    const link = textOf(item, 'link')
    const enclosureUrl = (item.match(/<enclosure[^>]+url="([^"]+)"/) || [])[1] || null
    const enclosureType = (item.match(/<enclosure[^>]+type="([^"]+)"/) || [])[1] || null

    // Parse the buzzsproutId + slug from the link.
    // Link form: https://echoplay.buzzsprout.com/2377760/episodes/17326083-some-slug
    let buzzsproutId = null
    let slug = null
    if (link) {
      const m = link.match(/\/episodes\/(\d+)-([^/?#]+)/)
      if (m) {
        buzzsproutId = m[1]
        slug = m[2]
      }
    }

    items.push({
      number: episodeNum ? parseInt(episodeNum, 10) : null,
      title: title?.trim() || 'Untitled',
      date: pubDate ? new Date(pubDate).toISOString() : null,
      duration: normalizeDuration(duration),
      buzzsproutId,
      slug,
      description: stripHtml(descriptionHtml),
      link,
      audioUrl: enclosureUrl,
      // If the enclosure type starts with video/, we know it's a video episode.
      isVideo: enclosureType ? enclosureType.startsWith('video/') : false,
    })
  }

  // Sort newest first (RSS is usually already sorted, but be defensive).
  items.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  return items
}

// Pull the text content of a tag, handling CDATA and namespace prefixes.
function textOf(xml, tag) {
  // Escape colon for regex.
  const safe = tag.replace(/:/g, '\\:')
  const re = new RegExp(`<${safe}[^>]*>([\\s\\S]*?)</${safe}>`)
  const m = xml.match(re)
  if (!m) return null
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
}

// Strip HTML and collapse whitespace for plain-text display.
function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

// Buzzsprout returns duration as MM:SS, HH:MM:SS, or raw seconds.
function normalizeDuration(d) {
  if (!d) return ''
  const s = String(d).trim()
  if (s.includes(':')) return s
  const total = parseInt(s, 10)
  if (Number.isNaN(total)) return ''
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const sec = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

// ──────────────────────────────────────────────────────────────────────
// EMBED + URL HELPERS
// ──────────────────────────────────────────────────────────────────────

export function buzzsproutEmbedUrl(episodeId) {
  return `https://www.buzzsprout.com/${podcast.buzzsproutShowId}/episodes/${episodeId}?client_source=small_player&iframe=true`
}

export function buzzsproutEpisodeUrl(episodeId, slug) {
  if (!episodeId) return podcast.subscribe.buzzsprout
  if (!slug) return `https://echoplay.buzzsprout.com/${podcast.buzzsproutShowId}/episodes/${episodeId}`
  return `https://echoplay.buzzsprout.com/${podcast.buzzsproutShowId}/episodes/${episodeId}-${slug}`
}

export function formatEpisodeDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ──────────────────────────────────────────────────────────────────────
// FALLBACK — used when the RSS fetch fails.
// Keep this small (latest 3-5) — full list lives at Buzzsprout.
// ──────────────────────────────────────────────────────────────────────

const STATIC_FALLBACK_EPISODES = [
  {
    number: 13,
    title: 'Your Armpits Deserve Better Deodorant',
    date: '2025-06-12T00:00:00.000Z',
    duration: '42:01',
    buzzsproutId: '17326083',
    slug: 'your-armpits-deserve-better-deodorant',
    description: 'Evan and Aaron return after a brief hiatus, joking about a lost recording that was supposedly their best episode ever.',
    isVideo: false,
  },
  {
    number: 12,
    title: 'Life After Loss: Talking Through Grief and Recovery',
    date: '2025-04-14T00:00:00.000Z',
    duration: '1:33:43',
    buzzsproutId: '16956606',
    slug: 'life-after-loss-talking-through-grief-and-recovery',
    description: 'There are moments that split life into clear before and after segments. A raw conversation about grief, recovery, and what comes after.',
    isVideo: false,
  },
  {
    number: 11,
    title: 'Balloon Fiesta Magic and Wedding Planning',
    date: '2024-10-21T00:00:00.000Z',
    duration: '37:08',
    buzzsproutId: '15961669',
    slug: 'balloon-fiesta-magic-and-wedding-planning',
    description: 'After a brief hiatus, we are back. Evan dropped a big announcement — he is engaged.',
    isVideo: false,
  },
]
