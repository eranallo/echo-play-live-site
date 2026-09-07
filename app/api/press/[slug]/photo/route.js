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
    const src =
      slug === 'the-dick-beldings'
        ? band.crowdPhoto
        : slug === 'jambi'
          ? '/bands/jambi/gallery/photo-2.jpg'
          : slug === 'elite'
            ? '/bands/elite/gallery/photo-1.jpg'
            : band.heroPhoto
    let bytes
    if (src.startsWith('/bands/')) bytes = await readFile(path.join(process.cwd(), 'public', src))
    else {
      const response = await fetch(src, { signal: AbortSignal.timeout(10000), redirect: 'error' })
      if (!response.ok || !/^image\/jpeg/.test(response.headers.get('content-type') || ''))
        throw new Error('Photo unavailable')
      if (Number(response.headers.get('content-length')) > MAX_BYTES)
        throw new Error('Photo too large')
      const reader = response.body.getReader()
      const chunks = []
      let total = 0
      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          total += value.length
          if (total > MAX_BYTES) throw new Error('Photo too large')
          chunks.push(Buffer.from(value))
        }
      } finally {
        await reader.cancel()
      }
      bytes = Buffer.concat(chunks)
    }
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
