import { searchRequestTracks } from '@/lib/spotify-request-search'
import { rateLimit } from '@/lib/ratelimit'
export const runtime='nodejs'
export const dynamic='force-dynamic'
export async function GET(request) {
  const headers={'Cache-Control':'no-store'}
  const query=new URL(request.url).searchParams.get('q')?.trim() || ''
  if(query.length<2 || query.length>180 || /[\x00-\x1f]/.test(query)) return Response.json({error:'Enter a song title, artist, or Spotify track link.'},{status:400,headers})
  const limit=rateLimit(request,{scope:'song-search',capacity:30,refillMs:2000})
  if(!limit.ok)return Response.json({error:'Please wait a moment before searching again.'},{status:429,headers:{...headers,'Retry-After':String(limit.retryAfter)}})
  try {return Response.json({songs:await searchRequestTracks(query)},{headers})}
  catch {return Response.json({error:'Song search is taking a break. Try again, or send a suggestion for us to review.'},{status:503,headers})}
}
