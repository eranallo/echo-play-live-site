import { get, put, BlobPreconditionFailedError } from '@vercel/blob'
import { createHash, randomBytes } from 'node:crypto'
import { checkUploadQuota } from './quota.mjs'

function options() {
  const token = process.env.FAN_UPLOAD_READ_WRITE_TOKEN
  if (!token) throw new Error('journal_unconfigured')
  return { token, access:'private', abortSignal:AbortSignal.timeout(10000) }
}
export async function readJournal(path) {
  // Compressed responses carry weak ETags, which cannot be used for atomic writes.
  const result = await get(path, { ...options(), useCache:false, headers:{'Accept-Encoding':'identity'} })
  if (!result) return null
  if (result.statusCode !== 200 || result.blob.size > 250000 || !result.blob.etag || result.blob.etag.startsWith('W/')) throw new Error('journal_invalid')
  return { data: await new Response(result.stream).json(), etag: result.blob.etag }
}
export async function writeJournal(path, data, etag) {
  const result = await put(path, JSON.stringify(data), { ...options(), contentType:'application/json', addRandomSuffix:false, allowOverwrite:Boolean(etag), ...(etag ? {ifMatch:etag} : {}) })
  return { data, etag:result.etag }
}
export function sessionId(token) {
  if (!/^[a-f0-9]{64}$/.test(token || '')) throw new Error('invalid_session')
  return createHash('sha256').update(`epl-fan-session-v1:${token}`).digest('hex')
}
export const sessionPath = id => `sessions/${id}.json`
export async function reserveQuota(id, total, ip, now = Date.now()) {
  // A compare-and-swap ledger protects limits across instances. Reservations remain
  // charged after abandonment: issued Drive sessions can still receive bytes.
  for (let attempt=0; attempt<6; attempt++) {
    const row=await readJournal('quota.json')
    const data=row?.data || {salt:randomBytes(32).toString('hex'), reservations:[]}
    const ipHash=createHash('sha256').update(`${data.salt}:${ip}`).digest('hex')
    const quota=checkUploadQuota(data.reservations,{id,total,ip:ipHash,now})
    if(quota.code==='reserved')return
    if(quota.code!=='available')throw new Error(quota.code)
    data.reservations=quota.active
    data.reservations.push({id,total,ip:ipHash,at:now})
    try { await writeJournal('quota.json',data,row?.etag); return } catch(error) {
      if (!(error instanceof BlobPreconditionFailedError) && !/already exists/i.test(error.message)) throw error
    }
  }
  throw new Error('journal_busy')
}
