import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { createElement as h } from 'react'
import { ImageResponse } from 'next/og.js'
import { bandKits } from '../lib/press/kit-content.mjs'

const font = await readFile('app/fonts/Gotham-Bold.ttf')
const data = async (file, type = 'png') => `data:image/${type};base64,${(await readFile(file)).toString('base64')}`
await mkdir('public/social', { recursive: true })
for (const kit of bandKits) {
  const [photo, logo, seal] = await Promise.all([
    data(`public/press/bands/${kit.slug}/cover.jpg`, 'jpeg'),
    data(`public/press/bands/${kit.slug}/logo.png`),
    data('public/brand/epl-seal-white.png'),
  ])
  const image = new ImageResponse(h('div', { style: { width: '100%', height: '100%', display: 'flex', background: '#080809', color: '#fff', fontFamily: 'Gotham', position: 'relative' } },
    h('img', { src: photo, width: 1200, height: 630, style: { position: 'absolute', objectFit: 'cover', opacity: 0.3 } }),
    h('div', { style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 52, width: '100%' } },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, h('span', { style: { fontSize: 19, letterSpacing: '0.04em' } }, 'ECHO PLAY LIVE · FORT WORTH, TEXAS'), h('img', { src: seal, width: 75, height: 75 })),
      h('div', { style: { display: 'flex', alignItems: 'center', height: 250 } }, h('img', { src: logo, width: kit.logoStyle === 'seal' ? 250 : 700, height: 250, style: { objectFit: 'contain', objectPosition: 'left center' } })),
      h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 22 } }, h('span', {}, kit.label), h('span', {}, 'echoplay.live')),
    ),
  ), { width: 1200, height: 630, fonts: [{ name: 'Gotham', data: font, weight: 700, style: 'normal' }] })
  await writeFile(`public/social/${kit.slug}.png`, Buffer.from(await image.arrayBuffer()))
  console.log(`Created ${kit.slug} share image`)
}
