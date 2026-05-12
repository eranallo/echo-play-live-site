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

const AIRTABLE_BASE = 'appYUOoJgvRyZ7fLB'
const SONGS_TABLE = 'tblrC2brkr3mVNnl1'

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

// Fetch ALL live songs (no per-band filter on the API side — we filter in JS
// so we can use the same payload for any band lookup within a request).
async function fetchAllLiveSongs() {
  const token = process.env.AIRTABLE_API_TOKEN
  if (!token) {
    console.warn('[songs] AIRTABLE_API_TOKEN not set — returning empty catalog')
    return []
  }

  // filterByFormula keeps us to only "Live" songs. Show Status of "Live" is the
  // public catalog; Practicing / Untouched / Dead don't surface on the site.
  const formula = `{Show Status}='Live'`
  let url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${SONGS_TABLE}` +
    `?filterByFormula=${encodeURIComponent(formula)}` +
    `&pageSize=100` +
    `&returnFieldsByFieldId=true`

  const all = []
  try {
    // Airtable paginates at 100 records max — songs catalog is ~130-200 long so
    // we may have to follow nextPage at least once.
    while (url) {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 * 60 }, // 1 hour
      })
      if (!res.ok) {
        console.warn('[songs] Airtable fetch failed:', res.status, await res.text())
        return []
      }
      const data = await res.json()
      all.push(...(data.records || []))
      url = data.offset
        ? `https://api.airtable.com/v0/${AIRTABLE_BASE}/${SONGS_TABLE}` +
          `?filterByFormula=${encodeURIComponent(formula)}` +
          `&pageSize=100` +
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
