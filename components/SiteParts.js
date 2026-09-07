import Link from 'next/link'
import Image from 'next/image'
import Nav from './Nav'
import Footer from './Footer'
export function Page({ children, className = '' }) {
  return (
    <>
      <Nav />
      <main id="main-content" tabIndex={-1} className={`public-page ${className}`}>
        {children}
      </main>
      <Footer />
    </>
  )
}
export function Intro({ eyebrow, title, children }) {
  return (
    <section className="shell page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
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
          Your crowd.
          <br />
          Our kind of night.
        </h2>
        <p>
          Tell us the date, the room, and what you have in mind.
          <br className="desktop-break" /> We’ll help you find the band that fits.
        </p>
        <Link className="button" href="/contact">
          Let’s talk booking <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  )
}
export function BandCard({ band, index = 0 }) {
  return (
    <Link className={`band-card band-${band.slug}`} href={`/bands/${band.slug}`}>
      <Image
        src={band.heroPhoto}
        alt={`${band.name} performing live`}
        fill
        sizes="(max-width: 620px) 92vw, 46vw"
        style={{ objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center' }}
      />
      <div className="band-card-shade" />
      <div className="band-card-top">
        <span>
          {band.tributeArtistName ? `${band.tributeArtistName} tribute` : band.genre?.[0]}
        </span>
        <span className="card-number">0{index + 1}</span>
      </div>
      <div className="band-card-bottom">
        <div>
          <h3>{band.name}</h3>
          <p>{band.tagline}</p>
        </div>
        <span className="round-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
    </Link>
  )
}
