import { getAdminShowsOverview } from '@/lib/admin/airtable'
import { bandsList } from '@/lib/bands'
import { formatDateOnly } from '@/lib/date'

function bandFromRow(row) {
  return bandsList.find(band => Array.isArray(row.bandIds) && row.bandIds.includes(band.airtableId))
    || bandsList.find(band => band.name === row.band)
    || { name: row.band, shortName: row.band, slug: '', color: row.bandColor || '#D4A017' }
}

function priceText(value, hasLink) {
  const text = value === null || value === undefined ? '' : String(value).trim()
  if (!text) return hasLink ? 'Tickets available' : 'Details coming soon'
  if (text.toLowerCase().includes('free')) return text
  if (text.startsWith('$')) return text
  if (/^\d+(\.\d+)?$/.test(text)) return `$${Number(text).toLocaleString('en-US')}`
  return text
}

function keyFor(row) {
  const venueKey = Array.isArray(row.venueIds) && row.venueIds[0] ? row.venueIds[0] : row.venue
  return `${row.date || 'date-tbd'}::${venueKey || 'venue-tbd'}`
}

function isPublicRow(row) {
  return row.promotionReleased === true
    || row.facebookEventCreated === true
    || row.bandsintownPosted === true
    || Boolean(row.ticketUrl)
}

function collectBands(rows) {
  const seen = new Set()
  const items = []

  for (const row of rows) {
    const band = bandFromRow(row)
    const key = band.slug || band.name
    if (!key || seen.has(key)) continue
    seen.add(key)
    items.push(band)
  }

  return items
}

function buildEvent(rows) {
  const primary = rows[0]
  const bands = collectBands(rows)
  const main = bands[0] || bandFromRow(primary)
  const others = bands.slice(1)
  const ticketUrl = rows.map(row => row.ticketUrl).find(Boolean) || ''
  const ticketPrice = rows.map(row => row.ticketPrice).find(Boolean) || ''

  return {
    id: rows.map(row => row.id).join('-'),
    date: primary.date,
    dateLabel: formatDateOnly(primary.date),
    bandName: main.name,
    bandShortName: main.shortName || main.name,
    bandColor: main.color || '#D4A017',
    bandSlug: main.slug || '',
    bandSlugs: bands.map(band => band.slug).filter(Boolean),
    bands: bands.map(band => ({ name: band.name, shortName: band.shortName || band.name, slug: band.slug || '', color: band.color || '#D4A017' })),
    supportNames: others.map(band => band.name),
    billLabel: others.length ? `${main.name} with ${others.map(band => band.name).join(' + ')}` : main.name,
    venueName: primary.venue,
    startTime: primary.startTime || '',
    ticketUrl,
    ticketLabel: priceText(ticketPrice, Boolean(ticketUrl)),
    publicStatus: ticketUrl ? 'Tickets available' : 'Details coming soon',
  }
}

export async function getPublicShows() {
  const result = await getAdminShowsOverview()
  if (!result?.ok) return []

  const groups = new Map()

  for (const row of result.shows || []) {
    if (!isPublicRow(row)) continue
    const key = keyFor(row)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }

  return Array.from(groups.values())
    .map(buildEvent)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
}
