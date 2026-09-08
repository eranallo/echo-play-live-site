import { timingSafeEqual } from 'node:crypto'
import { retryUploadEmails } from '@/lib/uploads/notifications.mjs'

export const runtime='nodejs'
export const dynamic='force-dynamic'
export const maxDuration=300
const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}
export async function GET(request) {
  const secret=process.env.CRON_SECRET
  const received=Buffer.from(request.headers.get('authorization') || '')
  const expected=Buffer.from(`Bearer ${secret || ''}`)
  if(!secret || process.env.VERCEL_ENV!=='production' || received.length!==expected.length || !timingSafeEqual(received,expected))return Response.json({error:'Unauthorized'},{status:401,headers})
  try {return Response.json(await retryUploadEmails(),{headers})}
  catch {console.error('[upload email] retry unavailable');return Response.json({error:'Retry unavailable'},{status:503,headers})}
}
