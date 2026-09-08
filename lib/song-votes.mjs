import { createHmac, randomBytes } from 'node:crypto'
import { BlobPreconditionFailedError } from '@vercel/blob'
import { readJournal, writeJournal } from './uploads/journal.mjs'
import { SPOTIFY_ID, songIdentity, requestedSongId, validRequestedSong, requestCatalog } from './song-request-catalog.mjs'

export const MAX_SONG_VOTES = 3
const BAND = new Set(['elite','jambi','the-dick-beldings','so-long-goodnight'])
const SONG = /^[a-f0-9]{20}$/
const VISITOR = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
const VOTER = /^[A-Za-z0-9_-]{22}$/
const MAX_VOTERS = 10000
const choicesFor=(data,voter,aliases)=>[...new Set((data.ballots[voter] || []).map(id=>aliases.get(id)).filter(Boolean))]

export function voteBoard(data, catalog, voter = '') {
  const {songs,aliases}=requestCatalog(data || {},catalog)
  const counts=new Map(songs.map(song=>[song.id,0]))
  for(const key of Object.keys(data?.ballots || {})) for(const id of choicesFor(data,key,aliases)) counts.set(id,counts.get(id)+1)
  const ranked=songs.map(({id,title,artist,kind,spotifyUrl,albumArt})=>({id,title,artist,kind,...(spotifyUrl?{spotifyUrl,albumArt}:{}),votes:counts.get(id) || 0}))
    .sort((a,b)=>b.votes-a.votes || a.title.localeCompare(b.title) || a.artist.localeCompare(b.artist))
  return {songs:ranked,totalVotes:ranked.reduce((sum,song)=>sum+song.votes,0),voted:data?choicesFor(data,voter,aliases):[],maxVotes:MAX_SONG_VOTES}
}
function validLedger(data) {
  return data?.version===1 && /^[a-f0-9]{64}$/.test(data.salt || '') && data.ballots && typeof data.ballots==='object' && !Array.isArray(data.ballots)
    && Object.keys(data.ballots).length<=MAX_VOTERS && Object.entries(data.ballots).every(([key,ids])=>VOTER.test(key) && Array.isArray(ids) && ids.length<=MAX_SONG_VOTES && new Set(ids).size===ids.length && ids.every(id=>typeof id==='string' && SONG.test(id)))
    && (data.requests===undefined || (Array.isArray(data.requests) && data.requests.length<=500 && new Set(data.requests.map(r=>r.id)).size===data.requests.length && data.requests.every(r=>validRequestedSong(r) && r.id===requestedSongId(r) && VOTER.test(r.addedBy) && Number.isSafeInteger(r.createdAt) && r.createdAt>0)))
}
export async function handleSongVote({band,action='status',visitor,song,spotifyId}, {
  catalog=[],read=readJournal,write=writeJournal,resolveTrack,now=Date.now(),production=process.env.VERCEL_ENV==='production',
} = {}) {
  if(!BAND.has(band)) return {status:404,body:{error:'Band not found.'}}
  if(!['status','vote','remove','add'].includes(action) || typeof visitor!=='string' || !VISITOR.test(visitor)
    || (['vote','remove'].includes(action) && (typeof song!=='string' || !SONG.test(song)))
    || (action==='add' && (typeof spotifyId!=='string' || !SPOTIFY_ID.test(spotifyId)))) return {status:400,body:{error:'Please reload the page and try again.'}}
  if(!production || !catalog.length || catalog.some(s=>!SONG.test(s.id) || typeof s.title!=='string' || typeof s.artist!=='string')) return {status:503,body:{error:'Song voting is temporarily unavailable. Please try again shortly.'}}
  try {
    // Only provider-verified song metadata can enter the public chart. Never trust
    // a posted title, URL, artwork, requester name, or email as a public entry.
    const candidate=action==='add' ? await resolveTrack?.(spotifyId) : null
    if(action==='add' && (!validRequestedSong(candidate) || candidate.spotifyId!==spotifyId)) return {status:503,body:{error:'We couldn’t look up that song. Please search again, or send a suggestion below.'}}
    for(let attempt=0;attempt<8;attempt++) {
      const path=`song-votes/v1/${band}.json`
      const row=await read(path,{maxBytes:2000000})
      const data=row===null ? {version:1,salt:randomBytes(32).toString('hex'),ballots:{}} : row?.data
      if(!validLedger(data)) throw new Error('invalid_votes')
      const voter=createHmac('sha256',data.salt).update(visitor.toLowerCase()).digest('base64url').slice(0,22)
      const {songs,aliases}=requestCatalog(data,catalog)
      const current=choicesFor(data,voter,aliases)
      const match=candidate && songs.find(s=>songIdentity(s)===songIdentity(candidate))
      const target=action==='add' ? (match?.id || requestedSongId(candidate)) : (aliases.get(song) || song)
      if(['vote','remove'].includes(action) && !songs.some(s=>s.id===target)) return {status:400,body:{error:'Choose a song from this band’s request list.'}}
      const adding=['vote','add'].includes(action)
      if(action==='status' || (adding && current.includes(target)) || (action==='remove' && !current.includes(target))) return {status:200,body:{...voteBoard(data,catalog,voter),...(action==='add'?{requestedId:target}:{})}}
      if(adding && current.length>=MAX_SONG_VOTES) return {status:409,body:{error:'You’ve picked three songs. Remove one to make room for another.',...voteBoard(data,catalog,voter)}}
      if(!Object.hasOwn(data.ballots,voter) && Object.keys(data.ballots).length>=MAX_VOTERS) throw new Error('vote_capacity')
      const requests=data.requests || []
      const isNew=action==='add' && !match
      if(isNew && (requests.length>=500 || requests.filter(r=>r.addedBy===voter && r.createdAt>now-86400000).length>=5)) return {status:429,body:{error:'Please vote for existing requests for now. You can add more songs later.'}}
      const next={...data,ballots:{...data.ballots,[voter]:adding ? [...current,target] : current.filter(id=>id!==target)}}
      if(isNew) next.requests=[...requests,{id:target,...candidate,addedBy:voter,createdAt:now}]
      if(!next.ballots[voter].length) delete next.ballots[voter]
      try {
        await write(path,next,row?.etag)
        return {status:200,body:{...voteBoard(next,catalog,voter),...(action==='add'?{requestedId:target}: {})}}
      } catch(error) {
        if(!(error instanceof BlobPreconditionFailedError) && !/already exists/i.test(error.message)) throw error
      }
    }
  } catch { /* Keep private storage and provider details out of public responses. */ }
  return {status:503,body:{error:'We couldn’t save that change. Your last saved picks are safe. Please try again.'}}
}
