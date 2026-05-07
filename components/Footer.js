import Link from 'next/link'
import { bandsList } from '@/lib/bands'

// Phase 1: refactored to use design tokens (see app/globals.css and site-audit/design-system.md).
// Visual output is identical to the previous version. Token mapping:
//   colors    rgba/#hex strings         → var(--c-*)
//   fonts     'Bebas Neue, cursive'      → var(--ff-display)
//             'Barlow, sans-serif'       → var(--ff-body)
//             'Barlow Condensed, ...'    → var(--ff-label)
//   spacing   matching scale values      → var(--s-*)
//   motion    transition durations       → var(--d-fast/base) + var(--ease-*)
// Values that don't match the scale (e.g., 0.08em letter-spacing) stay inline.

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      background: '#050505', // intentionally darker than --c-bg for footer separation
      borderTop: '1px solid var(--c-border)',
      padding: 'var(--s-8) 0 var(--s-6)',
    }}>
      <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto', padding: '0 var(--gutter-d)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--s-7)',
          marginBottom: 'var(--s-8)',
        }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{
              fontFamily: 'var(--ff-display)',
              fontSize: '28px',
              letterSpacing: '0.08em',
              color: 'var(--c-epl)',
              marginBottom: 'var(--s-2)',
            }}>Echo Play Live</div>
            <p style={{
              fontFamily: 'var(--ff-body)',
              fontSize: 'var(--t-body-s)',
              lineHeight: 'var(--lh-base)',
              color: 'rgba(255,255,255,0.35)',
              maxWidth: '240px',
            }}>
              DFW's premier band management company. Founded 2023 by Evan Ranallo.
            </p>
            <p style={{
              fontFamily: 'var(--ff-body)',
              fontSize: '12px',
              color: 'var(--c-text-faint)',
              marginTop: 'var(--s-3)',
            }}>
              Fort Worth, TX
            </p>
          </div>

          {/* Bands */}
          <div>
            <div style={{
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label-s)',
              fontWeight: 600,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--c-epl)',
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
                    gap: 'var(--s-2)',
                    textDecoration: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'var(--ff-body)',
                    fontSize: 'var(--t-body-s)',
                    transition: 'color var(--d-fast) var(--ease-in-out)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = band.color}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                  <span style={{ width: 'var(--s-1)', height: 'var(--s-1)', borderRadius: '50%', background: band.color, flexShrink: 0 }} />
                  {band.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div style={{
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label-s)',
              fontWeight: 600,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--c-epl)',
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
              fontFamily: 'var(--ff-label)',
              fontSize: 'var(--t-label-s)',
              fontWeight: 600,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--c-epl)',
              marginBottom: '20px',
            }}>Get In Touch</div>
            <Link
              href="/contact"
              style={{
                display: 'block',
                fontFamily: 'var(--ff-body)',
                fontSize: 'var(--t-body-s)',
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                marginBottom: 'var(--s-4)',
                transition: 'color var(--d-fast) var(--ease-in-out)',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--c-epl)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >
              For booking inquiries, contact us →
            </Link>
            <Link
              href="/contact"
              style={{
                display: 'inline-block',
                fontFamily: 'var(--ff-label)',
                fontSize: 'var(--t-label)',
                fontWeight: 600,
                letterSpacing: 'var(--ls-label-tight)',
                textTransform: 'uppercase',
                color: 'var(--c-bg)',
                background: 'var(--c-epl)',
                padding: '9px 18px',
                textDecoration: 'none',
                transition: 'opacity var(--d-fast) var(--ease-in-out)',
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
          borderTop: '1px solid var(--c-border)',
          paddingTop: 'var(--s-5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--s-3)',
        }}>
          <p style={{
            fontFamily: 'var(--ff-body)',
            fontSize: 'var(--t-label)',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.05em',
          }}>
            © {year} Echo Play Live. All rights reserved.
          </p>
          <p style={{
            fontFamily: 'var(--ff-body)',
            fontSize: 'var(--t-label)',
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
