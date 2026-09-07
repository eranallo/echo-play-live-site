'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
const links = [
  ['The bands', '/bands'],
  ['Shows', '/shows'],
  ['Our story', '/about'],
  ['Press', '/press'],
]
export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const button = useRef(null)
  const nav = useRef(null)
  useEffect(() => {
    setOpen(false)
  }, [pathname])
  useEffect(() => {
    if (!open) return
    const key = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    const outside = (e) => {
      if (!nav.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', key)
    document.addEventListener('pointerdown', outside)
    return () => {
      document.removeEventListener('keydown', key)
      document.removeEventListener('pointerdown', outside)
    }
  }, [open])
  const items = links.map(([label, href]) => (
    <Link
      key={href}
      href={href}
      aria-current={pathname === href || pathname.startsWith(href + '/') ? 'page' : undefined}
      onClick={() => setOpen(false)}
    >
      {label}
    </Link>
  ))
  return (
    <header className="site-header" ref={nav}>
      <nav className="nav-inner" aria-label="Main navigation">
        <Link className="wordmark" href="/" aria-label="Echo Play Live home">
          <span className="echo-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            echo play<span className="wordmark-live"> live</span>
          </span>
        </Link>
        <div className="desktop-links">{items}</div>
        <div className="nav-actions">
          <Link className="button button-small" href="/contact">
            Book a band <span aria-hidden="true">↗</span>
          </Link>
          <button
            ref={button}
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setOpen(!open)}
          >
            <span aria-hidden="true">{open ? '×' : '☰'}</span>
          </button>
        </div>
      </nav>
      {open && (
        <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation">
          {items}
          <Link href="/podcast">Podcast</Link>
          <Link href="/musicians">Meet the musicians</Link>
        </nav>
      )}
    </header>
  )
}
