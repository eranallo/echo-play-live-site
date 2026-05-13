'use client'
import { useEffect, useRef } from 'react'
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

const values = [
  {
    title: 'The Craft',
    description: 'Every show is built on preparation. We learn the songs the way the records were made and we hold ourselves to the standard of the artists we play. Anything less is phoning it in, and we do not do that.',
  },
  {
    title: 'The Community',
    description: 'Echo Play Live is a band of friends first. The bandmates carry each other, the crew shows up for one another, and the audiences come back because the room feels like family. None of it is transactional.',
  },
  {
    title: 'The Moment',
    description: 'A great song is a time machine. Our job is to bring people back to the first time they heard it. CD changer in the car, Walkman on the bus, record they played until it skipped. That moment, live, again.',
  },
]

// Pull-quotes from the founding interviews — one per member who has gone
// through the bio/interview process so far. Phase 19. Names are kept short
// since the card layout favors weight on the quote itself.
const memberVoices = [
  {
    quote: "It is not just transactional. It is community-building. We feed each other with our interactions.",
    name: 'Evan Ranallo',
    role: 'Founder · Guitar, Bass',
  },
  {
    quote: "A wondrous enjoyment of brotherly love. Communion with like-minded souls and adventurers in this sea of unknown that is life.",
    name: 'Paul Seidler',
    role: 'Guitar · SLGN, The Dick Beldings',
  },
  {
    quote: "More than friendship. Camaraderie. The accumulation of really great friends vibing together.",
    name: 'Kevin Scott',
    role: 'Bass · SLGN, Jambi, Elite',
  },
  {
    quote: "It is like a family. Everybody looks out for each other. Like a fraternity, in a way.",
    name: 'Irfan Malik',
    role: 'Drums · So Long Goodnight',
  },
]

