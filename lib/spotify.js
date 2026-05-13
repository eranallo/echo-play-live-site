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

// Internal cached version. Keyed by (title, artist) so the same song only
// hits Spotify once per revalidation window across all renders.
//
// Cache key bumped to v2 in the Phase 18.2 hotfix because v1 entries were
// poisoned with nulls from cold starts that happened before SPOTIFY_CLIENT_ID
// was set in Vercel. Bumping the key forces a fresh fetch for every song the
// next time the page is loaded.
const _cachedSearchTrack = unstable_cache(
  async (title, artist) => _searchTrackOnce(title, artist),
  ['spotify-track-v2'],
  {
    // 7 days. Album covers rarely change, but if a lookup somehow caches the
    // wrong artwork, the page self-heals within a week.
    revalidate: 60 * 60 * 24 * 7,
    tags: ['spotify-tracks'],
  }
)

// Public lookup. Skips the cache entirely when Spotify credentials are missing
// so we never poison a cache slot with `null` during a misconfigured deploy.
// Once creds are present, every call goes through `_cachedSearchTrack`.
export async function searchTrack(title, artist) {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    return null
  }
  return _cachedSearchTrack(title, artist)
}

// ── Phase 20: Artist + discography lookups ───────────────────────────
//
// Used by the tribute band pages (Elite, Jambi) to show the full
// discography of the tributed artist (Deftones, TOOL) with our performed
// tracks highlighted.

const ARTIST_SEARCH_URL = 'https://api.spotify.com/v1/search'
const ARTIST_ALBUMS_URL = (id) => `https://api.spotify.com/v1/artists/${id}/albums`
const ALBUMS_BATCH_URL = 'https://api.spotify.com/v1/albums'

async function _searchArtistOnce(name) {
  const token = await getAppToken()
  if (!token) return null
  const url = `${ARTIST_SEARCH_URL}?type=artist&limit=5&q=${encodeURIComponent(name)}`
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) {
      if (res.status === 401) _tokenCache = { value: null, expiresAt: 0 }
      console.warn('[spotify] artist search failed:', res.status, name)
      return null
    }
    const data = await res.json()
    const items = data?.artists?.items || []
    // Prefer the artist whose name matches exactly (case-insensitive), else
    // first hit. Spotify will return e.g. "TOOL" first for the search "TOOL"
    // but with this fallback we'd survive a slight name mismatch.
    const lower = name.toLowerCase()
    const exact = items.find(a => a.name?.toLowerCase() === lower)
    const pick = exact || items[0]
    if (!pick) return null
    return {
      id: pick.id,
      name: pick.name,
      spotifyUrl: pick.external_urls?.spotify || null,
      image: pick.images?.[0]?.url || null,
      followers: pick.followers?.total || null,
    }
  } catch (err) {
    console.warn('[spotify] artist search threw:', err?.message)
    return null
  }
}

// Phase 20.3 hotfix: bumped v1→v2 to bypass any null entries that got cached
// during a transient Spotify failure on a Phase 20 cold start. The TTL is
// also dropped to 30 days so a future poisoned entry would self-heal within
// a month instead of three.
const _cachedSearchArtist = unstable_cache(
  async (name) => _searchArtistOnce(name),
  ['spotify-artist-v2'],
  { revalidate: 60 * 60 * 24 * 30, tags: ['spotify-artists'] } // 30 days
)

export async function searchArtist(name) {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) return null
  return _cachedSearchArtist(name)
}

