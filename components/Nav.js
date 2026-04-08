'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { bandsList } from '@/lib/bands'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [bandsOpen, setBandsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setBandsOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'background 0.4s ease, padding 0.4s ease, border-color 0.4s ease',
          background: scrolled ? 'rgba(8,8,8,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          padding: scrolled ? '14px 0' : '22px 0',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{
                fontFamily: 'Bebas Neue, cursive',
                fontSize: '22px',
                letterSpacing: '0.08em',
                color: '#F5C518',
              }}>ECHO PLAY LIVE</span>
              <span style={{
                fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                fontSize: '9px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                marginTop: '1px',
              }}>Band Management · Est. 2023</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }} className="desktop-nav">
            <Link href="/" className="nav-link" style={{ textDecoration: 'none' }}>Home</Link>

            {/* Bands Dropdown */}
            <div style={{ position: 'relative' }} onMouseEnter={() => setBandsOpen(true)} onMouseLeave={() => setBandsOpen(false)}>
              <span className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Bands
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5, transition: 'transform 0.2s', transform: bandsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '-20px',
                paddingTop: '12px',
                opacity: bandsOpen ? 1 : 0,
                pointerEvents: bandsOpen ? 'all' : 'none',
                transform: bandsOpen ? 'translateY(0)' : 'translateY(-8px)',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                zIndex: 100,
              }}>
                <div style={{
                  background: 'rgba(12,12,12,0.98)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  minWidth: '200px',
                  padding: '8px 0',
                }}>
                  {bandsList.map(band => (
                    <Link
                      key={band.slug}
                      href={`/bands/${band.slug}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 20px',
                        textDecoration: 'none',
                        transition: 'background 0.15s ease',
                      }}
                      className="dropdown-item"
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: band.color,
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                        fontSize: '13px',
                        fontWeight: 500,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.8)',
                      }}>{band.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/shows" className="nav-link" style={{ textDecoration: 'none' }}>Shows</Link>
            <Link href="/about" className="nav-link" style={{ textDecoration: 'none' }}>About</Link>
            <Link href="/contact" style={{
              textDecoration: 'none',
              fontFamily: 'Barlow Condensed, Barlow, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#080808',
              background: '#F5C518',
              padding: '9px 20px',
              transition: 'opacity 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'none' }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            <div style={{ width: '24px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{
                display: 'block', height: '1.5px', background: '#fff',
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                transform: open ? 'rotate(45deg) translate(4px, 5px)' : 'none',
              }} />
              <span style={{
                display: 'block', height: '1.5px', background: '#fff',
                opacity: open ? 0 : 1,
                transition: 'opacity 0.3s ease',
              }} />
              <span style={{
                display: 'block', height: '1.5px', background: '#fff',
                transition: 'transform 0.3s ease',
                transform: open ? 'rotate(-45deg) translate(4px, -5px)' : 'none',
              }} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: '#080808',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'all' : 'none',
        transition: 'opacity 0.3s ease',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { href: '/', label: 'Home' },
            { href: '/shows', label: 'Shows' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Book Now' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: 'Bebas Neue, cursive',
                fontSize: 'clamp(40px, 10vw, 72px)',
                letterSpacing: '0.04em',
                color: '#fff',
                textDecoration: 'none',
                lineHeight: 1.1,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#F5C518'}
              onMouseLeave={e => e.currentTarget.style.color = '#fff'}
            >
              {label}
            </Link>
          ))}
          <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
            {bandsList.map(band => (
              <Link
                key={band.slug}
                href={`/bands/${band.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontFamily: 'Barlow Condensed, Barlow, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  padding: '8px 0',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = band.color}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: band.color }} />
                {band.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
