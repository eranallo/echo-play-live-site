const keyPart = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
export function cleanSongCatalog(songs) {
  const unique = new Map()
  for (const original of songs) {
    let song = original
    // Source audit: two Bush/Machine Head entries have reversed fields.
    // Preserve source records and setlist links; normalize only the public view.
    if (keyPart(song.title) === 'bush' && keyPart(song.artist) === 'machinehead') song = { ...song, title: 'Machinehead', artist: 'Bush', year: '1994', album: null }
    if (keyPart(song.artist) === 'bush' && keyPart(song.title) === 'machinehead') song = { ...song, title: 'Machinehead', artist: 'Bush' }
    const key = `${keyPart(song.artist)}:${keyPart(song.title)}`
    const existing = unique.get(key)
    if (!existing || (song.popularityRank || 0) > (existing.popularityRank || 0)) unique.set(key, song)
  }
  return [...unique.values()]
}
