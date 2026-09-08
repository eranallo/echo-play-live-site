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
  return NextResponse.json({ ok: false, error: message }, { status, headers:{'Cache-Control':'no-store'} })
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
  try {
    const origin=new URL(request.headers.get('origin'))
    if(!['http:','https:'].includes(origin.protocol) || origin.host!==request.headers.get('host')) return jsonErr('Please send your suggestion from this website.',403)
  } catch {return jsonErr('Please send your suggestion from this website.',403)}
  if(process.env.VERCEL_ENV!=='production') return genericUnavailable()
  if(!request.headers.get('content-type')?.startsWith('application/json')) return jsonErr('Expected a song suggestion.',415)
  if(Number(request.headers.get('content-length'))>6000) return jsonErr('Please shorten your suggestion.',413)
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
    const raw=await request.text()
    if(raw.length>6000) return jsonErr('Please shorten your suggestion.',413)
    body=JSON.parse(raw)
    if(!body || typeof body!=='object' || Array.isArray(body))return jsonErr('Invalid suggestion.')
    for(const [field,max] of Object.entries({bandSlug:80,songTitle:200,originalArtist:200,album:200,spotifyTrackId:80,spotifyTrackUrl:300,requesterName:80,requesterEmail:120,message:1000,company:200})) {
      if(body[field]!=null && (typeof body[field]!=='string' || body[field].length>max)) return jsonErr('Please check your suggestion details.')
    }
    if(body.requesterEmail && !/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(body.requesterEmail.trim())) return jsonErr('Please check your email address.')
  } catch {
    return jsonErr('Invalid JSON body')
  }

  const songTitle = (body.songTitle || '').toString().trim()
  const bandSlug = (body.bandSlug || '').toString().trim()
  if (!songTitle) return jsonErr('songTitle is required')
  if (!bandSlug || !bands[bandSlug] || bands[bandSlug].hidden) return jsonErr('Invalid bandSlug')

  const band = bands[bandSlug]
  const originalArtist = (body.originalArtist || '').toString().trim()
  const album = (body.album || '').toString().trim()
  const spotifyTrackId = (body.spotifyTrackId || '').toString().trim()
  const spotifyTrackUrl = (body.spotifyTrackUrl || '').toString().trim()
  const requesterName = (body.requesterName || '').toString().trim().slice(0, 80)
  const requesterEmail = (body.requesterEmail || '').toString().trim().slice(0, 120)
  const message = (body.message || '').toString().trim().slice(0, 1000)

  if (body.company) return jsonErr('Please check your suggestion details.')

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
      cache: 'no-store', signal:AbortSignal.timeout(10000),
    })
    if (!res.ok) return genericUnavailable()
    if (res.ok) {
      const data = await res.json()
      existing = data?.records?.[0] || null
    }
  } catch {
    return genericUnavailable()
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
          method: 'PATCH', signal:AbortSignal.timeout(10000),
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
        return genericUnavailable()
      } else {
        return NextResponse.json({ ok: true, deduped: true })
      }
    } catch (err) {
      console.warn('[song-request] dedupe patch failed')
      return genericUnavailable()
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
        method: 'POST', signal:AbortSignal.timeout(10000),
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
    console.warn('[song-request] create failed')
    return genericUnavailable()
  }
}
