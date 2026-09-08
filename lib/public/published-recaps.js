import { cache } from 'react'
import { recaps } from './recaps.mjs'
import { recapIsPublished } from './recap-policy.mjs'
import { SHOW_FIELD_IDS as F } from './shows-contract.mjs'
import { tableUrl, TABLES } from '../airtable.js'

// Server-only source mapping. Never return source records or internal recap notes.
const sources = [
  { id: 'recdbTibOyATYKb7v', band: 'recJrGyEPjO5xJ10Z', venue: 'rec0CUD6d6rFht3bC' },
  { id: 'recpbUt4y8mjqTOFt', band: 'recOP9WYkvMajk16S', venue: 'rec0CUD6d6rFht3bC' },
]
export const getPublishedRecaps = cache(async () => {
  const token = process.env.AIRTABLE_API_TOKEN
  if (!token) return { ok: false, recaps: [] }
  try {
    const url = new URL(tableUrl(TABLES.SHOWS))
    url.searchParams.set('returnFieldsByFieldId', 'true')
    url.searchParams.set('pageSize', '10')
    url.searchParams.set('filterByFormula', `OR(${sources.map(({ id }) => `RECORD_ID()='${id}'`).join(',')})`)
    for (const field of [F.publish, F.date, F.status, F.bands, F.venue]) url.searchParams.append('fields[]', field)
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(8000) })
    if (!response.ok) throw new Error('source_unavailable')
    const data = await response.json()
    if (!Array.isArray(data.records) || data.offset) throw new Error('invalid_source')
    return { ok: true, recaps: recaps.filter(recap => recapIsPublished(data.records, sources, recap.date)) }
  } catch { return { ok: false, recaps: [] } }
})
