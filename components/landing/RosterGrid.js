// Phase 33 — RosterGrid for the EPL Hub QR landing.
//
// Renders a grid of band cards, each linking to that band's QR landing page
// at the root slug (e.g., /the-dick-beldings).

'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function RosterGrid({ bands }) {
  if (!bands || bands.length === 0) return null

  return (
    <section
      style={{
        padding: '32px 20px',
        maxWidth: '720px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--ff-label, sans-serif)',
          fontSize: '11px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        Our Bands
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {bands.map(band => (
          <Link
            key={band.slug}
            href={`/${band.slug}`}
            style={{
              display: 'block',
              position: 'relative',
              aspectRatio: '4/5',
              background: '#0a0a0a',
              border: `1.5px solid ${band.color}40`,
              borderRadius: '4px',
              overflow: 'hidden',
              textDecoration: 'none',
              color: '#fff',
              transition: 'border-color 150ms ease, transform 200ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = band.color
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = `${band.color}40`
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {band.heroImage && (
              <Image
                src={band.heroImage}
                alt={band.name}
                fill
                sizes="(max-width: 640px) 100vw, 240px"
                style={{ objectFit: 'cover', opacity: 0.55 }}
              />
            )}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px 16px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--ff-label, sans-serif)',
                  fontSize: '10px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: band.color,
                  marginBottom: '6px',
                }}
              >
                {band.shortName || ''}
              </div>
              <div
                style={{
                  fontFamily: 'var(--ff-display, sans-serif)',
                  fontSize: 'clamp(20px, 4vw, 26px)',
                  lineHeight: 1,
                  letterSpacing: '0.02em',
                  marginBottom: band.tagline ? '6px' : 0,
                }}
              >
                {band.name}
              </div>
              {band.tagline && (
                <div
                  style={{
                    fontFamily: 'var(--ff-body, sans-serif)',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.3,
                  }}
                >
                  {band.tagline}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
