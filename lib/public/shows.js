import { getAdminShowsOverview } from '@/lib/admin/airtable'
import { bandsList } from '@/lib/bands'
import { formatDateOnly } from '@/lib/date'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appYUOoJgvRyZ7fLB'
const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
const SHOWS_TABLE = process.env.AIRTABLE_SHOWS_TABLE || 'SHOWS'
const PUBLISH_FIELD = 'Publish to Website'

function airtableShowsUrl() {
  return new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(SHOWS_TABLE)}`)
}

async function getPublishFlags(showIds) {
  const safeIds = [...new Set(showIds || [])].filter(id => /^rec[A-Za-z0-9]{14}$/.test(id))
  if (!AIRTABLE_API_TOKEN || safeIds.length === 0) return new Map()

  const formula = safeIds.length === 1
    ? `RECORD_ID()='${safeIds[0]}'`
    : `OR(${safeIds.map(id => `RECORD_ID()='${id}'`).join(',')})`

  const url = airtableShowsUrl()
  url.searchParams.set('filterByFormula', formula)
  url.searchParams.append('fields[]', PUBLISH_FIELD)
  url.searchParams.set('pageSize', '100')

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_TOKEN.trim()}` },
      cache: 'no-store',
    })
    if (!response.ok) return new Map()

    const data = await response.json()
    return new Map((data.records || []).map(record => [record.id, record.fields?.[PUBLISH_FIELD] === true]))
  } catch {
    return new Map()
  }
}

function bandFromRow(row) {
  return bandsList.find(band => Array.isArray(row.bandIds) && row.bandIds.includes(band.airtableId))
    || bandsList.find(band => band.name === row.band)
    || { name: row.band, shortName: row.band, slug: '', color: row.bandColor || '#D4A017' }
}

function priceText(value, hasLink) {
  const text = value === null || value === undefined ? '' : String(value).trim()
  if (!text) return hasLink ? 'Tickets available' : 'Details coming soon'
  if (text.toLowerCase().includes('free')) return text

  const currencyText = text.replace(/\$/g, '').trim()
  if (/^\d+(\.\d+)?$/.test(currencyText)) {
    return `$${Number(currencyText).toLocaleString('en-US')}`
  }

  return text
}

function keyFor(row) {
  const venueKey = Array.isArray(row.venueIds) && row.venueIds[0] ? row.venueIds[0] : row.venue
  return `${row.date || 'date-tbd'}::${venueKey || 'venue-tbd'}`
}

function isPublicRow(row) {
  return row.publishToWebsite === true
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
  const publicRow = rows.find(isPublicRow) || rows[0]
  const primary = rows[0] || publicRow
  const bands = collectBands(rows)
  const main = bands[0] || bandFromRow(primary)
  const others = bands.slice(1)
  const ticketUrl = rows.map(row => row.ticketUrl).find(Boolean) || ''
  const ticketPrice = rows.map(row => row.ticketPrice).find(Boolean) || ''

  return {
    id: rows.map(row => row.id).join('-'),
    date: primary.date || publicRow?.date,
    dateLabel: formatDateOnly(primary.date || publicRow?.date),
    bandName: main.name,
    bandShortName: main.shortName || main.name,
    bandColor: main.color || '#D4A017',
    bandSlug: main.slug || '',
    bandSlugs: bands.map(band => band.slug).filter(Boolean),
    bands: bands.map(band => ({ name: band.name, shortName: band.shortName || band.name, slug: band.slug || '', color: band.color || '#D4A017' })),
    supportNames: others.map(band => band.name),
    billLabel: others.length ? `${main.name} with ${others.map(band => band.name).join(' + ')}` : main.name,
    venueName: primary.venue || publicRow?.venue,
    startTime: publicRow?.startTime || primary.startTime || '',
    ticketUrl,
    ticketLabel: priceText(ticketPrice, Boolean(ticketUrl)),
    publicStatus: ticketUrl ? 'Tickets available' : 'Details coming soon',
  }
}

export async function getPublicShows() {
  const result = await getAdminShowsOverview()
  if (!result?.ok) return []

  const sourceRows = result.shows || []
  const publishFlags = await getPublishFlags(sourceRows.map(row => row.id))
  const rowsWithPublishState = sourceRows.map(row => ({
    ...row,
    publishToWebsite: publishFlags.get(row.id) === true,
  }))

  const groups = new Map()

  for (const row of rowsWithPublishState) {
    const key = keyFor(row)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }

  return Array.from(groups.values())
    .filter(rows => rows.some(isPublicRow))
    .map(buildEvent)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
}
