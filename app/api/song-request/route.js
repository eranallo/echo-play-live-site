// Phase 20: Song request intake endpoint.
//
// POST /api/song-request writes a new record to the Airtable SONG REQUESTS
// table. Used by both the tribute discography view (Elite, Jambi — pre-fills
// song info from Spotify) and the regular catalog (SLGN, TDB — user types
// the song themselves).
//
// Naive dedupe: if a request with the same normalized song title + same
// band already exists with Status != Declined, increment that record's
// Vote Count by 1 and append the new requester info to its Message field
// instead of creating a duplicate row.
//
// All fields except Song Title and Band Requested For are optional.

import { NextResponse } from 'next/server'
import { bands } from '@/lib/bands'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── Airtable config ─────────────────────────────────────────────────
//
// The SONG REQUESTS table ID is what Airtable Cobuilder produces after
// creating the table from the prompt. Fill it in once you have it. The
// site will return a 500 with a useful error message until it's set, so
// you don't accidentally lose a request to /dev/null.

const AIRTABLE_BASE = 'appYUOoJgvRyZ7fLB'
const SONG_REQUESTS_TABLE_ID = process.env.AIRTABLE_SONG_REQUESTS_TABLE_ID || ''

// Field names — match the names Cobuilder will produce from the prompt.
// If anything came back named slightly differently, edit here.
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

function normTitle(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
}

export async function POST(request) {
  // Block obviously bad config before touching the network.
  const token = process.env.AIRTABLE_API_TOKEN
  if (!token) return jsonErr('Server misconfigured: AIRTABLE_API_TOKEN missing', 500)
  if (!SONG_REQUESTS_TABLE_ID) {
    return jsonErr(
      'Server misconfigured: AIRTABLE_SONG_REQUESTS_TABLE_ID not set. Drop the SONG REQUESTS table ID into Vercel env vars to enable submissions.',
      500
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonErr('Invalid JSON body')
  }

  // ── Validate inputs ───────────────────────────────────────────────
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

  // Honeypot: front-end may include a hidden field "company" that real users
  // never fill. Anything in it is almost certainly a bot — silently 200.
  if (body.company) return NextResponse.json({ ok: true, deduped: false })

  // ── Dedupe: check for an existing open request with the same title + band
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${SONG_REQUESTS_TABLE_ID}` +
    `?filterByFormula=` +
    encodeURIComponent(
      `AND(LOWER({${F.SONG_TITLE}})="${songTitle.toLowerCase().replace(/"/g, '\\"')}",` +
      `FIND("${band.airtableId}",ARRAYJOIN({${F.BAND_REQUESTED_FOR}}))>0,` +
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
    // If filterByFormula fails because Airtable can't resolve a name, fall
    // through to plain insert. Better to over-create than to lose requests.
  } catch {
    existing = null
  }

  // ── If existing, bump Vote Count + append message
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
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/${SONG_REQUESTS_TABLE_ID}/${existing.id}`,
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
        const errText = await patchRes.text()
        console.warn('[song-request] dedupe patch failed:', patchRes.status, errText)
        // Fall through to a fresh create so the request isn't lost.
      } else {
        return NextResponse.json({ ok: true, deduped: true })
      }
    } catch (err) {
      console.warn('[song-request] dedupe patch threw:', err?.message)
    }
  }

  // ── Create new record
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
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/${SONG_REQUESTS_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [{ fields: fieldsToCreate }],
          // typecast helps if the singleSelect option text differs slightly.
          typecast: true,
        }),
      }
    )
    if (!createRes.ok) {
      const errText = await createRes.text()
      console.warn('[song-request] create failed:', createRes.status, errText)
      return jsonErr(`Airtable rejected the request: ${createRes.status}`, 502)
    }
    return NextResponse.json({ ok: true, deduped: false })
  } catch (err) {
    console.warn('[song-request] create threw:', err?.message)
    return jsonErr('Unable to reach Airtable. Please try again.', 502)
  }
}
