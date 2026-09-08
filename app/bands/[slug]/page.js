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
import FanReviews from '@/components/FanReviews'
import PerformanceVideo from '@/components/PerformanceVideo'
import { getPerformance } from '@/lib/public/performances.mjs'
import { getBandGallery } from '@/lib/public/gallery.mjs'
import BandPhotoGallery from '@/components/BandPhotoGallery'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export default async function BandPage({ params }) {
  const { slug } = await params
  const band = getBand(slug)
  if (!band) notFound()
  const performance = getPerformance(slug)
  const gallery = getBandGallery(slug)
  const clientBand = {
    slug: band.slug,
    name: band.name,
    shortName: band.shortName,
    color: band.color,
    hidden: Boolean(band.hidden),
    tributeMode: band.tributeMode || false,
    tributeArtistName: band.tributeArtistName || '',
    social: band.social,
  }
  return (
    <Page>
      <section className="band-detail-hero">
        <Image
          src={band.heroPhoto}
          alt={
            band.slug === 'the-dick-beldings'
              ? 'The Dick Beldings band portrait'
              : `${band.name} live on stage`
          }
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
          {performance && <a href="#watch">Watch live</a>}
          {gallery?.photos.length > 0 && <a href="#photos">Photos</a>}
          <a href="#experience">About the band</a>
          <a href="#music">The music</a>
          {!band.hidden && <Link href={`/requests?band=${band.slug}`}>Song requests ↗</Link>}
          <Link href="/musicians">The musicians</Link>
          {!band.hidden && <a href="#booking">Booking essentials</a>}
          <Link href={`/press/${band.slug}`}>Band kit ↗</Link>
        </div>
      </nav>
      {!band.hidden && (
        <Suspense
          fallback={
            <section id="shows" className="section shell" aria-busy="true">
              <p className="eyebrow">Upcoming shows</p>
              <h2 className="section-title">Loading upcoming shows…</h2>
            </section>
          }
        >
          <BandUpcomingShows slug={band.slug} name={band.name} />
        </Suspense>
      )}
      <section id="experience" className="section shell band-description">
        <div>
          <p className="eyebrow">About {band.name}</p>
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
      {performance && <PerformanceVideo performance={performance} slug={slug} />}
      {gallery?.photos.length > 0 && <BandPhotoGallery name={band.name} slug={slug} photos={gallery.photos} />}
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
      <FanReviews band={slug} />
      {!band.hidden && <BookingEssentials band={band} />}
      {!band.hidden && <FanSignup bandSlug={band.slug} />}
      <BookingCta />
    </Page>
  )
}
