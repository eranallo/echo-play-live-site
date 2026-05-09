'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { bandsList } from '@/lib/bands'

// Phase 1: refactored to use design tokens (see app/globals.css and site-audit/design-system.md).
// Visual output is identical to the previous version.

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
          transition: 'background var(--d-base) var(--ease-in-out), padding var(--d-base) var(--ease-in-out), border-color var(--d-base) var(--ease-in-out)',
          background: scrolled ? 'rgba(8,8,8,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--c-border)' : '1px solid transparent',
          padding: scrolled ? '14px 0' : '22px 0',
        }}
      >
        <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto', padding: '0 var(--gutter-d)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo: badge mark + Bebas wordmark */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--s-3)', minHeight: '44px' }} aria-label="Echo Play Live home">
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              priority
              style={{ display: 'block', flexShrink: 0 }}
            />
            <span style={{
              fontFamily: 'var(--ff-display)',
              fontSize: '22px',
              letterSpacing: '0.08em',
              color: 'var(--c-epl)',
              lineHeight: 1,
            }}>ECHO PLAY LIVE</span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }} className="desktop-nav">
            <Link href="/" className="nav-link" style={{ textDecoration: 'none' }}>Home</Link>

            {/* Bands Dropdown */}
            <div style={{ position: 'relative' }} onMouseEnter={() => setBandsOpen(true)} onMouseLeave={() => setBandsOpen(false)}>
              <span className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--s-1)' }}>
                Bands
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5, transition: 'transform var(--d-fast) var(--ease-in-out)', transform: bandsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '-20px',
                paddingTop: 'var(--s-3)',
                opacity: bandsOpen ? 1 : 0,
                pointerEvents: bandsOpen ? 'all' : 'none',
                transform: bandsOpen ? 'translateY(0)' : 'translateY(-8px)',
                transition: 'opacity var(--d-fast) var(--ease-in-out), transform var(--d-fast) var(--ease-in-out)',
                zIndex: 100,
              }}>
                <div style={{
                  background: 'rgba(12,12,12,0.98)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  minWidth: '200px',
                  padding: 'var(--s-2) 0',
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
                        transition: 'background 150ms var(--ease-in-out)',
                      }}
                      className="dropdown-item"
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--c-surface-3)'}
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
                        fontFamily: 'var(--ff-label)',
                        fontSize: 'var(--t-body-s)',
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
            <Link href="/musicians" className="nav-link" style={{ textDecoration: 'none' }}>Roster</Link>
            <Link href="/about" className="nav-link" style={{ textDecoration: 'none' }}>About</Link>
            <Link href="/contact" style={{
              textDecoration: 'none',
              fontFamily: 'var(--ff-label)',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: 'var(--ls-label-tight)',
              textTransform: 'uppercase',
              color: 'var(--c-bg)',
              background: 'var(--c-epl)',
              padding: '9px 20px',
              transition: 'opacity var(--d-fast) var(--ease-in-out)',
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
                display: 'block', height: '1.5px', background: 'var(--c-text)',
                transition: 'transform 300ms var(--ease-in-out), opacity 300ms var(--ease-in-out)',
                transform: open ? 'rotate(45deg) translate(4px, 5px)' : 'none',
              }} />
              <span style={{
                display: 'block', height: '1.5px', background: 'var(--c-text)',
                opacity: open ? 0 : 1,
                transition: 'opacity 300ms var(--ease-in-out)',
              }} />
              <span style={{
                display: 'block', height: '1.5px', background: 'var(--c-text)',
                transition: 'transform 300ms var(--ease-in-out)',
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
        background: 'var(--c-bg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'all' : 'none',
        transition: 'opacity 300ms var(--ease-in-out)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-1)' }}>
          {[
            { href: '/', label: 'Home' },
            { href: '/shows', label: 'Shows' },
            { href: '/musicians', label: 'Roster' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Book Now' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: 'var(--ff-display)',
                fontSize: 'clamp(40px, 10vw, 72px)',
                letterSpacing: '0.04em',
                color: 'var(--c-text)',
                textDecoration: 'none',
                lineHeight: 'var(--lh-tight)',
                transition: 'color var(--d-fast) var(--ease-in-out)',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--c-epl)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text)'}
            >
              {label}
            </Link>
          ))}
          <div style={{ marginTop: 'var(--s-4)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
            {bandsList.map(band => (
              <Link
                key={band.slug}
                href={`/bands/${band.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontFamily: 'var(--ff-label)',
                  fontSize: '16px',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  padding: 'var(--s-2) 0',
                  transition: 'color var(--d-fast) var(--ease-in-out)',
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
