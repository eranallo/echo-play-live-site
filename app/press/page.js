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
          Company logos in vector and PNG formats.
        </p>
        <div className="three-columns">
          {[
            ['white', 'White', true],
            ['black', 'Black', false],
            ['gold', 'Gold', true],
          ].map(([color, label, dark]) => (
            <article key={color} className="content-panel">
              <div
                style={{
                  height: 180,
                  position: 'relative',
                  background: dark ? '#1d1d1f' : '#f5f5f7',
                  borderRadius: 14,
                  marginBottom: 22,
                }}
              >
                <Image
                  src={`/press/epl-logo-${color}.svg`}
                  alt={`Echo Play Live ${label.toLowerCase()} logo`}
                  fill
                  sizes="300px"
                  style={{ objectFit: 'contain', padding: 28 }}
                />
              </div>
              <h2>{label}</h2>
              <div className="inline-links">
                <a href={`/press/epl-logo-${color}.svg`} download>
                  SVG ↓
                </a>
                <a href={`/press/epl-logo-${color}-1024.png`} download>
                  PNG ↓
                </a>
              </div>
            </article>
          ))}
        </div>
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
