// Phase 18.3 + 20.4: Spotify diagnostic endpoint.
//
// GET /api/spotify-check runs a fresh, uncached Spotify probe across three
// surfaces:
//   - Token (Client Credentials flow)
//   - Track search (verifies basic search works — used by the SLGN/TDB catalog)
//   - Artist search + album discography (used by the Elite/Jambi tribute view)
//
// No caching. Safe to expose because it never echoes secret values. The
// `conclusion` field at the bottom names the exact failure mode in plain
// English.

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SEARCH_URL = 'https://api.spotify.com/v1/search'

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

  if (!id || !secret) {
    return NextResponse.json(
      { env, token: null, search: null, artist: null, discography: null,
        conclusion: 'Spotify env vars not set in this deployment.' },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  // ── Token request ─────────────────────────────────────────────
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
      tokenResult.error = shortPreview(await res.text())
    }
  } catch (err) {
    tokenResult.error = `THREW: ${shortPreview(String(err?.message || err))}`
  }

  if (!token) {
    return NextResponse.json(
      { env, token: tokenResult, search: null, artist: null, discography: null,
        conclusion: 'Token request failed — see token.error for details.' },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  // ── Track search ──────────────────────────────────────────────
  let searchResult = { ok: false, status: 0, error: null }
  try {
    const q = `track:"Dear Maria, Count Me In" artist:"All Time Low"`
    const url = `${SEARCH_URL}?type=track&limit=1&market=US&q=${encodeURIComponent(q)}`
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
          albumArt: track.album?.images?.[0]?.url || null,
        }
      }
    } else {
      searchResult.error = shortPreview(await res.text())
    }
  } catch (err) {
    searchResult.error = `THREW: ${shortPreview(String(err?.message || err))}`
  }

  // ── Artist search (Deftones) ──────────────────────────────────
  let artistResult = { ok: false, status: 0, error: null }
  let artistId = null
  let artistName = null
  try {
    const q = 'Deftones'
    const url = `${SEARCH_URL}?type=artist&limit=5&q=${encodeURIComponent(q)}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    artistResult.status = res.status
    artistResult.ok = res.ok
    if (res.ok) {
      const data = await res.json()
      const items = data?.artists?.items || []
      artistResult.itemsReturned = items.length
      const exact = items.find(a => a.name?.toLowerCase() === 'deftones')
      const pick = exact || items[0]
      if (pick) {
        artistId = pick.id
        artistName = pick.name
        artistResult.sample = { id: pick.id, name: pick.name, followers: pick.followers?.total }
      }
    } else {
      artistResult.error = shortPreview(await res.text())
    }
  } catch (err) {
    artistResult.error = `THREW: ${shortPreview(String(err?.message || err))}`
  }

  // ── Discography (Deftones albums) ─────────────────────────────
  let discoResult = { ok: false, status: 0, error: null }
  if (artistId) {
    try {
      const url = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=50&market=US`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      discoResult.status = res.status
      discoResult.ok = res.ok
      if (res.ok) {
        const data = await res.json()
        const albums = data?.items || []
        discoResult.albumsReturned = albums.length
        discoResult.firstThreeNames = albums.slice(0, 3).map(a => `${a.name} (${(a.release_date || '').slice(0, 4)})`)
      } else {
        discoResult.error = shortPreview(await res.text())
      }
    } catch (err) {
      discoResult.error = `THREW: ${shortPreview(String(err?.message || err))}`
    }
  } else {
    discoResult.error = 'Skipped — artist lookup returned no ID.'
  }

  // ── Verdict ───────────────────────────────────────────────────
  let conclusion
  if (!searchResult.ok) {
    conclusion = 'Track search failed. SLGN/TDB catalogs would not work either.'
  } else if (!artistResult.ok) {
    conclusion = 'Artist search failed. Elite/Jambi discography depends on this.'
  } else if (!artistId) {
    conclusion = 'Artist search returned no Deftones match — unusual. Share output with Claude.'
  } else if (!discoResult.ok) {
    conclusion = 'Artist found, but discography fetch failed. See discography.error.'
  } else if (discoResult.albumsReturned === 0) {
    conclusion = 'Discography returned 0 albums — unexpected. Share output with Claude.'
  } else {
    conclusion =
      `Everything reachable from this deployment. Artist "${artistName}" found, ` +
      `${discoResult.albumsReturned} albums returned. If /api/discography/elite still shows empty, ` +
      `there is a poisoned unstable_cache entry — redeploy with build cache disabled to clear it, ` +
      `and verify the lib/spotify.js you uploaded has 'spotify-artist-v2' (not v1).`
  }

  return NextResponse.json(
    { env, token: tokenResult, search: searchResult, artist: artistResult, discography: discoResult, conclusion },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
