import Link from 'next/link'
import { Children } from 'react'
import PortalSidebar from './PortalSidebar'
import Image from 'next/image'
import Nav from './Nav'
import Footer from './Footer'
export function Page({ children, className = '', section = 'bands', band, sidebar }) {
  const home = className.split(' ').includes('scene-home')
  const content = Children.toArray(children)
  const introIndex = content.findIndex(child => child.type === Intro)
  const intro = !home && introIndex >= 0 ? content.splice(introIndex, 1)[0] : null
  return (
    <>
      <Nav />
      <main id="main-content" tabIndex={-1} className={`public-page ${home ? '' : `portal-page portal-${section}`} ${className}`}>
        {home ? children : <>
          {intro}
          <div className="portal-layout shell">
            {sidebar === undefined ? <PortalSidebar section={section} band={band} /> : sidebar}
            <div className="portal-main">{content}</div>
          </div>
        </>}
      </main>
      <Footer />
    </>
  )
}
function compactTitle(node) {
  return Children.toArray(node).map(child => {
    if (typeof child === 'string' || typeof child === 'number') return String(child)
    if (child.type === 'br') return ' '
    return compactTitle(child.props?.children)
  }).join('')
}
export function Intro({ eyebrow, title, children }) {
  return (
    <section className="shell page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{compactTitle(title)}</h1>
      {children && <div className="intro-copy">{children}</div>}
    </section>
  )
}
export function BookingCta() {
  return (
    <section className="booking-banner">
      <div className="shell">
        <p className="eyebrow">For venues, festivals & private events</p>
        <h2>
          Let’s book{' '}
          <br />a show.
        </h2>
        <p>
          Send us the date, venue and what you’re planning.
          <br className="desktop-break" /> We’ll check availability and help you find the right
          band.
        </p>
        <Link className="button" href="/contact">
          Let’s talk booking <span aria-hidden="true">↗</span>
        </Link>
        <div className="inline-links buyer-cta-links"><Link href="/booking/venues-festivals">Venues & festivals ↗</Link><Link href="/booking/private-corporate">Private & corporate events ↗</Link></div>
      </div>
    </section>
  )
}
export function BandCard({ band, index = 0 }) {
  return (
    <Link className={`band-card portal-roster-card band-${band.slug}`} href={`/bands/${band.slug}`}>
      <div className="portal-band-art">
        <Image src={band.heroPhoto}
          alt={band.slug === 'the-dick-beldings' ? 'The Dick Beldings band portrait' : `${band.name} performing live`}
          fill sizes="(max-width: 900px) 90vw, 480px"
          style={{ objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center' }} />
        <span className="portal-card-index">0{index + 1}</span>
      </div>
      <div className="portal-band-copy">
        <p className="eyebrow">{band.tributeArtistName ? `${band.tributeArtistName} tribute` : band.genre?.slice(0, 2).join(' / ')}</p>
        <h2>{band.name}</h2><p>{band.tagline}</p>
        <span className="text-link">Visit artist profile →</span>
      </div>
    </Link>
  )
}
