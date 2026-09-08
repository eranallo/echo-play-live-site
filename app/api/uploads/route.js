import { rateLimit } from '@/lib/ratelimit'
import { runUpload, uploadCatalog, uploadsEnabled } from '@/lib/uploads/service.mjs'

export const runtime='nodejs'
export const dynamic='force-dynamic'
export const maxDuration=300
const headers={'Cache-Control':'private, no-store, max-age=0','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'}
const reply=(body,status=200)=>Response.json(body,{status,headers})
export async function GET(request) {
  if(!uploadsEnabled()) return reply({error:'Uploads are being connected. Please check back shortly.',shows:[]},503)
  if(!rateLimit(request,{capacity:15,refillMs:5000,scope:'upload-catalog'}).ok) return reply({error:'Please try again shortly.',shows:[]},429)
  try{return reply({shows:await uploadCatalog()})}catch(error){console.warn('[uploads] catalog unavailable',{code:safeCode(error)});return reply({error:'We couldn’t load the show list. Please try again shortly.',shows:[]},503)}
}
function safeCode(error) { return /^[a-z_]+(?:_\d{3})?$/.test(error?.message || '') ? error.message : 'upload_unavailable' }
const errors={
  show_unavailable:[404,'This show is not available for uploads. Please choose a show from the current list.'],
  session_missing:[404,'This upload session could not be found. Please start a new submission.'],
  session_expired:[410,'This upload session has expired. Please start a new submission.'],
  session_conflict:[409,'These files don’t match this upload session. Please start a new submission.'],
  session_busy:[409,'This submission is still being prepared. Wait a few minutes, then try again.'],
  upload_quota:[429,'We’ve reached the upload limit for now. Please try again later.'],
  delivery_incomplete:[409,'We haven’t received every file yet. Please resume the upload.'],
  restart_limit:[409,'We couldn’t restart this file again. Please contact us with your submission reference.'],
}
export async function POST(request) {
  if(!uploadsEnabled()) return reply({error:'Uploads are being connected. Please check back shortly.'},503)
  const origin=request.headers.get('origin')
  const deploymentOrigin=process.env.VERCEL_ENV==='production' && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  const projectOrigin=process.env.VERCEL_ENV==='production' ? 'https://echo-play-live-site-eranallo-6688s-projects.vercel.app' : null
  if(origin!=='https://echoplay.live' && origin!==deploymentOrigin && origin!==projectOrigin && !(process.env.NODE_ENV!=='production' && origin===new URL(request.url).origin)) return reply({error:'Please upload from echoplay.live.'},403)
  if(!request.headers.get('content-type')?.startsWith('application/json')) return reply({error:'Please send upload details.'},415)
  if(!rateLimit(request,{capacity:30,refillMs:6000,scope:'upload-actions'}).ok) return reply({error:'Please wait a moment before trying again.'},429)
  const token=request.headers.get('authorization')?.replace(/^Bearer /,'')
  if(!/^[a-f0-9]{64}$/.test(token || '')) return reply({error:'Please start a new upload session.'},401)
  let body
  if(Number(request.headers.get('content-length'))>20000)return reply({error:'Upload details are too long.'},413)
  try{const raw=await request.text();if(raw.length>20000) return reply({error:'Upload details are too long.'},413);body=JSON.parse(raw)}catch{return reply({error:'Please check your upload details.'},400)}
  if(!body || !['start','resume','complete','restart-file','file-status'].includes(body.action)) return reply({error:'Please choose a valid upload action.'},400)
  try {
    return reply(await runUpload(body.action,token,body,request.headers.get('x-vercel-forwarded-for')?.split(',')[0] || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',origin))
  } catch(error) {
    if(error?.message?.startsWith('Please ') || error?.message?.startsWith('Choose ') || error?.message?.startsWith('We couldn’t read')) return reply({error:error.message},400)
    const code=safeCode(error); const [status,message]=errors[code] || [503,'We couldn’t confirm the upload. Keep this page open and try again. Your submission reference will stay the same.']
    console.warn('[uploads] action unavailable',{action:body.action,code,kind:error?.name})
    return reply({error:message},status)
  }
}
