import { createHash } from 'node:crypto'
import { validateSubmission } from './files.mjs'
import { findEligibleUploadShow, loadUploadShows, saveUploadReceipt } from './source.mjs'
import { beginFile, ensureSubmissionFolder, fileMetadata, filePosition, generateDriveIds, uploadDestinations, verifiedFile, verifyFileSignature, trashRejectedMedia } from './google.mjs'
import { readJournal, reserveQuota, sessionId, sessionPath, writeJournal } from './journal.mjs'
import { queueUploadEmail, notifyUpload } from './notifications.mjs'

const MAX_AGE = 3 * 86400000
export const uploadsEnabled = () => process.env.FAN_UPLOADS_ENABLED === 'true' && Boolean(process.env.FAN_UPLOAD_READ_WRITE_TOKEN)
const digest = data => createHash('sha256').update(JSON.stringify(data)).digest('hex')
async function inGroups(items, fn) { const result=[]; for(let i=0;i<items.length;i+=4) result.push(...await Promise.all(items.slice(i,i+4).map(fn))); return result }
export async function uploadCatalog() {
  const [shows, destinations] = await Promise.all([loadUploadShows(), uploadDestinations()])
  console.info('[uploads] catalog counts',{eligible:shows.length,destinations:destinations.size})
  return shows.filter(s=>destinations.has(s.showFolder)).map(s=>s.public)
}
function publicSession(s) {
  return { complete:s.status==='complete', reference:s.id.slice(0,12).toUpperCase(), expiresAt:s.expiresAt, show:s.show,
    files:s.files.map(f=>({name:f.name,size:f.size,mimeType:f.mimeType,fingerprint:f.fingerprint,...(s.status==='complete'?{}:{uploadUrl:f.uploadUrl})})) }
}
async function lock(row) {
  if(row.data.leaseUntil > Date.now()) throw new Error('session_busy')
  return writeJournal(sessionPath(row.data.id),{...row.data,leaseUntil:Date.now()+330000},row.etag)
}
export async function runUpload(action, token, body, ip, origin='https://echoplay.live') {
  const id=sessionId(token), path=sessionPath(id)
  const parsed=action==='start' ? validateSubmission(body) : undefined
  let row=await readJournal(path)
  if(action==='start') {
    if(row && row.data.requestHash!==digest(parsed)) throw new Error('session_conflict')
  } else if(!row) throw new Error('session_missing')
  if(row && Date.parse(row.data.expiresAt)<Date.now()) throw new Error('session_expired')
  const show=await findEligibleUploadShow(parsed?.show || row.data.show.id)
  if(row && (show.recordId!==row.data.recordId || show.showFolder!==row.data.sourceFolder || digest(show.bandIds)!==digest(row.data.bandIds))) throw new Error('show_unavailable')
  if(row?.data.status==='rejected') {
    for(const file of row.data.files.filter(f=>row.data.rejectedFiles?.includes(f.id)))await trashRejectedMedia(file,row.data)
    throw new Error('media_rejected')
  }
  if(row?.data.status==='complete') {await notifyUpload(id);return publicSession(row.data)}
  if(action==='file-status') {
    if(row.data.status!=='uploading' || !Number.isInteger(body.index) || body.index<0 || body.index>=row.data.files.length)throw new Error('invalid_file')
    return filePosition(row.data,row.data.files[body.index])
  }
  if(action==='start' && row?.data.status==='uploading') return publicSession(row.data)
  if(action==='resume' && row?.data.status==='uploading') return publicSession(row.data)
  if(action==='start' || (action==='resume' && row.data.status==='preparing')) {
    if(!row) {
      const destinations=await uploadDestinations()
      const destination=destinations.get(show.showFolder)
      if(!destination) throw new Error('show_unavailable')
      await reserveQuota(id,parsed.total,ip)
      const ids=await generateDriveIds(parsed.files.length+1)
      const now=new Date()
      row=await writeJournal(path,{...parsed,id,origin,requestHash:digest(parsed),show:show.public,recordId:show.recordId,bandIds:show.bandIds,sourceFolder:show.showFolder,destination,folderId:ids[0],files:parsed.files.map((f,i)=>({...f,id:ids[i+1]})),status:'preparing',createdAt:now.toISOString(),expiresAt:new Date(+now+MAX_AGE).toISOString(),leaseUntil:Date.now()+330000})
    } else row=await lock(row)
    try {
      await ensureSubmissionFolder(row.data)
      const files=await inGroups(row.data.files,async f=>({...f,uploadUrl:f.uploadUrl || await beginFile(row.data,f)}))
      row=await writeJournal(path,{...row.data,files,status:'uploading',leaseUntil:0},row.etag)
      return publicSession(row.data)
    } catch(error) {
      await writeJournal(path,{...row.data,leaseUntil:0},row.etag).catch(()=>{})
      throw error
    }
  }
  if(action==='complete') {
    row=await lock(row)
    let stage='verify_files'
    try {
      const verified=await inGroups(row.data.files,async f=>{
        if(!verifiedFile(await fileMetadata(f.id),f,row.data))return 'incomplete'
        if(await verifyFileSignature(f))return 'verified'
        return 'rejected'
      })
      if(verified.includes('rejected')) {
        const rejectedFiles=row.data.files.filter((f,i)=>verified[i]==='rejected')
        row=await writeJournal(path,{...row.data,status:'rejected',rejectedFiles:rejectedFiles.map(f=>f.id),leaseUntil:0,files:row.data.files.map(({uploadUrl,...f})=>f)},row.etag)
        for(const file of rejectedFiles)await trashRejectedMedia(file,row.data)
        throw new Error('media_rejected')
      }
      if(verified.includes('incomplete')) throw new Error('delivery_incomplete')
      // Recheck after transfer verification as well as before it.
      stage='recheck_show'
      await findEligibleUploadShow(row.data.show.id)
      stage='save_receipt'
      const receiptId=await saveUploadReceipt(row.data)
      stage='queue_notification'
      await queueUploadEmail(row.data)
      stage='save_completion'
      row=await writeJournal(path,{...row.data,status:'complete',receiptId,notificationVersion:1,completedAt:new Date().toISOString(),leaseUntil:0,files:row.data.files.map(({uploadUrl,...f})=>f)},row.etag)
      await notifyUpload(id)
      return publicSession(row.data)
    } catch(error) {
      console.warn('[uploads] completion step failed',{stage,kind:error?.name})
      await writeJournal(path,{...row.data,leaseUntil:0},row.etag).catch(()=>{})
      throw error
    }
  }
  // A lost/expired Drive session is recoverable only after metadata proves that
  // the preassigned file ID has not already completed. Parent IDs never come from the caller.
  if(action==='restart-file') {
    if(!Number.isInteger(body.index) || body.index<0 || body.index>=row.data.files.length) throw new Error('invalid_file')
    row=await lock(row)
    try {
      const file=row.data.files[body.index]
      const metadata=await fileMetadata(file.id)
      if(metadata) {
        if(!verifiedFile(metadata,file,row.data)) throw new Error('delivery_mismatch')
        await writeJournal(path,{...row.data,leaseUntil:0},row.etag)
        return {fileComplete:true}
      }
      // Restart is limited; no unlimited session issuance for the same reservation.
      if((file.restarts || 0)>=2) throw new Error('restart_limit')
      const uploadUrl=await beginFile(row.data,file)
      const files=row.data.files.map((f,i)=>i===body.index?{...f,uploadUrl,restarts:(f.restarts || 0)+1}:f)
      row=await writeJournal(path,{...row.data,files,leaseUntil:0},row.etag)
      return {uploadUrl}
    } catch(error) { await writeJournal(path,{...row.data,leaseUntil:0},row.etag).catch(()=>{}); throw error }
  }
  throw new Error('invalid_action')
}
