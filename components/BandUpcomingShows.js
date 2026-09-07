import Link from 'next/link'
import { getPublicShows } from '@/lib/public/shows'
import ShowRow from './ShowRow'

export default async function BandUpcomingShows({ slug, name }) {
  const result = await getPublicShows()
  const shows = result.shows
    .filter((show) => show.bands.some((band) => band.slug === slug))
    .slice(0, 3)
  return (
    <section id="shows" className="section shell band-upcoming">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Your next night with {name}</p>
          <h2 className="section-title">Be there.</h2>
        </div>
        <Link className="text-link" href={`/shows?band=${slug}`} prefetch={false}>
          All announced dates ↗
        </Link>
      </div>
      {shows.length ? (
        shows.map((show) => <ShowRow key={show.id} show={show} />)
      ) : (
        <div className="quiet-state">
          <h3>{result.ok ? 'More nights are on the way.' : 'Show dates are taking a moment.'}</h3>
          <p>
            {result.ok
              ? 'New dates will appear here as they’re announced. Follow the band for the next one.'
              : 'We couldn’t load the calendar right now. Please try again shortly.'}
          </p>
          <Link className="text-link" href={`/shows?band=${slug}`} prefetch={false}>
            {result.ok ? 'Explore the show calendar ↗' : 'Try the show calendar ↗'}
          </Link>
        </div>
      )}
    </section>
  )
}
