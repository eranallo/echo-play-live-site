// Phase 42 — Refined hero for QR landing pages.
//
// Major changes from v1:
// - Much bigger band-name typography (clamp 56 → 130px)
// - Band-color tinted gradient overlay (was pure black)
// - Scroll-reveal entrance animations using existing .reveal classes
// - Accent line under band name in band color
// - Better shortName pill treatment

'use client'

import Image from 'next/image'

export default function Hero({ name, shortName, tagline, heroImage, heroVideoUrl, primaryColor, secondaryColor }) {
  const accent = primaryColor || '#D4A017'
  const accentDark = secondaryColor || '#0a0a0a'

  return (
    <header
      style={{
        position: 'relative',
        minHeight: '70vh',
        maxHeight: '720px',
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
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
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
          style={{ objectFit: 'cover', opacity: 0.65 }}
        />
      ) : null}

      {/* Layered overlays for legibility + band-color tint */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 100%)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 100%, ${accent}30 0%, transparent 60%)`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      {/* Top accent bar */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(to right, ${accent}, ${accentDark}, ${accent})`,
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          padding: '60px 24px 56px',
          maxWidth: '720px',
          margin: '0 auto',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        {shortName && (
          <div
            className="reveal-up"
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              fontFamily: 'var(--ff-label, sans-serif)',
              fontSize: '11px',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: accent,
              background: `${accent}15`,
              border: `1px solid ${accent}50`,
              marginBottom: '20px',
            }}
          >
            {shortName}
          </div>
        )}
        <h1
          className="reveal-up"
          style={{
            fontFamily: 'var(--ff-display, "Bebas Neue", sans-serif)',
            fontSize: 'clamp(56px, 18vw, 130px)',
            lineHeight: 0.9,
            letterSpacing: '0.02em',
            margin: '0',
            fontWeight: 700,
            textShadow: '0 2px 30px rgba(0,0,0,0.5)',
          }}
        >
          {name}
        </h1>
        {/* Accent line under band name */}
        <div
          aria-hidden
          className="reveal-up"
          style={{
            width: '64px',
            height: '3px',
            background: accent,
            margin: '24px auto 20px',
            boxShadow: `0 0 16px ${accent}80`,
          }}
        />
        {tagline && (
          <p
            className="reveal-up"
            style={{
              fontFamily: 'var(--ff-body, sans-serif)',
              fontSize: 'clamp(17px, 4vw, 22px)',
              lineHeight: 1.45,
              color: 'rgba(255,255,255,0.92)',
              fontStyle: 'italic',
              margin: 0,
              maxWidth: '520px',
              marginInline: 'auto',
              fontWeight: 300,
            }}
          >
            {tagline}
          </p>
        )}
      </div>
    </header>
  )
}
