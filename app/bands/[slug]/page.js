import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { Page, BookingCta } from '@/components/SiteParts'
import { getBand } from '@/lib/bands'
import BandExperienceDetails from '@/components/BandExperienceDetails'
import BandHeaderVideo from '@/components/BandHeaderVideo'
import BandUpcomingShows from '@/components/BandUpcomingShows'
import BookingEssentials from '@/components/BookingEssentials'
import FanSignup from '@/components/FanSignup'
export const dynamic = 'force-dynamic'
export const revalidate = 0
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
        {band.heroVideo && (
          <BandHeaderVideo
            key={band.slug}
            src={band.heroVideo}
            poster={band.heroPhoto}
            objectPosition={band.heroObjectPosition || 'center'}
          />
        )}
        <div className="shell">
          <p className="eyebrow">{band.genre.join(' · ')}</p>
          <h1>{band.name}</h1>
          <p>{band.tagline}</p>
          <div className="button-row">
            <Link
              className="button button-light"
              href={band.hidden ? `/shows?band=${band.slug}` : '#shows'}
            >
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
          {!band.hidden && <a href="#shows">Upcoming shows</a>}
          <a href="#experience">The experience</a>
          <a href="#music">The music</a>
          <Link href="/musicians">The musicians</Link>
          {!band.hidden && <a href="#booking">Booking essentials</a>}
          <a href={`/api/press/${band.slug}`}>Download EPK ↗</a>
        </div>
      </nav>
      {!band.hidden && (
        <Suspense
          fallback={
            <section id="shows" className="section shell" aria-busy="true">
              <p className="eyebrow">Upcoming shows</p>
              <h2 className="section-title">Finding your next night.</h2>
            </section>
          }
        >
          <BandUpcomingShows slug={band.slug} name={band.name} />
        </Suspense>
      )}
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
      {!band.hidden && <BookingEssentials band={band} />}
      {!band.hidden && <FanSignup bandSlug={band.slug} />}
      <BookingCta />
    </Page>
  )
}
