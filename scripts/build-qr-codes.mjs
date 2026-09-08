import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'
import { linkHubs } from '../lib/public/link-hubs.mjs'
import { qrPlacements, hubQrUrl } from '../lib/public/qr-placements.mjs'
const target = fileURLToPath(new URL('../public/qr/', import.meta.url))
await mkdir(target, { recursive: true })
for (const hub of linkHubs) {
 for (const [placement] of qrPlacements) {
  const url = hubQrUrl(hub.path, hub.slug, placement)
  const basename = `${hub.slug}${placement === 'standard' ? '' : `-${placement}`}`
  const options = {
    margin: 4,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000', light: '#ffffff' },
  }
  await writeFile(
    `${target}${basename}.svg`,
    await QRCode.toString(url, { ...options, type: 'svg' }),
  )
  await QRCode.toFile(`${target}${basename}.png`, url, { ...options, width: 1200, type: 'png' })
  console.log(`${hub.name}: ${url}`)
 }
}
