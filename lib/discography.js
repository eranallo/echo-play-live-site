// Phase 20: Tribute band discography.
//
// For tribute bands (Elite, Jambi), the band page replaces the album-art
// catalog with a vertical discography view of the tributed artist. This
// module produces the data: pulls the full discography from Spotify and
// cross-references against the Airtable SONGS table to flag which tracks
// the band actually performs.

import { bands } from '@/lib/bands'
import { searchArtist, getArtistDiscography } from '@/lib/spotify'
import { getSongsForBand } from '@/lib/songs'

// Normalize a track title for comparison. Lowercase, trim, strip common
// parenthetical suffixes ("(Remastered)", "(Live)", "(2018 Remaster)"),
// strip leading/trailing punctuation. This is fuzzy on purpose so a
// "Schism (2001)" Airtable entry still matches Spotify's "Schism" track.
function normTitle(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s*[-–—]\s*(remastered|live|acoustic|edit|version|mix)[^()]*$/i, '')
    .replace(/\s*\([^)]*(remaster|live|edit|version|mono|stereo|deluxe|bonus|acoustic)[^)]*\)/gi, '')
    .replace(/[''""`]/g, "'")
    .replace(/[^a-z0-9' ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Public entry. Returns:
//   {
//     artist: { name, spotifyUrl, image },
//     albums: [{ id, name, year, coverUrl, tracks: [{ ..., isPerformed }] }],
//     performedCount, totalCount
//   }
// Returns null when the band isn't a tribute or Spotify is unreachable.
export async function getTributeDiscography(bandSlug) {
  const band = bands[bandSlug]
  if (!band || !band.tributeMode || !band.tributeArtistName) return null

  // 1. Resolve the artist + their discography from Spotify (cached aggressively).
  const artist = await searchArtist(band.tributeArtistName)
  if (!artist) return null
  const disco = await getArtistDiscography(artist.id)
  if (!disco?.albums) return null

  // 2. Pull our performed songs for this band from Airtable (cached 1h).
  //    We don't need the Spotify enrichment for this — just titles. But
  //    getSongsForBand already returns titles, so we reuse it.
  let performed = []
  try {
    performed = await getSongsForBand(bandSlug)
  } catch {
    performed = []
  }

  // 3. Build a normalized title set for quick lookup. Many performed songs
  //    will share a title with the artist's tracks (since these ARE that
  //    artist's songs). We compare with normalized strings.
  const performedTitles = new Map()
  for (const song of performed) {
    const key = normTitle(song.title)
    if (key) performedTitles.set(key, song)
  }

  // 4. Walk the discography and tag tracks.
  let performedCount = 0
  let totalCount = 0
  const albums = disco.albums.map(album => ({
    ...album,
    tracks: album.tracks.map(t => {
      totalCount += 1
      const match = performedTitles.get(normTitle(t.title))
      const isPerformed = Boolean(match)
      if (isPerformed) performedCount += 1
      return {
        ...t,
        isPerformed,
        // Pass through the Airtable song id when matched, so the request
        // form can avoid suggesting songs we already play (front-end could
        // also use this for analytics later).
        airtableSongId: match?.id || null,
      }
    }),
  }))

  return {
    artist: {
      name: artist.name,
      spotifyUrl: artist.spotifyUrl,
      image: artist.image,
    },
    albums,
    performedCount,
    totalCount,
  }
}
