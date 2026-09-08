import { getVercelOidcToken } from '@vercel/oidc'
import { hasMediaSignature } from './files.mjs'
import { readJournal } from './journal.mjs'
import { receivedOffset } from './transfer.mjs'

const ACCOUNT = 'epl-fan-uploads@echo-play-live.iam.gserviceaccount.com'
const AUDIENCE = '//iam.googleapis.com/projects/580910541736/locations/global/workloadIdentityPools/epl-website-production/providers/vercel'
const DRIVE = 'https://www.googleapis.com/drive/v3'
let cachedToken
let pendingToken
async function jsonRequest(url, options) {
  const response = await fetch(url, { ...options, cache: 'no-store', signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error(`google_${response.status}`)
  return response.json()
}
export async function googleToken() {
  if (process.env.VERCEL_ENV !== 'production') throw new Error('production_identity_required')
  if (cachedToken && cachedToken.expires > Date.now() + 120000) return cachedToken.value
  if (!pendingToken) pendingToken = (async () => {
    const oidc = await getVercelOidcToken()
    const exchange = await jsonRequest('https://sts.googleapis.com/v1/token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audience: AUDIENCE, grantType: 'urn:ietf:params:oauth:grant-type:token-exchange', requestedTokenType: 'urn:ietf:params:oauth:token-type:access_token', subjectTokenType: 'urn:ietf:params:oauth:token-type:jwt', subjectToken: oidc, scope: 'https://www.googleapis.com/auth/cloud-platform' }),
    })
    const result = await jsonRequest(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${ACCOUNT}:generateAccessToken`, {
      method: 'POST', headers: { Authorization: `Bearer ${exchange.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: ['https://www.googleapis.com/auth/drive'], lifetime: '1800s' }),
    })
    if (!result.accessToken || !Number.isFinite(Date.parse(result.expireTime))) throw new Error('google_identity_invalid')
    cachedToken = { value: result.accessToken, expires: Date.parse(result.expireTime) }
    return cachedToken.value
  })().finally(() => { pendingToken = null })
  return pendingToken
}
export async function driveRequest(path, options = {}) {
  return fetch(`${DRIVE}${path}`, { ...options, headers: { Authorization: `Bearer ${await googleToken()}`, 'Content-Type': 'application/json', ...options.headers }, cache: 'no-store', signal: AbortSignal.timeout(15000) })
}
export async function driveJson(path, options) {
  const response = await driveRequest(path, options)
  if (!response.ok) throw new Error(`drive_${response.status}`)
  return response.json()
}
export async function uploadDestinations() {
  // Google omits parents when an identity can access only the child folder.
  // An owner-verified private mapping preserves that narrow access boundary.
  const routes=(await readJournal('destinations.json'))?.data
  if(!routes || routes.version!==1 || !Array.isArray(routes.folders))throw new Error('drive_routes_unconfigured')
  const sourceByChild=new Map(routes.folders.map(f=>[f.fanFolder,f.showFolder]))
  const destinations=new Map(); const duplicates=new Set(); let pageToken
  const seen=new Set()
  do {
    const params=new URLSearchParams({q:"name = 'Fan uploads' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",fields:'files(id,parents,capabilities(canAddChildren)),nextPageToken',spaces:'drive',pageSize:'100',supportsAllDrives:'true',includeItemsFromAllDrives:'true'})
    if(pageToken) params.set('pageToken',pageToken)
    const result=await driveJson(`/files?${params}`)
    if(!Array.isArray(result.files)) throw new Error('drive_folders_invalid')
    console.info('[uploads] folder discovery',{found:result.files.length,withParent:result.files.filter(f=>f.parents?.length===1).length,writable:result.files.filter(f=>f.capabilities?.canAddChildren===true).length})
    for(const folder of result.files){
      const parent=sourceByChild.get(folder.id)
      if(!/^[-\w]{10,100}$/.test(parent || '') || folder.capabilities?.canAddChildren !== true) continue
      if(folder.parents?.length && (folder.parents.length!==1 || folder.parents[0]!==parent))continue
      if(destinations.has(parent)) duplicates.add(parent)
      destinations.set(parent,folder.id)
    }
    pageToken=result.nextPageToken
    if(pageToken && (seen.has(pageToken) || seen.size>50)) throw new Error('drive_folders_invalid')
    if(pageToken) seen.add(pageToken)
  } while(pageToken)
  for(const parent of duplicates) destinations.delete(parent)
  return destinations
}
export async function generateDriveIds(count) {
  const result = await driveJson(`/files/generateIds?count=${count}&space=drive&type=files`)
  if (!Array.isArray(result.ids) || result.ids.length !== count || result.ids.some(id=>!/^[-\w]{10,100}$/.test(id))) throw new Error('drive_ids_invalid')
  return result.ids
}
export async function fileMetadata(id) {
  const response = await driveRequest(`/files/${encodeURIComponent(id)}?supportsAllDrives=true&fields=id,name,mimeType,size,parents,trashed,appProperties,md5Checksum,capabilities(canAddChildren)`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`drive_${response.status}`)
  return response.json()
}
export async function ensureSubmissionFolder(session) {
  const current = await fileMetadata(session.folderId)
  if (current) {
    if (current.trashed || current.mimeType !== 'application/vnd.google-apps.folder' || !current.parents?.includes(session.destination) || current.appProperties?.eplSubmission !== session.id) throw new Error('folder_mismatch')
    return
  }
  const response = await driveRequest('/files?supportsAllDrives=true&fields=id', { method:'POST', body: JSON.stringify({ id: session.folderId, name: `Submission ${session.createdAt.slice(0,10)} ${session.id.slice(0,8)}`, mimeType:'application/vnd.google-apps.folder', parents:[session.destination], appProperties:{eplSubmission:session.id}, description:'Private fan media intake. Review the matching UPLOADS receipt and permission before reuse.' }) })
  if (!response.ok && response.status !== 409) throw new Error(`drive_folder_${response.status}`)
}
export function validSessionUrl(value) {
  try { const u = new URL(value); return u.origin === 'https://www.googleapis.com' && u.pathname === '/upload/drive/v3/files' && u.searchParams.get('uploadType') === 'resumable' && Boolean(u.searchParams.get('upload_id')) } catch { return false }
}
export async function beginFile(session, file) {
  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id', {
    method:'POST', headers:{Authorization:`Bearer ${await googleToken()}`, 'Content-Type':'application/json', 'X-Upload-Content-Type':file.mimeType, 'X-Upload-Content-Length':String(file.size), Origin:session.origin || 'https://echoplay.live'},
    body: JSON.stringify({id:file.id, name:file.name, mimeType:file.mimeType, parents:[session.folderId], appProperties:{eplSubmission:session.id, fingerprint:file.fingerprint}}),
    cache:'no-store', signal:AbortSignal.timeout(15000), redirect:'error',
  })
  if (!response.ok) throw new Error(`drive_start_${response.status}`)
  const url=response.headers.get('location')
  if (!validSessionUrl(url)) throw new Error('drive_session_invalid')
  return url
}
export async function filePosition(session, file, request=fetch) {
  if(!validSessionUrl(file.uploadUrl))throw new Error('drive_session_invalid')
  const response=await request(file.uploadUrl,{method:'PUT',headers:{'Content-Range':`bytes */${file.size}`},cache:'no-store',signal:AbortSignal.timeout(15000),redirect:'manual'})
  await response.body?.cancel()
  if(response.status===404)return {expired:true}
  return {offset:receivedOffset(response.status,response.headers.get('range'),file.size)}
}
export function verifiedFile(metadata, file, session) {
  return Boolean(metadata && !metadata.trashed && metadata.id === file.id && metadata.name === file.name && metadata.mimeType === file.mimeType && Number(metadata.size) === file.size && metadata.parents?.length === 1 && metadata.parents[0] === session.folderId && metadata.appProperties?.eplSubmission === session.id && metadata.appProperties?.fingerprint === file.fingerprint)
}
export async function verifyFileSignature(file) {
  const response=await driveRequest(`/files/${encodeURIComponent(file.id)}?alt=media&supportsAllDrives=true`,{headers:{Range:'bytes=0-63'}})
  if(![200,206].includes(response.status) || Number(response.headers.get('content-length'))>64){await response.body?.cancel();return false}
  const reader=response.body.getReader();const bytes=[];let length=0
  try{while(length<64){const part=await reader.read();if(part.done)break;bytes.push(part.value.slice(0,64-length));length+=Math.min(part.value.length,64-length)}}finally{await reader.cancel()}
  const result=new Uint8Array(length);let offset=0;for(const part of bytes){result.set(part,offset);offset+=part.length}
  return hasMediaSignature(result,file.mimeType)
}
