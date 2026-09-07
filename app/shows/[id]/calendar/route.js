import { getPublicShow } from '@/lib/public/show-detail'
import { showCalendar } from '@/lib/public/show-calendar.mjs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export async function GET(request, { params }) {
  const { id } = await params
  const result = await getPublicShow(id)
  const headers = { 'Cache-Control': 'no-store, max-age=0' }
  if (!result.ok) return new Response('Calendar temporarily unavailable', { status: 503, headers })
  if (!result.show) return new Response('Show not found', { status: 404, headers })
  return new Response(showCalendar(result.show), {
    headers: {
      ...headers,
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="echo-play-live-${id}.ics"`,
    },
  })
}
