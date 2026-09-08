import { BlobPreconditionFailedError } from '@vercel/blob'
import { BOOKING_EMAIL } from '../public/booking.mjs'
import { readJournal, writeJournal, sessionPath, listUploadEmailQueue, removeUploadEmailQueue } from './journal.mjs'

const DAY=86400000
export const UPLOAD_EMAIL_DAILY_CAP=40 // Together with booking's 50, below 100/day.
const receiptPath=id=>`upload-email/receipts/${id}.json`
const queuePath=id=>`upload-email/pending/${id}.json`
const conflict=error=>error instanceof BlobPreconditionFailedError || /already exists/i.test(error?.message || '')
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const validFrom=value=>/^Echo Play Live website <bookings@notify\.echoplay\.live>$/.test(value || '')

export function uploadEmailMessage(session) {
  if(!/^[a-f0-9]{64}$/.test(session.id) || !/^[-\w]{10,100}$/.test(session.folderId))throw new Error('invalid_notification')
  const reference=session.id.slice(0,12).toUpperCase()
  const bands=session.show.bands.map(b=>b.name).join(' + ')
  const photos=session.files.filter(f=>f.mimeType.startsWith('image/')).length
  const videos=session.files.filter(f=>f.mimeType.startsWith('video/')).length
  if(photos+videos!==session.files.length || !session.files.length)throw new Error('invalid_notification')
  const count=[photos && `${photos} photo${photos===1?'':'s'}`,videos && `${videos} video${videos===1?'':'s'}`].filter(Boolean).join(' and ')
  const folder=`https://drive.google.com/drive/folders/${session.folderId}`
  const rows=[['Band',bands],['Show',`${session.show.date} · ${session.show.venue}`],['Received',count],['From',session.name || 'A fan'],['Email',session.email || 'Not provided'],['Credit',session.credit || 'Not provided'],['Repost permission',session.repost ? 'Yes — website and social pages' : 'Not granted — ask before reposting'],['Reference',reference]]
  const text=`New fan photos & videos\n\n${rows.map(([k,v])=>`${k}: ${v}`).join('\n')}\n\nThe files have arrived in the show’s private Google Drive folder.\nOpen the submission: ${folder}\n\nReview the files and permission before sharing.\n`
  const html=`<div style="font-family:Arial,sans-serif;color:#171717;max-width:640px;margin:auto;padding:28px"><img src="https://echoplay.live/press/epl-logo-black-1024.png" alt="Echo Play Live" width="88" height="88"><h1 style="font-size:26px">New fan photos &amp; videos</h1><p>${escape(count)} just arrived in the show’s private Google Drive folder.</p><table role="presentation" style="width:100%;border-collapse:collapse">${rows.map(([k,v])=>`<tr><td style="padding:10px 12px 10px 0;border-bottom:1px solid #e6e6e6;vertical-align:top;width:35%"><strong>${escape(k)}</strong></td><td style="padding:10px 0;border-bottom:1px solid #e6e6e6">${escape(v)}</td></tr>`).join('')}</table><p style="margin:28px 0"><a href="${folder}" style="display:inline-block;background:#171717;color:#fff;padding:14px 22px;border-radius:24px;text-decoration:none">View photos &amp; videos</a></p><p style="font-size:13px;color:#666">Review the files and permission before sharing.</p></div>`
  return {to:[BOOKING_EMAIL],subject:`New fan media · ${bands} · ${session.show.date} · ${reference}`.replace(/[\r\n]/g,' '),text,html,tags:[{name:'source',value:'website-fan-upload'}]}
}

export async function reserveUploadEmail({read=readJournal,write=writeJournal,now=Date.now()}={}) {
  for(let attempt=0;attempt<6;attempt++) {
    const row=await read('upload-email/quota.json')
    const entries=row===null ? [] : row?.data?.attempts
    if(!Array.isArray(entries) || entries.some(at=>!Number.isSafeInteger(at) || at<0 || at>now+60000))throw new Error('email_quota_invalid')
    const active=entries.filter(at=>at>now-DAY)
    if(active.length>=UPLOAD_EMAIL_DAILY_CAP)throw new Error('upload_email_cap')
    try {await write('upload-email/quota.json',{attempts:[...active,now]},row?.etag);return} catch(error) {if(!conflict(error))throw error}
  }
  throw new Error('email_quota_busy')
}

