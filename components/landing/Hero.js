// Phase 33 — Hero block for QR landing pages.
//
// Renders full-bleed hero image (or video bg) with band name, tagline, and
// brand-color accent. Mobile-first since QR scans almost always come from
// phones.

'use client'

import Image from 'next/image'

export default function Hero({ name, shortName, tagline, heroImage, heroVideoUrl, primaryColor }) {
  const accent = primaryColor || '#D4A017'
  return (
    <header
      style={{
        position: 'relative',
        minHeight: '60vh',
        maxHeight: '600px',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        background: '#0a0a0a',
      }}
    >
      {heroVideoUrl ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
        >
          <source src={heroVideoUrl} />
        </video>
      ) : heroImage ? (
        <Image
          src={heroImage}
          alt={name}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', opacity: 0.55 }}
        />
      ) : null}

      {/* Gradient overlay for text legibility */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      {/* Color accent bar */}
      <div
        aria-hidden
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: accent }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          padding: '40px 24px 32px',
          maxWidth: '640px',
          margin: '0 auto',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        {shortName && (
          <div
            style={{
              fontFamily: 'var(--ff-label, sans-serif)',
              fontSize: '12px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: accent,
              marginBottom: '12px',
            }}
          >
            {shortName}
          </div>
        )}
        <h1
          style={{
            fontFamily: 'var(--ff-display, sans-serif)',
            fontSize: 'clamp(48px, 12vw, 80px)',
            lineHeight: 0.95,
            letterSpacing: '0.02em',
            margin: '0 0 16px',
            fontWeight: 700,
          }}
        >
          {name}
        </h1>
        {tagline && (
          <p
            style={{
              fontFamily: 'var(--ff-body, sans-serif)',
              fontSize: 'clamp(16px, 4vw, 20px)',
              lineHeight: 1.4,
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
              maxWidth: '480px',
              marginInline: 'auto',
            }}
          >
            {tagline}
          </p>
        )}
      </div>
    </header>
  )
}
