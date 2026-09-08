import test from 'node:test'
import assert from 'node:assert/strict'
import { BlobPreconditionFailedError } from '@vercel/blob'
import { uploadEmailMessage,queueUploadEmail,notifyUpload,reserveUploadEmail,retryUploadEmails } from '../../lib/uploads/notifications.mjs'

const id='a'.repeat(64), now=Date.parse('2026-09-08T17:00:00Z')
const session={id,status:'complete',notificationVersion:1,folderId:'private_fixture_folder',show:{date:'2026-09-07',venue:'Fixture Venue',bands:[{name:'Elite'}]},files:[{name:'a.jpg',mimeType:'image/jpeg',uploadUrl:'PRIVATE_UPLOAD_URL',fingerprint:'PRIVATE_FINGERPRINT'},{name:'b.mp4',mimeType:'video/mp4'}],name:'<script>test</script>',email:'fan@example.com',credit:'Fan & Friend',repost:false,sourceFolder:'PRIVATE_PARENT',recordId:'PRIVATE_RECORD'}
function harness() {
  const rows=new Map([[`sessions/${id}.json`,{data:structuredClone(session),etag:'0'}]])
  let revision=0,sends=0,reservations=0
  const options={
    read:async path=>structuredClone(rows.get(path) || null),
    write:async(path,data,etag)=>{
      if(rows.get(path)?.etag!==etag)throw new BlobPreconditionFailedError('conflict')
      const row={data:structuredClone(data),etag:String(++revision)};rows.set(path,row);return structuredClone(row)
    },
    remove:async path=>{rows.delete(path)},
    reserve:async()=>{reservations++},apiKey:'test-not-a-secret',from:'Echo Play Live website <bookings@notify.echoplay.live>',environment:'production',now:()=>now,wait:async()=>{},log:()=>{},
    fetchImpl:async(url,options)=>{
      sends++
      assert.equal(url,'https://api.resend.com/emails')
      assert.equal(options.headers['Idempotency-Key'],`fan-upload/v1/${id}`)
      assert.deepEqual(JSON.parse(options.body).to,['eranallo@echoplay.live'])
      return Response.json({id:'c790dfaa-8530-4ec2-950c-eedff3fcb543'})
    },
  }
  return {rows,options,get sends(){return sends},get reservations(){return reservations}}
}
test('upload email contains the private submission link, counts and consent without upload credentials',()=>{
  const message=uploadEmailMessage(session)
  assert.match(message.text,/1 photo and 1 video/)
  assert.match(message.text,/Not granted/)
  assert.match(message.html,/&lt;script&gt;test&lt;\/script&gt;/)
  assert.ok(!message.html.includes('<script>'))
  assert.match(message.text,/https:\/\/drive.google.com\/drive\/folders\/private_fixture_folder/)
  for(const secret of ['PRIVATE_UPLOAD_URL','PRIVATE_FINGERPRINT','PRIVATE_PARENT','PRIVATE_RECORD'])assert.ok(!JSON.stringify(message).includes(secret))
  assert.throws(()=>uploadEmailMessage({...session,folderId:'x" onclick="evil'}))
})
test('outbox never sends for unfinished, rejected, legacy or preview submissions',async()=>{
  for(const change of [{status:'uploading'},{status:'rejected'},{notificationVersion:undefined}]) {
    const h=harness();h.rows.get(`sessions/${id}.json`).data={...session,...change}
    await queueUploadEmail(session,h.options)
    assert.equal(await notifyUpload(id,h.options),'incomplete');assert.equal(h.sends,0)
  }
  const h=harness();await queueUploadEmail(session,h.options)
  assert.equal(await notifyUpload(id,{...h.options,environment:'preview'}),'disabled');assert.equal(h.sends,0)
})
test('concurrent completions and later resumes produce one accepted notification',async()=>{
  const h=harness()
  await Promise.all([queueUploadEmail(session,h.options),queueUploadEmail(session,h.options)])
  await Promise.all(Array.from({length:5},()=>notifyUpload(id,h.options)))
  assert.equal(h.sends,1)
  assert.equal(await notifyUpload(id,{...h.options,now:()=>now+3*86400000}),'accepted')
  assert.equal(h.sends,1)
  assert.ok(!h.rows.has(`upload-email/pending/${id}.json`))
})
test('uncertain provider responses reuse the identical payload and key',async()=>{
  const h=harness();await queueUploadEmail(session,h.options)
  const bodies=[]
  const result=await notifyUpload(id,{...h.options,fetchImpl:async(url,options)=>{
    bodies.push(options.body)
    if(bodies.length===1)throw new Error('response lost')
    return h.options.fetchImpl(url,options)
  }})
  assert.equal(result,'accepted');assert.equal(bodies.length,2);assert.equal(bodies[0],bodies[1])
})
test('uncertain sends stop before provider deduplication expires',async()=>{
  const h=harness();await queueUploadEmail(session,h.options)
  assert.equal(await notifyUpload(id,{...h.options,fetchImpl:async()=>{throw new Error('network')}}),'pending')
  assert.equal(await notifyUpload(id,{...h.options,now:()=>now+23*3600000}),'review')
  assert.equal(h.sends,0)
  assert.equal(h.rows.get(`upload-email/receipts/${id}.json`).data.status,'review')
})
test('definite rejections and quota deferrals remain recoverable after a day',async()=>{
  const h=harness();await queueUploadEmail(session,h.options)
  assert.equal(await notifyUpload(id,{...h.options,reserve:async()=>{throw new Error('cap')}}),'pending')
  assert.equal(h.sends,0)
  assert.equal(await notifyUpload(id,{...h.options,fetchImpl:async()=>new Response('',{status:429})}),'pending')
  assert.equal(await notifyUpload(id,{...h.options,now:()=>now+2*86400000}),'accepted')
})
test('lost accepted journal writes recover with the original provider key',async()=>{
  const h=harness();await queueUploadEmail(session,h.options)
  let fail=true
  const write=async(path,data,etag)=>{
    if(data.status==='accepted' && fail){fail=false;throw new Error('write interrupted')}
    return h.options.write(path,data,etag)
  }
  assert.equal(await notifyUpload(id,{...h.options,write}),'accepted')
  assert.equal(h.sends,2) // Same key: Resend returns the original email receipt.
})
test('rolling notification cap stays atomic at 40 attempts and rejects malformed journals',async()=>{
  const h=harness();h.rows.set('upload-email/quota.json',{data:{attempts:Array(39).fill(now-1000)},etag:'existing'})
  const result=await Promise.allSettled(Array.from({length:5},()=>reserveUploadEmail({...h.options,now})))
  assert.equal(result.filter(r=>r.status==='fulfilled').length,1)
  assert.equal(h.rows.get('upload-email/quota.json').data.attempts.length,40)
  await assert.rejects(reserveUploadEmail({...h.options,read:async()=>({data:{},etag:'bad'}),now}),/email_quota_invalid/)
})
test('retry worker accepts only queue paths and reports counts without private details',async()=>{
  const called=[]
  assert.deepEqual(await retryUploadEmails({list:async()=>[`upload-email/pending/${id}.json`,'sessions/private.json'],notify:async value=>{called.push(value);return 'accepted'},now:()=>now}),{checked:1,accepted:1,pending:0,review:0})
  assert.deepEqual(called,[id])
})
