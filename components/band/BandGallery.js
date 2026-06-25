'use client'
import Image from 'next/image'

export default function BandGallery({ band, galleryImages, openLightbox }) {
  return (
          <section style={{
            padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{
                display: 'flex', alignItems: 'flex-end',
                justifyContent: 'space-between', flexWrap: 'wrap',
                gap: '16px', marginBottom: '32px',
              }}>
                <div>
                  {/* Gallery section appears AFTER the page's IntersectionObserver
                      has already set up (mediaLoaded flips true post-fetch), so
                      .reveal classes would never get observed. Use the mount-time
                      .fade-up-in keyframe animation instead. Same pattern as the
                      band Lineup section. */}
                  <div className="section-label fade-up-in" style={{ color: band.color, marginBottom: '8px' }}>
                    Live Photography
                  </div>
                  <h2 className="fade-up-in" style={{
                    fontFamily: 'Bebas Neue, cursive',
                    fontSize: 'clamp(32px, 5vw, 60px)',
                    letterSpacing: '0.02em', lineHeight: 0.9,
                    animationDelay: '100ms',
                  }}>On Stage</h2>
                </div>
                <p className="fade-up-in" style={{
                  fontFamily: 'Barlow, sans-serif', fontSize: '13px',
                  color: 'rgba(255,255,255,0.3)', fontStyle: 'italic',
                  animationDelay: '160ms',
                }}>Click any photo to expand</p>
              </div>

              {/* Mosaic gallery — 3-col grid with strategic wide spans.
                  Span count is computed from photo count so the grid always
                  tiles cleanly with no trailing gaps, regardless of how many
                  photos are in galleryPhotos. `grid-auto-flow: dense` packs
                  any remaining holes if a future edit breaks the math. */}
              {(() => {
                const count = galleryImages.length
                const remainder = count % 3
                const needWides = remainder === 0 ? 0 : (3 - remainder)
                const wideSet = new Set()
                if (count >= 4 && needWides >= 1) wideSet.add(0)
                if (needWides >= 2) wideSet.add(count - 1)
                if (needWides >= 3) wideSet.add(Math.floor(count / 2))
                return (
                  <div className="gallery-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridAutoRows: '240px',
                    gridAutoFlow: 'dense',
                    gap: '6px',
                  }}>
                    {galleryImages.map((img, i) => {
                      const isWide = wideSet.has(i)
                      return (
                        <div
                          key={img.url}
                          className="fade-up-in"
                          onClick={() => openLightbox(img, i + 2)}
                          style={{
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'zoom-in',
                            gridColumn: isWide ? 'span 2' : 'span 1',
                            animationDelay: `${220 + Math.min(i * 60, 600)}ms`,
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
                )
              })()}
            </div>
          </section>
  )
}
