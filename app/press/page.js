import Link from 'next/link'
import Image from 'next/image'
import { Page, Intro } from '@/components/SiteParts'
import { bandsList } from '@/lib/bands'
import { FAQ_PRESS } from '@/lib/faqs'
export default function PressPage() {
  return (
    <Page>
      <Intro
        eyebrow="For promoters, venues & media"
        title={
          <>
            Everything for
            <br />
            the next show.
          </>
        }
      >
        <p>
          Meet the bands, download a one-sheet, and get in touch.
          <br />
          The essentials, all in one place.
        </p>
      </Intro>
      <section className="shell section-bottom">
        <div className="two-columns">
          {bandsList.map((b) => (
            <article className="content-panel" key={b.slug}>
              <p className="eyebrow">{b.genre[0]}</p>
              <h2>{b.name}</h2>
              <p>{b.tagline}</p>
              <div className="inline-links">
                <a href={`/api/press/${b.slug}`} download>
                  Download band kit · PDF ↓
                </a>
                <Link href={`/bands/${b.slug}`}>View band ↗</Link>
              </div>
              <a className="text-link" href={`mailto:${b.bookingEmail}`}>
                {b.bookingEmail}
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="shell section-bottom">
        <h2 className="section-title">The Echo Play Live identity.</h2>
        <p className="text-body" style={{ marginBottom: 30 }}>
          The official seal, in black and white. Keep its proportions and leave clear space around it.
        </p>
        <div className="two-columns">
          {[
            ['white', 'White', true],
            ['black', 'Black', false],
          ].map(([color, label, dark]) => (
            <article key={color} className="content-panel">
              <div
                style={{
                  height: 180,
                  position: 'relative',
                  background: dark ? '#000000' : '#ffffff',
                  borderRadius: 14,
                  marginBottom: 22,
                }}
              >
                <Image
                  src={`/brand/epl-seal-${color}.svg`}
                  alt={`Echo Play Live ${label.toLowerCase()} logo`}
                  fill
                  sizes="300px"
                  style={{ objectFit: 'contain', padding: 28 }}
                />
              </div>
              <h2>{label}</h2>
              <div className="inline-links">
                <a href={`/brand/epl-seal-${color}.svg`} download>
                  SVG ↓
                </a>
                <a href={`/brand/epl-seal-${color}.png`} download>
                  PNG ↓
                </a>
              </div>
            </article>
          ))}
        </div>
        <a className="text-link" href="/brand/epl-logo-master.svg" download style={{ marginTop: 24 }}>
          Download original vector artwork · SVG ↓
        </a>
      </section>
      <section className="shell section-bottom">
        <h2 className="section-title">Need something else?</h2>
        <div className="faq-list">
          {FAQ_PRESS.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Page>
  )
}