export default function AboutPage() {
  const pageRef = useScrollReveal()

  return (
    <>
      <Nav />
      <main ref={pageRef} style={{ background: '#080808', minHeight: '100vh' }}>

        {/* Hero */}
        <section style={{
          padding: 'clamp(120px, 16vw, 200px) var(--gutter-fluid) clamp(60px, 8vw, 100px)',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 80% 40%, rgba(212, 160, 23,0.04) 0%, transparent 60%)',
          }} />
          {/* Big text watermark */}
          <div style={{
            position: 'absolute',
            fontFamily: 'Bebas Neue, cursive',
            fontSize: 'clamp(120px, 30vw, 400px)',
            right: '-0.05em', bottom: '-0.1em',
            lineHeight: 0.8,
            color: 'rgba(212, 160, 23,0.03)',
            pointerEvents: 'none',
            letterSpacing: '-0.02em',
            userSelect: 'none',
          }}>EPL</div>

          <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
            <div className="section-label reveal" style={{ marginBottom: '16px' }}>Our Story</div>
            <h1 className="reveal delay-100" style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 'clamp(64px, 14vw, 160px)',
              letterSpacing: '0.01em',
              lineHeight: 0.85,
              maxWidth: '800px',
            }}>
              About<br />
              <span style={{ color: '#D4A017' }}>Echo Play</span><br />
              Live
            </h1>
          </div>
        </section>

        {/* Origin Story */}
        <section style={{
          padding: 'clamp(60px, 10vw, 120px) var(--gutter-fluid)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'clamp(40px, 8vw, 120px)',
              alignItems: 'start',
            }}>
              <div>
                <div className="section-label reveal" style={{ marginBottom: '24px' }}>How It Started</div>
                <p className="reveal delay-100" style={{
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: 'clamp(17px, 2vw, 21px)',
                  lineHeight: 1.8,
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.65)',
                  marginBottom: '24px',
                }}>
                  Echo Play Live was founded by Evan Ranallo in 2023 out of a simple need. The
                  projects he and his friends were already running deserved a real home. The bands
                  had real audiences, the shows had real production demands, and managing it all
                  required dedicated organization. What started as managing a band among friends
                  grew into a full management company representing four of the most active live
                  acts in the DFW Metroplex.
                </p>
                <p className="reveal delay-200" style={{
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: 'clamp(15px, 1.8vw, 18px)',
                  lineHeight: 1.8,
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.45)',
                  marginBottom: '24px',
                }}>
                  Though everyone on the roster comes from a different musical place, the company
                  runs on one shared belief. The live show is sacred. Every band under the Echo
                  Play Live umbrella shows up ready. Every player on the roster knows their job in
                  the room. Nobody phones it in.
                </p>
                <p className="reveal delay-300" style={{
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: 'clamp(15px, 1.8vw, 18px)',
                  lineHeight: 1.8,
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.45)',
                }}>
                  Talk to anyone in the bands and one word keeps coming up. Community. Brotherly
                  love. Camaraderie. Family. Echo Play Live is not a vendor and the audience is not
                  a customer. It is a room of people, on and off the stage, who care about the same
                  thing for the same reason. The bands look after each other. The audiences come
                  back. And the goal of every show is to give people a night that feels nostalgic,
                  energetic, sincere, and worth remembering.
                </p>
              </div>

              <div className="reveal reveal-right delay-200">
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '40px',
                  position: 'relative',
                }}>
                  {/* Quote mark */}
                  <div style={{
                    position: 'absolute',
                    top: '-0.1em', left: '32px',
                    fontFamily: 'Bebas Neue, cursive',
                    fontSize: '120px',
                    lineHeight: 1,
                    color: '#D4A017',
                    opacity: 0.15,
                    pointerEvents: 'none',
                  }}>"</div>

                  <blockquote style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: 'clamp(20px, 3vw, 32px)',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    lineHeight: 1.5,
                    color: 'rgba(255,255,255,0.8)',
                    marginBottom: '32px',
                    position: 'relative',
                  }}>
                    "Though our backgrounds vary greatly, we are unified in our vision of quality, hustle, and love for the show."
                  </blockquote>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    <div style={{
                      width: '36px', height: '36px',
                      background: '#D4A017',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Bebas Neue, cursive',
                      fontSize: '16px',
                      color: '#080808',
                      letterSpacing: '0.05em',
                    }}>ER</div>
                    <div>
                      <div style={{
                        fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                        fontSize: '13px',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        color: '#fff',
                      }}>Evan Ranallo</div>
                      <div style={{
                        fontFamily: 'Barlow, sans-serif',
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.35)',
                      }}>Founder, Echo Play Live</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: '1px', background: 'rgba(255,255,255,0.06)',
                  marginTop: '1px',
                }}>
                  {[
                    { label: 'Founded', value: '2023' },
                    { label: 'Based In', value: 'Fort Worth, TX' },
                    { label: 'Bands', value: '4 Active' },
                    { label: 'Region', value: 'DFW Metroplex' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      background: '#080808',
                      padding: '20px 24px',
                    }}>
                      <div style={{
                        fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                        fontSize: '9px',
                        fontWeight: 600,
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.2)',
                        marginBottom: '4px',
                      }}>{label}</div>
                      <div style={{
                        fontFamily: 'Bebas Neue, cursive',
                        fontSize: '24px',
                        letterSpacing: '0.04em',
                        color: '#D4A017',
                      }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{
          padding: 'clamp(60px, 10vw, 120px) var(--gutter-fluid)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div className="section-label reveal" style={{ marginBottom: '48px' }}>What We Stand For</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
              {values.map((v, i) => (
                <div
                  key={v.title}
                  className={`reveal delay-${i * 150}`}
                  style={{
                    background: '#080808',
                    padding: '48px 40px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    width: '32px', height: '3px',
                    background: '#D4A017',
                    marginBottom: '24px',
                  }} />
                  <h3 style={{
                    fontFamily: 'Bebas Neue, cursive',
                    fontSize: '48px',
                    letterSpacing: '0.04em',
                    color: '#fff',
                    marginBottom: '16px',
                    lineHeight: 0.9,
                  }}>{v.title}</h3>
                  <p style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.45)',
                  }}>{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* In Their Words — Phase 19, pull-quotes from member interviews */}
        <section style={{
          padding: 'clamp(60px, 10vw, 120px) var(--gutter-fluid)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div className="section-label reveal" style={{ marginBottom: '16px' }}>In Their Words</div>
            <h2 className="reveal delay-100" style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 'clamp(40px, 7vw, 88px)',
              letterSpacing: '0.02em',
              lineHeight: 0.9,
              marginBottom: '48px',
              maxWidth: '900px',
            }}>
              What Echo Play Live<br />Means to the Roster
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1px',
              background: 'rgba(255,255,255,0.06)',
            }}>
              {memberVoices.map((v, i) => (
                <figure
                  key={v.name}
                  className={`reveal delay-${i * 100}`}
                  style={{
                    background: '#080808',
                    padding: 'clamp(28px, 3vw, 40px)',
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '240px',
                    position: 'relative',
                  }}
                >
                  {/* Quote mark watermark */}
                  <div aria-hidden="true" style={{
                    position: 'absolute',
                    top: '8px', left: '16px',
                    fontFamily: 'Bebas Neue, cursive',
                    fontSize: '72px',
                    lineHeight: 1,
                    color: '#D4A017',
                    opacity: 0.12,
                    pointerEvents: 'none',
                  }}>"</div>

                  <blockquote style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: 'clamp(16px, 1.8vw, 19px)',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.82)',
                    margin: 0,
                    position: 'relative',
                  }}>
                    "{v.quote}"
                  </blockquote>
                  <figcaption style={{ marginTop: '24px' }}>
                    <div style={{
                      width: '24px', height: '2px',
                      background: '#D4A017',
                      marginBottom: '12px',
                    }} />
                    <div style={{
                      fontFamily: 'Bebas Neue, cursive',
                      fontSize: '18px',
                      letterSpacing: '0.04em',
                      color: '#fff',
                    }}>{v.name}</div>
                    <div style={{
                      fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.4)',
                      marginTop: '2px',
                    }}>{v.role}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* The Roster */}
        <section style={{ padding: 'clamp(60px, 10vw, 120px) var(--gutter-fluid)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '48px' }}>
              <div className="reveal">
                <div className="section-label" style={{ marginBottom: '8px' }}>The Bands</div>
                <h2 style={{
                  fontFamily: 'Bebas Neue, cursive',
                  fontSize: 'clamp(40px, 7vw, 88px)',
                  letterSpacing: '0.02em',
                  lineHeight: 0.9,
                }}>Our Roster</h2>
              </div>
              <Link href="/#bands" className="reveal" style={{
                fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#D4A017'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >View Full Roster →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {bandsList.map((band, i) => (
                <Link
                  key={band.slug}
                  href={`/bands/${band.slug}`}
                  className={`reveal delay-${i * 100}`}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '32px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'border-color 0.3s ease, transform 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${band.color}50`
                    e.currentTarget.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ width: '32px', height: '3px', background: band.color, marginBottom: '20px' }} />
                  <div style={{
                    fontFamily: 'Bebas Neue, cursive',
                    fontSize: '32px',
                    letterSpacing: '0.04em',
                    color: '#fff',
                    marginBottom: '6px',
                  }}>{band.name}</div>
                  <div style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.35)',
                    marginBottom: '16px',
                  }}>{band.tagline}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {band.genre.map(g => (
                      <span key={g} style={{
                        fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                        fontSize: '9px',
                        fontWeight: 600,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: band.color,
                        background: `${band.color}10`,
                        padding: '4px 8px',
                      }}>{g}</span>
                    ))}
                  </div>
                  <div style={{ position: 'absolute', bottom: '24px', right: '24px', color: band.color, opacity: 0.5, fontSize: '18px' }}>→</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
