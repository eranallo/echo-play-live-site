import { bandsList } from '@/lib/bands'
export async function GET(request, { params }) {
  const { slug } = await params
  const band = bandsList.find((item) => item.slug === slug)
  if (!band) return new Response('Band not found', { status: 404 })
  const bio = `${band.name}\n${band.tagline}\n\n${band.description}\n\nBooking: ${band.bookingEmail}\nhttps://echoplay.live/bands/${band.slug}\n\nEcho Play Live · Fort Worth, Texas\n`
  return new Response(bio, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}-bio.txt"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
