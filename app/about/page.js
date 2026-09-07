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
            Hi, we’re
            <br />
            Echo Play Live.
          </>
        }
      >
        <p>
          We’re based in Fort Worth, Texas, and manage four tribute and cover bands. We’re musicians
          ourselves, and we handle the business side so our bands can focus on playing.
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
        <h2>How we got here.</h2>
        <div className="text-body">
          <p>
            Evan Ranallo started Echo Play Live in 2023. Our roster includes So Long Goodnight, The
            Dick Beldings, Jambi and Elite. Each band has its own history and plays music its
            members love, from 90s alternative and 2000s emo to TOOL and Deftones.
          </p>
          <p>
            We know how much goes into a show before anyone takes the stage. We care about being
            prepared, communicating with the venue and working with the production team. We want
            people to have a great time, and we want the people putting it together to enjoy working
            with us.
          </p>
          <Link className="text-link" href="/musicians">
            Meet the musicians →
          </Link>
        </div>
      </section>
      <section className="shell section-bottom three-columns">
        {[
          [
            'The music',
            'We put in the rehearsal time because these songs matter to us. We want to play them well.',
          ],
          [
            'The people',
            'We appreciate the fans who come out and the venues and crews who make it possible. We’re glad to be part of this scene.',
          ],
          [
            'The work',
            'From booking through load-out, we work through the details with you. Clear communication makes a difference.',
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
          <p className="eyebrow">More from Evan & Aaron</p>
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
