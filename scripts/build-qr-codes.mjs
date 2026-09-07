import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'
import { linkHubs } from '../lib/public/link-hubs.mjs'
const target = fileURLToPath(new URL('../public/qr/', import.meta.url))
await mkdir(target, { recursive: true })
for (const hub of linkHubs) {
  const url = `https://echoplay.live${hub.path}`
  const options = {
    margin: 4,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000', light: '#ffffff' },
  }
  await writeFile(
    `${target}${hub.slug}.svg`,
    await QRCode.toString(url, { ...options, type: 'svg' }),
  )
  await QRCode.toFile(`${target}${hub.slug}.png`, url, { ...options, width: 1200, type: 'png' })
  console.log(`${hub.name}: ${url}`)
}
