// Diagnostic endpoint — Phase 20.5 deep-dive version.
//
// GET /api/spotify-check runs a thorough probe of the Spotify discography
// path. Critically, it includes:
//   - A FILE_VERSION marker at the top so we can verify which version is
//     actually deployed (the previous round had a mismatch where the live
//     site appeared to be running stale code).
//   - Multiple limit values tested against the artist-albums endpoint
//     (?include_groups=album&limit=...) so we can definitively identify
//     which value Spotify accepts in the current deployment.
//   - The exact URLs constructed, echoed back in the response.
//
// No caching. Safe to leave deployed (never echoes secrets).

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Bump this string every time you edit this file. After redeploying, the
// response will reflect the new version — if it doesn't, the file didn't
// actually ship.
const FILE_VERSION = '20.5-deep-dive-2026-05-13'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SEARCH_URL = 'https://api.spotify.com/v1/search'

function shortPreview(s) {
  if (typeof s !== 'string') return null
  const t = s.trim()
  return t.length > 280 ? t.slice(0, 280) + '…' : t
}

async function getToken(id, secret) {
  const basic = Buffer.from(`${id}:${secret}`).toString('base64')
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })
  if (!res.ok) {
    return { ok: false, status: res.status, error: shortPreview(await res.text()), token: null }
  }
  const data = await res.json()
  return { ok: true, status: res.status, token: data?.access_token, expiresIn: data?.expires_in }
}

async function getArtistId(token, name) {
  const url = `${SEARCH_URL}?type=artist&limit=5&q=${encodeURIComponent(name)}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
  const result = { url, ok: res.ok, status: res.status }
  if (!res.ok) {
    result.error = shortPreview(await res.text())
    return result
  }
  const data = await res.json()
  const items = data?.artists?.items || []
  const exact = items.find(a => a.name?.toLowerCase() === name.toLowerCase())
  const pick = exact || items[0]
  if (pick) {
    result.id = pick.id
    result.name = pick.name
  }
  return result
}

// Test the artist-albums endpoint with one specific limit value.
// Returns a row of: { limitTried, url, status, ok, albumsReturned, firstAlbumName, error }
async function probeArtistAlbums(token, artistId, limitValue) {
  // limitValue can be a number or null (omit the param entirely)
  let url = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&market=US`
  if (limitValue !== null) url += `&limit=${limitValue}`

  const out = { limitTried: limitValue, url, ok: false, status: 0 }
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    out.status = res.status
    out.ok = res.ok
    if (res.ok) {
      const data = await res.json()
      const items = data?.items || []
      out.albumsReturned = items.length
      out.totalAccordingToSpotify = data?.total ?? null
      out.firstAlbumName = items[0]?.name || null
      out.lastAlbumName = items[items.length - 1]?.name || null
      out.hasNextPage = Boolean(data?.next)
    } else {
      out.error = shortPreview(await res.text())
    }
  } catch (err) {
    out.error = `THREW: ${shortPreview(String(err?.message || err))}`
  }
  return out
}

export async function GET() {
  const idRaw = process.env.SPOTIFY_CLIENT_ID
  const secretRaw = process.env.SPOTIFY_CLIENT_SECRET
  const id = (idRaw || '').trim()
  const secret = (secretRaw || '').trim()

  const env = {
    hasClientId: Boolean(idRaw),
    hasClientSecret: Boolean(secretRaw),
    clientIdLength: idRaw ? idRaw.length : 0,
    clientSecretLength: secretRaw ? secretRaw.length : 0,
  }

  if (!id || !secret) {
    return NextResponse.json(
      { FILE_VERSION, env, conclusion: 'Spotify env vars not set' },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  // ── 1. Token ─────────────────────────────────────────────────
  const tokenResult = await getToken(id, secret)
  if (!tokenResult.ok || !tokenResult.token) {
    return NextResponse.json(
      { FILE_VERSION, env, token: tokenResult, conclusion: 'Token request failed' },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }
  const token = tokenResult.token

  // ── 2. Artist resolution (Deftones + TOOL) ───────────────────
  const deftones = await getArtistId(token, 'Deftones')
  const tool = await getArtistId(token, 'TOOL')

  // ── 3. Probe artist-albums with every relevant limit value ───
  //
  // The endpoint's documented range is 1-50. We test the edges + a few
  // points in between. If one specific value works and others don't, we
  // know exactly what to use. If all fail, the problem isn't the limit.
  const limitVariants = [null, 1, 10, 20, 30, 49, 50]
  let probes = []
  if (deftones.id) {
    for (const limit of limitVariants) {
      const probe = await probeArtistAlbums(token, deftones.id, limit)
      probes.push({ artist: 'Deftones', ...probe })
    }
  }

  // ── 4. Verdict ───────────────────────────────────────────────
  const workingLimits = probes.filter(p => p.ok).map(p => p.limitTried)
  let conclusion
  if (probes.length === 0) {
    conclusion = 'Artist resolution failed before we could probe albums.'
  } else if (workingLimits.length === 0) {
    conclusion = 'EVERY limit value failed. Issue is not the limit parameter — check probes[0].error for the real Spotify error message.'
  } else if (workingLimits.length === probes.length) {
    conclusion = `All limit values worked. If the production page still shows empty discography, lib/spotify.js is poisoning unstable_cache or not running. Verify FILE_VERSION matches what you uploaded.`
  } else {
    conclusion = `Some limit values work, others fail. Working: ${JSON.stringify(workingLimits)}. lib/spotify.js should use one of the working values.`
  }

  return NextResponse.json(
    {
      FILE_VERSION,
      env,
      token: { ok: tokenResult.ok, status: tokenResult.status, expiresIn: tokenResult.expiresIn },
      artists: { deftones, tool },
      probes,
      conclusion,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
