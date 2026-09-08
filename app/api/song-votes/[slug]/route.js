import { getSongChoicesForBand } from '@/lib/songs'
import { bandsList } from '@/lib/bands'
import { rateLimit } from '@/lib/ratelimit'
import { handleSongVote } from '@/lib/song-votes.mjs'
import { getRequestTrack } from '@/lib/spotify-request-search'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function POST(request,{params}) {
  const headers={'Cache-Control':'private, no-store'}
  const reply=(body,status)=>Response.json(body,{status,headers})
  const {slug}=await params
  if (!bandsList.some(b=>b.slug===slug)) return reply({error:'Band not found.'},404)
  try {
    const origin=new URL(request.headers.get('origin'))
    if (!['http:','https:'].includes(origin.protocol) || origin.host!==request.headers.get('host')) return reply({error:'Please vote from this website.'},403)
  } catch { return reply({error:'Please vote from this website.'},403) }
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({error:'Please reload the page and try again.'},415)
  const limited=rateLimit(request,{scope:'song-votes',capacity:120,refillMs:500})
  if (!limited.ok) return Response.json({error:'A lot of votes are coming in. Please try again shortly.'},{status:429,headers:{...headers,'Retry-After':String(limited.retryAfter)}})
  if (Number(request.headers.get('content-length'))>600) return reply({error:'Invalid vote.'},413)
  let body
  try {
    const raw=await request.text()
    if(raw.length>600) return reply({error:'Invalid vote.'},413)
    body=JSON.parse(raw)
    if(!body || typeof body!=='object' || Array.isArray(body)) return reply({error:'Invalid vote.'},400)
  } catch {return reply({error:'Invalid vote.'},400)}
  if(body.action==='add') {
    const additions=rateLimit(request,{scope:'song-additions',capacity:12,refillMs:30000})
    if(!additions.ok) return reply({error:'Please try adding that song again shortly.'},429)
  }
  const result=await handleSongVote({band:slug,action:body.action,visitor:body.visitor,song:body.song,spotifyId:body.spotifyId},{catalog:await getSongChoicesForBand(slug),resolveTrack:getRequestTrack})
  if(result.status===503) console.info('[song-votes]',{event:'unavailable',band:slug})
  return reply(result.body,result.status)
}
