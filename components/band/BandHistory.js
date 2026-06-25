'use client'

export default function BandHistory({ band }) {
  return (
          <section style={{
            padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)',
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
                  <div key={i} className={`history-row reveal delay-${Math.min(i * 100, 400)}`} style={{
                    borderLeft: `3px solid ${band.color}`,
                    background: 'rgba(255,255,255,0.015)',
                    transition: 'background 0.2s ease',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = `${band.color}08`}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                  >
                    {/* Year column (stacks above content on mobile via .history-row) */}
                    <div className="history-year" style={{
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
                    <div className="history-body" style={{ padding: '28px 32px' }}>
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
  )
}
