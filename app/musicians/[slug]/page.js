// /musicians/[slug] — individual musician detail page.
//
// Server Component. Fetches the member by slug from Airtable.
//
// Phase 10A foundation: photo, name, instruments, bands, sub-bands, plus a
// bio area that reads `bioLong` if present and falls back to a quiet
// placeholder. As Evan adds Bio Long values in Airtable, the placeholder
// disappears automatically.

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import RevealOnView from '@/components/RevealOnView'
import ScrollToTopOnMount from '@/components/ScrollToTopOnMount'
import { getMusician, getMusicians } from '@/lib/musicians'

export const revalidate = 1800

const SITE_URL = 'https://echoplay.live'

export default async function MusicianPage({ params }) {
  const m = await getMusician(params.slug)
  if (!m) notFound()

  // Phase 10D: Person JSON-LD for rich Google snippets when someone searches
  // a musician by name. Image points to the auto-generated OG image (stable
  // URL, doesn't expire like Airtable signed URLs).
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: m.name,
    url: `${SITE_URL}/musicians/${m.slug}`,
    image: `${SITE_URL}/musicians/${m.slug}/opengraph-image`,
    ...(m.instruments.length > 0 && { knowsAbout: m.instruments }),
    ...(m.bioShort && { description: m.bioShort }),
    ...(m.bands.length > 0 && {
      memberOf: m.bands.map(b => ({
        '@type': 'MusicGroup',
        name: b.name,
        url: `${SITE_URL}/bands/${b.slug}`,
      })),
    }),
  }

  // Other roster members (for the "Also on the Roster" rail)
  const allMusicians = await getMusicians()
  const otherMembers = allMusicians
    .filter(x => x.slug !== m.slug)
    // Prefer members who share at least one band
    .sort((a, b) => {
      const aShares = a.bands.some(x => m.bands.find(y => y.slug === x.slug))
      const bShares = b.bands.some(x => m.bands.find(y => y.slug === x.slug))
      if (aShares && !bShares) return -1
      if (!aShares && bShares) return 1
      return a.name.localeCompare(b.name)
    })
    .slice(0, 4)

  const accent = m.bands[0]?.color || 'var(--c-epl)'
  const initials = m.name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <ScrollToTopOnMount />
      <Nav />
      <RevealOnView>
      <main style={{ background: 'var(--c-bg)', minHeight: '100vh' }}>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(120px, 16vw, 180px) var(--gutter-fluid) clamp(48px, 7vw, 80px)',
          borderBottom: '1px solid var(--c-border)',
          background: `radial-gradient(ellipse 60% 70% at 80% 30%, ${accent}10 0%, transparent 60%), var(--c-bg)`,
        }}>
          <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
            {/* Breadcrumb */}
            <div className="reveal-up" style={{
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label)',
              fontWeight: 500,
              letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: 'var(--s-5)',
              display: 'flex', alignItems: 'center', gap: 'var(--s-2)',
            }}>
              <Link href="/musicians" style={{ color: 'inherit', textDecoration: 'none' }}>Roster</Link>
              <span style={{ opacity: 0.4 }}>→</span>
              <span style={{ color: accent }}>{m.name}</span>
            </div>

            <div className="musician-hero-grid" style={{
              display: 'grid',
              gridTemplateColumns: m.photo ? 'minmax(0, 1fr) minmax(0, 1.2fr)' : '1fr',
              gap: 'clamp(32px, 5vw, 72px)',
              alignItems: 'center',
            }}>

              {/* Photo */}
              {m.photo ? (
                <div className="reveal-zoom" style={{
                  position: 'relative',
                  aspectRatio: '4 / 5',
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  overflow: 'hidden',
                }}>
                  <Image
                    src={m.photo.thumb}
                    alt={m.name}
                    fill
                    unoptimized
                    priority
                    sizes="(max-width: 900px) 100vw, 40vw"
                    style={{ objectFit: 'cover', objectPosition: 'center 25%' }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: 0, right: 0, bottom: 0, height: '4px',
                    background: accent,
                  }} />
                </div>
              ) : null}

              {/* Identity block */}
              <div>
                {/* Instruments */}
                {m.instruments.length > 0 && (
                  <div className="reveal-up delay-100" style={{
                    fontFamily: 'var(--ff-label)',
                    fontSize: 'var(--t-label-s)',
                    fontWeight: 700,
                    letterSpacing: 'var(--ls-label)',
                    textTransform: 'uppercase',
                    color: accent,
                    marginBottom: 'var(--s-4)',
                  }}>
                    {m.instruments.join(' · ')}
                  </div>
                )}

                {/* Name */}
                <h1 className="reveal delay-200" style={{
                  fontFamily: 'var(--ff-display)',
                  fontSize: 'clamp(48px, 9vw, 124px)',
                  letterSpacing: '0.01em',
                  lineHeight: 0.9,
                  color: 'var(--c-text)',
                  marginBottom: 'var(--s-5)',
                }}>
                  {m.name}
                </h1>

                {/* Bio short (one-liner under name) */}
                {m.bioShort && (
                  <p className="reveal-up delay-300" style={{
                    fontFamily: 'var(--ff-body)',
                    fontSize: 'clamp(17px, 1.9vw, 21px)',
                    lineHeight: 1.55,
                    fontWeight: 300,
                    color: 'rgba(255,255,255,0.78)',
                    marginBottom: 'var(--s-5)',
                    maxWidth: '560px',
                  }}>
                    {m.bioShort}
                  </p>
                )}

                {/* Bands chips — each chip shows what the member plays in
                    that specific band (from `Role - {Band Name}` fields in
                    Airtable MEMBERS). Falls back to band name only when no
                    per-band role is set yet. */}
                {m.bands.length > 0 && (
                  <div className="reveal-up delay-400" style={{ marginBottom: 'var(--s-3)' }}>
                    <div style={{
                      fontFamily: 'var(--ff-label)',
                      fontSize: '10px', fontWeight: 600, letterSpacing: '0.22em',
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
                      marginBottom: 'var(--s-2)',
                    }}>
                      Plays with
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
                      {m.bands.map(b => {
                        const role = m.roleByBand?.[b.slug]
                        return (
                          <Link
                            key={b.slug}
                            href={`/bands/${b.slug}`}
                            className="member-band-chip"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 'var(--s-2)',
                              fontFamily: 'var(--ff-label)',
                              fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em',
                              textTransform: 'uppercase', color: b.color,
                              background: `${b.color}14`,
                              border: `1px solid ${b.color}40`,
                              padding: '7px 14px',
                              textDecoration: 'none',
                              '--accent': b.color,
                            }}
                          >
                            <span>{b.name}</span>
                            {role && (
                              <span style={{
                                opacity: 0.7,
                                fontWeight: 500,
                                letterSpacing: '0.14em',
                              }}>· {role}</span>
                            )}
                            <span aria-hidden="true">→</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* "Subs for" intentionally not shown publicly per Evan 2026-05-09.
                    The data is still on the musician object (m.subBands) for any
                    future internal/admin use. */}
              </div>
            </div>
          </div>
        </section>

        {/* ── BIO ──────────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(60px, 9vw, 120px) var(--gutter-fluid)',
          borderBottom: '1px solid var(--c-border)',
        }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div className="reveal-up" style={{
              width: '32px', height: '3px',
              background: accent,
              marginBottom: 'var(--s-5)',
            }} />
            <div className="reveal-up delay-100" style={{
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label-s)',
              fontWeight: 600,
              letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase',
              color: accent,
              marginBottom: 'var(--s-4)',
            }}>
              About {m.name.split(' ')[0]}
            </div>

            {m.bioLong ? (
              <div className="reveal delay-200" style={{
                fontFamily: 'var(--ff-body)',
                fontSize: 'clamp(16px, 1.7vw, 18px)',
                lineHeight: 1.85,
                fontWeight: 300,
                color: 'rgba(255,255,255,0.78)',
              }}>
                {m.bioLong.split(/\n\s*\n/).map((para, i) => (
                  <p key={i} style={{ marginBottom: 'var(--s-5)' }}>{para}</p>
                ))}
              </div>
            ) : (
              <p className="reveal delay-200" style={{
                fontFamily: 'var(--ff-body)',
                fontSize: 'clamp(16px, 1.7vw, 18px)',
                lineHeight: 1.85,
                fontWeight: 300,
                color: 'rgba(255,255,255,0.45)',
                fontStyle: 'italic',
              }}>
                Bio coming soon. Echo Play Live is in the middle of interviewing every player on the roster. The full story for {m.name.split(' ')[0]} drops here when the conversation is in.
              </p>
            )}

            {/* Phase 19: Interview Q&A. Server-rendered when MEMBERS.Interview is
                populated; <details> handles the show/hide with no JS. */}
            {m.interview && m.interview.length > 0 && (
              <details className="reveal delay-300 interview-block" style={{
                marginTop: 'var(--s-7)',
                borderTop: '1px solid var(--c-border)',
                paddingTop: 'var(--s-6)',
              }}>
                <summary style={{
                  cursor: 'pointer',
                  listStyle: 'none',
                  fontFamily: 'var(--ff-label)',
                  fontSize: 'var(--t-label-s)',
                  fontWeight: 600,
                  letterSpacing: 'var(--ls-label)',
                  textTransform: 'uppercase',
                  color: accent,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--s-2)',
                  userSelect: 'none',
                  transition: 'opacity var(--d-fast) var(--ease-in-out)',
                }}>
                  <span className="interview-summary-toggle" aria-hidden="true" style={{
                    fontFamily: 'var(--ff-display)',
                    fontSize: '18px',
                    lineHeight: 1,
                    display: 'inline-block',
                    transition: 'transform var(--d-fast) var(--ease-in-out)',
                  }}>+</span>
                  Read the full interview with {m.name.split(' ')[0]}
                </summary>

                <div style={{
                  marginTop: 'var(--s-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--s-6)',
                }}>
                  {m.interview.map((qa, i) => (
                    <div key={i}>
                      <h3 style={{
                        fontFamily: 'var(--ff-display)',
                        fontSize: 'clamp(20px, 2.4vw, 26px)',
                        letterSpacing: '0.02em',
                        lineHeight: 1.25,
                        color: 'var(--c-text)',
                        marginBottom: 'var(--s-3)',
                      }}>{qa.question}</h3>
                      {qa.paragraphs.map((p, j) => (
                        <p key={j} style={{
                          fontFamily: 'var(--ff-body)',
                          fontSize: 'clamp(15px, 1.6vw, 17px)',
                          lineHeight: 1.8,
                          fontWeight: 300,
                          color: 'rgba(255,255,255,0.72)',
                          marginBottom: 'var(--s-3)',
                        }}>{p}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </section>

        {/* ── GALLERY (Phase 23) ───────────────────────────── */}
        {/* Renders only when the member has more than one Website Photo
            attachment in Airtable. The primary portrait (photos[0]) already
            appears in the hero, so we slice it off here to avoid duplication. */}
        {Array.isArray(m.photos) && m.photos.length > 1 && (
          <section style={{
            padding: 'clamp(60px, 9vw, 100px) var(--gutter-fluid)',
            borderBottom: '1px solid var(--c-border)',
          }}>
            <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
              <div className="reveal-up" style={{
                fontFamily: 'var(--ff-label)',
                fontSize: 'var(--t-label-s)',
                fontWeight: 600,
                letterSpacing: 'var(--ls-label)',
                textTransform: 'uppercase',
                color: accent,
                marginBottom: 'var(--s-5)',
              }}>
                More of {m.name.split(' ')[0]}
              </div>
              <div className="musician-gallery">
                {m.photos.slice(1).map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <a
                    key={i}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="musician-gallery-item reveal-up"
                    style={{ transitionDelay: `${Math.min(i * 60, 360)}ms` }}
                  >
                    <img
                      src={p.thumb || p.url}
                      alt={`${m.name} — photo ${i + 2}`}
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </div>

          </section>
        )}

        {/* ── ALSO ON THE ROSTER ───────────────────────────── */}
        {otherMembers.length > 0 && (
          <section style={{
            padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)',
            borderBottom: '1px solid var(--c-border)',
          }}>
            <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
              <div className="reveal-up" style={{
                fontFamily: 'var(--ff-label)',
                fontSize: 'var(--t-label-s)',
                fontWeight: 600,
                letterSpacing: 'var(--ls-label)',
                textTransform: 'uppercase',
                color: 'var(--c-epl)',
                marginBottom: 'var(--s-5)',
              }}>
                Also on the Roster
              </div>

              <div className="other-members-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 'clamp(16px, 2vw, 24px)',
              }}>
                {otherMembers.map((om, i) => {
                  const omAccent = om.bands[0]?.color || 'var(--c-epl)'
                  return (
                    <Link
                      key={om.id}
                      href={`/musicians/${om.slug}`}
                      className="roster-mini-card reveal"
                      style={{
                        display: 'block',
                        textDecoration: 'none',
                        background: 'var(--c-surface)',
                        border: '1px solid var(--c-border)',
                        padding: 'var(--s-4)',
                        transitionDelay: `${i * 80}ms`,
                        '--accent': omAccent,
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--ff-display)',
                        fontSize: '20px',
                        letterSpacing: '0.02em',
                        color: 'var(--c-text)',
                        marginBottom: 'var(--s-1)',
                      }}>{om.name}</div>
                      <div style={{
                        fontFamily: 'var(--ff-label)',
                        fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em',
                        textTransform: 'uppercase', color: omAccent,
                      }}>
                        {(om.instruments[0] || 'Musician')}
                      </div>
                    </Link>
                  )
                })}
              </div>

              <div className="reveal-up delay-300" style={{ marginTop: 'var(--s-6)', textAlign: 'center' }}>
                <Link href="/musicians" style={{
                  fontFamily: 'var(--ff-label)',
                  fontSize: 'var(--t-label)',
                  fontWeight: 600,
                  letterSpacing: 'var(--ls-label-tight)',
                  textTransform: 'uppercase',
                  color: 'var(--c-epl)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--c-epl)',
                  paddingBottom: '2px',
                }}>
                  See full roster →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── BOOKING CTA ──────────────────────────────────── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h2 className="reveal" style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(32px, 5vw, 56px)',
              letterSpacing: '0.01em',
              lineHeight: 0.95,
              color: 'var(--c-text)',
              marginBottom: 'var(--s-5)',
            }}>
              Book a band {m.name.split(' ')[0]} plays in
            </h2>
            <Link href="/contact" className="reveal-up delay-200" style={{
              display: 'inline-block',
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label)',
              fontWeight: 700,
              letterSpacing: 'var(--ls-label-tight)',
              textTransform: 'uppercase',
              color: 'var(--c-bg)',
              background: accent,
              padding: '16px 36px',
              textDecoration: 'none',
            }}>
              Start a booking inquiry →
            </Link>
          </div>
        </section>

      </main>
      </RevealOnView>
      <Footer />

      {/* Mobile: stack hero photo above identity */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 900px) {
          .musician-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </>
  )
}
