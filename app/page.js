import Link from 'next/link'
import { Suspense } from 'react'
import HomeUpcomingShows from '@/components/HomeUpcomingShows'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import Image from 'next/image'
import { Page, BandCard, BookingCta } from '@/components/SiteParts'
import { bandsList } from '@/lib/bands'
export default function HomePage() {
  return (
    <Page>
      <section className="home-intro shell">
        <p className="eyebrow">
          <span className="live-dot" />
          Tribute & cover bands · Fort Worth, Texas
        </p>
        <h1>
          Come out
          <br />
          and see us.
        </h1>
        <p className="hero-description">
          We’re Echo Play Live. We manage four tribute and cover bands in DFW, playing everything
          from 90s rock to TOOL and Deftones.
        </p>
        <div className="button-row">
          <Link className="button" href="/shows">
            Find a show <span aria-hidden="true">↗</span>
          </Link>
          <Link className="text-link" href="/bands">
            Meet the bands <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <section className="hero-stage" aria-label="So Long Goodnight live">
        <Image
          src="/bands/so-long-goodnight/feature.jpg"
          alt="The view from the stage: So Long Goodnight playing to a crowd at a live show"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center 45%' }}
        />
        <div className="hero-stage-shade" />
        <div className="stage-caption">
          <span className="eyebrow">From the stage</span>
          <p>
            Thanks for
            <br />
            singing with us.
          </p>
          <Link className="glass-link" href="/bands/so-long-goodnight">
            So Long Goodnight <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <span className="photo-credit">On stage with So Long Goodnight</span>
      </section>
      <section className="section shell" id="bands">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Meet the bands</p>
            <h2>What do you want to hear?</h2>
          </div>
          <p>
            90s alternative, 2000s emo and pop punk,
            <br />
            or a night of TOOL or Deftones. Here’s our lineup.
          </p>
        </div>
        <div className="band-grid">
          {bandsList.map((band, index) => (
            <BandCard band={band} index={index} key={band.slug} />
          ))}
        </div>
      </section>
      <Suspense fallback={<section className="shell section-bottom" aria-busy="true"><p className="eyebrow">Upcoming shows</p><p>Checking the latest dates…</p></section>}>
        <HomeUpcomingShows />
      </Suspense>
      <section className="story-strip shell">
        <p className="eyebrow">About Echo Play Live</p>
        <h2>
          We’re musicians, too.
          <br />
          <span className="muted">We care about the whole show.</span>
        </h2>
        <p>
          We handle booking and coordination for our bands. Our goal is to put on a great show and
          make things easier for the venues, crews and people we work with.
        </p>
        <Link className="text-link" href="/about">
          Get to know Echo Play Live <span aria-hidden="true">→</span>
        </Link>
      </section>
      <BookingCta />
    </Page>
  )
}
