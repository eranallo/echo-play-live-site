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

export default function ShowsPage() {
  const pageRef = useScrollReveal()
  const [filter, setFilter] = useState('all')
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/shows')
      .then(r => r.json())
      .then(data => {
        setShows(data.shows || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredShows = filter === 'all'
    ? shows
    : shows.filter(s => s.bandSlug === filter)

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

        {/* Shows Content */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 40px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.25em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                }}>Loading shows...</div>
              </div>
            ) : filteredShows.length > 0 ? (
              <div className="reveal">
                {/* Live show rows */}
                <div style={{ marginBottom: '64px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px',
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

                  {filteredShows.map((show, i) => (
                    <div key={show.id} className={`show-row reveal delay-${Math.min(i * 100, 400)}`} style={{
                      padding: '20px 0',
                      display: 'grid',
                      gridTemplateColumns: '160px 1fr 180px 140px auto',
                      alignItems: 'center', gap: '24px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      transition: 'background 0.2s ease',
                    }}>
                      {/* Date */}
                      <div>
                        <div style={{
                          fontFamily: 'Bebas Neue, cursive',
                          fontSize: '20px', letterSpacing: '0.06em',
                          color: show.bandColor,
                        }}>{show.dateFormatted?.split(',')[0]}</div>
                        <div style={{
                          fontFamily: 'Barlow, sans-serif',
                          fontSize: '12px', color: 'rgba(255,255,255,0.4)',
                        }}>{show.dateFormatted?.split(',').slice(1).join(',').trim()}</div>
                      </div>

                      {/* Venue */}
                      <div style={{
                        fontFamily: 'Barlow, sans-serif',
                        fontSize: '15px', fontWeight: 500,
                        color: 'rgba(255,255,255,0.85)',
                      }}>{show.venue}</div>

                      {/* Band */}
                      {show.bandSlug ? (
                        <Link href={`/bands/${show.bandSlug}`} style={{
                          fontFamily: 'Barlow Condensed, sans-serif',
                          fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em',
                          textTransform: 'uppercase', color: show.bandColor,
                          textDecoration: 'none',
                          transition: 'opacity 0.2s ease',
                        }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >{show.bandName}</Link>
                      ) : (
                        <span style={{
                          fontFamily: 'Barlow Condensed, sans-serif',
                          fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em',
                          textTransform: 'uppercase', color: show.bandColor,
                        }}>{show.bandName}</span>
                      )}

                      {/* Set time */}
                      <div style={{
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontSize: '12px', letterSpacing: '0.08em',
                        color: 'rgba(255,255,255,0.3)',
                      }}>{show.setTime ? `Showtime ${show.setTime}` : ''}</div>

                      {/* Bandsintown CTA */}
                      {show.bandsintownUrl ? (
                        <a href={show.bandsintownUrl} target="_blank" rel="noopener noreferrer" style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontFamily: 'Barlow Condensed, sans-serif',
                          fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em',
                          textTransform: 'uppercase', color: '#080808',
                          background: show.bandColor, padding: '7px 14px',
                          textDecoration: 'none', whiteSpace: 'nowrap',
                          transition: 'opacity 0.2s ease',
                        }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          Tickets / Info →
                        </a>
                      ) : (
                        <div style={{ width: '100px' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* No shows — placeholder + Bandsintown follow links */
              <div className="reveal" style={{ marginBottom: '64px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px',
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

                <div style={{
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '60px 40px', textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'Bebas Neue, cursive',
                    fontSize: '40px', letterSpacing: '0.04em',
                    color: 'rgba(255,255,255,0.15)', marginBottom: '12px',
                  }}>New Dates Coming Soon</div>
                  <p style={{
                    fontFamily: 'Barlow, sans-serif', fontSize: '14px',
                    color: 'rgba(255,255,255,0.25)', marginBottom: '32px',
                  }}>
                    Follow each band on Bandsintown to get notified the moment new shows are announced.
                  </p>

                  {/* Bandsintown follow buttons per band */}
                  <div style={{
                    display: 'flex', justifyContent: 'center',
                    flexWrap: 'wrap', gap: '12px',
                  }}>
                    {bandsList.map(band => (
                      <div key={band.slug} style={{
                        border: `1px solid ${band.color}30`,
                        background: `${band.color}08`,
                        padding: '16px 24px', minWidth: '200px',
                        textAlign: 'left',
                      }}>
                        <div style={{
                          fontFamily: 'Bebas Neue, cursive',
                          fontSize: '18px', letterSpacing: '0.04em',
                          color: band.color, marginBottom: '8px',
                        }}>{band.name}</div>
                        {band.bandsintownUrl ? (
                          <a href={band.bandsintownUrl} target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            fontFamily: 'Barlow Condensed, sans-serif',
                            fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em',
                            textTransform: 'uppercase', color: '#080808',
                            background: band.color, padding: '6px 14px',
                            textDecoration: 'none', transition: 'opacity 0.2s ease',
                          }}>Follow on Bandsintown →</a>
                        ) : (
                          <a href={band.social.facebook} target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            fontFamily: 'Barlow Condensed, sans-serif',
                            fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em',
                            textTransform: 'uppercase', color: band.color,
                            border: `1px solid ${band.color}40`,
                            padding: '6px 14px', textDecoration: 'none',
                            transition: 'opacity 0.2s ease',
                          }}>Follow on Facebook →</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Band Roster Quick Links */}
            <div className="reveal">
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
                    <div style={{
                      width: '40px', height: '40px',
                      border: `1px solid ${band.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                      color: band.color, flexShrink: 0,
                    }}>{band.number}</div>
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
