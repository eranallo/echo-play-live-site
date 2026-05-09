// /musicians — roster grid.
//
// Server Component. Fetches active members from Airtable at build time
// (with ISR revalidation in lib/musicians.js).
//
// Phase 10A foundation. Bios and detailed copy fill in via Phase 10B as
// Evan completes member interviews.

import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { getMusicians } from '@/lib/musicians'

export const revalidate = 1800

export default async function MusiciansPage() {
  const musicians = await getMusicians()

  return (
    <>
      <Nav />
      <main style={{ background: 'var(--c-bg)', minHeight: '100vh' }}>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(120px, 16vw, 200px) var(--gutter-fluid) clamp(60px, 8vw, 100px)',
          borderBottom: '1px solid var(--c-border)',
          position: 'relative',
        }}>
          <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
            <div style={{
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label-s)',
              fontWeight: 600,
              letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase',
              color: 'var(--c-epl)',
              marginBottom: 'var(--s-4)',
            }}>
              The Musicians of Echo Play Live
            </div>
            <h1 style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(56px, 11vw, 148px)',
              letterSpacing: '0.01em',
              lineHeight: 0.88,
              color: 'var(--c-text)',
              marginBottom: 'var(--s-5)',
            }}>
              ROSTER
            </h1>
            <p style={{
              fontFamily: 'var(--ff-body)',
              fontSize: 'clamp(16px, 1.8vw, 19px)',
              lineHeight: 1.7,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '720px',
            }}>
              The players behind every Echo Play Live show. Some are mainstays of one band. Some move across multiple lineups depending on the night. All of them are the reason these shows feel the way they do.
            </p>
          </div>
        </section>

        {/* ── ROSTER GRID ──────────────────────────────────── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)',
        }}>
          <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
            {musicians.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="roster-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 'clamp(20px, 2.5vw, 32px)',
              }}>
                {musicians.map(m => (
                  <MusicianCard key={m.id} musician={m} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── FOOTER CTA ───────────────────────────────────── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)',
          borderTop: '1px solid var(--c-border)',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(36px, 6vw, 64px)',
              letterSpacing: '0.01em',
              lineHeight: 0.95,
              color: 'var(--c-text)',
              marginBottom: 'var(--s-5)',
            }}>
              Want to book one of these bands?
            </h2>
            <Link href="/contact" style={{
              display: 'inline-block',
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label)',
              fontWeight: 700,
              letterSpacing: 'var(--ls-label-tight)',
              textTransform: 'uppercase',
              color: 'var(--c-bg)',
              background: 'var(--c-epl)',
              padding: '16px 36px',
              textDecoration: 'none',
            }}>
              Start a booking inquiry →
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

// ────────────────────────────────────────────────────────────
// Card

function MusicianCard({ musician }) {
  const initials = musician.name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  // Pick the primary band's color as the card accent. Fallback to EPL gold.
  const accent = musician.bands[0]?.color || 'var(--c-epl)'

  return (
    <Link
      href={`/musicians/${musician.slug}`}
      className="roster-card"
      style={{
        display: 'block',
        textDecoration: 'none',
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Photo / placeholder */}
      <div style={{
        position: 'relative',
        aspectRatio: '4 / 5',
        background: `linear-gradient(180deg, ${accent}1A 0%, var(--c-surface) 100%)`,
        overflow: 'hidden',
      }}>
        {musician.photo?.thumb ? (
          <Image
            src={musician.photo.thumb}
            alt={musician.name}
            fill
            unoptimized
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--ff-display)',
            fontSize: 'clamp(72px, 12vw, 128px)',
            letterSpacing: '0.02em',
            color: `${accent}55`,
            lineHeight: 1,
          }}>
            {initials}
          </div>
        )}
        {/* Bottom-edge accent */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0, height: '3px',
          background: accent,
        }} />
      </div>

      {/* Body */}
      <div style={{ padding: 'var(--s-5)' }}>
        <div style={{
          fontFamily: 'var(--ff-display)',
          fontSize: 'clamp(22px, 2.4vw, 28px)',
          letterSpacing: '0.02em',
          color: 'var(--c-text)',
          lineHeight: 1.05,
          marginBottom: 'var(--s-2)',
        }}>
          {musician.name}
        </div>

        {/* Instruments */}
        {musician.instruments.length > 0 && (
          <div style={{
            fontFamily: 'var(--ff-label)',
            fontSize: 'var(--t-label-s)',
            fontWeight: 600,
            letterSpacing: 'var(--ls-tag)',
            textTransform: 'uppercase',
            color: accent,
            marginBottom: 'var(--s-3)',
          }}>
            {musician.instruments.join(' · ')}
          </div>
        )}

        {/* Band chips */}
        {musician.bands.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-1)' }}>
            {musician.bands.map(b => (
              <span
                key={b.slug}
                style={{
                  fontFamily: 'var(--ff-label)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: b.color,
                  background: `${b.color}14`,
                  border: `1px solid ${b.color}30`,
                  padding: '4px 10px',
                  lineHeight: 1.2,
                }}
              >
                {b.shortName}
              </span>
            ))}
            {musician.subBands.map(b => (
              <span
                key={`sub-${b.slug}`}
                title={`Subs for ${b.name}`}
                style={{
                  fontFamily: 'var(--ff-label)',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.45)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px dashed rgba(255,255,255,0.15)',
                  padding: '4px 10px',
                  lineHeight: 1.2,
                }}
              >
                {b.shortName} sub
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div style={{
      padding: 'clamp(40px, 6vw, 80px)',
      border: '1px dashed var(--c-border-strong)',
      textAlign: 'center',
    }}>
      <p style={{
        fontFamily: 'var(--ff-body)',
        fontSize: 'var(--t-body-l)',
        color: 'rgba(255,255,255,0.55)',
        margin: 0,
      }}>
        Roster is loading. Check back in a moment.
      </p>
    </div>
  )
}
