// Phase 18.3: Spotify diagnostic endpoint.
//
// GET /api/songs/_debug returns a JSON blob describing:
//   - whether SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET are present in the
//     runtime env (boolean) and how long the values are (number, no secret
//     content)
//   - the result of a single fresh token request (uncached)
//   - the result of a single fresh search for a known track (uncached)
//
// No caching. Safe to expose because it never echoes secret values, only
// presence + length + Spotify response status. Delete this file (or leave
// it; it has no marketing surface) once album art is verified working.

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SEARCH_URL = 'https://api.spotify.com/v1/search'

// Trim what makes it into the response body if Spotify returns text (errors,
// HTML, etc.) so we never leak something huge. 240 chars is plenty for any
// real Spotify error payload.
function shortPreview(s) {
  if (typeof s !== 'string') return null
  const trimmed = s.trim()
  return trimmed.length > 240 ? trimmed.slice(0, 240) + '…' : trimmed
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
    clientIdHadWhitespace: idRaw ? idRaw !== idRaw.trim() : false,
    clientSecretHadWhitespace: secretRaw ? secretRaw !== secretRaw.trim() : false,
  }

  // If creds aren't set, stop here — no point hitting Spotify.
  if (!id || !secret) {
    return NextResponse.json(
      { env, token: null, search: null, conclusion: 'Spotify env vars not set in this deployment.' },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  // ── Token request ──────────────────────────────────────────────
  let token = null
  let tokenResult = { ok: false, status: 0, error: null }
  try {
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
    tokenResult.status = res.status
    tokenResult.ok = res.ok
    if (res.ok) {
      const data = await res.json()
      token = data?.access_token || null
      tokenResult.tokenType = data?.token_type || null
      tokenResult.expiresIn = data?.expires_in || null
    } else {
      const body = await res.text()
      tokenResult.error = shortPreview(body)
    }
  } catch (err) {
    tokenResult.error = `THREW: ${shortPreview(String(err?.message || err))}`
  }

  if (!token) {
    return NextResponse.json(
      { env, token: tokenResult, search: null, conclusion: 'Token request failed — see token.error for details.' },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  // ── Sample search ──────────────────────────────────────────────
  const q = `track:"Dear Maria, Count Me In" artist:"All Time Low"`
  const url = `${SEARCH_URL}?type=track&limit=1&market=US&q=${encodeURIComponent(q)}`
  let searchResult = { ok: false, status: 0, error: null }
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    searchResult.status = res.status
    searchResult.ok = res.ok
    if (res.ok) {
      const data = await res.json()
      const track = data?.tracks?.items?.[0]
      searchResult.itemsReturned = data?.tracks?.items?.length ?? 0
      if (track) {
        searchResult.sample = {
          name: track.name,
          artist: (track.artists || []).map(a => a.name).join(', '),
          albumName: track.album?.name,
          albumArt: track.album?.images?.[0]?.url || null,
          spotifyUrl: track.external_urls?.spotify || null,
        }
      }
    } else {
      const body = await res.text()
      searchResult.error = shortPreview(body)
    }
  } catch (err) {
    searchResult.error = `THREW: ${shortPreview(String(err?.message || err))}`
  }

  const conclusion = searchResult.ok && searchResult.sample?.albumArt
    ? 'Spotify is fully reachable from this deployment. Album art should be loading on band pages once any old cache entries clear (within 1 hour of the redeploy).'
    : searchResult.ok
      ? 'Token + search both 200 but no album art on the test track — unusual. Share the raw output with Claude.'
      : 'Token works but search failed. Check search.error for details.'

  return NextResponse.json(
    { env, token: tokenResult, search: searchResult, conclusion },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
