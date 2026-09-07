import Link from 'next/link'
import Image from 'next/image'
import { Page, BandCard, BookingCta } from '@/components/SiteParts'
import { bandsList } from '@/lib/bands'
export default function HomePage() {
  return (
    <Page>
      <section className="home-intro shell">
        <p className="eyebrow">
          <span className="live-dot" />
          Live music. Fort Worth & beyond.
        </p>
        <h1>
          Some nights
          <br />
          stay with you.
        </h1>
        <p className="hero-description">
          The songs you know. The feeling you came for.
          <br />
          Tribute and cover bands, brought to life.
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
          <span className="eyebrow">This is what it feels like.</span>
          <p>
            All together.
            <br />
            All the way in.
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
            <p className="eyebrow">Four bands. Four worlds.</p>
            <h2>Find your frequency.</h2>
          </div>
          <p>
            From the first chord to the last encore.
            <br />
            There’s a night here with your name on it.
          </p>
        </div>
        <div className="band-grid">
          {bandsList.map((band, index) => (
            <BandCard band={band} index={index} key={band.slug} />
          ))}
        </div>
      </section>
      <section className="fan-feature shell">
        <div>
          <p className="eyebrow">Be there for the next one</p>
          <h2>
            Less scrolling.
            <br />
            More singing.
          </h2>
          <p>
            Find your band. Make your plans. Bring your people.
            <br />
            Your next great night starts here.
          </p>
          <Link className="button" href="/shows">
            Explore upcoming shows <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="fan-image">
          <Image
            src="/bands/jambi/hero.jpg"
            alt="Jambi performing beneath a large illuminated stage backdrop"
            fill
            sizes="(max-width: 760px) 90vw, 45vw"
            style={{ objectFit: 'cover' }}
          />
          <span>Jambi · A TOOL Experience</span>
        </div>
      </section>
      <section className="story-strip shell">
        <p className="eyebrow">The people behind the noise</p>
        <h2>
          Built on music.
          <br />
          <span className="muted">Held together by people.</span>
        </h2>
        <p>
          A Fort Worth home for musicians who care about the songs,
          <br className="desktop-break" /> the show, and everyone in the room.
        </p>
        <Link className="text-link" href="/about">
          Get to know Echo Play Live <span aria-hidden="true">→</span>
        </Link>
      </section>
      <BookingCta />
    </Page>
  )
}
