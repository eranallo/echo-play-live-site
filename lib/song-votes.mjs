import { createHmac, randomBytes } from 'node:crypto'
import { BlobPreconditionFailedError } from '@vercel/blob'
import { readJournal, writeJournal } from './uploads/journal.mjs'

export const MAX_SONG_VOTES = 3
const BAND = new Set(['elite','jambi','the-dick-beldings','so-long-goodnight'])
const SONG = /^[a-f0-9]{20}$/
const VISITOR = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
const MAX_VOTERS = 10000

export function voteBoard(data, catalog, voter = '') {
  const counts = new Map(catalog.map(song => [song.id,0]))
  for (const choices of Object.values(data?.ballots || {})) for (const id of choices) if(counts.has(id)) counts.set(id,counts.get(id)+1)
  const songs = catalog.map(({id,title,artist}) => ({id,title,artist,votes:counts.get(id) || 0}))
    .sort((a,b) => b.votes-a.votes || a.title.localeCompare(b.title) || a.artist.localeCompare(b.artist))
  return {songs,totalVotes:songs.reduce((sum,song)=>sum+song.votes,0),voted:(data?.ballots?.[voter] || []).filter(id=>counts.has(id)),maxVotes:MAX_SONG_VOTES}
}
function validLedger(data) {
  return data?.version === 1 && /^[a-f0-9]{64}$/.test(data.salt || '') && data.ballots && typeof data.ballots === 'object' && !Array.isArray(data.ballots)
    && Object.keys(data.ballots).length <= MAX_VOTERS && Object.entries(data.ballots).every(([key,ids]) => /^[A-Za-z0-9_-]{22}$/.test(key) && Array.isArray(ids) && ids.length<=MAX_SONG_VOTES && new Set(ids).size===ids.length && ids.every(id=>SONG.test(id)))
}
export async function handleSongVote({band,action='status',visitor,song}, {
  catalog=[],read=readJournal,write=writeJournal,production=process.env.VERCEL_ENV === 'production',
} = {}) {
  if (!BAND.has(band)) return {status:404,body:{error:'Band not found.'}}
  if (!['status','vote','remove'].includes(action) || typeof visitor !== 'string' || !VISITOR.test(visitor) || (action !== 'status' && (typeof song !== 'string' || !SONG.test(song)))) return {status:400,body:{error:'Please reload the page and try again.'}}
  if (!production || !catalog.length || catalog.some(s=>!SONG.test(s.id) || typeof s.title!=='string' || typeof s.artist!=='string')) return {status:503,body:{error:'Song voting is temporarily unavailable. Please try again shortly.'}}
  if (action !== 'status' && !catalog.some(s=>s.id===song)) return {status:400,body:{error:'Choose a song from this band’s list.'}}
  try {
    for (let attempt=0; attempt<8; attempt++) {
      const path=`song-votes/v1/${band}.json`
      const row = await read(path,{maxBytes:2000000})
      const data = row === null ? {version:1,salt:randomBytes(32).toString('hex'),ballots:{}} : row?.data
      if (!validLedger(data)) throw new Error('invalid_votes')
      const voter=createHmac('sha256',data.salt).update(visitor.toLowerCase()).digest('base64url').slice(0,22)
      const current=(data.ballots[voter] || []).filter(id=>catalog.some(s=>s.id===id))
      if (action === 'status' || (action === 'vote' && current.includes(song)) || (action === 'remove' && !current.includes(song))) return {status:200,body:voteBoard(data,catalog,voter)}
      if (action === 'vote' && current.length>=MAX_SONG_VOTES) return {status:409,body:{error:'You’ve picked three songs. Remove one to make room for another.',...voteBoard(data,catalog,voter)}}
      if (!Object.hasOwn(data.ballots,voter) && Object.keys(data.ballots).length>=MAX_VOTERS) throw new Error('vote_capacity')
      // An explicit desired action makes retries idempotent; never toggle on the server.
      const next={...data,ballots:{...data.ballots,[voter]:action==='vote' ? [...current,song] : current.filter(id=>id!==song)}}
      if (!next.ballots[voter].length) delete next.ballots[voter]
      try {
        await write(path,next,row?.etag)
        return {status:200,body:voteBoard(next,catalog,voter)}
      } catch(error) {
        if (!(error instanceof BlobPreconditionFailedError) && !/already exists/i.test(error.message)) throw error
      }
    }
  } catch { /* Return no storage details, visitor identifiers or source records. */ }
  return {status:503,body:{error:'We couldn’t save that change. Your last saved picks are safe. Please try again.'}}
}
