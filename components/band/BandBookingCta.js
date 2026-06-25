'use client'
import Link from 'next/link'
import MagneticButton from '@/components/MagneticButton'

export default function BandBookingCta({ band }) {
  return (
        <section style={{
          padding: 'clamp(80px, 10vw, 120px) var(--gutter-fluid)',
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
              <MagneticButton strength={0.3} radius={100}>
                <Link href="/contact" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: '#080808',
                  background: band.color, padding: '15px 32px',
                  textDecoration: 'none', transition: 'opacity 0.2s ease',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >Submit Booking Inquiry →</Link>
              </MagneticButton>
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
  )
}
