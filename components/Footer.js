import Link from 'next/link'
import { bandsList } from '@/lib/bands'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      background: '#050505',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '64px 0 32px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          marginBottom: '64px',
        }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: '28px',
              letterSpacing: '0.08em',
              color: '#F5C518',
              marginBottom: '8px',
            }}>Echo Play Live</div>
            <p style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: '13px',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.35)',
              maxWidth: '240px',
            }}>
              DFW's premier band management company. Founded 2023 by Evan Ranallo.
            </p>
            <p style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.25)',
              marginTop: '12px',
            }}>
              Fort Worth, TX
            </p>
          </div>

          {/* Bands */}
          <div>
            <div style={{
              fontFamily: 'Barlow Condensed, Barlow, sans-serif',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#F5C518',
              marginBottom: '20px',
            }}>Our Roster</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bandsList.map(band => (
                <Link
                  key={band.slug}
                  href={`/bands/${band.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '13px',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = band.color}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: band.color, flexShrink: 0 }} />
                  {band.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div style={{
              fontFamily: 'Barlow Condensed, Barlow, sans-serif',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#F5C518',
              marginBottom: '20px',
            }}>Navigate</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: '/', label: 'Home' },
                { href: '/shows', label: 'Shows' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact / Booking' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="footer-link"
                  style={{ textDecoration: 'none' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{
              fontFamily: 'Barlow Condensed, Barlow, sans-serif',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#F5C518',
              marginBottom: '20px',
            }}>Get In Touch</div>
            <Link
              href="/contact"
              style={{
                display: 'block',
                fontFamily: 'Barlow, sans-serif',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                marginBottom: '16px',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#F5C518'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >
              For booking inquiries, contact us →
            </Link>
            <Link
              href="/contact"
              style={{
                display: 'inline-block',
                fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#080808',
                background: '#F5C518',
                padding: '9px 18px',
                textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Book a Band
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{
            fontFamily: 'Barlow, sans-serif',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.05em',
          }}>
            © {year} Echo Play Live. All rights reserved.
          </p>
          <p style={{
            fontFamily: 'Barlow, sans-serif',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '0.05em',
          }}>
            Quality · Hustle · Love for the Show
          </p>
        </div>
      </div>
    </footer>
  )
}
