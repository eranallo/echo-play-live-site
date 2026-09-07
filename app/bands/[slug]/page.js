import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Page, BookingCta } from '@/components/SiteParts'
import { allBandsList, getBand } from '@/lib/bands'
import BandExperienceDetails from '@/components/BandExperienceDetails'
export function generateStaticParams() {
  return allBandsList.map((b) => ({ slug: b.slug }))
}
export async function generateMetadata({ params }) {
  const { slug } = await params
  const band = getBand(slug)
  if (!band) return { title: 'Band not found', robots: { index: false } }
  return {
    title: band.name,
    description: band.description,
    alternates: { canonical: `/bands/${slug}` },
    robots: band.hidden ? { index: false, follow: false } : undefined,
  }
}
export default async function BandPage({ params }) {
  const { slug } = await params
  const band = getBand(slug)
  if (!band) notFound()
  const photos = (
    band.galleryPhotos?.length ? band.galleryPhotos : [band.featurePhoto, band.crowdPhoto]
  )
    .filter(Boolean)
    .slice(0, 3)
  const clientBand = {
    slug: band.slug,
    name: band.name,
    shortName: band.shortName,
    color: band.color,
    tributeMode: band.tributeMode || false,
    tributeArtistName: band.tributeArtistName || '',
    social: band.social,
  }
  return (
    <Page>
      <section className="band-detail-hero">
        <Image
          src={band.heroPhoto}
          alt={`${band.name} live on stage`}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: band.heroObjectPosition || 'center' }}
        />
        <div className="shell">
          <p className="eyebrow">{band.genre.join(' · ')}</p>
          <h1>{band.name}</h1>
          <p>{band.tagline}</p>
          <div className="button-row">
            <Link className="button button-light" href={`/shows?band=${band.slug}`}>
              Find a show ↗
            </Link>
            <Link className="glass-link" href={`/contact?band=${band.slug}`}>
              Book {band.shortName || band.name} ↗
            </Link>
          </div>
        </div>
      </section>
      <nav className="band-subnav" aria-label={`${band.name} page sections`}>
        <div className="shell">
          <a href="#experience">The experience</a>
          {band.heroVideo && <a href="#watch">Watch live</a>}
          <a href="#music">The music</a>
          <Link href="/musicians">The musicians</Link>
          <a href={`/api/press/${band.slug}`}>Download EPK ↗</a>
        </div>
      </nav>
      <section id="experience" className="section shell band-description">
        <div>
          <p className="eyebrow">A night with {band.name}</p>
          <h2>
            {typeof band.experienceHeadline === 'object' ? (
              <>
                {band.experienceHeadline.line1}
                <br />
                {band.experienceHeadline.line2}
              </>
            ) : (
              band.experienceHeadline || band.tagline
            )}
          </h2>
        </div>
        <p>{band.description}</p>
      </section>
      {band.heroVideo && (
        <section className="shell section-bottom" id="watch">
          <p className="eyebrow">Straight from the stage</p>
          <h2 className="section-title">Feel the room.</h2>
          <video
            className="watch-film"
            controls
            playsInline
            preload="none"
            poster={band.heroPhoto}
            aria-label={`${band.name} live performance clip`}
          >
            <source src={band.heroVideo} type="video/mp4" />
            Your browser does not support this video.
          </video>
          <p className="form-note">Live performance clip. Press play to watch with sound.</p>
        </section>
      )}
      {photos.length > 0 && (
        <section className="shell section-bottom">
          <div className="photo-grid">
            {photos.map((src, i) => (
              <div className="photo-tile" key={src}>
                <Image
                  src={src}
                  alt={`${band.name} live performance, photo ${i + 1}`}
                  fill
                  sizes="(max-width: 760px) 45vw, 30vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="shell section-bottom" id="music">
        <BandExperienceDetails band={clientBand} />
        <div className="follow-bands">
          <h2>Stay in the loop.</h2>
          <div className="inline-links">
            {Object.entries(band.social || {})
              .filter(([, url]) => typeof url === 'string' && url.startsWith('https://'))
              .map(([name, url]) => (
                <a href={url} key={name} target="_blank" rel="noopener noreferrer">
                  {{
                    facebook: 'Facebook',
                    instagram: 'Instagram',
                    bandsintown: 'Bandsintown',
                    youtube: 'YouTube',
                    spotify: 'Spotify',
                  }[name] || name}{' '}
                  ↗
                </a>
              ))}
          </div>
        </div>
      </section>
      <BookingCta />
    </Page>
  )
}
