'use client'

import Link from 'next/link'
import { bandsList } from '@/lib/bands'

const marquee = 'QUALITY / HUSTLE / LOVE FOR THE SHOW / THE FIRST NOTE / THE WHOLE ROOM / THE LAST CHORUS / '

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__marquee" aria-hidden="true">
        <span>{marquee}</span><span>{marquee}</span><span>{marquee}</span><span>{marquee}</span>
      </div>

      <div className="site-footer__inner">
        <div className="site-footer__statement">
          The last chorus<br />should still <em>echo.</em>
        </div>

        <div className="site-footer__grid">
          <div className="site-footer__column">
            <div className="site-footer__label">Echo Play Live / 01</div>
            <p>Independent tribute and cover-band management built in Fort Worth, Texas. Real preparation, real production, real live rooms.</p>
          </div>

          <div className="site-footer__column">
            <div className="site-footer__label">The roster / 02</div>
            {bandsList.map(band => (
              <Link className="site-footer__band" key={band.slug} href={`/bands/${band.slug}`}>
                <i style={{ '--band': band.color }} />
                <span>{band.name}</span>
              </Link>
            ))}
          </div>

          <div className="site-footer__column">
            <div className="site-footer__label">Explore / 03</div>
            <Link href="/shows">Shows</Link>
            <Link href="/musicians">Musicians</Link>
            <Link href="/podcast">Podcast</Link>
            <Link href="/press">Press and EPK</Link>
            <Link href="/about">About</Link>
          </div>

          <div className="site-footer__column">
            <div className="site-footer__label">Make a night / 04</div>
            <p>Venues, festivals, private events, and rooms that want more than background music.</p>
            <Link href="/contact">Start a booking ↗</Link>
            <Link href="/portal">Musician portal →</Link>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© {year} Echo Play Live</span>
          <span>Fort Worth / DFW / Texas and beyond</span>
          <span>Quality · Hustle · Love for the show</span>
        </div>
      </div>
    </footer>
  )
}
