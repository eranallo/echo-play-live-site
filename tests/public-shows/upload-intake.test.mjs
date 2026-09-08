import test from 'node:test'
import assert from 'node:assert/strict'
import { hasMediaSignature, validateSubmission } from '../../lib/uploads/files.mjs'
import { loadUploadShows, uploadShowId, driveFolderId, saveUploadReceipt } from '../../lib/uploads/source.mjs'
import { receivedOffset, nextChunkEnd, checkSelectedMedia } from '../../lib/uploads/transfer.mjs'
import { validSessionUrl, verifiedFile, filePosition, trashRejectedMedia } from '../../lib/uploads/google.mjs'
import { SHOW_FIELD_IDS as F, VENUE_FIELD_IDS as V } from '../../lib/public/shows-contract.mjs'
const rid='rec00000000000001', bid='rec00000000000002', vid='rec00000000000003'
const folder='sample_private_folder_001'
const file={name:'video.MOV',size:600_000_000,fingerprint:'a'.repeat(64)}
const body={show:uploadShowId(rid),files:[file],authority:true,repost:false}
test('intake separates required authority from optional repost and drops caller destinations',()=>{
  const clean=validateSubmission({...body,folderId:'attacker',destination:'attacker',email:''})
  assert.equal(clean.repost,false);assert.equal(clean.authority,true);assert.equal(clean.email,'');assert.equal(clean.destination,undefined);assert.equal(clean.folderId,undefined)
  assert.equal(clean.files[0].mimeType,'video/quicktime')
  assert.throws(()=>validateSubmission({...body,authority:false}))
})
test('intake rejects executable extensions, path traversal, malformed identity and unbounded metadata',()=>{
  for(const name of ['page.html','payload.constructor','../video.mov','video\\test.mp4','x\n.mp4','document.pdf','archive.zip','music.mp3','audio.m4a','vector.svg','script.js','app.exe','video.mp4.exe']) assert.throws(()=>validateSubmission({...body,files:[{...file,name}]}))
  assert.throws(()=>validateSubmission({...body,show:rid}))
  assert.throws(()=>validateSubmission({...body,name:'n'.repeat(81)}))
  assert.throws(()=>validateSubmission({...body,email:'wrong'}))
})
test('local preflight rejects renamed documents before any transfer',async()=>{
  await assert.rejects(checkSelectedMedia(new File(['<html>not a photo</html>'],'photo.jpg',{type:'image/jpeg'})),/original photos or videos/)
  await assert.rejects(checkSelectedMedia(new File(['%PDF'],'file.pdf',{type:'image/png'})),/original photos or videos/)
  await checkSelectedMedia(new File([Uint8Array.from([137,80,78,71,13,10,26,10])],'photo.png'))
})
test('media container checks reject audio-only ISO brands and arbitrary EBML documents',()=>{
  const encode=value=>new TextEncoder().encode(value)
  assert.equal(hasMediaSignature(encode('\0\0\0\x18ftypM4A \0\0\0\0isommp42'),'video/mp4'),false)
  assert.equal(hasMediaSignature(encode('\0\0\0\x18ftypavif\0\0\0\0isomavif'),'video/mp4'),false)
  assert.equal(hasMediaSignature(Uint8Array.from([0x1a,0x45,0xdf,0xa3]),'video/webm'),false)
  assert.equal(hasMediaSignature(encode('\0\0\0\x18ftypisom\0\0\0\0isommp42'),'video/mp4'),true)
})
test('rejected-file cleanup can trash only the matching upload and is recoverable on retry',async()=>{
  const session={id:'submission',folderId:'destination'},f={...file,id:'file-id',mimeType:'video/quicktime'}
  const metadata={...f,parents:['destination'],appProperties:{eplSubmission:'submission',fingerprint:f.fingerprint}}
  let writes=0
  const request=async(path,options)=>{writes++;assert.deepEqual(JSON.parse(options.body),{trashed:true});return Response.json({trashed:true})}
  await trashRejectedMedia(f,session,{metadata:async()=>metadata,request})
  await trashRejectedMedia(f,session,{metadata:async()=>({...metadata,trashed:true}),request})
  assert.equal(writes,1)
  await assert.rejects(trashRejectedMedia(f,session,{metadata:async()=>({...metadata,parents:['unrelated-folder']}),request}),/delivery_mismatch/)
  assert.equal(writes,1)
})
test('media signatures reject renamed HTML and distinguish image and video containers',()=>{
  const png=Uint8Array.from([137,80,78,71,13,10,26,10])
  assert.equal(hasMediaSignature(png,'image/png'),true)
  assert.equal(hasMediaSignature(png,'video/mp4'),false)
  assert.equal(hasMediaSignature(new TextEncoder().encode('<!DOCTYPE html>'),'image/jpeg'),false)
  const movie=new TextEncoder().encode('\0\0\0\x18ftypqt  \0\0\0\0qt  ')
  assert.equal(hasMediaSignature(movie,'video/quicktime'),true)
  assert.equal(hasMediaSignature(movie,'image/heic'),false)
})
test('resumable offsets trust acknowledged bytes and reject invalid or oversize ranges',()=>{
  assert.equal(receivedOffset(308,'bytes=0-262143',10e9),262144)
  assert.equal(receivedOffset(308,null,10e9),0)
  assert.equal(receivedOffset(201,null,10e9),10e9)
  assert.throws(()=>receivedOffset(308,'bytes=0-100',100))
  assert.throws(()=>receivedOffset(308,'bytes=42-999',1000))
  assert.throws(()=>receivedOffset(404,null,100),/session_gone/)
  assert.equal(nextChunkEnd(9_999_999_900,10e9),10e9)
  assert.equal(nextChunkEnd(0,10e9) % 262144,0)
})
test('Drive session URLs cannot redirect the browser or server to arbitrary destinations',()=>{
  assert.equal(validSessionUrl('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=fixture'),true)
  for(const value of ['https://evil.example/upload/drive/v3/files?uploadType=resumable&upload_id=x','https://www.googleapis.com/drive/v3/files?uploadType=resumable&upload_id=x','http://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=x'])assert.equal(validSessionUrl(value),false)
})
test('server recovery reads incomplete progress without following a 308 response',async()=>{
  const uploadUrl='https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=fixture'
  const f={size:600_000_000,uploadUrl}
  for(const [status,range,expected] of [[308,null,{offset:0}],[308,'bytes=0-8388607',{offset:8388608}],[200,null,{offset:f.size}],[404,null,{expired:true}]]){
    const result=await filePosition({},f,async(url,options)=>{
      assert.equal(url,uploadUrl);assert.equal(options.redirect,'manual');assert.equal(options.headers['Content-Range'],`bytes */${f.size}`)
      return new Response('',{status,headers:range?{Range:range}:{}})
    })
    assert.deepEqual(result,expected)
  }
  await assert.rejects(filePosition({},f,async()=>new Response('',{status:308,headers:{Range:'bytes=0-999999999'}})),/invalid_upload_position/)
})
test('completion requires the exact file size, submission, fingerprint and destination',()=>{
  const session={id:'submission',folderId:'destination'}, f={...file,id:'file-id',mimeType:'video/quicktime'}
  const metadata={...f,size:String(file.size),parents:['destination'],appProperties:{eplSubmission:'submission',fingerprint:file.fingerprint}}
  assert.equal(verifiedFile(metadata,f,session),true)
  for(const invalid of [{size:'499999999'},{parents:['wrong']},{trashed:true},{appProperties:{eplSubmission:'other'}},{mimeType:'text/html'}])assert.equal(verifiedFile({...metadata,...invalid},f,session),false)
})
test('upload source filters hidden/future/canceled shows again after Airtable and exposes a safe projection',async()=>{
  const fields={[F.publish]:true,[F.date]:'2026-09-07',[F.bands]:[bid],[F.venue]:[vid],[F.status]:'Completed',fldnqQyo5loU2yac1:`https://drive.google.com/drive/folders/${folder}`}
  const cases=[fields,{...fields,[F.publish]:false},{...fields,[F.date]:'2026-09-08'},{...fields,[F.status]:'Cancelled'},{...fields,[F.date]:'2026-02-30'}]
  const requests=[]
  const result=await loadUploadShows({now:new Date('2026-09-08T04:59:00Z'),approvedBands:[{slug:'fixture-band',name:'Fixture Band',airtableId:bid}],request:async path=>{
    requests.push(path)
    if(path.startsWith('tblSF'))return {records:cases.map((f,i)=>({id:`rec0000000000000${i+1}`,fields:f}))}
    return {records:[{id:vid,fields:{[V.name]:'Fixture Venue'}}]}
  }})
  assert.equal(result.length,1)
  assert.equal(result[0].showFolder,folder)
  const published=JSON.stringify(result.map(r=>r.public))
  for(const privateValue of [rid,bid,vid,folder,'2026-09-08','Cancelled'])assert.ok(!published.includes(privateValue))
  assert.match(new URLSearchParams(requests[0].split('?')[1]).get('filterByFormula'),/Publish to Website.*TRUE/)
  assert.match(new URLSearchParams(requests[0].split('?')[1]).get('filterByFormula'),/Date.*2026-09-07/)
})
test('upload source never returns partial results when pagination fails',async()=>{
  await assert.rejects(loadUploadShows({request:async()=>({records:[],offset:'repeat'})}),/source_invalid/)
  assert.equal(driveFolderId('https://evil.example/drive/folders/private'),null)
  assert.equal(driveFolderId('javascript:alert(1)'),null)
})
const receipt={id:'abc',folderId:folder,recordId:rid,bandIds:[bid],files:[file],name:'Test',email:'',credit:'',repost:false,total:file.size,consentVersion:'2026-09-07'}
test('retrying a completed receipt preserves the existing review record without writing again',async()=>{
  let calls=0
  const id=await saveUploadReceipt(receipt,async(path,options)=>{calls++;assert.equal(options,undefined);return {records:[{id:rid}]}})
  assert.equal(id,rid);assert.equal(calls,1)
})
test('new receipt uses an atomic unique folder upsert and never reports success for an unconfirmed write',async()=>{
  let upsert
  await assert.rejects(saveUploadReceipt(receipt,async(path,options)=>{if(!options)return {records:[]};upsert=JSON.parse(options.body);return {records:[]}}),/receipt_unconfirmed/)
  assert.deepEqual(upsert.performUpsert.fieldsToMergeOn,['fldmhZqmqlnORGHCx'])
  assert.equal(upsert.records[0].fields.fldWNOwRTucu88ov5,false)
  assert.equal(upsert.records[0].fields.flddxdkTnPpIIjCDv,1)
})
