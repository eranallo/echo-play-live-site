// Phase 10D: Dynamic Open Graph image per musician.
//
// Next.js App Router auto-detects this file and uses it for the route's
// og:image. When someone shares a musician page on Slack/iMessage/Twitter,
// they get a branded card with photo + name + bands instead of a generic
// site preview.
//
// Uses the Edge runtime + next/og ImageResponse. Bebas Neue is fetched
// once per build/request from Google Fonts for brand consistency.

import { ImageResponse } from 'next/og'
import { getMusician } from '@/lib/musicians'

export const runtime = 'edge'
export const alt = 'Echo Play Live musician'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Cache the generated image for 12 hours. Member content (bio, role) changes
// rarely enough that this is safe; Vercel re-generates on the next request
// after the window expires.
export const revalidate = 43200

async function loadBebasNeue() {
  // Fetch the Bebas Neue font CSS, then the actual font file URL.
  const cssRes = await fetch(
    'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
    { headers: { 'User-Agent': 'Mozilla/5.0' } } // forces TTF/WOFF response
  )
  const css = await cssRes.text()
  const m = css.match(/src:\s*url\(([^)]+)\)\s*format/)
  if (!m) throw new Error('Could not extract Bebas Neue font URL')
  const fontRes = await fetch(m[1])
  return await fontRes.arrayBuffer()
}

export default async function OpengraphImage({ params }) {
  const { slug } = await params
  const m = await getMusician(slug)

  // Fallback if the musician slug isn't found — return a neutral EPL card.
  const name = m?.name || 'Echo Play Live'
  const instruments = m?.instruments?.join(' · ') || 'Musician'
  const bands = m?.bands || []
  const photoUrl = m?.photo?.url || null
  const accent = bands[0]?.color || '#D4A017'

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  let fontData
  try {
    fontData = await loadBebasNeue()
  } catch {
    fontData = null
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#080808',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Left half: photo or initials block */}
        <div
          style={{
            width: '500px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${accent}22, transparent 60%), #0a0a0a`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              width="500"
              height="630"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', display: 'flex' }}
              alt=""
            />
          ) : (
            <div
              style={{
                fontFamily: 'Bebas Neue',
                fontSize: '260px',
                letterSpacing: '0.02em',
                color: `${accent}88`,
                lineHeight: 1,
                display: 'flex',
              }}
            >
              {initials}
            </div>
          )}
          {/* Bottom accent line */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '6px',
              background: accent,
              display: 'flex',
            }}
          />
        </div>

        {/* Right half: identity */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 72px',
            background: '#080808',
          }}
        >
          {/* EPL wordmark */}
          <div
            style={{
              fontFamily: 'Bebas Neue',
              fontSize: '24px',
              letterSpacing: '0.18em',
              color: '#D4A017',
              display: 'flex',
            }}
          >
            ECHO PLAY LIVE
          </div>

          {/* Name + instruments + bands */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontFamily: 'Bebas Neue',
                fontSize: '116px',
                letterSpacing: '0.01em',
                lineHeight: 0.92,
                color: '#ffffff',
                display: 'flex',
              }}
            >
              {name}
            </div>
            <div
              style={{
                marginTop: '20px',
                fontFamily: 'Bebas Neue',
                fontSize: '24px',
                letterSpacing: '0.22em',
                color: accent,
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              {instruments}
            </div>
            {bands.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '32px' }}>
                {bands.map(b => (
                  <div
                    key={b.slug}
                    style={{
                      fontFamily: 'Bebas Neue',
                      fontSize: '20px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: b.color,
                      background: `${b.color}1c`,
                      border: `1px solid ${b.color}55`,
                      padding: '10px 18px',
                      display: 'flex',
                    }}
                  >
                    {b.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Site URL footer */}
          <div
            style={{
              fontFamily: 'Bebas Neue',
              fontSize: '20px',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.35)',
              display: 'flex',
            }}
          >
            echoplay.live/musicians/{m?.slug || ''}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: 'Bebas Neue',
              data: fontData,
              weight: 400,
              style: 'normal',
            },
          ]
        : undefined,
    }
  )
}
