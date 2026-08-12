'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { bandsList } from '@/lib/bands'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/shows', label: 'Shows' },
  { href: '/musicians', label: 'Roster' },
  { href: '/podcast', label: 'Podcast' },
  { href: '/press', label: 'Press' },
  { href: '/about', label: 'About' },
]

const pad = value => String(value + 1).padStart(2, '0')

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [bandsOpen, setBandsOpen] = useState(false)
  const pathname = usePathname()
  const menuButtonRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setBandsOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKeyDown = event => {
      if (event.key !== 'Escape') return
      setOpen(false)
      setBandsOpen(false)
      menuButtonRef.current?.focus()
    }
    if (open || bandsOpen) document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, bandsOpen])

  const isActive = href => href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <nav className={`site-nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="site-nav__inner">
          <Link className="site-nav__brand" href="/" aria-label="Echo Play Live home">
            <Image src="/logo.png" alt="" width={34} height={34} priority />
            <span>
              <strong>Echo Play Live</strong>
              <small>Independent live entertainment</small>
            </span>
          </Link>

          <div className="site-nav__desktop">
            <Link className="site-nav__link" href="/" aria-current={isActive('/') ? 'page' : undefined}>Home</Link>

            <div
              className="site-nav__bands"
              onMouseEnter={() => setBandsOpen(true)}
              onMouseLeave={() => setBandsOpen(false)}
              onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setBandsOpen(false) }}
            >
              <button
                className="site-nav__bands-button"
                type="button"
                aria-expanded={bandsOpen}
                aria-controls="site-nav-bands"
                onClick={() => setBandsOpen(value => !value)}
              >
                Bands
              </button>
              <div id="site-nav-bands" className={`site-nav__dropdown ${bandsOpen ? 'is-open' : ''}`} aria-hidden={!bandsOpen}>
                {bandsList.map((band, index) => (
                  <Link key={band.slug} href={`/bands/${band.slug}`}>
                    <small>{pad(index)}</small>
                    <span>{band.name}</span>
                    <i style={{ '--band': band.color }} />
                  </Link>
                ))}
              </div>
            </div>

            {navItems.slice(1).map(item => (
              <Link key={item.href} className="site-nav__link" href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</Link>
            ))}
            <Link className="site-nav__book" href="/contact">Book a band</Link>
          </div>

          <button
            ref={menuButtonRef}
            className={`site-nav__menu-button ${open ? 'is-open' : ''}`}
            type="button"
            onClick={() => setOpen(value => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-site-menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div id="mobile-site-menu" className={`site-nav__mobile ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="site-nav__mobile-main">
          {[...navItems, { href: '/contact', label: 'Book a band' }].map((item, index) => (
            <Link key={item.href} href={item.href} style={{ '--i': index }}>
              <span>{pad(index)}</span>
              <strong>{item.label}</strong>
              <small>{isActive(item.href) ? 'Now' : 'Open'}</small>
            </Link>
          ))}
        </div>
        <div className="site-nav__mobile-bands" aria-label="Bands">
          <span>Roster / direct</span>
          {bandsList.map((band, index) => (
            <Link key={band.slug} href={`/bands/${band.slug}`} style={{ '--i': index + navItems.length + 1, '--band': band.color }}>
              <span>{pad(index)}</span>
              <strong>{band.name}</strong>
              <small style={{ color: band.color }}>Band</small>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
