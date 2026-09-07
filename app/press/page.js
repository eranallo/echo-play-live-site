import Link from 'next/link'
import Image from 'next/image'
import { Page, Intro } from '@/components/SiteParts'
import { bandKits, kitPdfPath, kitAssetPath } from '@/lib/press/kit-content.mjs'
import { FAQ_PRESS } from '@/lib/faqs'
import TrackedLink from '@/components/TrackedLink'
export default function PressPage() {
  return (
    <Page>
      <Intro
        eyebrow="For promoters, venues & media"
        title={
          <>
            Band kits
            <br />& press.
          </>
        }
      >
        <p>
          Need a bio, photo or logo for an upcoming show?
          <br />
          You can download them here, along with each band’s kit.
        </p>
      </Intro>
      <section className="shell section-bottom">
        <div className="press-kit-grid">
          {bandKits.map((kit) => (
            <article className="press-kit-card" key={kit.slug}>
              <Link
                href={`/press/${kit.slug}`}
                className="press-kit-image"
                aria-label={`Explore ${kit.name} band kit`}
              >
                <Image
                  src={kitAssetPath(kit.slug, 'cover.jpg')}
                  alt={
                    kit.slug === 'the-dick-beldings'
                      ? 'The Dick Beldings band portrait'
                      : `${kit.name} live on stage`
                  }
                  fill
                  sizes="(max-width: 700px) 100vw, 50vw"
                  style={{ objectFit: 'cover', objectPosition: kit.coverPosition }}
                />
              </Link>
              <div className="press-kit-copy">
                <p className="eyebrow">{kit.label}</p>
                <h2>{kit.name}</h2>
                <p>{kit.intro}</p>
                <div className="kit-actions">
                  <Link className="button" href={`/press/${kit.slug}`}>
                    View band kit ↗
                  </Link>
                  <TrackedLink
                    className="text-link"
                    href={kitPdfPath(kit.slug)}
                    event="Press download"
                    band={kit.slug}
                    download
                  >
                    3-page PDF ↓
                  </TrackedLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="shell section-bottom">
        <div className="production-request">
          <div>
            <p className="eyebrow">Production & press requests</p>
            <h2>Need something else?</h2>
          </div>
          <div>
            <p>
              For the current stage plot, input list, additional photographs, and photographer
              credits, contact the band’s booking team. Include your event, intended use, and
              deadline.
            </p>
            <Link className="text-link" href="/contact">
              Request your production & press materials ↗
            </Link>
          </div>
        </div>
      </section>
      <section className="shell section-bottom">
        <h2 className="section-title">Echo Play Live logos</h2>
        <p className="text-body" style={{ marginBottom: 30 }}>
          The official seal, in black and white. Keep its proportions and leave clear space around
          it.
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
        <a
          className="text-link"
          href="/brand/epl-logo-master.svg"
          download
          style={{ marginTop: 24 }}
        >
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
