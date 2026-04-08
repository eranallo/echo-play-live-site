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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
    instagram: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
      </svg>
    ),
    youtube: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon fill="#080808" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
    tiktok: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
      </svg>
    ),
  }
  return icons[platform] || null
}

export default function BandPage({ params }) {
  const band = getBand(params.slug)
  const pageRef = useScrollReveal()
  const [images, setImages] = useState([])
  const [heroImage, setHeroImage] = useState(null)
  const [lightboxImg, setLightboxImg] = useState(null)
  const [mediaLoaded, setMediaLoaded] = useState(false)

  useEffect(() => {
    if (!band) return
    fetch(`/api/media?band=${band.slug}`)
      .then(r => r.json())
      .then(data => {
        const imgs = data.images || []
        setImages(imgs)
        if (imgs.length > 0) setHeroImage(imgs[0])
        setMediaLoaded(true)
      })
      .catch(() => setMediaLoaded(true))
  }, [band?.slug])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setLightboxImg(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!band) notFound()

  const otherBands = bandsList.filter(b => b.slug !== band.slug)
  const galleryImages = images.slice(1)

  return (
    <>
      <Nav />
      <main ref={pageRef} style={{ background: '#080808' }}>

        {/* ── HERO ─────────────────────────────────────── */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'relative',
          overflow: 'hidden',
          padding: '0 0 80px',
        }}>
          {heroImage ? (
            <>
              <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <Image
                  src={heroImage.url}
                  alt={`${band.name} live`}
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  priority
                  sizes="100vw"
                />
              </div>
              <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: `linear-gradient(to bottom, rgba(8,8,8,0.2) 0%, rgba(8,8,8,0.1) 30%, rgba(8,8,8,0.7) 65%, rgba(8,8,8,0.97) 100%)`,
              }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
                background: `linear-gradient(to right, ${band.color}, transparent)`,
                zIndex: 2,
              }} />
            </>
          ) : (
            <>
              <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: `radial-gradient(ellipse 70% 70% at 70% 30%, ${band.color}18 0%, transparent 60%), #080808`,
              }} />
              <div className={`pattern-${band.pattern}`} style={{ position: 'absolute', inset: 0, opacity: 0.6, zIndex: 0 }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
                background: 'linear-gradient(to bottom, transparent, #080808)', zIndex: 1,
              }} />
            </>
          )}

          <div style={{
            position: 'absolute', right: '-0.05em', top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: 'Bebas Neue, cursive',
            fontSize: 'clamp(200px, 40vw, 500px)',
            lineHeight: 0.8, color: band.color, opacity: 0.05,
            pointerEvents: 'none', userSelect: 'none', zIndex: 2,
          }}>{band.number}</div>

          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 3, width: '100%' }}>
            <div style={{
              fontFamily: 'Barlow Condensed, Barlow, sans-serif',
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
              marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
              <span>/</span>
              <Link href="/#bands" style={{ color: 'inherit', textDecoration: 'none' }}>Bands</Link>
              <span>/</span>
              <span style={{ color: band.color }}>{band.name}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {band.genre.map(g => (
                <span key={g} style={{
                  fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: band.color,
                  background: `${band.color}15`, padding: '5px 10px',
                  border: `1px solid ${band.color}30`,
                }}>{g}</span>
              ))}
            </div>

            <h1 style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 'clamp(64px, 14vw, 180px)',
              letterSpacing: '0.01em', lineHeight: 0.85, color: '#fff', marginBottom: '16px',
              textShadow: heroImage ? '0 4px 60px rgba(0,0,0,0.9)' : 'none',
            }}>{band.name}</h1>

            <p style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: 'clamp(16px, 2.5vw, 22px)',
              fontStyle: 'italic', fontWeight: 300,
              color: band.color, letterSpacing: '0.02em', marginBottom: '32px',
            }}>{band.tagline}</p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {Object.entries(band.social).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                    fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)',
                    background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
                    padding: '10px 16px', textDecoration: 'none', backdropFilter: 'blur(8px)',
                    transition: 'color 0.2s ease, border-color 0.2s ease, background 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = band.color
                    e.currentTarget.style.borderColor = `${band.color}40`
                    e.currentTarget.style.background = `${band.color}15`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                    e.currentTarget.style.background = 'rgba(0,0,0,0.5)'
                  }}
                >
                  <SocialIcon platform={platform} />
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── DESCRIPTION ──────────────────────────────── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) 32px',
          borderTop: `1px solid ${band.color}20`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '3px', background: `linear-gradient(to bottom, ${band.color}, transparent)`,
          }} />
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 'clamp(40px, 6vw, 100px)', alignItems: 'start',
            }}>
              <div>
                <div className="section-label reveal" style={{ color: band.color, marginBottom: '24px' }}>About the Band</div>
                <p className="reveal delay-100" style={{
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: 'clamp(16px, 1.8vw, 19px)',
                  lineHeight: 1.8, fontWeight: 300, color: 'rgba(255,255,255,0.7)',
                }}>{band.description}</p>
              </div>

              <div className="reveal reveal-right delay-200" style={{
                background: `${band.color}08`, border: `1px solid ${band.color}15`, padding: '40px',
              }}>
                <div style={{
                  fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.25em',
                  textTransform: 'uppercase', color: band.color, marginBottom: '24px',
                }}>The Details</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    { label: 'Type', value: 'Tribute / Cover Band' },
                    { label: 'Genre', value: band.genre.join(' · ') },
                    { label: 'Era', value: band.era },
                    { label: 'Based', value: 'Fort Worth / DFW, Texas' },
                    { label: 'Management', value: 'Echo Play Live' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
                      <div style={{
                        fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                        fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em',
                        textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '4px',
                      }}>{label}</div>
                      <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PHOTO GALLERY ────────────────────────────── */}
        {mediaLoaded && galleryImages.length > 0 && (
          <section style={{
            padding: 'clamp(60px, 8vw, 100px) 32px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div className="section-label reveal" style={{ color: band.color, marginBottom: '40px' }}>
                Live Photos
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
              }}>
                {galleryImages.map((img, i) => (
                  <div
                    key={img.url}
                    className={`reveal delay-${Math.min(i * 100, 400)}`}
                    onClick={() => setLightboxImg(img)}
                    style={{
                      position: 'relative',
                      aspectRatio: i % 4 === 0 ? '16/9' : '4/3',
                      overflow: 'hidden',
                      cursor: 'zoom-in',
                      gridColumn: i % 4 === 0 ? 'span 2' : 'span 1',
                    }}
                  >
                    <Image
                      src={img.url}
                      alt={`${band.name} - photo ${i + 2}`}
                      fill
                      style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(135deg, ${band.color}30, transparent)`,
                      opacity: 0, transition: 'opacity 0.3s ease',
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.opacity = '1'
                        e.currentTarget.previousElementSibling.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.opacity = '0'
                        e.currentTarget.previousElementSibling.style.transform = 'scale(1)'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── BOOKING CTA ──────────────────────────────── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) 32px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: `radial-gradient(ellipse 50% 100% at 50% 100%, ${band.color}08 0%, transparent 70%)`,
        }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <div className="section-label reveal" style={{ color: band.color, marginBottom: '20px' }}>Book {band.name}</div>
            <h2 className="reveal delay-100" style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: 'clamp(40px, 7vw, 88px)',
              letterSpacing: '0.02em', lineHeight: 0.9, marginBottom: '20px',
            }}>Ready for a<br />Live Experience?</h2>
            <p className="reveal delay-200" style={{
              fontFamily: 'Barlow, sans-serif', fontSize: '15px',
              lineHeight: 1.7, color: 'rgba(255,255,255,0.4)', marginBottom: '36px',
            }}>
              Venues, festivals, private events. Contact us to bring {band.name} to your audience.
            </p>
            <div className="reveal delay-300" style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/contact" style={{
                textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: '#080808',
                background: band.color, padding: '14px 28px',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              >Booking Inquiry →</Link>
            </div>
          </div>
        </section>

        {/* ── OTHER BANDS ──────────────────────────────── */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div className="section-label reveal" style={{ marginBottom: '40px' }}>Also on Our Roster</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {otherBands.map((b, i) => (
                <Link key={b.slug} href={`/bands/${b.slug}`}
                  className={`reveal delay-${i * 100}`}
                  style={{
                    display: 'block', textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '28px', position: 'relative', overflow: 'hidden',
                    transition: 'border-color 0.3s ease, transform 0.3s ease',
                    background: 'rgba(255,255,255,0.01)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${b.color}40`; e.currentTarget.style.transform = 'translateY(-4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ fontFamily: 'Barlow Condensed, Barlow, sans-serif', fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: b.color, marginBottom: '10px' }}>{b.number}</div>
                  <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '28px', letterSpacing: '0.04em', color: '#fff', marginBottom: '6px' }}>{b.name}</div>
                  <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{b.tagline}</div>
                  <div style={{ position: 'absolute', bottom: '20px', right: '20px', color: b.color, fontSize: '18px', opacity: 0.5 }}>→</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── LIGHTBOX ─────────────────────────────────── */}
      {lightboxImg && (
        <div onClick={() => setLightboxImg(null)} style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.96)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', cursor: 'zoom-out',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={lightboxImg.url} alt={band.name}
              style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', display: 'block' }}
            />
            <button onClick={() => setLightboxImg(null)} style={{
              position: 'absolute', top: '-44px', right: '0',
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              fontSize: '32px', cursor: 'pointer', lineHeight: 1,
              transition: 'color 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >×</button>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
