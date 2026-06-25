'use client'
import Image from 'next/image'

export default function BandAbout({ band, featureImg, openLightbox }) {
  return (
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)',
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

            {/* Feature photo: second best shot */}
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
  )
}