// Fetch the artist's discography — studio albums only, paginated.
// Then expand each album to its full track list via the /albums batch endpoint.
async function _getArtistDiscographyOnce(artistId) {
  const token = await getAppToken()
  if (!token) return null

  // 1. Get the list of albums (include_groups=album to skip singles/compilations).
  //    Phase 20.4 hotfix: dropped page size 50→20. Spotify's docs say 50 is the
  //    max but the live API returned HTTP 400 "Invalid limit" at 50 on the
  //    artist-albums endpoint. The pagination loop below follows `next` so
  //    deep catalogs (Deftones has ~9 studio albums, TOOL ~5) still resolve
  //    fully — just in 1–2 requests instead of 1.
  const albumIds = []
  const albumsMeta = []
  let pageUrl = `${ARTIST_ALBUMS_URL(artistId)}?include_groups=album&limit=20&market=US`
  try {
    while (pageUrl) {
      const res = await fetch(pageUrl, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (!res.ok) {
        if (res.status === 401) _tokenCache = { value: null, expiresAt: 0 }
        console.warn('[spotify] artist albums fetch failed:', res.status, artistId)
        return null
      }
      const data = await res.json()
      for (const album of data?.items || []) {
        albumIds.push(album.id)
      }
      pageUrl = data?.next || null
    }
  } catch (err) {
    console.warn('[spotify] artist albums fetch threw:', err?.message)
    return null
  }

  if (albumIds.length === 0) return { albums: [] }

  // 2. Batch-fetch full album details (20 per call max) so we get tracks.
  const albumDetails = []
  try {
    for (let i = 0; i < albumIds.length; i += 20) {
      const batch = albumIds.slice(i, i + 20).join(',')
      const url = `${ALBUMS_BATCH_URL}?ids=${batch}&market=US`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (!res.ok) {
        console.warn('[spotify] albums batch failed:', res.status)
        continue
      }
      const data = await res.json()
      albumDetails.push(...(data?.albums || []))
    }
  } catch (err) {
    console.warn('[spotify] albums batch threw:', err?.message)
  }

  // 3. De-dupe albums by normalized name + release year. Spotify often returns
  //    the same album multiple times (deluxe, remastered, regional pressings).
  //    Keep the version with the most tracks (likely the most complete).
  const dedup = new Map()
  for (const a of albumDetails) {
    if (!a) continue
    const year = (a.release_date || '').slice(0, 4)
    const key = `${(a.name || '').toLowerCase().replace(/\s+\(.+\)$/, '').trim()}|${year}`
    const existing = dedup.get(key)
    const trackCount = a.tracks?.items?.length || 0
    if (!existing || trackCount > (existing.tracks?.items?.length || 0)) {
      dedup.set(key, a)
    }
  }

  // 4. Project to a slim shape and sort by release date desc.
  const albums = Array.from(dedup.values())
    .map(a => ({
      id: a.id,
      name: a.name,
      year: (a.release_date || '').slice(0, 4) || null,
      releaseDate: a.release_date || null,
      coverUrl: (a.images || [])[1]?.url || a.images?.[0]?.url || null,
      coverUrlLarge: a.images?.[0]?.url || null,
      spotifyUrl: a.external_urls?.spotify || null,
      totalTracks: a.total_tracks,
      tracks: (a.tracks?.items || []).map(t => ({
        id: t.id,
        title: t.name,
        trackNumber: t.track_number,
        discNumber: t.disc_number,
        durationMs: t.duration_ms,
        spotifyUrl: t.external_urls?.spotify || null,
        previewUrl: t.preview_url || null,
        explicit: t.explicit,
      })),
    }))
    .sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''))

  return { albums }
}

// Phase 20.3 hotfix: bumped v1→v2 to bypass null entries cached during a
// transient Spotify failure on a Phase 20 cold start. TTL dropped from 30 days
// to 7 days so any future poisoned state self-heals within a week.
const _cachedDiscography = unstable_cache(
  async (artistId) => _getArtistDiscographyOnce(artistId),
  ['spotify-discography-v2'],
  { revalidate: 60 * 60 * 24 * 7, tags: ['spotify-discography'] } // 7 days
)

export async function getArtistDiscography(artistId) {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) return null
  if (!artistId) return null
  return _cachedDiscography(artistId)
}
