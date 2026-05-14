import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

const FOLDER_MAP = {
  'so-long-goodnight': ['So Long Goodnight/Media', 'So Long Goodnight'],
  'the-dick-beldings': ['The Dick Beldings/Media', 'The Dick Beldings'],
  'jambi': ['Jambi/Media', 'Jambi'],
  'elite': ['Elite/Media', 'Elite'],
}

// @vercel/blob v2 dropped the `filename` field from list() results.
// Derive it from pathname (e.g., "Jambi/Media/01-photo.jpg" -> "01-photo.jpg").
function filenameOf(blob) {
  return (blob.pathname || '').split('/').pop() || ''
}

function sortNumerically(blobs) {
  return [...blobs].sort((a, b) => {
    const aNum = parseInt(filenameOf(a).match(/^(\d+)/)?.[1] || '9999')
    const bNum = parseInt(filenameOf(b).match(/^(\d+)/)?.[1] || '9999')
    return aNum - bNum
  })
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const band = searchParams.get('band')

  if (!band || !FOLDER_MAP[band]) {
    return NextResponse.json({ error: 'Invalid band' }, { status: 400 })
  }

  try {
    const folders = FOLDER_MAP[band]
    let allBlobs = []

    for (const folder of folders) {
      const { blobs } = await list({ prefix: `${folder}/` })
      const imageBlobs = blobs.filter(b =>
        /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(b.pathname)
      )
      if (imageBlobs.length > 0) {
        allBlobs = imageBlobs
        break
      }
    }

    const images = sortNumerically(allBlobs).map(b => ({
      url: b.url,
      pathname: b.pathname,
      filename: filenameOf(b),
      size: b.size,
      uploadedAt: b.uploadedAt,
    }))

    return NextResponse.json({ images, count: images.length })
  } catch (err) {
    console.error('Blob list error:', err)
    return NextResponse.json({ error: 'Failed to load media', images: [] }, { status: 500 })
  }
}
