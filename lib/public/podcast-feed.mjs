// Parse a Buzzsprout/iTunes-format RSS feed into normalized episode objects.
export function parseEpisodes(xml) {
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
    const episodeSource = link || enclosureUrl
    if (episodeSource) {
      const m = episodeSource.match(/\/episodes\/(\d+)-([^/?#]+)/)
      if (m) {
        buzzsproutId = m[1]
        const candidate = m[2].replace(/\.(mp3|m4a|mp4)$/i, '')
        slug = /^[a-z0-9-]+$/.test(candidate) ? candidate : null
      }
    }

    items.push({
      number: episodeNum ? parseInt(episodeNum, 10) : null,
      title: stripHtml(title) || 'Untitled',
      date: pubDate && Number.isFinite(Date.parse(pubDate)) ? new Date(pubDate).toISOString() : null,
      duration: normalizeDuration(duration),
      buzzsproutId,
      slug,
      description: stripHtml(descriptionHtml).replace(/\bDick Buildings\b/g, 'The Dick Beldings'),
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
    .replace(/<\/(p|li|ul|ol)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (entity, value) => {
      const code = value[0].toLowerCase() === 'x' ? parseInt(value.slice(1), 16) : Number(value)
      return code >= 32 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : ''
    })
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

