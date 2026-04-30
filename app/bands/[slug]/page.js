'use client'
import { useEffect, useRef, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { getBand, bandsList } from '@/lib/bands'

function useScrollReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('revealed')
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    const els = ref.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    els?.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

const SocialIcon = ({ platform }) => {
  const icons = {
    facebook: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
    instagram: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
      </svg>
    ),
    youtube: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon fill="#080808" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
    tiktok: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
      </svg>
    ),
  }
  return icons[platform] || null
}

// EPK-specific stats per band
const bandStats = {
  'jambi': [
    { value: '50+', label: 'Shows Performed' },
    { value: '2019', label: 'Est.' },
    { value: '6 Years', label: 'On Stage' },
    { value: 'TX & OK', label: 'Territory' },
  ],
  'so-long-goodnight': [
    { value: '3+ Hours', label: 'Per Show' },
    { value: '100+', label: 'Songs' },
    { value: 'Live Band', label: 'No DJs' },
    { value: 'Warped Tour', label: 'Era' },
  ],
  'the-dick-beldings': [
    { value: '10+', label: 'Years Together' },
    { value: 'Fort Worth', label: 'Based' },
    { value: '90s', label: 'Era' },
    { value: '100+', label: 'Song Library' },
  ],
  'elite': [
    { value: '2017', label: 'Est.' },
    { value: '8 Years', label: 'On Stage' },
    { value: 'Fort Worth', label: 'Based' },
    { value: 'TX & Beyond', label: 'Territory' },
  ],
}

