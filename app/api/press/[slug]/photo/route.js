import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { bandsList } from '@/lib/bands'
export const runtime = 'nodejs'
const MAX_BYTES = 10 * 1024 * 1024

export async function GET(request, { params }) {
  const { slug } = await params
  const band = bandsList.find((item) => item.slug === slug)
  if (!band) return new Response('Band not found', { status: 404 })
  try {
    // Fixed curated assets only; this endpoint never accepts a user-supplied URL/path.
    const bytes = await readFile(path.join(process.cwd(), 'public', 'press', 'bands', slug, 'cover.jpg'))
    if (bytes.length > MAX_BYTES || bytes[0] !== 0xff || bytes[1] !== 0xd8)
      throw new Error('Invalid photo')
    return new Response(bytes, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${slug}-press-photo.jpg"`,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return new Response(
      'Photo temporarily unavailable. Please contact the band for press assets.',
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
