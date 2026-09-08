import { createHash } from 'node:crypto'

export const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/
export function songIdentity({title,artist}) {
  const normalize = value => String(value || '').normalize('NFKC').toLowerCase()
    .replace(/\s*[-–—]\s*(?:\d{4}\s+)?remaster(?:ed)?\b.*$/i,'')
    .replace(/\([^)]*remaster[^)]*\)/gi,'').replace(/[^\p{L}\p{N}]/gu,'')
  return `${normalize(artist)}:${normalize(title)}`
}
export const requestedSongId = track => createHash('sha256').update(`requested-song:${songIdentity(track)}`).digest('hex').slice(0,20)
export function spotifySong(track) {
  if (!SPOTIFY_ID.test(track?.id || '') || typeof track.name!=='string' || !track.name.trim() || track.name.length>300 || !Array.isArray(track.artists)) return null
  const artist=track.artists.map(item=>item.name).filter(name=>typeof name==='string' && name.trim()).join(', ')
  if(!artist || artist.length>300) return null
  const images=track.album?.images || []
  const art=images.find(image=>image.width<=320) || images[0]
  return {spotifyId:track.id,title:track.name.trim(),artist,album:String(track.album?.name || '').slice(0,300),spotifyUrl:`https://open.spotify.com/track/${track.id}`,albumArt:/^https:\/\/i\.scdn\.co\/image\/[a-zA-Z0-9]+$/.test(art?.url || '') ? art.url : null}
}
export function validRequestedSong(track) {
  return track && SPOTIFY_ID.test(track.spotifyId || '') && typeof track.title==='string' && track.title.length>0 && track.title.length<=300 && typeof track.artist==='string' && track.artist.length>0 && track.artist.length<=300
    && track.spotifyUrl===`https://open.spotify.com/track/${track.spotifyId}` && (track.albumArt===null || /^https:\/\/i\.scdn\.co\/image\/[a-zA-Z0-9]+$/.test(track.albumArt))
}
// Existing catalog IDs remain stable. If the band adds a requested song later,
// both old and new votes follow it into the repertoire without double counting.
export function requestCatalog(data,catalog) {
  const songs=catalog.map(song=>({...song,kind:'catalog'}))
  const aliases=new Map(songs.map(song=>[song.id,song.id]))
  const identities=new Map(songs.map(song=>[songIdentity(song),song]))
  for(const request of data.requests || []) {
    const match=identities.get(songIdentity(request))
    if(match) { aliases.set(request.id,match.id); continue }
    const song={id:request.id,title:request.title,artist:request.artist,spotifyUrl:request.spotifyUrl,albumArt:request.albumArt,kind:'learn'}
    songs.push(song);identities.set(songIdentity(song),song);aliases.set(song.id,song.id)
  }
  return {songs,aliases}
}
