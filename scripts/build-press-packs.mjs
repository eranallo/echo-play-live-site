import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { crc32 } from 'node:zlib'
import { bandKits } from '../lib/press/kit-content.mjs'

// Stored ZIP entries: PDFs/JPEGs/PNGs are already compressed. Standard headers
// keep this build independent of a system zip command or an extra runtime package.
function archive(entries) {
  const files = [], directory = []
  let offset = 0
  for (const [name, bytes] of entries) {
    const filename = Buffer.from(name), checksum = crc32(bytes)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(0x5d28, 12)
    local.writeUInt32LE(checksum, 14); local.writeUInt32LE(bytes.length, 18)
    local.writeUInt32LE(bytes.length, 22); local.writeUInt16LE(filename.length, 26)
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(0x5d28, 14)
    central.writeUInt32LE(checksum, 16); central.writeUInt32LE(bytes.length, 20)
    central.writeUInt32LE(bytes.length, 24); central.writeUInt16LE(filename.length, 28)
    central.writeUInt32LE(offset, 42)
    files.push(local, filename, bytes); directory.push(central, filename)
    offset += local.length + filename.length + bytes.length
  }
  const end = Buffer.alloc(22), central = Buffer.concat(directory)
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(central.length, 12); end.writeUInt32LE(offset, 16)
  return Buffer.concat([...files, central, end])
}
const publicRoot = new URL('../public/', import.meta.url)
await mkdir(new URL('press/packs/', publicRoot), { recursive: true })
for (const kit of bandKits) {
  const entries = []
  for (const [source, name] of [[`press/kits/${kit.slug}.pdf`, 'band-kit.pdf'], ...['logo.png', 'cover.jpg', 'detail.jpg', 'stage.jpg'].map(file => [`press/bands/${kit.slug}/${file}`, file])]) entries.push([`${kit.slug}/${name}`, await readFile(new URL(source, publicRoot))])
  entries.push([`${kit.slug}/bio.txt`, Buffer.from(`${kit.name}\n${kit.label}\n\n${kit.bio}\n\nBooking: ${kit.bookingEmail}\nhttps://echoplay.live/press/${kit.slug}\n`)])
  entries.push([`${kit.slug}/READ-ME.txt`, Buffer.from(`${kit.name} — Echo Play Live press materials\nSeptember 2026\n\nIncludes the band kit, biography, logo and three selected images.\nKeep logos proportional and unaltered. Contact ${kit.bookingEmail} for photographer credits, higher-resolution photos, current stage plots and input lists.\n\nCurrent materials: https://echoplay.live/press/${kit.slug}\n`)])
  await writeFile(new URL(`press/packs/${kit.slug}.zip`, publicRoot), archive(entries))
  console.log(`Built ${kit.slug} press pack (${entries.length} files)`)
}
