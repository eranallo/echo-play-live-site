// Phase 20: Song request intake endpoint.
//
// POST /api/song-request writes a new record to the Airtable SONG REQUESTS
// table. Used by both the tribute discography view and the regular catalog.
// Public callers receive generic errors; operational details are logged only
// on the server.

import { NextResponse } from 'next/server'
import { bands } from '@/lib/bands'
import { rateLimit } from '@/lib/ratelimit'
import { tableUrl, getSongRequestsTableId } from '@/lib/airtable'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const F = {
  SONG_TITLE: 'Song Title',
  ORIGINAL_ARTIST: 'Original Artist',
  ALBUM: 'Album',
  SPOTIFY_TRACK_ID: 'Spotify Track ID',
  SPOTIFY_TRACK_URL: 'Spotify Track URL',
  BAND_REQUESTED_FOR: 'Band Requested For',
  REQUESTER_NAME: 'Requester Name',
  REQUESTER_EMAIL: 'Requester Email',
  MESSAGE: 'Message',
  STATUS: 'Status',
  VOTE_COUNT: 'Vote Count',
}

function jsonErr(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

function escapeFormulaLiteral(s) {
  return String(s || '')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[{}]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .slice(0, 200)
}

function genericUnavailable() {
  return jsonErr('Song requests are temporarily unavailable. Please try again later.', 503)
}

export async function POST(request) {
  const limited = rateLimit(request, {
    capacity: 10,
    refillMs: 60_000,
    scope: 'song-request',
  })
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
    )
  }

  const token = process.env.AIRTABLE_API_TOKEN
  if (!token) {
    console.warn('[song-request] missing Airtable credential')
    return genericUnavailable()
  }

  const SONG_REQUESTS_TABLE_ID = getSongRequestsTableId()
  if (!SONG_REQUESTS_TABLE_ID) {
    console.warn('[song-request] missing song requests table id')
    return genericUnavailable()
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonErr('Invalid JSON body')
  }

  const songTitle = (body.songTitle || '').toString().trim()
  const bandSlug = (body.bandSlug || '').toString().trim()
  if (!songTitle) return jsonErr('songTitle is required')
  if (!bandSlug || !bands[bandSlug]) return jsonErr('Invalid bandSlug')

  const band = bands[bandSlug]
  const originalArtist = (body.originalArtist || '').toString().trim()
  const album = (body.album || '').toString().trim()
  const spotifyTrackId = (body.spotifyTrackId || '').toString().trim()
  const spotifyTrackUrl = (body.spotifyTrackUrl || '').toString().trim()
  const requesterName = (body.requesterName || '').toString().trim().slice(0, 80)
  const requesterEmail = (body.requesterEmail || '').toString().trim().slice(0, 120)
  const message = (body.message || '').toString().trim().slice(0, 1000)

  if (body.company) return NextResponse.json({ ok: true, deduped: false })

  const url = tableUrl(SONG_REQUESTS_TABLE_ID) +
    `?filterByFormula=` +
    encodeURIComponent(
      `AND(LOWER({${F.SONG_TITLE}})="${escapeFormulaLiteral(songTitle.toLowerCase())}",` +
      `FIND("${escapeFormulaLiteral(band.airtableId)}",ARRAYJOIN({${F.BAND_REQUESTED_FOR}}))>0,` +
      `{${F.STATUS}}!="Declined")`
    ) +
    `&maxRecords=1`

  let existing = null
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      existing = data?.records?.[0] || null
    }
  } catch {
    existing = null
  }

  if (existing) {
    const fields = existing.fields || {}
    const prevVotes = typeof fields[F.VOTE_COUNT] === 'number' ? fields[F.VOTE_COUNT] : 1
    const prevMsg = (fields[F.MESSAGE] || '').toString()
    const appended = message || requesterName || requesterEmail
      ? [
          prevMsg,
          '',
          `--- additional vote ---`,
          requesterName ? `From: ${requesterName}` : null,
          requesterEmail ? `Email: ${requesterEmail}` : null,
          message ? `Message: ${message}` : null,
        ].filter(Boolean).join('\n')
      : prevMsg

    try {
      const patchRes = await fetch(
        `${tableUrl(SONG_REQUESTS_TABLE_ID)}/${existing.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              [F.VOTE_COUNT]: prevVotes + 1,
              [F.MESSAGE]: appended,
            },
          }),
        }
      )
      if (!patchRes.ok) {
        console.warn('[song-request] dedupe patch failed:', patchRes.status)
      } else {
        return NextResponse.json({ ok: true, deduped: true })
      }
    } catch (err) {
      console.warn('[song-request] dedupe patch threw:', err?.message)
    }
  }

  const fieldsToCreate = {
    [F.SONG_TITLE]: songTitle,
    [F.BAND_REQUESTED_FOR]: [band.airtableId],
    [F.STATUS]: 'New',
    [F.VOTE_COUNT]: 1,
  }
  if (originalArtist) fieldsToCreate[F.ORIGINAL_ARTIST] = originalArtist
  if (album) fieldsToCreate[F.ALBUM] = album
  if (spotifyTrackId) fieldsToCreate[F.SPOTIFY_TRACK_ID] = spotifyTrackId
  if (spotifyTrackUrl) fieldsToCreate[F.SPOTIFY_TRACK_URL] = spotifyTrackUrl
  if (requesterName) fieldsToCreate[F.REQUESTER_NAME] = requesterName
  if (requesterEmail) fieldsToCreate[F.REQUESTER_EMAIL] = requesterEmail
  if (message) fieldsToCreate[F.MESSAGE] = message

  try {
    const createRes = await fetch(
      tableUrl(SONG_REQUESTS_TABLE_ID),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [{ fields: fieldsToCreate }],
          typecast: true,
        }),
      }
    )
    if (!createRes.ok) {
      console.warn('[song-request] create failed:', createRes.status)
      return genericUnavailable()
    }
    return NextResponse.json({ ok: true, deduped: false })
  } catch (err) {
    console.warn('[song-request] create threw:', err?.message)
    return genericUnavailable()
  }
}
