import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getBandKit } from '@/lib/press/kit-content.mjs'

export const runtime = 'nodejs'

export async function GET(request, { params }) {
  const { slug } = await params
  const kit = getBandKit(slug)
  if (!kit) return NextResponse.json({ error: 'Band kit not found' }, { status: 404 })
  try {
    const bytes = await readFile(path.join(process.cwd(), 'public/press/kits', `${kit.slug}.pdf`))
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="EPL-${kit.slug}-Band-Kit.pdf"`,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Content-Length': String(bytes.length),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Band kit temporarily unavailable' }, { status: 503 })
  }
}
