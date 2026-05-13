// Phase 20.x: Airtable diagnostic endpoint.
//
// GET /api/airtable-check returns a JSON blob describing:
//   - whether AIRTABLE_API_TOKEN is present (boolean + length, no value)
//   - whether AIRTABLE_SONG_REQUESTS_TABLE_ID is present
//   - the result of a single fresh GET against the SONGS table (uncached)
//   - how many records came back, and whether any of them have So Long
//     Goodnight in their Performed By field
//
// No caching. Safe to expose (never echoes the token or any record content
// beyond a single sample for diagnostics). Delete this file once the catalog
// is verified working.

import { NextResponse } from 'next/server'
import { bands } from '@/lib/bands'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AIRTABLE_BASE = 'appYUOoJgvRyZ7fLB'
const SONGS_TABLE = 'tblrC2brkr3mVNnl1'
const PERFORMED_BY_FIELD = 'fldg5C7NikZXurjU9'

function shortPreview(s) {
  if (typeof s !== 'string') return null
  const t = s.trim()
  return t.length > 320 ? t.slice(0, 320) + '…' : t
}

export async function GET() {
  const tokenRaw = process.env.AIRTABLE_API_TOKEN
  const tableIdRaw = process.env.AIRTABLE_SONG_REQUESTS_TABLE_ID
  const token = (tokenRaw || '').trim()

  const env = {
    hasAirtableToken: Boolean(tokenRaw),
    airtableTokenLength: tokenRaw ? tokenRaw.length : 0,
    tokenHadWhitespace: tokenRaw ? tokenRaw !== tokenRaw.trim() : false,
    hasSongRequestsTableId: Boolean(tableIdRaw),
    songRequestsTableIdValue: tableIdRaw || null, // safe — this is a table ID, not a secret
  }

  if (!token) {
    return NextResponse.json(
      { env, songs: null, conclusion: 'AIRTABLE_API_TOKEN env var is not set in this deployment.' },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  // Fresh, uncached Airtable request.
  const url =
    `https://api.airtable.com/v0/${AIRTABLE_BASE}/${SONGS_TABLE}` +
    `?pageSize=100&returnFieldsByFieldId=true`

  let songs = { ok: false, status: 0, error: null }
  let firstPageCount = 0
  let firstPageHasNextPage = false
  let bandMatchSummary = {}

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    songs.status = res.status
    songs.ok = res.ok
    if (!res.ok) {
      songs.error = shortPreview(await res.text())
    } else {
      const data = await res.json()
      const records = data?.records || []
      firstPageCount = records.length
      firstPageHasNextPage = Boolean(data?.offset)

      // Count how many songs on this first page link to each band.
      for (const band of Object.values(bands)) {
        let count = 0
        for (const rec of records) {
          const links = rec.fields?.[PERFORMED_BY_FIELD]
          if (Array.isArray(links) && links.includes(band.airtableId)) count += 1
        }
        bandMatchSummary[band.slug] = count
      }

      // Sample the first record so we can verify field-IDs vs field-names.
      const sample = records[0]
      songs.sampleRecord = sample
        ? {
            id: sample.id,
            fieldKeys: Object.keys(sample.fields || {}).slice(0, 12),
            performedByOnSample: sample.fields?.[PERFORMED_BY_FIELD] || null,
          }
        : null
    }
  } catch (err) {
    songs.error = `THREW: ${shortPreview(String(err?.message || err))}`
  }

  let conclusion
  if (!songs.ok) {
    conclusion = `Airtable rejected the request (HTTP ${songs.status}). See songs.error.`
  } else if (firstPageCount === 0) {
    conclusion = 'Airtable returned zero records on the first page — the SONGS table may be empty or filtered server-side.'
  } else if (Object.values(bandMatchSummary).every(n => n === 0)) {
    conclusion =
      'Airtable returned records, but none on the first page link to any of the four bands in Performed By. ' +
      'Check that Performed By is populated on songs and that records use the field ID ' +
      PERFORMED_BY_FIELD + '. Also verify the band airtableIds in lib/bands.js still match the BANDS table.'
  } else {
    conclusion =
      `First page returned ${firstPageCount} records. ` +
      `Per-band first-page matches: ${JSON.stringify(bandMatchSummary)}. ` +
      `If the live catalog still shows 0, the Vercel data cache from a prior cold start is stale — redeploy with build cache disabled.`
  }

  return NextResponse.json(
    {
      env,
      songs,
      firstPageCount,
      firstPageHasNextPage,
      bandMatchSummary,
      conclusion,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
