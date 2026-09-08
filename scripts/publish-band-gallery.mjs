import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { put, head, BlobNotFoundError } from '@vercel/blob'

const [directory, flag] = process.argv.slice(2)
if (!directory || flag !== '--publish') throw new Error('Usage: node scripts/publish-band-gallery.mjs prepared-directory --publish')
if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('The existing public media-storage token is required')
if (!process.env.BLOB_READ_WRITE_TOKEN.toLowerCase().startsWith('vercel_blob_rw_wkqcpwrvrb9fa0hy_')) throw new Error('The token must belong to the existing public website media store')
const assets = JSON.parse(await readFile(join(directory, 'assets.json'), 'utf8'))
const galleries = JSON.parse(await readFile(join(directory, 'galleries.json'), 'utf8'))
const urls = new Map()
for (const asset of assets) {
  if (!/^website-media\/20260908\/(elite|jambi|so-long-goodnight|the-dick-beldings)\/[a-f0-9]{12}-(480|960|1920)\.webp$/.test(asset.pathname)) throw new Error('Unexpected media pathname')
  const bytes = await readFile(join(directory, asset.pathname))
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw new Error('Prepared asset changed after review')
  let blob
  try {
    blob = await head(asset.pathname)
    const existing = await fetch(blob.url)
    if (!existing.ok || createHash('sha256').update(Buffer.from(await existing.arrayBuffer())).digest('hex') !== asset.sha256) throw new Error('Existing media differs; use a new release namespace')
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) throw error
    blob = await put(asset.pathname, bytes, { access: 'public', addRandomSuffix: false, allowOverwrite: false, contentType: 'image/webp', cacheControlMaxAge: 31536000 })
  }
  if (new URL(blob.url).hostname !== 'wkqcpwrvrb9fa0hy.public.blob.vercel-storage.com') throw new Error('Unexpected storage destination')
  urls.set(`/${asset.pathname}`, blob.url)
  if (urls.size % 30 === 0) console.log(`Uploaded ${urls.size} of ${assets.length} reviewed image variants.`)
}
for (const gallery of Object.values(galleries)) for (const photo of gallery.photos) photo.src = urls.get(photo.src)
await writeFile(join(directory, 'galleries.published.json'), JSON.stringify(galleries, null, 2) + '\n')
console.log(`Published and verified ${assets.length} image variants. Public gallery manifest is ready.`)
