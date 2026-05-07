'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { bandsList } from '@/lib/bands'

function useScrollReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed')
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    const els = ref.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    els?.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

// Exact artist names as registered on Bandsintown
const artistNames = {
  'so-long-goodnight': 'So Long Goodnight',
  'the-dick-beldings': 'The Dick Beldings',
  'jambi': 'Jambi - Tribute To Tool',
  'elite': 'Elite - Tribute To Deftones',
}

export default function Home() {
  const pageRef = useScrollReveal()

  // Load Bandsintown widget script once
  useEffect(() => {
    if (document.querySelector('script[src*="bandsintown"]')) return
    const script = document.createElement('script')
    script.src = 'https://widget.bandsintown.com/main.min.js'
    script.async = true
    document.head.appendChild(script)
  }, [])

  return (
    <>
      <Nav />
      <main ref={pageRef} style={{ background: '#080808' }}>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
          padding: '120px 32px 80px',
        }}>
          {/* Animated background */}
          <div className="hero-bg" style={{
            position: 'absolute', inset: 0, zIndex: 0,
          }} />

          {/* Radial vignette */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, rgba(8,8,8,0.7) 100%)',
          }} />

          {/* Subtle horizontal line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '50%',
            height: '1px', background: 'rgba(245,197,24,0.06)', zIndex: 1,
          }} />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', width: '100%' }}>
            <div className="hero-label" style={{
              fontFamily: 'Barlow Condensed, Barlow, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#F5C518',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}>
              <span style={{ width: '32px', height: '1px', background: '#F5C518', opacity: 0.5 }} />
              Est. 2023 · Fort Worth, TX
              <span style={{ width: '32px', height: '1px', background: '#F5C518', opacity: 0.5 }} />
            </div>

            <h1 style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 'clamp(80px, 18vw, 220px)',
              lineHeight: 0.85,
              letterSpacing: '-0.01em',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '32px',
              userSelect: 'none',
            }}>
              {['ECHO', 'PLAY', 'LIVE'].map((word, i) => (
                <span key={word} className="hero-word">
                  <span
                    className="hero-word-inner"
                    style={{
                      color: i === 0 ? '#ffffff' : i === 1 ? '#F5C518' : '#ffffff',
                    }}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </h1>

            <div className="hero-cta-wrap" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="#bands" className="btn-primary" style={{
                textDecoration: 'none',
                color: '#F5C518',
                borderColor: '#F5C518',
              }}>
                <span>Explore Our Roster</span>
                <span>↓</span>
              </Link>
              <Link href="/contact" className="btn-primary" style={{
                textDecoration: 'none',
                color: 'rgba(255,255,255,0.6)',
                borderColor: 'rgba(255,255,255,0.2)',
              }}>
                <span>Book a Show</span>
              </Link>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="scroll-cue" style={{
            position: 'absolute', bottom: '32px', left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            zIndex: 2,
          }}>
            <span style={{
              fontFamily: 'Barlow Condensed, Barlow, sans-serif',
              fontSize: '10px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)',
            }}>Scroll</span>
            <div style={{
              width: '1px', height: '40px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
            }} />
          </div>
        </section>

        {/* ── BAND SHOWCASE ─────────────────────────────── */}
        <section id="bands" style={{ padding: '0' }}>
          {/* Band cards */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {bandsList.map((band, index) => (
              <Link
                key={band.slug}
                href={`/bands/${band.slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  className={`band-card reveal ${index % 2 === 0 ? 'reveal-left' : 'reveal-right'}`}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Band color background */}
                  <div
                    className="band-card-bg"
                    style={{ background: band.color }}
                  />

                  <div style={{
                    maxWidth: '1400px', margin: '0 auto', padding: '52px 32px',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    alignItems: 'center',
                    gap: '40px',
                  }}>
                    {/* Content */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '8px',
                        flexWrap: 'wrap',
                      }}>
                        <span style={{
                          fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.25em',
                          textTransform: 'uppercase',
                          color: band.color,
                          opacity: 0.8,
                        }}>
                          {band.era}
                        </span>
                        {band.genre.map(g => (
                          <span key={g} style={{
                            fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                            fontSize: '10px',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.2)',
                          }}>
                            {g}
                          </span>
                        ))}
                      </div>

                      <h3 style={{
                        fontFamily: 'Bebas Neue, cursive',
                        fontSize: 'clamp(40px, 7vw, 96px)',
                        letterSpacing: '0.02em',
                        lineHeight: 0.9,
                        color: '#fff',
                        marginBottom: '12px',
                      }}>
                        {band.name}
                      </h3>

                      <p style={{
                        fontFamily: 'Barlow, sans-serif',
                        fontSize: '14px',
                        lineHeight: 1.65,
                        color: 'rgba(255,255,255,0.4)',
                        maxWidth: '500px',
                      }}>
                        {band.tagline}
                      </p>

                      <div
                        className="band-card-line"
                        style={{ background: band.color, marginTop: '20px' }}
                      />
                    </div>

                    {/* Arrow */}
                    <div style={{
                      width: '48px', height: '48px',
                      border: `1px solid ${band.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: band.color,
                      fontSize: '20px',
                      flexShrink: 0,
                      transition: 'background 0.3s ease, color 0.3s ease',
                    }}
                      className="band-arrow"
                    >
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── MANIFESTO ─────────────────────────────────── */}
        <section style={{
          padding: 'clamp(80px, 12vw, 160px) 32px',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* Background accent */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(245,197,24,0.03) 0%, transparent 70%)',
          }} />

          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <div className="section-label reveal" style={{ marginBottom: '32px' }}>
              Who We Are
            </div>

            <blockquote className="reveal delay-100" style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 'clamp(36px, 7vw, 88px)',
              letterSpacing: '0.03em',
              lineHeight: 1.0,
              color: '#fff',
              marginBottom: '40px',
            }}>
              "Quality, Hustle,<br />
              <span style={{ color: '#F5C518' }}>and Love</span><br />
              for the Show."
            </blockquote>

            <p className="reveal delay-200" style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: 'clamp(15px, 2vw, 18px)',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.45)',
              maxWidth: '600px',
              margin: '0 auto 48px',
            }}>
              Echo Play Live was founded by Evan Ranallo in 2023 out of a need for band management
              amongst friends and all the projects we share. Though our backgrounds vary greatly,
              we are unified in our vision. Every show is a live, full-band performance.
              The music, the energy, the crowd.
            </p>

            <div className="reveal delay-300">
              <Link href="/about" className="btn-primary" style={{
                textDecoration: 'none',
                color: '#F5C518',
                borderColor: 'rgba(245,197,24,0.4)',
              }}>
                <span>Our Story</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── SHOWS TEASER ──────────────────────────────── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) 32px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.01)',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{
              display: 'flex', alignItems: 'flex-end',
              justifyContent: 'space-between', flexWrap: 'wrap',
              gap: '20px', marginBottom: '48px',
            }}>
              <div className="reveal">
                <div className="section-label" style={{ marginBottom: '8px' }}>On Stage</div>
                <h2 style={{
                  fontFamily: 'Bebas Neue, cursive',
                  fontSize: 'clamp(36px, 6vw, 72px)',
                  letterSpacing: '0.03em',
                  lineHeight: 0.9,
                }}>Upcoming Shows</h2>
              </div>
              <Link href="/shows" className="reveal reveal-right" style={{
                textDecoration: 'none',
                fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'color 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#F5C518'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                View All Shows →
              </Link>
            </div>

            {/* Per-band Bandsintown widgets, next 1 show each */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {bandsList.map(band => (
                <div key={band.slug} className="reveal">
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    marginBottom: '8px', paddingBottom: '8px',
                    borderBottom: `1px solid ${band.color}30`,
                  }}>
                    <div style={{ width: '3px', height: '18px', background: band.color, flexShrink: 0 }} />
                    <Link href={`/bands/${band.slug}`} style={{
                      fontFamily: 'Bebas Neue, cursive',
                      fontSize: '20px', letterSpacing: '0.04em',
                      color: band.color, textDecoration: 'none',
                      transition: 'opacity 0.2s ease',
                    }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >{band.name}</Link>
                  </div>
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
                    data-display-limit="1"
                    data-separator-color="rgba(255,255,255,0.06)"
                    data-play-my-city="false"
                  />
                </div>
              ))}
            </div>

            {/* Bandsintown widget style overrides */}
            <style>{`
              .bit-widget { background: transparent !important; font-family: 'Barlow', sans-serif !important; }
              .bit-event { background: rgba(255,255,255,0.015) !important; border: none !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; padding: 14px 0 !important; margin: 0 !important; }
              .bit-event:hover { background: rgba(255,255,255,0.03) !important; }
              .bit-date * { font-family: 'Bebas Neue', cursive !important; font-size: 16px !important; letter-spacing: 0.06em !important; color: #fff !important; }
              .bit-venue * { font-family: 'Barlow', sans-serif !important; color: rgba(255,255,255,0.85) !important; font-size: 13px !important; }
              .bit-location * { font-family: 'Barlow', sans-serif !important; color: rgba(255,255,255,0.4) !important; font-size: 11px !important; }
              .bit-offers a, .bit-rsvp a { font-family: 'Barlow Condensed', sans-serif !important; font-size: 9px !important; font-weight: 700 !important; letter-spacing: 0.15em !important; text-transform: uppercase !important; padding: 5px 10px !important; border-radius: 0 !important; }
              .bit-no-dates-title { font-family: 'Barlow', sans-serif !important; color: rgba(255,255,255,0.18) !important; font-size: 12px !important; font-style: italic; }
              .bit-no-dates-container { background: transparent !important; padding: 6px 0 !important; }
            `}</style>

            <div className="reveal" style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link href="/shows" className="btn-primary" style={{
                textDecoration: 'none',
                color: 'rgba(255,255,255,0.6)',
                borderColor: 'rgba(255,255,255,0.15)',
              }}>
                <span>Full Schedule</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── BOOKING CTA ───────────────────────────────── */}
        <section style={{
          padding: 'clamp(80px, 12vw, 140px) 32px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(245,197,24,0.04) 0%, transparent 50%, rgba(245,197,24,0.02) 100%)',
          }} />
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <div className="section-label reveal" style={{ marginBottom: '24px' }}>Ready to Book?</div>
            <h2 className="reveal delay-100" style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 'clamp(48px, 9vw, 120px)',
              letterSpacing: '0.02em',
              lineHeight: 0.9,
              marginBottom: '24px',
            }}>
              Bring the<br />
              <span style={{ color: '#F5C518' }}>Show to You</span>
            </h2>
            <p className="reveal delay-200" style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '40px',
            }}>
              Venues, festivals, private events. We bring the full live experience wherever you need it.
              Reach out and let's make something unforgettable.
            </p>
            <div className="reveal delay-300" style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/contact" style={{
                textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#080808',
                background: '#F5C518',
                padding: '16px 36px',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Book Now →
              </Link>
              <Link href="/shows" className="btn-primary" style={{
                textDecoration: 'none',
                color: 'rgba(255,255,255,0.5)',
                borderColor: 'rgba(255,255,255,0.15)',
              }}>
                <span>View Upcoming Shows</span>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
