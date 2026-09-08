import test from 'node:test'
import assert from 'node:assert/strict'
import { BlobPreconditionFailedError } from '@vercel/blob'
import { bookingQuota, reserveBookingSend } from '../../lib/booking-quota.mjs'
import { sendInquiry } from '../../lib/inquiry-service.mjs'
const now=Date.parse('2026-09-08T15:00:00Z')
test('email cap uses a rolling day and rejects invalid journal timestamps',()=>{
  assert.equal(bookingQuota(Array(50).fill(now),now).available,false)
  assert.equal(bookingQuota(Array(50).fill(now-86400000),now).available,true)
  assert.throws(()=>bookingQuota([now+120000],now))
})
test('simultaneous final email reservations cannot exceed the cap',async()=>{
  let row={data:{attempts:Array(48).fill(now-1000)},etag:'1'};let revision=1
  const options={now,read:async()=>structuredClone(row),write:async(path,data,etag)=>{
    assert.equal(path,'booking-email/v1-quota.json')
    if(etag!==row.etag) throw new BlobPreconditionFailedError('conflict')
    row={data,etag:String(++revision)}
  }}
  const outcomes=await Promise.allSettled(Array.from({length:5},()=>reserveBookingSend(options)))
  assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,2)
  assert.equal(row.data.attempts.length,50)
  assert.deepEqual(Object.keys(row.data),['attempts'])
})
test('a missing or failed email cap prevents any provider send',async()=>{
  const body={name:'Fixture',email:'fixture@example.com',message:'Test',requestId:'a03e22d1-43a0-4ac5-8cc8-2b405aa6d801'}
  let calls=0
  for(const reserve of [undefined,async()=>{throw new Error('cap')}]) {
    const result=await sendInquiry(body,{apiKey:'fixture',from:'Echo Play Live website <bookings@notify.echoplay.live>',reserve,fetchImpl:async()=>{calls++}})
    assert.equal(result.status,503)
  }
  assert.equal(calls,0)
})
test('an existing malformed quota journal cannot reset the sending cap',async()=>{
  let writes=0
  for(const data of [null,{}, {attempts:null}]) {
    await assert.rejects(reserveBookingSend({now,read:async()=>({data,etag:'1'}),write:async()=>{writes++}}),/quota_invalid/)
  }
  assert.equal(writes,0)
})
