'use client'
import Image from 'next/image'
import Link from 'next/link'
import MagneticButton from '@/components/MagneticButton'

export default function BandHero({ band, heroImg, heroParallaxRef, allowHeroVideo }) {
const SocialIcon = ({ platform }) => {
  const icons = {
    facebook: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
    instagram: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
      </svg>
    ),
    youtube: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon fill="#080808" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
    tiktok: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
      </svg>
    ),
  }
  return icons[platform] || null
}

  return (
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'relative',
          overflow: 'hidden',
          padding: '0 0 72px',
        }}>
          {/* Hero image with subtle parallax (Phase 12). On mobile + reduced-
              motion, useParallaxY no-ops so the image stays anchored. */}
          {heroImg ? (
            <div ref={heroParallaxRef} style={{ position: 'absolute', inset: 0, zIndex: 0, willChange: 'transform' }}>
              <Image
                src={heroImg.url}
                alt={`${band.name} live`}
                fill
                style={{ objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center 20%' }}
                priority
                sizes="100vw"
              />
              {/* Phase 47: hero video layer. Sits over the Image (which acts
                  as poster) so the still always paints first. Hidden for
                  prefers-reduced-motion users via `allowHeroVideo`. If the
                  browser blocks autoplay, the muted Image underneath remains
                  visible. */}
              {band.heroVideo && allowHeroVideo && (
                <video
                  src={band.heroVideo}
                  poster={heroImg.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: band.heroObjectPosition || 'center 20%',
                    pointerEvents: 'none',
                  }}
                />
              )}
              {/* Gradient overlay: clear at top, dark at bottom for text legibility */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(to bottom,
                  rgba(8,8,8,0.15) 0%,
                  rgba(8,8,8,0.05) 25%,
                  rgba(8,8,8,0.4) 55%,
                  rgba(8,8,8,0.92) 80%,
                  rgba(8,8,8,1) 100%)`,
              }} />
              {/* Subtle band color accent at very bottom */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
                background: `linear-gradient(to right, ${band.color}80, transparent 60%)`,
              }} />
            </div>
          ) : (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 0,
              background: `radial-gradient(ellipse 70% 70% at 65% 30%, ${band.color}15 0%, transparent 65%), #080808`,
            }} />
          )}

          {/* Content */}
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 var(--gutter-fluid)', position: 'relative', zIndex: 2, width: '100%' }}>
            {/* Breadcrumb */}
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
              marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Echo Play Live</Link>
              <span style={{ opacity: 0.4 }}>→</span>
              <span style={{ color: band.color }}>{band.name}</span>
            </div>

            {/* Genre tags */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {band.genre.map(g => (
                <span key={g} style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: band.color,
                  background: `${band.color}18`, padding: '5px 12px',
                  border: `1px solid ${band.color}35`,
                }}>{g}</span>
              ))}
              <span style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.05)', padding: '5px 12px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>Fort Worth, TX</span>
            </div>

            {/* Band name */}
            <h1 style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 'clamp(60px, 13vw, 172px)',
              letterSpacing: '0.01em', lineHeight: 0.85,
              color: '#fff', marginBottom: '14px',
              textShadow: heroImg ? '0 2px 40px rgba(0,0,0,0.7)' : 'none',
            }}>{band.name}</h1>

            {!band.hideTagline && (
              <p style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: 'clamp(15px, 2.2vw, 20px)',
                fontStyle: 'italic', fontWeight: 300,
                color: band.color, letterSpacing: '0.02em', marginBottom: '28px',
              }}>{band.tagline}</p>
            )}

            {/* Social links + booking CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {Object.entries(band.social).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
                    background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.12)',
                    padding: '13px 16px', textDecoration: 'none', backdropFilter: 'blur(8px)',
                    minHeight: '44px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = band.color
                    e.currentTarget.style.borderColor = `${band.color}45`
                    e.currentTarget.style.background = `${band.color}12`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                    e.currentTarget.style.background = 'rgba(0,0,0,0.45)'
                  }}
                >
                  <SocialIcon platform={platform} />{platform}
                </a>
              ))}
              <MagneticButton>
                <Link href="/contact" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: '#080808',
                  background: band.color, padding: '9px 20px',
                  textDecoration: 'none', transition: 'opacity 0.2s ease',
                  backdropFilter: 'blur(8px)',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >Book This Band →</Link>
              </MagneticButton>
            </div>
          </div>
        </section>
  )
}
