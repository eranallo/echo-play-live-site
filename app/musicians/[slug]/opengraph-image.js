import { ImageResponse } from 'next/og'
import { getMusician } from '@/lib/musicians'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { sharePortrait } from '@/lib/public/share-portrait.mjs'

export const runtime = 'nodejs'
export const alt = 'Echo Play Live musician'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const revalidate = 43200

export default async function OpengraphImage({ params }) {
  const { slug } = await params
  const [member, font, bodyFont, logo] = await Promise.all([
    getMusician(slug),
    readFile(path.join(process.cwd(), 'app/fonts/CabinetGrotesk-Bold.ttf')),
    readFile(path.join(process.cwd(), 'app/fonts/DMSans-Regular.ttf')),
    readFile(path.join(process.cwd(), 'public/brand/epl-seal-white.png')),
  ])
  const name = member?.name || 'Echo Play Live'
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`
  const portrait = await sharePortrait(member?.photo)
  const render = (photoSrc) => new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#11191D', color: '#F5F0E8', fontFamily: 'Cabinet Grotesk', fontWeight: 700 }}>
      <div style={{ width: 440, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#202C32' }}>
        {photoSrc ? (
          <img src={photoSrc} width={440} height={630} style={{ objectFit: 'cover', objectPosition: 'center 25%' }} alt="" />
        ) : (
          <img src={logoSrc} width={280} height={280} alt="" />
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '44px 50px', fontFamily: 'DM Sans', fontWeight: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <img src={logoSrc} width={84} height={84} alt="" />
          <div style={{ display: 'flex', fontSize: 18, letterSpacing: '0.06em' }}>THE PEOPLE BEHIND THE MUSIC</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', fontFamily: 'Cabinet Grotesk', fontWeight: 700, fontSize: name.length > 24 ? 48 : 66, lineHeight: 1.08, letterSpacing: '-0.02em' }}>{name}</div>
          <div style={{ display: 'flex', fontSize: 22, lineHeight: 1.4, color: '#B6B9B8' }}>{member?.instruments?.join(' · ') || 'Fort Worth, Texas'}</div>
          <div style={{ display: 'flex', fontSize: 18, lineHeight: 1.5, color: '#B6B9B8' }}>{member?.bands?.map(b => b.name).join(' / ') || 'Live music. Great people.'}</div>
        </div>
        <div style={{ display: 'flex', fontSize: 18, color: '#EFC47C' }}>echoplay.live</div>
      </div>
    </div>,
    { ...size, fonts: [
      { name: 'Cabinet Grotesk', data: font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength), weight: 700, style: 'normal' },
      { name: 'DM Sans', data: bodyFont.buffer.slice(bodyFont.byteOffset, bodyFont.byteOffset + bodyFont.byteLength), weight: 400, style: 'normal' },
    ] },
  )
  try {
    const image = render(portrait)
    return new Response(await image.arrayBuffer(), { headers: image.headers })
  } catch {
    // An expired or unsupported portrait must not break a profile's share card.
    const fallback = render(null)
    return new Response(await fallback.arrayBuffer(), { headers: fallback.headers })
  }
}
