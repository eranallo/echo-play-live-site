'use client'
import AnimatedStat from '@/components/AnimatedStat'

export default function BandStatsBar({ band, stats }) {
  return (
          <section style={{
            borderTop: `1px solid ${band.color}25`,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: `${band.color}06`,
          }}>
            <div className="stats-bar-grid" style={{
              maxWidth: '1400px', margin: '0 auto', padding: '0 var(--gutter-fluid)',
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
                  }}>
                    <AnimatedStat value={stat.value} />
                  </div>
                  <div style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
  )
}
