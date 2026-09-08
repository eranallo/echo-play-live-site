import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { BlobPreconditionFailedError } from '@vercel/blob'
import { handleSongVote } from '../../lib/song-votes.mjs'
const catalog=Array.from({length:5},(_,i)=>({id:String(i+1).padStart(20,'0'),title:`Song ${i+1}`,artist:'Artist'}))
function storage() {
  const rows=new Map();let writes=0
  return {rows,get writes(){return writes},
    read:async path=>structuredClone(rows.get(path) || null),
    write:async(path,data,etag)=>{
      const previous=rows.get(path)
      if ((previous?.etag)!==etag) throw new BlobPreconditionFailedError('conflict')
      rows.set(path,{data:structuredClone(data),etag:String(++writes)})
    },catalog,production:true,
  }
}
const ballot=(visitor,song=catalog[0].id,action='vote',band='elite')=>({visitor,song,action,band})
test('votes persist across visits, retries do not add votes, and separate bands remain separate',async()=>{
  const store=storage();const visitor=randomUUID()
  const first=await handleSongVote(ballot(visitor),store)
  assert.equal(first.body.totalVotes,1)
  assert.equal((await handleSongVote(ballot(visitor),store)).body.totalVotes,1)
  assert.equal(store.writes,1)
  assert.deepEqual((await handleSongVote(ballot(visitor,undefined,'status'),store)).body.voted,[catalog[0].id])
  assert.equal((await handleSongVote(ballot(visitor,undefined,'status','jambi'),store)).body.totalVotes,0)
  assert.equal((await handleSongVote(ballot(randomUUID(),undefined,'status'),store)).body.voted.length,0)
  assert.doesNotMatch(JSON.stringify(first.body),new RegExp(`${visitor}|salt|ballots|private`))
})
test('simultaneous votes do not overwrite one another',async()=>{
  const store=storage()
  const results=await Promise.all(Array.from({length:6},()=>handleSongVote(ballot(randomUUID()),store)))
  assert.ok(results.every(r=>r.status===200))
  const status=await handleSongVote(ballot(randomUUID(),undefined,'status'),store)
  assert.equal(status.body.totalVotes,6)
  assert.equal(status.body.songs[0].votes,6)
})
test('three active choices are enforced, and removing a vote is safe to retry',async()=>{
  const store=storage();const visitor=randomUUID()
  for(const song of catalog.slice(0,3)) assert.equal((await handleSongVote(ballot(visitor,song.id),store)).status,200)
  assert.equal((await handleSongVote(ballot(visitor,catalog[3].id),store)).status,409)
  const removed=await handleSongVote(ballot(visitor,catalog[1].id,'remove'),store)
  assert.equal(removed.body.totalVotes,2)
  assert.equal((await handleSongVote(ballot(visitor,catalog[1].id,'remove'),store)).body.totalVotes,2)
  assert.equal((await handleSongVote(ballot(visitor,catalog[3].id),store)).body.totalVotes,3)
})
test('unknown bands/songs, malformed visitors and preview requests never write',async()=>{
  const store=storage();const visitor=randomUUID()
  for(const input of [ballot(visitor,undefined,'vote','hidden-band'),ballot('bad'),ballot([visitor]),ballot(visitor,[catalog[0].id]),ballot(visitor,'not-in-catalog'),ballot(visitor,catalog[0].id,'toggle')]) assert.ok((await handleSongVote(input,store)).status>=400)
  assert.equal((await handleSongVote(ballot(visitor),{...store,production:false})).status,503)
  assert.equal((await handleSongVote(ballot(visitor),{...store,catalog:[]})).status,503)
  assert.equal(store.writes,0)
})
test('failed/corrupt storage is never reported as a saved vote or silently reset',async()=>{
  const store=storage(); const input=ballot(randomUUID())
  assert.equal((await handleSongVote(input,{...store,write:async()=>{throw new Error('secret-storage-detail')}})).status,503)
  const corrupt=await handleSongVote(input,{...store,read:async()=>({data:{version:1,salt:'bad',ballots:{}}})})
  assert.equal(corrupt.status,503);assert.doesNotMatch(JSON.stringify(corrupt.body),/secret|salt|ballots/)
  assert.equal((await handleSongVote(input,{...store,read:async()=>({data:null,etag:'1'})})).status,503)
  assert.equal(store.writes,0)
})
test('a removed catalog entry disappears publicly and makes room for a new pick',async()=>{
  const store=storage(); const visitor=randomUUID()
  for(const song of catalog.slice(0,3)) await handleSongVote(ballot(visitor,song.id),store)
  const result=await handleSongVote(ballot(visitor,catalog[3].id),{...store,catalog:catalog.slice(1)})
  assert.equal(result.status,200);assert.equal(result.body.voted.length,3)
  assert.ok(result.body.songs.every(song=>song.id!==catalog[0].id))
})
