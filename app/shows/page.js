'use client'
import { useEffect, useRef, useState } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { bandsList } from '@/lib/bands'

function useScrollReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed') }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    const els = ref.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    els?.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

// Exact artist names as registered on Bandsintown
// These must match the artist's profile name on Bandsintown exactly
const artistNames = {
  'so-long-goodnight': 'So Long Goodnight',
  'the-dick-beldings': 'The Dick Beldings',
  'jambi': 'Jambi - Tribute To Tool',
  'elite': 'Elite - Tribute To Deftones',
}

export default function ShowsPage() {
  const pageRef = useScrollReveal()
  const [filter, setFilter] = useState('all')

  // Load Bandsintown widget script once
  useEffect(() => {
    if (document.querySelector('script[src*="bandsintown"]')) return
    const script = document.createElement('script')
    script.src = 'https://widget.bandsintown.com/main.min.js'
    script.async = true
    document.head.appendChild(script)
  }, [])

  const filteredBands = filter === 'all'
    ? bandsList
    : bandsList.filter(b => b.slug === filter)

  return (
    <>
      <Nav />
      <main ref={pageRef} style={{ background: '#080808', minHeight: '100vh' }}>

        {/* Hero */}
        <section style={{
          padding: 'clamp(120px, 16vw, 180px) 40px clamp(60px, 8vw, 100px)',
          position: 'relative', overflow: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 60% 80% at 20% 50%, rgba(245,197,24,0.04) 0%, transparent 60%)',
          }} />
          <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
            <div className="section-label reveal" style={{ marginBottom: '16px' }}>On Stage</div>
            <h1 className="reveal delay-100" style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 'clamp(64px, 14vw, 180px)',
              letterSpacing: '0.01em', lineHeight: 0.85, marginBottom: '24px',
            }}>
              Shows &<br /><span style={{ color: '#F5C518' }}>Events</span>
            </h1>
            <p className="reveal delay-200" style={{
              fontFamily: 'Barlow, sans-serif', fontSize: '16px',
              lineHeight: 1.7, color: 'rgba(255,255,255,0.4)', maxWidth: '480px',
            }}>
              All Echo Play Live bands perform live, full-band shows across the DFW Metroplex.
            </p>
          </div>
        </section>

        {/* Filter Bar */}
        <div style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky', top: '60px', zIndex: 10,
          background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(12px)',
        }}>
          <div style={{
            maxWidth: '1400px', margin: '0 auto', padding: '0 40px',
            display: 'flex', gap: '0', overflowX: 'auto',
          }}>
            {['all', ...bandsList.map(b => b.slug)].map(slug => {
              const band = slug === 'all' ? null : bandsList.find(b => b.slug === slug)
              const isActive = filter === slug
              return (
                <button key={slug} onClick={() => setFilter(slug)} style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em',
                  textTransform: 'uppercase', padding: '16px 20px',
                  background: 'none', border: 'none',
                  borderBottom: `2px solid ${isActive ? (band ? band.color : '#F5C518') : 'transparent'}`,
                  color: isActive ? (band ? band.color : '#F5C518') : 'rgba(255,255,255,0.35)',
                  cursor: 'pointer', transition: 'color 0.2s ease, border-color 0.2s ease',
                  whiteSpace: 'nowrap', marginBottom: '-1px',
                }}>
                  {slug === 'all' ? 'All Shows' : band.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Shows — Bandsintown Widgets */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 40px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            {/* Live indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#F5C518', boxShadow: '0 0 8px #F5C518',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              <div style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.25em',
                textTransform: 'uppercase', color: '#F5C518',
              }}>Upcoming Shows</div>
            </div>

            {/* One widget per filtered band */}
            {filteredBands.map(band => (
              <div key={band.slug} style={{ marginBottom: '48px' }}>
                {/* Band label — only show when viewing All Shows */}
                {filter === 'all' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    marginBottom: '16px', paddingBottom: '12px',
                    borderBottom: `1px solid ${band.color}30`,
                  }}>
                    <div style={{ width: '3px', height: '20px', background: band.color, flexShrink: 0 }} />
                    <Link href={`/bands/${band.slug}`} style={{
                      fontFamily: 'Bebas Neue, cursive',
                      fontSize: '22px', letterSpacing: '0.04em',
                      color: band.color, textDecoration: 'none',
                      transition: 'opacity 0.2s ease',
                    }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >{band.name}</Link>
                  </div>
                )}

                {/* Bandsintown widget */}
                <a
                  className="bit-widget-initializer"
                  data-artist-name={artistNames[band.slug] || band.name}
                  data-display-local-dates="false"
                  data-display-past-dates="false"
                  data-auto-style="false"
                  data-font-color="#ffffff"
                  data-text-color="#ffffff"
                  data-link-color={band.color}
                  data-popup-background-color="#0a0a0a"
                  data-background-color="transparent"
                  data-display-limit="15"
                  data-separator-color="rgba(255,255,255,0.06)"
                  data-play-my-city="false"
                />
              </div>
            ))}

            {/* Follow on Bandsintown */}
            <div style={{
              marginTop: '40px', paddingTop: '40px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.25em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                marginBottom: '16px',
              }}>Follow on Bandsintown</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {bandsList.filter(b => b.social?.bandsintown).map(band => (
                  <a key={band.slug} href={band.social.bandsintown} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: band.color,
                    border: `1px solid ${band.color}40`,
                    padding: '8px 16px', textDecoration: 'none',
                    transition: 'background 0.2s ease',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = `${band.color}15`}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {band.shortName} →
                  </a>
                ))}
              </div>
            </div>

            {/* Band Roster Quick Links */}
            <div className="reveal" style={{ marginTop: '80px' }}>
              <div style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.25em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                marginBottom: '24px',
              }}>Our Bands</div>
              <div className="roster-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1px', background: 'rgba(255,255,255,0.06)',
              }}>
                {bandsList.map(band => (
                  <Link key={band.slug} href={`/bands/${band.slug}`} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '24px', background: '#080808', textDecoration: 'none',
                    transition: 'background 0.2s ease',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = `${band.color}08`}
                    onMouseLeave={e => e.currentTarget.style.background = '#080808'}
                  >
                    <div style={{ width: '4px', height: '40px', background: band.color, flexShrink: 0 }} />
                    <div>
                      <div style={{
                        fontFamily: 'Bebas Neue, cursive',
                        fontSize: '20px', letterSpacing: '0.04em', color: '#fff',
                      }}>{band.name}</div>
                      <div style={{
                        fontFamily: 'Barlow, sans-serif',
                        fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                      }}>{band.era}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', color: band.color, opacity: 0.4 }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bandsintown widget style overrides */}
        <style>{`
          .bit-widget { background: transparent !important; font-family: 'Barlow', sans-serif !important; }
          .bit-event { background: rgba(255,255,255,0.015) !important; border: none !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; padding: 16px 0 !important; margin: 0 !important; }
          .bit-event:hover { background: rgba(255,255,255,0.03) !important; }
          .bit-date * { font-family: 'Bebas Neue', cursive !important; font-size: 18px !important; letter-spacing: 0.06em !important; color: #fff !important; }
          .bit-venue * { font-family: 'Barlow', sans-serif !important; color: rgba(255,255,255,0.85) !important; }
          .bit-location * { font-family: 'Barlow', sans-serif !important; color: rgba(255,255,255,0.4) !important; font-size: 12px !important; }
          .bit-offers a, .bit-rsvp a { font-family: 'Barlow Condensed', sans-serif !important; font-size: 10px !important; font-weight: 700 !important; letter-spacing: 0.15em !important; text-transform: uppercase !important; padding: 7px 14px !important; border-radius: 0 !important; }
          .bit-no-dates-title { font-family: 'Barlow', sans-serif !important; color: rgba(255,255,255,0.15) !important; font-size: 13px !important; }
          .bit-no-dates-container { background: transparent !important; padding: 8px 0 !important; }
        `}</style>

        {/* Book a show CTA */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) 40px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <p className="reveal" style={{
              fontFamily: 'Barlow, sans-serif', fontSize: '15px',
              color: 'rgba(255,255,255,0.4)', marginBottom: '24px',
            }}>
              Interested in booking one of our bands for your venue or event?
            </p>
            <Link className="reveal delay-100" href="/contact" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: '#080808',
              background: '#F5C518', padding: '14px 28px', textDecoration: 'none',
              transition: 'opacity 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >Booking Inquiry →</Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
