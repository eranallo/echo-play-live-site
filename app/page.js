import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import HomeUpcomingShows from '@/components/HomeUpcomingShows'
import FanReviews from '@/components/FanReviews'
import LatestRecap from '@/components/LatestRecap'
import { Page, BookingCta } from '@/components/SiteParts'
import { bandsList } from '@/lib/bands'
import { performances } from '@/lib/public/performances.mjs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function HomePage() {
  const featured = ['so-long-goodnight', 'the-dick-beldings'].map(slug => bandsList.find(band => band.slug === slug))
  return (
    <Page className="scene-home">
      <section className="scene-welcome shell">
        <div>
          <p className="eyebrow">Tribute & cover bands · Fort Worth, Texas</p>
          <h1>Come out and see us.</h1>
          <p>We’re Echo Play Live. We manage four tribute and cover bands in DFW, playing everything from 90s rock to TOOL and Deftones.</p>
        </div>
        <Link className="button" href="/shows">Find a show <span aria-hidden="true">→</span></Link>
      </section>

      <section className="scene-featured shell" aria-labelledby="featured-heading">
        <div className="scene-section-bar"><h2 id="featured-heading">Featured bands</h2><Link href="/bands">Meet all {bandsList.length} bands →</Link></div>
        <div className="scene-featured-grid">
          {featured.map((band, index) => <Link className="scene-feature" key={band.slug} href={`/bands/${band.slug}`}>
            <Image src={band.slug === 'so-long-goodnight' ? '/bands/so-long-goodnight/feature.jpg' : '/press/bands/the-dick-beldings/cover.jpg'}
              alt={`${band.name} ${index === 0 ? 'performing live' : 'band portrait'}`}
              fill priority sizes="(max-width: 650px) 95vw, (max-width: 1280px) 50vw, 640px" style={{objectFit:'cover', objectPosition:index===0?'center 48%':'center 35%'}} />
            <span className="scene-feature-tag">{band.genre?.[0]}</span>
            <div className="scene-feature-caption"><h3>{band.name} <span aria-hidden="true">↗</span></h3><p>{band.tagline}</p></div>
          </Link>)}
        </div>
      </section>

      <div className="scene-columns shell">
        <aside className="scene-sidebar" aria-label="Explore the bands">
          <section className="scene-panel">
            <div className="scene-section-bar"><h2>Artist directory</h2><span>{String(bandsList.length).padStart(2,'0')}</span></div>
            <div className="scene-roster">
              {bandsList.map(band => <Link href={`/bands/${band.slug}`} key={band.slug}>
                <Image src={`/press/bands/${band.slug}/cover.jpg`} alt="" width={52} height={52} sizes="52px" style={{objectFit:'cover'}} />
                <span><strong>{band.name}</strong><small>{band.tributeArtistName ? `${band.tributeArtistName} tribute` : band.genre?.slice(0,2).join(' / ')}</small></span><span aria-hidden="true">›</span>
              </Link>)}
            </div>
          </section>
          <section className="scene-panel scene-community">
            <div className="scene-section-bar"><h2>Get involved</h2></div>
            <Link href="/requests"><span className="scene-action-icon" aria-hidden="true">♫</span><span><strong>What should we learn next?</strong><small>Request a song. Vote for your favorites.</small></span><span aria-hidden="true">›</span></Link>
            <Link href="/hub"><span className="scene-action-icon" aria-hidden="true">↗</span><span><strong>Keep up with the bands</strong><small>Official links, social pages & QR codes.</small></span><span aria-hidden="true">›</span></Link>
            <Link href="/shows#stay-in-loop"><span className="scene-action-icon" aria-hidden="true">✉</span><span><strong>Join the mailing list</strong><small>Show announcements in your inbox.</small></span><span aria-hidden="true">›</span></Link>
          </section>
          <section className="scene-panel scene-booking-note">
            <div className="scene-section-bar"><h2>For venues & event planners</h2></div>
            <div><h3>Let’s book a show.</h3><p>Send us the date, venue and what you’re planning. We’ll help you find the right band.</p><Link className="button button-outline" href="/press">Explore the band kits →</Link><Link className="text-link" href="/contact">Talk to Echo Play Live ↗</Link></div>
          </section>
        </aside>

        <div className="scene-main-column">
          <section className="scene-panel" aria-labelledby="live-heading">
            <div className="scene-section-bar"><h2 id="live-heading">From the stage</h2><span>Live performances</span></div>
            <div className="scene-live-grid">
              {Object.entries(performances).map(([slug, performance]) => <Link className="scene-live-card" href={`/bands/${slug}#watch`} key={slug}>
                <div className="scene-live-image"><Image src={performance.poster} alt={`${performance.band} performing at Granada Theater`} fill sizes="(max-width: 360px) 90vw, (max-width: 650px) 45vw, (max-width: 900px) 32vw, 470px" style={{objectFit:'cover'}} /><span className="scene-play" aria-hidden="true">▶</span></div>
                <div><h3>{performance.band} — “{performance.title}”</h3><p>{performance.venue}</p><span>Watch the full performance →</span></div>
              </Link>)}
            </div>
          </section>
          <Suspense fallback={<section className="scene-panel" aria-busy="true"><div className="scene-section-bar"><h2>Upcoming shows</h2></div><p className="scene-loading">Checking the latest dates…</p></section>}><HomeUpcomingShows /></Suspense>
          <Suspense fallback={null}><LatestRecap /></Suspense>
          <section className="scene-panel scene-about">
            <div className="scene-section-bar"><h2>About Echo Play Live</h2><span>Fort Worth, TX</span></div>
            <div><h2>We’re musicians, too.</h2><p>We handle booking and coordination for our bands. Our goal is to put on a great show and make things easier for the venues, crews and people we work with.</p><Link className="text-link" href="/about">Get to know Echo Play Live →</Link></div>
          </section>
        </div>
      </div>
      <FanReviews />
      <BookingCta />
    </Page>
  )
}
