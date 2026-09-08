import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { createHash } from 'node:crypto'
import sharp from 'sharp'

// A reviewed, local selection is the input; never crawl or publish an entire Drive folder.
const [input, output] = process.argv.slice(2)
if (!input || !output) throw new Error('Usage: node scripts/prepare-band-gallery.mjs selection.json output-directory')
const selection = JSON.parse(await readFile(input, 'utf8'))
const galleries = {}, provenance = [], assets = []
const allowed = new Set(['elite', 'jambi', 'so-long-goodnight', 'the-dick-beldings'])
const xml = text => String(text).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]))
const digest = bytes => createHash('sha256').update(bytes).digest('hex')

for (const item of selection) {
  if (!allowed.has(item.slug) || !item.alt || !item.album || !item.path) throw new Error('Incomplete photo selection')
  const bytes = await readFile(resolve(item.path))
  const meta = await sharp(bytes).metadata()
  if (!['jpeg', 'png', 'webp'].includes(meta.format)) throw new Error('Only reviewed still photographs are supported')
  const sourceHash = digest(bytes)
  const id = `${item.slug}-${sourceHash.slice(0, 12)}`
  const copyright = item.copyright || (item.credit ? `Photo: ${item.credit}` : '')
  const xmp = `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:creator><rdf:Seq><rdf:li>${xml(item.credit || '')}</rdf:li></rdf:Seq></dc:creator><dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${xml(copyright)}</rdf:li></rdf:Alt></dc:rights></rdf:Description></rdf:RDF></x:xmpmeta>`
  let full
  for (const width of [480, 960, 1920]) {
    const result = await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).withXmp(xmp).webp({ quality: 82, effort: 5 }).toBuffer({ resolveWithObject: true })
    const pathname = `website-media/20260908/${item.slug}/${sourceHash.slice(0, 12)}-${width}.webp`
    const destination = join(output, pathname)
    await mkdir(dirname(destination), { recursive: true })
    await writeFile(destination, result.data)
    assets.push({ pathname, bytes: result.data.length, sha256: digest(result.data) })
    if (width === 1920) full = { src: `/${pathname}`, width: result.info.width, height: result.info.height }
  }
  const gallery = galleries[item.slug] ||= { updated: '2026-09-08', photos: [] }
  if (gallery.photos.some(p => p.id === id)) throw new Error(`Duplicate source photo: ${id}`)
  gallery.photos.push({ id, ...full, alt: item.alt, album: item.album, credit: item.credit || '', ...(item.position ? { position: item.position } : {}) })
  provenance.push({ id, ...item, sourceHash, originalBytes: bytes.length })
}
await mkdir(output, { recursive: true })
await writeFile(join(output, 'galleries.json'), JSON.stringify(galleries, null, 2) + '\n')
await writeFile(join(output, 'assets.json'), JSON.stringify(assets, null, 2) + '\n')
await writeFile(join(output, 'source-records.json'), JSON.stringify(provenance, null, 2) + '\n')
console.log(JSON.stringify({ photos: selection.length, variants: assets.length, originalBytes: provenance.reduce((n, p) => n + p.originalBytes, 0), webBytes: assets.reduce((n, a) => n + a.bytes, 0) }))
