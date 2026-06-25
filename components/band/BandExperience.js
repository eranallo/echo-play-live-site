'use client'
import Image from 'next/image'

export default function BandExperience({ band, crowdImg, openLightbox }) {
  return (
          <section style={{
            padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.01)',
          }}>
            <div style={{ maxWidth: crowdImg ? '1400px' : '820px', margin: '0 auto' }}>
              <div className={crowdImg ? 'proof-grid' : ''} style={crowdImg ? {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'clamp(40px, 6vw, 96px)',
                alignItems: 'center',
              } : { textAlign: 'center' }}>
                {/* Crowd photo (only when set) */}
                {crowdImg && (
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
                )}

                {/* Experience copy */}
                <div>
                  <div style={{
                    width: '32px', height: '3px',
                    background: band.color, marginBottom: '24px',
                    margin: crowdImg ? '0 0 24px 0' : '0 auto 24px',
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
                    maxWidth: crowdImg ? 'none' : '640px',
                    margin: crowdImg ? '0 0 28px 0' : '0 auto 28px',
                  }}>
                    {band.experienceBody || `When you book ${band.name}, your audience gets a show worth coming back for.`}
                  </p>
                  <div className="reveal delay-300" style={{
                    display: 'flex',
                    gap: '20px',
                    flexWrap: 'wrap',
                    justifyContent: crowdImg ? 'flex-start' : 'center',
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
  )
}
