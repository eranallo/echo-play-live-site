'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function BandLineup({ band, lineup }) {
  return (
          <section style={{
            padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div className="fade-up-in" style={{ width: '32px', height: '3px', background: band.color, marginBottom: '24px' }} />
              <div className="section-label fade-up-in" style={{ color: band.color, marginBottom: '12px', animationDelay: '60ms' }}>
                The Lineup
              </div>
              <h2 className="fade-up-in" style={{
                fontFamily: 'Bebas Neue, cursive',
                fontSize: 'clamp(32px, 5vw, 60px)',
                letterSpacing: '0.02em', lineHeight: 0.9,
                marginBottom: '12px',
                animationDelay: '120ms',
              }}>Meet The Band</h2>
              <p className="fade-up-in" style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: 'clamp(15px, 1.6vw, 17px)',
                lineHeight: 1.7, fontWeight: 300,
                color: 'rgba(255,255,255,0.5)',
                maxWidth: '600px',
                marginBottom: '40px',
                animationDelay: '200ms',
              }}>
                The musicians who play {band.name}. Every show, the same standard.
              </p>

              <div className="band-lineup-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 'clamp(16px, 2vw, 24px)',
              }}>
                {lineup.map((m, i) => {
                  const initials = m.name
                    .split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
                  return (
                    <Link
                      key={m.slug}
                      href={`/musicians/${m.slug}`}
                      className="roster-card fade-up-in"
                      style={{
                        display: 'block',
                        textDecoration: 'none',
                        background: 'var(--c-surface)',
                        border: '1px solid var(--c-border)',
                        position: 'relative',
                        overflow: 'hidden',
                        animationDelay: `${280 + Math.min(i * 70, 500)}ms`,
                        '--accent': band.color,
                      }}
                    >
                      <div className="roster-card-photo-wrap" style={{
                        aspectRatio: '4 / 5',
                        background: `linear-gradient(180deg, ${band.color}1A 0%, var(--c-surface) 100%)`,
                      }}>
                        {m.photo?.thumb ? (
                          <Image
                            src={m.photo.thumb}
                            alt={m.name}
                            fill
                            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
                            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        ) : (
                          <span style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Bebas Neue, cursive',
                            fontSize: 'clamp(64px, 10vw, 100px)',
                            letterSpacing: '0.02em',
                            color: `${band.color}55`,
                            lineHeight: 1,
                          }}>{initials}</span>
                        )}
                        <div className="roster-card-accent" />
                      </div>
                      <div className="roster-card-body" style={{ padding: 'var(--s-4)' }}>
                        <div className="roster-card-name" style={{
                          fontFamily: 'Bebas Neue, cursive',
                          fontSize: 'clamp(20px, 2vw, 24px)',
                          letterSpacing: '0.02em',
                          color: '#fff',
                          lineHeight: 1.05,
                          marginBottom: '6px',
                        }}>{m.name}</div>
                        {m.instruments.length > 0 && (
                          <div style={{
                            fontFamily: 'Barlow Condensed, sans-serif',
                            fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em',
                            textTransform: 'uppercase', color: band.color,
                          }}>
                            {m.instruments.join(' · ')}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>

              <div className="fade-up-in" style={{
                marginTop: 'clamp(32px, 4vw, 48px)',
                textAlign: 'center',
                animationDelay: '700ms',
              }}>
                <Link href="/musicians" style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: band.color,
                  textDecoration: 'none',
                  borderBottom: `1px solid ${band.color}`,
                  paddingBottom: '3px',
                  transition: 'opacity 0.2s ease',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >See the full Echo Play Live roster →</Link>
              </div>
            </div>
          </section>
  )
}
