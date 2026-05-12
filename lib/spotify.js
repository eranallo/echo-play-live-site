// Phase 18: Spotify track lookup.
//
// Server-side Client Credentials flow. Searches Spotify for a track by
// title + original artist, returns the official album cover, the Spotify
// track URL, and a 30s preview URL when available.
//
// Two layers of caching:
//   1. The access token is cached in-memory per Vercel instance for 50 min
//      (Spotify tokens are valid 1h).
//   2. Track lookups are wrapped in unstable_cache so the same (title, artist)
//      pair only hits Spotify once per ~30 days — even across cold starts.
//
// Required env vars:
//   SPOTIFY_CLIENT_ID
//   SPOTIFY_CLIENT_SECRET
// Set these in Vercel → Project Settings → Environment Variables for all envs.
// Free Spotify Developer App: https://developer.spotify.com/dashboard

import { unstable_cache } from 'next/cache'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SEARCH_URL = 'https://api.spotify.com/v1/search'

// Module-level token cache. Survives within a single Vercel instance until cold start.
let _tokenCache = { value: null, expiresAt: 0 }

async function getAppToken() {
  const now = Date.now()
  if (_tokenCache.value && now < _tokenCache.expiresAt) {
    return _tokenCache.value
  }

  const id = process.env.SPOTIFY_CLIENT_ID
  const secret = process.env.SPOTIFY_CLIENT_SECRET
  if (!id || !secret) {
    return null // Caller treats missing creds as "no album art" and falls back gracefully.
  }

  const basic = Buffer.from(`${id}:${secret}`).toString('base64')
  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      // Don't ISR-cache the token request itself — we manage that here.
      cache: 'no-store',
    })
    if (!res.ok) {
      console.warn('[spotify] token request failed:', res.status, await res.text())
      return null
    }
    const data = await res.json()
    _tokenCache = {
      value: data.access_token,
      // Refresh 10 min before actual expiry to avoid edge races.
      expiresAt: now + (data.expires_in - 600) * 1000,
    }
    return _tokenCache.value
  } catch (err) {
    console.warn('[spotify] token request threw:', err?.message)
    return null
  }
}

// Internal search — uncached, single call. Wrapped below for caching.
async function _searchTrackOnce(title, artist) {
  const token = await getAppToken()
  if (!token) return null

  // Quote title so phrases match cleanly; artist:"" scopes the artist field.
  const q = `track:"${title.replace(/"/g, '')}" artist:"${(artist || '').replace(/"/g, '')}"`
  const url = `${SEARCH_URL}?type=track&limit=1&market=US&q=${encodeURIComponent(q)}`

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) {
      // 401 = token expired mid-flight; bust the cache and let next call refresh.
      if (res.status === 401) _tokenCache = { value: null, expiresAt: 0 }
      console.warn('[spotify] search failed:', res.status, title, artist)
      return null
    }
    const data = await res.json()
    const track = data?.tracks?.items?.[0]
    if (!track) return null

    // Spotify returns 3 image sizes — pick the medium (300x300) for grid cards.
    const album = track.album || {}
    const images = album.images || []
    const sorted = [...images].sort((a, b) => (b.width || 0) - (a.width || 0))
    const albumArtLarge = sorted[0]?.url || null              // ~640x640
    const albumArtMed = sorted.find(i => (i.width || 0) <= 320)?.url || albumArtLarge

    return {
      albumArt: albumArtMed,
      albumArtLarge,
      spotifyUrl: track.external_urls?.spotify || null,
      previewUrl: track.preview_url || null,
      releaseYear: (album.release_date || '').slice(0, 4) || null,
      // The matched track + album name (handy for tooltips / debugging).
      matchedTitle: track.name,
      matchedAlbum: album.name,
      matchedArtist: (track.artists || []).map(a => a.name).join(', '),
    }
  } catch (err) {
    console.warn('[spotify] search threw:', err?.message)
    return null
  }
}

// Public cached lookup. The cache key is derived from (title, artist) so the
// same song only ever hits Spotify once per revalidation window, even if we
// re-render the band page hundreds of times.
export const searchTrack = unstable_cache(
  async (title, artist) => _searchTrackOnce(title, artist),
  ['spotify-track-v1'],
  {
    // 30 days. Album covers are immutable for re-released catalogues — no need
    // to refetch often. Force a redeploy or bump the cache tag to invalidate.
    revalidate: 60 * 60 * 24 * 30,
    tags: ['spotify-tracks'],
  }
)
