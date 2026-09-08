import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { sendInquiry, validateInquiry, bookingMessage } from '../../lib/inquiry-service.mjs'
const bands = [{name:'Test Band',airtableId:'rec00000000000001',bookingEmail:'band@example.com'}]
const valid = {name:'Fixture Booker',email:'booker@example.com',band:'Test Band',eventType:'Festival',date:'2027-05-08',venue:'Fixture venue',message:'Fixture only',requestId:'a03e22d1-43a0-4ac5-8cc8-2b405aa6d801'}
const configured = {bands,reserve:async()=>{},apiKey:'fixture-key',from:'Echo Play Live website <bookings@notify.echoplay.live>'}
const success = () => ({ok:true,json:async()=>({id:'49a3999c-0ce1-4ea6-ab68-afcd6dc2e794'})})

test('invalid fields, header injection, unknown bands and invalid retry IDs are rejected',()=>{
  for (const body of [null,[],{...valid,email:'not-email'},{...valid,email:'one@example.com,two@example.com'},{...valid,name:'Name\r\nBcc: victim@example.com'},{...valid,message:' '},{...valid,band:'Invented'},{...valid,eventType:'Invented'},{...valid,date:'2027-02-30'},{...valid,message:'x'.repeat(2001)},{...valid,requestId:'not-a-uuid'},{...valid,website:'spam'}]) assert.ok(validateInquiry(body,bands).error)
  for (const attendance of ['0','-2','1.5','1000001','250 guests']) assert.ok(validateInquiry({...valid,attendance},bands).error)
})

test('missing or invalid sender configuration makes no network request',async()=>{
  let calls=0
  const fetchImpl=async()=>{calls++;throw new Error('unexpected')}
  for (const options of [{bands},{...configured,apiKey:undefined},{...configured,from:'person@example.com'}]) assert.equal((await sendInquiry(valid,{...options,fetchImpl})).status,503)
  assert.equal((await sendInquiry({...valid,website:'spam'},{...configured,fetchImpl})).status,400)
  assert.equal(calls,0)
})

test('every inquiry goes only to Evan with the visitor as reply-to and no Airtable request',async()=>{
  let sent
  const result=await sendInquiry({...valid,to:'attacker@example.com',bookingEmail:'attacker@example.com'},{...configured,fetchImpl:async(url,options)=>{
    assert.equal(url,'https://api.resend.com/emails')
    assert.equal(options.redirect,'error')
    assert.ok(options.signal)
    assert.ok(options.headers['Idempotency-Key'])
    sent=JSON.parse(options.body)
    return success()
  }})
  assert.equal(result.status,200)
  assert.equal(result.body.status,'accepted')
  assert.deepEqual(sent.to,['eranallo@echoplay.live'])
  assert.equal(sent.reply_to,valid.email)
  assert.equal(sent.cc,undefined)
  assert.equal(sent.bcc,undefined)
  assert.equal(result.body.bookingEmail,'eranallo@echoplay.live')
  assert.match(result.body.reference,/^EPL-[A-F0-9]{12}$/)
  assert.ok(!JSON.stringify(sent).includes('rec00000000000001'))
  assert.ok(!JSON.stringify(result).includes('booker@example.com'))
  const route=await readFile(new URL('../../app/api/inquiry/route.js',import.meta.url),'utf8')
  assert.doesNotMatch(route,/airtable|TABLES|saveInquiry/)
  assert.match(route,/VERCEL_ENV === 'production'/)
})

test('all event details survive in text and escaped HTML',async()=>{
  let sent
  const body={...valid,name:'A & B',message:'<img src=x onerror=alert(1)>\nA second line',attendance:'250',budget:'$2,000–$3,000',production:'House sound available.',inquirySource:'qr-landing:jambi'}
  await sendInquiry(body,{...configured,fetchImpl:async(_,request)=>{sent=JSON.parse(request.body);return success()}})
  for (const value of [body.message,body.budget,body.production,'250','qr-landing:jambi',body.venue,body.date,body.email]) assert.ok(sent.text.includes(value))
  assert.ok(sent.html.includes('&lt;img'))
  assert.ok(sent.html.includes('A &amp; B'))
  assert.ok(!sent.html.includes('<img src=x'))
})

test('a lost response can be retried with identical content and provider idempotency key',async()=>{
  const requests=[]
  const fetchImpl=async(_,request)=>{requests.push(request);if(requests.length===1)throw new Error('connection lost');return success()}
  assert.equal((await sendInquiry(valid,{...configured,fetchImpl})).status,502)
  assert.equal((await sendInquiry(valid,{...configured,fetchImpl})).status,200)
  assert.equal(requests[0].body,requests[1].body)
  assert.equal(requests[0].headers['Idempotency-Key'],requests[1].headers['Idempotency-Key'])
  const first=validateInquiry(valid,bands)
  const changed=validateInquiry({...valid,message:'Changed date details'},bands)
  assert.notEqual(bookingMessage(first.data,first.requestId).idempotencyKey,bookingMessage(changed.data,changed.requestId).idempotencyKey)
})

test('provider rejection, malformed receipt and network failure never report success or leak data',async()=>{
  for (const fetchImpl of [async()=>({ok:false}),async()=>({ok:true,json:async()=>({})}),async()=>({ok:true,json:async()=>({id:'not-a-receipt'})}),async()=>{throw new Error('secret upstream body')}]) {
    const events=[]
    const result=await sendInquiry(valid,{...configured,fetchImpl,log:event=>events.push(event)})
    assert.equal(result.status,502)
    assert.equal(result.body.success,undefined)
    assert.deepEqual(events,[{event:'unconfirmed'}])
    assert.ok(!JSON.stringify(result).includes('secret upstream'))
  }
})
