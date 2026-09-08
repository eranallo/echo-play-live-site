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

const newTrack=(title='New song',spotifyId='A'.repeat(22))=>({spotifyId,title,artist:'New artist',spotifyUrl:`https://open.spotify.com/track/${spotifyId}`,albumArt:null})
const request=(visitor,spotifyId='A'.repeat(22))=>({band:'elite',action:'add',visitor,spotifyId,title:'Forged title',artist:'Forged artist'})
test('a new song enters the chart with one vote and other fans can vote for it',async()=>{
  const store=storage(),first=randomUUID(),second=randomUUID()
  const result=await handleSongVote(request(first),{...store,resolveTrack:async()=>newTrack()})
  assert.equal(result.status,200)
  const added=result.body.songs.find(s=>s.kind==='learn')
  assert.equal(added.title,'New song');assert.equal(added.votes,1)
  assert.equal((await handleSongVote(ballot(second,added.id),store)).body.songs.find(s=>s.id===added.id).votes,2)
  const status=await handleSongVote(ballot(first,undefined,'status'),store)
  assert.deepEqual(status.body.voted,[added.id])
  assert.doesNotMatch(JSON.stringify(status.body),/addedBy|createdAt|Forged|salt|ballots/)
  assert.equal((await handleSongVote({...request(first),band:'jambi'},{...store,resolveTrack:async()=>newTrack()})).body.totalVotes,1)
})
test('concurrent additions and alternate remasters share a single song without losing votes',async()=>{
  const store=storage()
  const results=await Promise.all(Array.from({length:5},()=>handleSongVote(request(randomUUID()),{...store,resolveTrack:async()=>newTrack()})))
  assert.ok(results.every(r=>r.status===200))
  const retry=await handleSongVote(request(randomUUID(),'B'.repeat(22)),{...store,resolveTrack:async()=>newTrack('New song - 2024 Remaster','B'.repeat(22))})
  assert.equal(retry.body.songs.filter(s=>s.kind==='learn').length,1)
  assert.equal(retry.body.totalVotes,6)
})
test('adding an existing repertoire song votes in its existing catalog entry',async()=>{
  const store=storage(),visitor=randomUUID()
  const result=await handleSongVote(request(visitor),{...store,resolveTrack:async()=>({...newTrack(),title:catalog[0].title,artist:catalog[0].artist})})
  assert.equal(result.status,200);assert.equal(result.body.requestedId,catalog[0].id)
  assert.equal(result.body.songs.length,catalog.length)
  assert.equal(result.body.songs.find(s=>s.id===catalog[0].id).kind,'catalog')
})
test('new-song requests share the three-pick limit and repeated adds are idempotent',async()=>{
  const store=storage(),visitor=randomUUID(),options={...store,resolveTrack:async()=>newTrack()}
  for(const song of catalog.slice(0,2))await handleSongVote(ballot(visitor,song.id),store)
  const first=await handleSongVote(request(visitor),options)
  assert.equal(first.status,200);assert.equal(first.body.totalVotes,3)
  assert.equal((await handleSongVote(request(visitor),options)).body.totalVotes,3)
  assert.equal((await handleSongVote(request(visitor,'C'.repeat(22)),{...store,resolveTrack:async()=>newTrack('Another','C'.repeat(22))})).status,409)
  assert.equal(store.rows.get('song-votes/v1/elite.json').data.requests.length,1)
})
test('provider failure or unsafe metadata cannot write a public request',async()=>{
  const store=storage()
  for(const candidate of [null,{...newTrack(),spotifyUrl:'https://unsafe.example'},{...newTrack(),albumArt:'https://unsafe.example/pixel'},newTrack('','A'.repeat(22)),newTrack('Wrong','B'.repeat(22))]) {
    assert.equal((await handleSongVote(request(randomUUID()),{...store,resolveTrack:async()=>candidate})).status,503)
  }
  assert.equal(store.writes,0)
})
test('a requested song later added to the repertoire keeps votes without double counting',async()=>{
  const store=storage(),visitor=randomUUID()
  const result=await handleSongVote(request(visitor),{...store,resolveTrack:async()=>newTrack()})
  const requestedId=result.body.requestedId
  await handleSongVote(ballot(visitor,catalog[0].id),store)
  const updatedCatalog=[{...catalog[0],title:'New song',artist:'New artist'},...catalog.slice(1)]
  const migrated=await handleSongVote(ballot(visitor,undefined,'status'),{...store,catalog:updatedCatalog})
  assert.equal(migrated.body.totalVotes,1)
  assert.deepEqual(migrated.body.voted,[catalog[0].id])
  assert.ok(migrated.body.songs.every(s=>s.kind==='catalog'))
  const remove=await handleSongVote(ballot(visitor,requestedId,'remove'),{...store,catalog:updatedCatalog})
  assert.equal(remove.body.totalVotes,0)
})
test('removing votes does not bypass the five-new-song daily addition cap',async()=>{
  const store=storage(),visitor=randomUUID()
  for(let i=0;i<5;i++) {
    const spotifyId=String(i).repeat(22)
    const result=await handleSongVote(request(visitor,spotifyId),{...store,resolveTrack:async()=>newTrack(`Request ${i}`,spotifyId)})
    assert.equal(result.status,200)
    await handleSongVote(ballot(visitor,result.body.requestedId,'remove'),store)
  }
  const sixth=await handleSongVote(request(visitor),{...store,resolveTrack:async()=>newTrack()})
  assert.equal(sixth.status,429)
  assert.equal(store.rows.get('song-votes/v1/elite.json').data.requests.length,5)
})
