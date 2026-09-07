import Link from 'next/link'
import Image from 'next/image'
import { Page, Intro, BookingCta } from '@/components/SiteParts'
export default function AboutPage() {
  return (
    <Page>
      <Intro
        eyebrow="Echo Play Live · Est. 2023"
        title={
          <>
            Music brought
            <br />
            us together.
          </>
        }
      >
        <p>
          We’re a live-music house in Fort Worth, Texas.
          <br />
          Four bands. A community of musicians. One love for the show.
        </p>
      </Intro>
      <section className="shell section-bottom">
        <div className="fan-image" style={{ minHeight: 520 }}>
          <Image
            src="/bands/so-long-goodnight/feature.jpg"
            alt="So Long Goodnight sharing a live music moment with the audience"
            fill
            sizes="90vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      </section>
      <section className="shell section-bottom band-description">
        <h2>
          For the songs.
          <br />
          For the people.
        </h2>
        <div className="text-body">
          <p>
            Founded in 2023 by Evan Ranallo, Echo Play Live brings together So Long Goodnight, The
            Dick Beldings, Jambi, and Elite. Each band has its own sound and its own identity. What
            connects them is a shared care for the music and the people in the room.
          </p>
          <p>
            From 90s rock and the Warped Tour era to the worlds of TOOL and Deftones, we build shows
            around music that means something to us. And to you.
          </p>
          <Link className="text-link" href="/musicians">
            Meet the musicians →
          </Link>
        </div>
      </section>
      <section className="shell section-bottom three-columns">
        {[
          [
            'The craft.',
            'Preparation, care, and a love for the songs. Every rehearsal is part of the show.',
          ],
          [
            'The community.',
            'Friends on stage. Familiar faces in the crowd. Music gives us a reason to come together.',
          ],
          [
            'The moment.',
            'The first chord you recognize. The chorus everyone knows. That feeling, live again.',
          ],
        ].map(([title, copy]) => (
          <article className="content-panel" key={title}>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <section className="shell section-bottom">
        <div className="content-panel">
          <p className="eyebrow">The conversation continues</p>
          <h2>Echo Play Podcast.</h2>
          <p>Evan Ranallo and Aaron Allen talk cover bands, tributes, and the DFW music scene.</p>
          <Link className="text-link" href="/podcast">
            Listen in →
          </Link>
        </div>
      </section>
      <BookingCta />
    </Page>
  )
}
