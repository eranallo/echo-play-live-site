import { unstable_cache } from 'next/cache'
import { getAppToken } from './spotify'
import { SPOTIFY_ID, spotifySong } from './song-request-catalog.mjs'

async function spotifyRequest(path) {
  const token=await getAppToken()
  if(!token) throw new Error('music_search_unavailable')
  const response=await fetch(`https://api.spotify.com/v1/${path}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store',signal:AbortSignal.timeout(7000),redirect:'error'})
  if(!response.ok) throw new Error('music_search_unavailable')
  return response.json()
}
export const getRequestTrack=unstable_cache(async id=>{
  if(!SPOTIFY_ID.test(id))return null
  return spotifySong(await spotifyRequest(`tracks/${id}?market=US`))
},['spotify-request-track-v1'],{revalidate:3600})
export async function searchRequestTracks(query) {
  const linked=query.match(/^https:\/\/open\.spotify\.com\/(?:intl-[a-z]+\/)?track\/([A-Za-z0-9]{22})(?:\?[^\s]*)?$/)
  if(linked) {const song=await getRequestTrack(linked[1]);return song?[song]:[]}
  const data=await spotifyRequest(`search?type=track&limit=8&market=US&q=${encodeURIComponent(query)}`)
  return (data.tracks?.items || []).map(spotifySong).filter(Boolean)
}
