// Phase 18: Songs catalog per band.
//
// Fetches Live songs from Airtable SONGS table filtered by the band's record
// link, enriches each with Spotify album art + track URL, and returns the
// list sorted by Popularity (Iconic → Smash Hit → Very Popular → ...) then
// alphabetically by title.
//
// Reads from Airtable on each request (with 1h ISR window), but each
// (title, artist) pair is Spotify-cached for 30 days. Adding a new song in
// Airtable surfaces on the next page render; the Spotify lookup is the only
// cost for net-new songs.

import { bands } from '@/lib/bands'
import { searchTrack } from '@/lib/spotify'

import { TABLES, tableUrl } from '@/lib/airtable'


// Field IDs from the SONGS table (frozen so a rename in Airtable doesn't break us).
const F = {
  TITLE: 'fldOQAvHt4irUXO4X',         // Song Title
  ARTIST: 'fldjCsYueKBK8xJAs',        // Artist (original)
  ALBUM: 'fldkKWmvAzqYDnqWU',         // Album
  YEAR: 'fldA8kFQLoZGasg79',          // Year (text)
  SHOW_STATUS: 'fldq1NXAYL5WbKGmf',   // Show Status singleSelect
  PERFORMED_BY: 'fldg5C7NikZXurjU9',  // linked record → BANDS
  POPULARITY: 'fldymiAqzVMMu7iri',    // singleSelect
  GENRE: 'fldVMVG0kgDFQElWQ',         // multipleSelects
  DURATION: 'fldBnltomWHlWkZkH',      // duration (seconds)
  NOTES: 'fld8ZXbfA10nBHwY6',         // multilineText
}

// Popularity ordering for sort. Higher = comes first. Values that don't appear
// here fall back to 0 (sorted alongside un-tagged songs at the bottom).
const POPULARITY_RANK = {
  'Smash Hit': 100,
  'Iconic': 95,
  'Very Popular': 90,
  'Mainstream': 85,
  'Popular': 80,
  'Well-Known': 75,
  'Known': 70,
  'Recognized': 65,
  'Cult Classic': 60,
  'Underground': 50,
  'Niche': 40,
  'Obscure': 30,
  'Popularity': 0,
}

// Cache the band-name lookup once per module load.
const bandIdToInfo = Object.fromEntries(
  Object.values(bands).map(b => [b.airtableId, b])
)

function selectValue(raw) {
  if (!raw) return null
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) return raw.map(selectValue).filter(Boolean).join(', ')
  if (raw.name) return raw.name
  return null
}

function multiSelectValues(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map(v => (typeof v === 'string' ? v : v?.name)).filter(Boolean)
  return []
}

// Fetch ALL songs (no Show Status filter — Phase 18.4 expanded the catalog
// scope so the page reflects every song tagged Performed By, past or present).
// We still filter per-band in JS so the same payload serves any band lookup
// within a single request.
async function fetchAllLiveSongs() {
  const token = process.env.AIRTABLE_API_TOKEN
  if (!token) {
    console.warn('[songs] AIRTABLE_API_TOKEN not set — returning empty catalog')
    return []
  }

  // No filterByFormula. The Performed By multipleRecordLinks field is the only
  // filter applied, and that happens in JS below since Airtable's formula
  // language doesn't index linked-record arrays cleanly.
  let url = tableUrl(TABLES.SONGS) +
    `?pageSize=100` +
    `&returnFieldsByFieldId=true`

  const all = []
  try {
    // Airtable paginates at 100 records max — full catalog is ~200+ so we
    // may follow nextPage a few times.
    while (url) {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        // Phase 20.2 hotfix: 60s so adding a song in Airtable appears within
        // a minute AND so a transient empty fetch can't pin the catalog at
        // zero for an hour. `tags` lets us programmatically bust later.
        next: { revalidate: 60, tags: ['airtable-songs'] },
      })
      if (!res.ok) {
        console.warn('[songs] Airtable fetch failed:', res.status, await res.text())
        return []
      }
      const data = await res.json()
      all.push(...(data.records || []))
      url = data.offset
        ? tableUrl(TABLES.SONGS) +
          `?pageSize=100` +
          `&returnFieldsByFieldId=true` +
          `&offset=${encodeURIComponent(data.offset)}`
        : null
    }
  } catch (err) {
    console.warn('[songs] fetch threw:', err?.message)
    return []
  }
  return all
}

// Public: get the enriched, sorted catalog for a single band by slug.
//
// Behavior:
//   - Empty array on any error or missing Airtable token (page hides the
//     section if the array is empty — no broken state).
//   - Songs missing from Spotify still render with title + artist + a
//     placeholder cover (handled by the UI).
export async function getSongsForBand(bandSlug) {
  const band = bands[bandSlug]
  if (!band) return []

  const records = await fetchAllLiveSongs()

  // Filter to songs that link to THIS band via Performed By.
  const bandSongs = records.filter(rec => {
    const links = rec.fields?.[F.PERFORMED_BY]
    if (!Array.isArray(links)) return false
    return links.includes(band.airtableId)
  })

  // Normalize first (cheap), then enrich with Spotify (network).
  const normalized = bandSongs.map(rec => {
    const f = rec.fields || {}
    const title = (f[F.TITLE] || '').trim()
    const artist = (f[F.ARTIST] || '').trim()
    if (!title || !artist) return null
    const popularityName = selectValue(f[F.POPULARITY])
    return {
      id: rec.id,
      title,
      artist,
      album: (f[F.ALBUM] || '').trim() || null,
      // Year may have been entered as 4-digit text — keep as string so it
      // formats cleanly without locale separators.
      year: (f[F.YEAR] || '').toString().trim() || null,
      popularity: popularityName,
      popularityRank: POPULARITY_RANK[popularityName] ?? 0,
      genre: multiSelectValues(f[F.GENRE]),
      duration: typeof f[F.DURATION] === 'number' ? f[F.DURATION] : null,
      notes: (f[F.NOTES] || '').trim() || null,
    }
  }).filter(Boolean)

  // Enrich with Spotify in parallel. Each call is independently cached by the
  // unstable_cache wrapper in lib/spotify, so steady-state we hit local cache.
  const enriched = await Promise.all(
    normalized.map(async song => {
      const spotify = await searchTrack(song.title, song.artist)
      return {
        ...song,
        albumArt: spotify?.albumArt || null,
        albumArtLarge: spotify?.albumArtLarge || null,
        spotifyUrl: spotify?.spotifyUrl || null,
        previewUrl: spotify?.previewUrl || null,
        // Fall back to Airtable year/album when Spotify didn't return them.
        year: song.year || spotify?.releaseYear || null,
        album: song.album || spotify?.matchedAlbum || null,
      }
    })
  )

  // Sort: popularity DESC, then alphabetical by title ASC.
  enriched.sort((a, b) => {
    if (b.popularityRank !== a.popularityRank) return b.popularityRank - a.popularityRank
    return a.title.localeCompare(b.title)
  })

  return enriched
}
