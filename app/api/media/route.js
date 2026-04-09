import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

const FOLDER_MAP = {
  'so-long-goodnight': ['So Long Goodnight/Media', 'So Long Goodnight'],
  'the-dick-beldings': ['The Dick Beldings/Media', 'The Dick Beldings'],
  'jambi': ['Jambi/Media', 'Jambi'],
  'elite': ['Elite/Media', 'Elite'],
}

function sortNumerically(blobs) {
  return [...blobs].sort((a, b) => {
    const aNum = parseInt(a.filename.match(/^(\d+)/)?.[1] || '9999')
    const bNum = parseInt(b.filename.match(/^(\d+)/)?.[1] || '9999')
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
      filename: b.filename,
      size: b.size,
      uploadedAt: b.uploadedAt,
    }))

    return NextResponse.json({ images, count: images.length })
  } catch (err) {
    console.error('Blob list error:', err)
    return NextResponse.json({ error: 'Failed to load media', images: [] }, { status: 500 })
  }
}
