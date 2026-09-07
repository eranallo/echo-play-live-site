import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Page } from '@/components/SiteParts'
import TrackedLink from '@/components/TrackedLink'
import CopyBandBio from '@/components/CopyBandBio'
import {
  bandKits,
  getBandKit,
  kitAssetPath,
  kitPdfPath,
  KIT_EDITION,
  planningDetails,
} from '@/lib/press/kit-content.mjs'

export const dynamicParams = false
export function generateStaticParams() {
  return bandKits.map(({ slug }) => ({ slug }))
}
export async function generateMetadata({ params }) {
  const { slug } = await params
  const kit = getBandKit(slug)
  if (!kit) return { title: 'Band kit not found' }
  return {
    title: `${kit.name} · Band Kit`,
    description: kit.intro,
    alternates: { canonical: `/press/${slug}` },
    openGraph: {
      title: `${kit.name} · Echo Play Live Band Kit`,
      description: kit.intro,
      url: `/press/${slug}`,
      images: [{ url: kitAssetPath(slug, 'cover.jpg'), alt: kit.name }],
    },
  }
}

export default async function BandKitPage({ params }) {
  const { slug } = await params
  const kit = getBandKit(slug)
  if (!kit) notFound()
  return (
    <Page>
      <section className="kit-hero" style={{ '--kit-accent': kit.color }}>
        <div className="shell kit-hero-grid">
          <div className="kit-hero-copy">
            <Link className="text-link" href="/press">
              ← All band kits
            </Link>
            <p className="eyebrow">For venues, promoters & media</p>
            <h1 className="sr-only">{kit.name} band kit</h1>
            <div className={`kit-band-logo kit-band-logo-${kit.logoStyle}`}>
              <Image
                src={kitAssetPath(slug, 'logo.png')}
                alt={kit.name}
                fill
                sizes="(max-width: 700px) 80vw, 440px"
                priority
                style={{ objectFit: 'contain', objectPosition: 'left center' }}
              />
            </div>
            <h2>{kit.headline.join(' ')}</h2>
            <p>{kit.intro}</p>
            <div className="kit-actions">
              <TrackedLink
                className="button button-light"
                href={kitPdfPath(slug)}
                event="Press download"
                band={slug}
                download
              >
                Download band kit · PDF ↓
              </TrackedLink>
              <Link className="text-link" href={`/contact?band=${slug}`}>
                Talk booking ↗
              </Link>
            </div>
            <span className="kit-edition">3 pages · {KIT_EDITION}</span>
          </div>
          <div className="kit-hero-photo">
            <Image
              src={kitAssetPath(slug, 'cover.jpg')}
              alt={
                slug === 'the-dick-beldings'
                  ? 'The Dick Beldings band portrait'
                  : `${kit.name} live on stage`
              }
              fill
              priority
              sizes="(max-width: 700px) 100vw, 50vw"
              style={{ objectFit: 'cover', objectPosition: kit.coverPosition }}
            />
          </div>
        </div>
      </section>
      <nav className="shell kit-jump-links" aria-label="Band kit sections">
        <a href="#overview">The show</a>
        <a href="#sound">The sound</a>
        <a href="#materials">Press materials</a>
        <a href="#planning">Booking</a>
      </nav>
      <section id="overview" className="shell section-bottom kit-overview">
        <div>
          <p className="eyebrow">{kit.label}</p>
          <h2 className="section-title">About the band</h2>
        </div>
        <div>
          <p className="kit-bio">{kit.bio}</p>
          <CopyBandBio bio={kit.bio} />
        </div>
      </section>
      <section className="shell section-bottom">
        <div className="kit-photo-pair">
          {['detail', 'stage'].map((asset, i) => (
            <div key={asset}>
              <Image
                src={kitAssetPath(slug, `${asset}.jpg`)}
                alt={
                  slug === 'the-dick-beldings'
                    ? i === 0
                      ? 'The Dick Beldings promotional portrait at a pool table'
                      : 'The Dick Beldings stage setup'
                    : `${kit.name} live performance, photo ${i + 1}`
                }
                fill
                sizes="(max-width: 700px) 100vw, 50vw"
                style={{ objectFit: 'cover', objectPosition: 'center 35%' }}
              />
            </div>
          ))}
        </div>
        <div className="kit-feature-grid">
          {kit.features.map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="sound" className="shell section-bottom kit-overview">
        <div>
          <p className="eyebrow">The sound</p>
          <h2 className="section-title">{kit.soundTitle}</h2>
        </div>
        <div>
          <ul className="kit-sound-list">
            {kit.sound.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="form-note">{kit.soundNote}</p>
          <Link className="text-link" href={`/bands/${slug}#music`}>
            Explore the music ↗
          </Link>
        </div>
      </section>
      <section id="materials" className="kit-materials section-bottom">
        <div className="shell">
          <p className="eyebrow">Photos, logos & bios</p>
          <h2 className="section-title">Download press materials</h2>
          <div className="kit-download-grid">
            {[
              ['Band kit', 'Three-page PDF', kitPdfPath(slug), 'Press download'],
              ['Band logo', 'Transparent PNG', kitAssetPath(slug, 'logo.png'), 'Logo download'],
              ['Press photo', 'Full-size JPG', `/api/press/${slug}/photo`, 'Photo download'],
              ['Band bio', 'Plain text', `/api/press/${slug}/bio`, 'Bio download'],
            ].map(([title, type, href, event]) => (
              <TrackedLink key={title} href={href} event={event} band={slug} download>
                <span>{title} ↓</span>
                <small>{type}</small>
              </TrackedLink>
            ))}
          </div>
          <p className="form-note">
            Keep logos proportional and unaltered. For photographer credits, additional images or a
            specific format, contact <a href={`mailto:${kit.bookingEmail}`}>{kit.bookingEmail}</a>.
          </p>
        </div>
      </section>
      <section id="planning" className="shell section-bottom">
        <p className="eyebrow">Booking & production</p>
        <h2 className="section-title">Let’s talk about your event.</h2>
        <div className="kit-planning-grid">
          {planningDetails.map(([title, body], i) => (
            <article key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <div className="kit-stage-history">
          <p className="eyebrow">Selected stages</p>
          <p>{kit.stages.join(' · ')}</p>
        </div>
        <div className="kit-booking-bar">
          <div>
            <p className="eyebrow">Get in touch</p>
            <a href={`mailto:${kit.bookingEmail}`}>{kit.bookingEmail}</a>
            <p>Ask for the current stage plot and input list.</p>
          </div>
          <Link className="button" href={`/contact?band=${slug}`}>
            Start a booking inquiry ↗
          </Link>
        </div>
      </section>
      <section className="shell section-bottom kit-return-links">
        <Link className="text-link" href={`/${slug}`}>
          Band links & QR code ↗
        </Link>
        <Link className="text-link" href={`/bands/${slug}`}>
          Visit the band page ↗
        </Link>
        <Link className="text-link" href={`/shows?band=${slug}`}>
          Announced shows ↗
        </Link>
        {Object.entries(kit.social).map(([label, url]) => (
          <a className="text-link" key={label} href={url} target="_blank" rel="noopener noreferrer">
            {label} ↗
          </a>
        ))}
      </section>
    </Page>
  )
}