export default function BandPage({ params }) {
  const band = getBand(params.slug)
  const pageRef = useScrollReveal()
  const [images, setImages] = useState([])
  const [lightboxImg, setLightboxImg] = useState(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [mediaLoaded, setMediaLoaded] = useState(false)

  useEffect(() => {
    if (!band) return
    fetch(`/api/media?band=${band.slug}`)
      .then(r => r.json())
      .then(data => {
        setImages(data.images || [])
        setMediaLoaded(true)
      })
      .catch(() => setMediaLoaded(true))
  }, [band?.slug])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') setLightboxImg(null)
      if (e.key === 'ArrowRight' && lightboxImg) {
        const next = (lightboxIdx + 1) % images.length
        setLightboxIdx(next)
        setLightboxImg(images[next])
      }
      if (e.key === 'ArrowLeft' && lightboxImg) {
        const prev = (lightboxIdx - 1 + images.length) % images.length
        setLightboxIdx(prev)
        setLightboxImg(images[prev])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxImg, lightboxIdx, images])

  if (!band) notFound()

  const otherBands = bandsList.filter(b => b.slug !== band.slug)
  const stats = bandStats[band.slug] || []

  // Use art-directed curated photos from bands.js if defined, otherwise fall back to API results
  const curatedUrls = new Set([band.heroPhoto, band.featurePhoto, band.crowdPhoto].filter(Boolean))
  const heroImg = band.heroPhoto ? { url: band.heroPhoto } : (images[0] || null)
  const featureImg = band.featurePhoto ? { url: band.featurePhoto } : (images[1] || null)
  const crowdImg = band.crowdPhoto ? { url: band.crowdPhoto } : (images[4] || null)
  // Gallery = all API images except the ones already used as curated hero/feature/crowd
  const galleryImages = images.filter(img => !curatedUrls.has(img.url))

  const openLightbox = (img, idx) => {
    setLightboxImg(img)
    setLightboxIdx(idx)
  }

  return (
    <>
      <Nav />
      <main ref={pageRef} style={{ background: '#080808' }}>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'relative',
          overflow: 'hidden',
          padding: '0 0 72px',
        }}>
          {/* Hero image */}
          {heroImg ? (
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              <Image
                src={heroImg.url}
                alt={`${band.name} live`}
                fill
                style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
                priority
                unoptimized
                sizes="100vw"
              />
              {/* Gradient overlay — clear at top, dark at bottom for text legibility */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(to bottom,
                  rgba(8,8,8,0.15) 0%,
                  rgba(8,8,8,0.05) 25%,
                  rgba(8,8,8,0.4) 55%,
                  rgba(8,8,8,0.92) 80%,
                  rgba(8,8,8,1) 100%)`,
              }} />
              {/* Subtle band color accent at very bottom */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
                background: `linear-gradient(to right, ${band.color}80, transparent 60%)`,
              }} />
            </div>
          ) : (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 0,
              background: `radial-gradient(ellipse 70% 70% at 65% 30%, ${band.color}15 0%, transparent 65%), #080808`,
            }} />
          )}

          {/* Content */}
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', position: 'relative', zIndex: 2, width: '100%' }}>
            {/* Breadcrumb */}
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
              marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Echo Play Live</Link>
              <span style={{ opacity: 0.4 }}>→</span>
              <span style={{ color: band.color }}>{band.name}</span>
            </div>

            {/* Genre tags */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {band.genre.map(g => (
                <span key={g} style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: band.color,
                  background: `${band.color}18`, padding: '5px 12px',
                  border: `1px solid ${band.color}35`,
                }}>{g}</span>
              ))}
              <span style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.05)', padding: '5px 12px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>Fort Worth, TX</span>
            </div>

            {/* Band name */}
            <h1 style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 'clamp(60px, 13vw, 172px)',
              letterSpacing: '0.01em', lineHeight: 0.85,
              color: '#fff', marginBottom: '14px',
              textShadow: heroImg ? '0 2px 40px rgba(0,0,0,0.7)' : 'none',
            }}>{band.name}</h1>

            {!band.hideTagline && (
              <p style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: 'clamp(15px, 2.2vw, 20px)',
                fontStyle: 'italic', fontWeight: 300,
                color: band.color, letterSpacing: '0.02em', marginBottom: '28px',
              }}>{band.tagline}</p>
            )}

            {/* Social links + booking CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {Object.entries(band.social).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
                    background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.12)',
                    padding: '9px 16px', textDecoration: 'none', backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = band.color
                    e.currentTarget.style.borderColor = `${band.color}45`
                    e.currentTarget.style.background = `${band.color}12`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                    e.currentTarget.style.background = 'rgba(0,0,0,0.45)'
                  }}
                >
                  <SocialIcon platform={platform} />{platform}
                </a>
              ))}
              <Link href="/contact" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: '#080808',
                background: band.color, padding: '9px 20px',
                textDecoration: 'none', transition: 'opacity 0.2s ease',
                backdropFilter: 'blur(8px)',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >Book This Band →</Link>
            </div>
          </div>
        </section>

        {/* ── EPK STATS BAR ────────────────────────────────── */}
        {stats.length > 0 && (
          <section style={{
            borderTop: `1px solid ${band.color}25`,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: `${band.color}06`,
          }}>
            <div className="stats-bar-grid" style={{
              maxWidth: '1400px', margin: '0 auto', padding: '0 40px',
              display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
            }}>
              {stats.map((stat, i) => (
                <div key={i} className="reveal" style={{
                  padding: '28px 24px',
                  borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'Bebas Neue, cursive',
                    fontSize: 'clamp(24px, 4vw, 40px)',
                    letterSpacing: '0.05em',
                    color: band.color,
                    lineHeight: 1,
                    marginBottom: '4px',
                  }}>{stat.value}</div>
                  <div style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── ABOUT + FEATURE PHOTO ────────────────────────── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) 40px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div className="about-grid" style={{
            maxWidth: '1400px', margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: featureImg ? '1fr 1fr' : '1fr',
            gap: 'clamp(40px, 6vw, 96px)',
            alignItems: 'center',
          }}>
            <div>
              <div style={{
                width: '32px', height: '3px',
                background: band.color, marginBottom: '24px',
              }} />
              <div className="section-label reveal" style={{ color: band.color, marginBottom: '20px' }}>
                About the Band
              </div>
              <p className="reveal delay-100" style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: 'clamp(16px, 1.8vw, 19px)',
                lineHeight: 1.85, fontWeight: 300,
                color: 'rgba(255,255,255,0.72)',
                marginBottom: '36px',
              }}>{band.description}</p>

              {/* EPK details grid */}
              <div className="reveal delay-200" style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                {[
                  { label: 'Type', value: 'Tribute / Cover Band' },
                  { label: 'Genre', value: band.era },
                  { label: 'Based', value: 'Fort Worth / DFW, TX' },
                  { label: 'Booking', value: band.bookingEmail },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#0a0a0a', padding: '16px 20px' }}>
                    <div style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em',
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
                      marginBottom: '3px',
                    }}>{label}</div>
                    <div style={{
                      fontFamily: 'Barlow, sans-serif', fontSize: '13px',
                      color: 'rgba(255,255,255,0.65)',
                    }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature photo — second best shot */}
            {featureImg && (
              <div
                className="reveal reveal-right delay-150"
                onClick={() => openLightbox(featureImg, 1)}
                style={{
                  position: 'relative',
                  aspectRatio: '4/3',
                  overflow: 'hidden',
                  cursor: 'zoom-in',
                }}
              >
                <Image
                  src={featureImg.url}
                  alt={`${band.name} performing`}
                  fill
                  style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={85}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(135deg, ${band.color}20, transparent 50%)`,
                  opacity: 0, transition: 'opacity 0.3s ease',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '1'
                    e.currentTarget.previousElementSibling.style.transform = 'scale(1.03)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '0'
                    e.currentTarget.previousElementSibling.style.transform = 'scale(1)'
                  }}
                />
              </div>
            )}
          </div>
        </section>

        {/* ── SOCIAL PROOF: CROWD SHOT ─────────────────────── */}
        {crowdImg && (
          <section style={{
            padding: 'clamp(60px, 8vw, 100px) 40px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.01)',
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div className="proof-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'clamp(40px, 6vw, 96px)',
                alignItems: 'center',
              }}>
                {/* Crowd photo */}
                <div
                  className="reveal reveal-left"
                  onClick={() => openLightbox(crowdImg, 4)}
                  style={{
                    position: 'relative', aspectRatio: '3/2',
                    overflow: 'hidden', cursor: 'zoom-in',
                  }}
                >
                  <Image
                    src={crowdImg.url}
                    alt="Crowd at show"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center 30%', transition: 'transform 0.6s ease' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={85}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(135deg, ${band.color}15, transparent 50%)`,
                    opacity: 0, transition: 'opacity 0.3s ease',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.opacity = '1'
                      e.currentTarget.previousElementSibling.style.transform = 'scale(1.03)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = '0'
                      e.currentTarget.previousElementSibling.style.transform = 'scale(1)'
                    }}
                  />
                </div>

                {/* Social proof copy */}
                <div>
                  <div style={{
                    width: '32px', height: '3px',
                    background: band.color, marginBottom: '24px',
                  }} />
                  <div className="section-label reveal" style={{ color: band.color, marginBottom: '20px' }}>
                    The Experience
                  </div>
                  <h2 className="reveal delay-100" style={{
                    fontFamily: 'Bebas Neue, cursive',
                    fontSize: 'clamp(36px, 5.5vw, 72px)',
                    letterSpacing: '0.02em', lineHeight: 0.9,
                    color: '#fff', marginBottom: '20px',
                  }}>
                    {band.experienceHeadline ? (
                      <>
                        {band.experienceHeadline.line1}<br />
                        <span style={{ color: band.color }}>{band.experienceHeadline.line2}</span>
                      </>
                    ) : (
                      <>Every Show Is<br /><span style={{ color: band.color }}>A Full Event</span></>
                    )}
                  </h2>
                  <p className="reveal delay-200" style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: 'clamp(15px, 1.6vw, 17px)',
                    lineHeight: 1.8, fontWeight: 300,
                    color: 'rgba(255,255,255,0.55)',
                    marginBottom: '28px',
                  }}>
                    {band.experienceBody || `When you book ${band.name}, your audience gets a show worth coming back for.`}
                  </p>
                  <div className="reveal delay-300" style={{
                    display: 'flex', gap: '20px', flexWrap: 'wrap',
                  }}>
                    {(band.experiencePoints || ['Faithful to the Catalog', 'Always Live', 'All Original Members']).map(item => (
                      <div key={item} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em',
                        textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
                      }}>
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: band.color, flexShrink: 0,
                        }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── BAND HISTORY (if available) ───────────────────── */}
        {band.history && band.history.length > 0 && (
          <section style={{
            padding: 'clamp(60px, 8vw, 100px) 40px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ width: '32px', height: '3px', background: band.color, marginBottom: '24px' }} />
              <div className="section-label reveal" style={{ color: band.color, marginBottom: '12px' }}>The Story</div>
              <h2 className="reveal delay-100" style={{
                fontFamily: 'Bebas Neue, cursive',
                fontSize: 'clamp(32px, 5vw, 60px)',
                letterSpacing: '0.02em', lineHeight: 0.9,
                marginBottom: '48px',
              }}>How It All Started</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {band.history.map((entry, i) => (
                  <div key={i} className={`reveal delay-${Math.min(i * 100, 400)}`} style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr',
                    borderLeft: `3px solid ${band.color}`,
                    background: 'rgba(255,255,255,0.015)',
                    transition: 'background 0.2s ease',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = `${band.color}08`}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                  >
                    {/* Year column */}
                    <div style={{
                      padding: '28px 20px',
                      borderRight: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                      paddingTop: '32px',
                    }}>
                      <div style={{
                        fontFamily: 'Bebas Neue, cursive',
                        fontSize: 'clamp(18px, 2.5vw, 26px)',
                        letterSpacing: '0.06em',
                        color: band.color,
                        lineHeight: 1,
                      }}>{entry.year}</div>
                    </div>

                    {/* Content column */}
                    <div style={{ padding: '28px 32px' }}>
                      <div style={{
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontSize: '10px', fontWeight: 700, letterSpacing: '0.25em',
                        textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                        marginBottom: '10px',
                      }}>{entry.label}</div>
                      <p style={{
                        fontFamily: 'Barlow, sans-serif',
                        fontSize: 'clamp(14px, 1.5vw, 16px)',
                        lineHeight: 1.85, fontWeight: 300,
                        color: 'rgba(255,255,255,0.65)',
                        margin: 0,
                      }}>{entry.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── GALLERY ──────────────────────────────────────── */}
        {mediaLoaded && galleryImages.length > 0 && (
          <section style={{
            padding: 'clamp(60px, 8vw, 100px) 40px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{
                display: 'flex', alignItems: 'flex-end',
                justifyContent: 'space-between', flexWrap: 'wrap',
                gap: '16px', marginBottom: '32px',
              }}>
                <div>
                  <div className="section-label reveal" style={{ color: band.color, marginBottom: '8px' }}>
                    Live Photography
                  </div>
                  <h2 className="reveal delay-100" style={{
                    fontFamily: 'Bebas Neue, cursive',
                    fontSize: 'clamp(32px, 5vw, 60px)',
                    letterSpacing: '0.02em', lineHeight: 0.9,
                  }}>On Stage</h2>
                </div>
                <p className="reveal" style={{
                  fontFamily: 'Barlow, sans-serif', fontSize: '13px',
                  color: 'rgba(255,255,255,0.3)', fontStyle: 'italic',
                }}>Click any photo to expand</p>
              </div>

              {/* Masonry-style gallery grid */}
              <div className="gallery-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridAutoRows: '240px',
                gap: '6px',
              }}>
                {galleryImages.map((img, i) => {
                  // Every 5th image spans 2 columns for visual variety
                  const isWide = i % 5 === 0
                  const isTall = i % 7 === 3
                  return (
                    <div
                      key={img.url}
                      className={`reveal delay-${Math.min(i * 80, 400)}`}
                      onClick={() => openLightbox(img, i + 2)}
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'zoom-in',
                        gridColumn: isWide ? 'span 2' : 'span 1',
                        gridRow: isTall ? 'span 2' : 'span 1',
                      }}
                    >
                      <Image
                        src={img.url}
                        alt={`${band.name} live`}
                        fill
                        style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        quality={80}
                      />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: `${band.color}25`,
                        opacity: 0, transition: 'opacity 0.3s ease',
                      }}
                        onMouseEnter={e => {
                          e.currentTarget.style.opacity = '1'
                          e.currentTarget.previousElementSibling.style.transform = 'scale(1.04)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.opacity = '0'
                          e.currentTarget.previousElementSibling.style.transform = 'scale(1)'
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── BOOKING CTA ──────────────────────────────────── */}
        <section style={{
          padding: 'clamp(80px, 10vw, 120px) 40px',
          background: `radial-gradient(ellipse 60% 80% at 50% 100%, ${band.color}0a 0%, transparent 70%)`,
        }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              width: '32px', height: '3px',
              background: band.color,
              margin: '0 auto 24px',
            }} />
            <div className="section-label reveal" style={{ color: band.color, marginBottom: '16px' }}>
              Booking
            </div>
            <h2 className="reveal delay-100" style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 'clamp(44px, 8vw, 100px)',
              letterSpacing: '0.02em', lineHeight: 0.88,
              marginBottom: '20px',
            }}>
              Ready to Book<br />
              <span style={{ color: band.color }}>{band.name}?</span>
            </h2>
            <p className="reveal delay-200" style={{
              fontFamily: 'Barlow, sans-serif', fontSize: '16px',
              lineHeight: 1.7, color: 'rgba(255,255,255,0.4)',
              marginBottom: '36px',
            }}>
              We work with venues, festivals, and private events across DFW and beyond. Reach out and let's build something great together.
            </p>
            <div className="reveal delay-300" style={{
              display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap',
            }}>
              <Link href="/contact" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: '#080808',
                background: band.color, padding: '15px 32px',
                textDecoration: 'none', transition: 'opacity 0.2s ease, transform 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              >Submit Booking Inquiry →</Link>
              <a href={`mailto:${band.bookingEmail}`} style={{
                display: 'inline-flex', alignItems: 'center',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '12px', fontWeight: 600, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '15px 24px', textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
              >Email Directly</a>
            </div>
          </div>
        </section>

        {/* ── OTHER BANDS ──────────────────────────────────── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) 40px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div className="section-label reveal" style={{ marginBottom: '32px' }}>
              Also on Our Roster
            </div>
            <div className="roster-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1px', background: 'rgba(255,255,255,0.05)',
            }}>
              {otherBands.map((b, i) => (
                <Link key={b.slug} href={`/bands/${b.slug}`}
                  className={`reveal delay-${i * 80}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    background: '#080808', padding: '24px 28px',
                    textDecoration: 'none',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = `${b.color}08`}
                  onMouseLeave={e => e.currentTarget.style.background = '#080808'}
                >
                  <div style={{
                    width: '4px', height: '40px',
                    background: b.color, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'Bebas Neue, cursive',
                      fontSize: '22px', letterSpacing: '0.04em', color: '#fff',
                    }}>{b.name}</div>
                    <div style={{
                      fontFamily: 'Barlow, sans-serif',
                      fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                    }}>{b.tagline}</div>
                  </div>
                  <span style={{ color: b.color, opacity: 0.5, fontSize: '16px' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── LIGHTBOX ─────────────────────────────────────── */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,0.97)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', cursor: 'zoom-out',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {/* Prev/Next arrows */}
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); const p = (lightboxIdx - 1 + images.length) % images.length; setLightboxIdx(p); setLightboxImg(images[p]) }}
                style={{
                  position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', width: '44px', height: '44px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '18px', transition: 'background 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >←</button>
              <button onClick={e => { e.stopPropagation(); const n = (lightboxIdx + 1) % images.length; setLightboxIdx(n); setLightboxImg(images[n]) }}
                style={{
                  position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', width: '44px', height: '44px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '18px', transition: 'background 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >→</button>
            </>
          )}

          <div style={{ position: 'relative', maxWidth: '88vw', maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>
            <img
              src={lightboxImg.url}
              alt={band.name}
              style={{ maxWidth: '88vw', maxHeight: '88vh', objectFit: 'contain', display: 'block' }}
            />
            <button onClick={() => setLightboxImg(null)} style={{
              position: 'absolute', top: '-40px', right: '0',
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              fontSize: '28px', cursor: 'pointer', lineHeight: 1,
              transition: 'color 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >×</button>
            <div style={{
              position: 'absolute', bottom: '-32px', left: '0',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '11px', letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.25)',
            }}>{lightboxIdx + 1} / {images.length}</div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
