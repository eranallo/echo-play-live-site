'use client'
import Link from 'next/link'

export default function OtherBands({ otherBands }) {
  return (
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) var(--gutter-fluid)',
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
  )
}