// Persist the outbox BEFORE marking the upload complete. The worker always
// checks the completed session before sending, including after an interrupted write.
export async function queueUploadEmail(session,{read=readJournal,write=writeJournal}={}) {
  if(!await read(receiptPath(session.id))) {
    try {await write(receiptPath(session.id),{id:session.id,status:'pending',message:uploadEmailMessage(session),attempts:0})}
    catch(error) {if(!conflict(error))throw error}
  }
  if(!await read(queuePath(session.id))) {
    try {await write(queuePath(session.id),{id:session.id})} catch(error) {if(!conflict(error))throw error}
  }
}

export async function notifyUpload(id,{
  read=readJournal,write=writeJournal,remove=removeUploadEmailQueue,reserve=reserveUploadEmail,
  apiKey=process.env.RESEND_API_KEY,from=process.env.BOOKING_EMAIL_FROM,environment=process.env.VERCEL_ENV,
  fetchImpl=fetch,now=Date.now,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),
  log=event=>console.warn('[upload email]',event),
}={}) {
  if(environment!=='production' || !/^[a-f0-9]{64}$/.test(id))return 'disabled'
  let row
  try {
    const session=await read(sessionPath(id))
    if(session?.data.status!=='complete' || session.data.notificationVersion!==1) {
      if(session && (session.data.status==='rejected' || Date.parse(session.data.expiresAt)<now()))await remove(queuePath(id))
      return 'incomplete'
    }
    row=await read(receiptPath(id))
    if(!row)return 'missing'
    if(['accepted','review'].includes(row.data.status)){await remove(queuePath(id));return row.data.status}
    if(!apiKey || !validFrom(from))return 'unconfigured'
    if(row.data.leaseUntil>now())return 'busy'
    row=await write(receiptPath(id),{...row.data,leaseUntil:now()+120000},row.etag)
    for(let attempt=0;attempt<3;attempt++) {
      // Stop uncertain retries before Resend's 24-hour deduplication expires.
      if(row.data.firstAttemptAt && now()-row.data.firstAttemptAt>=23*3600000) {
        row=await write(receiptPath(id),{...row.data,status:'review',leaseUntil:0},row.etag)
        await remove(queuePath(id));log({status:'review',reference:id.slice(0,12)});return 'review'
      }
      try {await reserve()} catch {break}
      row=await write(receiptPath(id),{...row.data,from:row.data.from || from,firstAttemptAt:row.data.firstAttemptAt || now(),attempts:row.data.attempts+1},row.etag)
      let definitelyRejected=false
      try {
        const response=await fetchImpl('https://api.resend.com/emails',{
          method:'POST',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000),
          headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':`fan-upload/v1/${id}`},
          body:JSON.stringify({from:row.data.from,...row.data.message}),
        })
        definitelyRejected=response.status>=400 && response.status<500 && response.status!==409
        if(!response.ok)throw new Error('email_rejected')
        const result=await response.json()
        if(typeof result.id!=='string' || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(result.id))throw new Error('email_unconfirmed')
        row=await write(receiptPath(id),{...row.data,status:'accepted',providerId:result.id,acceptedAt:now(),leaseUntil:0},row.etag)
        await remove(queuePath(id)).catch(()=>{})
        return 'accepted'
      } catch {
        // Preserve uncertainty from any earlier attempt. A confirmed rejection
        // without prior uncertainty can wait past tomorrow's daily quota reset.
        const uncertain=row.data.uncertain || !definitelyRejected
        row=await write(receiptPath(id),{...row.data,uncertain,...(!uncertain ? {firstAttemptAt:null} : {})},row.etag)
        if(attempt<2)await wait(1500*(attempt+1))
      }
    }
    await write(receiptPath(id),{...row.data,leaseUntil:0},row.etag)
    log({status:'pending',reference:id.slice(0,12)})
    return 'pending'
  } catch(error) {
    if(!conflict(error))log({status:'deferred',reference:id.slice(0,12)})
    return 'deferred'
  }
}

export async function retryUploadEmails({list=listUploadEmailQueue,notify=notifyUpload,now=Date.now}={}) {
  const started=now(),results={checked:0,accepted:0,pending:0,review:0}
  for(const path of await list()) {
    if(now()-started>180000)break
    const id=/^upload-email\/pending\/([a-f0-9]{64})\.json$/.exec(path)?.[1]
    if(!id)continue
    const result=await notify(id)
    results.checked++
    if(result==='accepted')results.accepted++
    else if(result==='review')results.review++
    else results.pending++
  }
  return results
}
