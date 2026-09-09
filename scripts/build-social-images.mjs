import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { createElement as h } from 'react'
import { ImageResponse } from 'next/og.js'
import { bandKits } from '../lib/press/kit-content.mjs'

const font = await readFile('app/fonts/CabinetGrotesk-Bold.ttf')
const bodyFont = await readFile('app/fonts/DMSans-Regular.ttf')
const fontOptions = [{ name: 'Cabinet Grotesk', data: font, weight: 700, style: 'normal' }, { name: 'DM Sans', data: bodyFont, weight: 400, style: 'normal' }]
const data = async (file, type = 'png') => `data:image/${type};base64,${(await readFile(file)).toString('base64')}`
await mkdir('public/social', { recursive: true })
for (const kit of bandKits) {
  const [photo, logo, seal] = await Promise.all([
    data(`public/press/bands/${kit.slug}/cover.jpg`, 'jpeg'),
    data(`public/press/bands/${kit.slug}/logo.png`),
    data('public/brand/epl-seal-white.png'),
  ])
  const image = new ImageResponse(h('div', { style: { width: '100%', height: '100%', display: 'flex', background: '#11191D', color: '#F5F0E8', fontFamily: 'Cabinet Grotesk', fontWeight: 700, position: 'relative' } },
    h('img', { src: photo, width: 1200, height: 630, style: { position: 'absolute', objectFit: 'cover', opacity: 0.3 } }),
    h('div', { style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 52, width: '100%' } },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, h('span', { style: { fontSize: 19, letterSpacing: '0.04em' } }, 'ECHO PLAY LIVE · FORT WORTH, TEXAS'), h('img', { src: seal, width: 75, height: 75 })),
      h('div', { style: { display: 'flex', alignItems: 'center', height: 250 } }, h('img', { src: logo, width: kit.logoStyle === 'seal' ? 250 : 700, height: 250, style: { objectFit: 'contain', objectPosition: 'left center' } })),
      h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 22, fontFamily: 'DM Sans', fontWeight: 400 } }, h('span', {}, kit.label), h('span', { style: { color: '#EFC47C' } }, 'echoplay.live')),
    ),
  ), { width: 1200, height: 630, fonts: fontOptions })
  await writeFile(`public/social/${kit.slug}.png`, Buffer.from(await image.arrayBuffer()))
  console.log(`Created ${kit.slug} share image`)
}

// Preserve the original company-seal composition in the selected background color.
const companyImage = new ImageResponse(h('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#11191D' } }, h('img', { src: await data('public/brand/epl-seal-white.png'), width: 440, height: 440 })), { width: 1200, height: 630 })
await writeFile('public/opengraph-image.png', Buffer.from(await companyImage.arrayBuffer()))
console.log('Created company share image')
