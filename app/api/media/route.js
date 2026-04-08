import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

// Map band slugs to their blob folder names
const FOLDER_MAP = {
  'so-long-goodnight': 'So Long Goodnight',
  'the-dick-beldings': 'The Dick Beldings',
  'jambi': 'Jambi',
  'elite': 'Elite',
  'logo': 'logo',
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const band = searchParams.get('band')

  if (!band || !FOLDER_MAP[band]) {
    return NextResponse.json({ error: 'Invalid band' }, { status: 400 })
  }

  try {
    const folder = FOLDER_MAP[band]
    const { blobs } = await list({ prefix: `${folder}/` })

    // Filter to image files only, return urls + metadata
    const images = blobs
      .filter(b => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(b.pathname))
      .map(b => ({
        url: b.url,
        pathname: b.pathname,
        filename: b.pathname.split('/').pop(),
        size: b.size,
        uploadedAt: b.uploadedAt,
      }))

    return NextResponse.json({ images, folder, count: images.length })
  } catch (err) {
    console.error('Blob list error:', err)
    return NextResponse.json({ error: 'Failed to load media', images: [] }, { status: 500 })
  }
}
