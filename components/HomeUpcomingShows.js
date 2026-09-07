import Link from 'next/link'
import { getPublicShows } from '@/lib/public/shows'
import ShowRow from './ShowRow'

export default async function HomeUpcomingShows() {
  const result = await getPublicShows()
  const shows = result.shows.slice(0, 3)
  return (
    <section className="shell section-bottom home-upcoming" aria-labelledby="home-shows-heading">
      <div className="section-heading-row">
        <div><p className="eyebrow">Upcoming shows</p><h2 className="section-title" id="home-shows-heading">See you at the next show.</h2></div>
        <Link className="text-link" href="/shows" prefetch={false}>All announced dates ↗</Link>
      </div>
      {shows.length ? shows.map((show) => <ShowRow key={show.id} show={show} />) : (
        <div className="quiet-state">
          <h3>{result.ok ? 'More dates are on the way.' : 'We couldn’t load the calendar.'}</h3>
          <p>{result.ok ? 'Sign up for updates and we’ll let you know when we’re playing.' : 'Please try the show calendar again shortly.'}</p>
          <Link className="text-link" href={result.ok ? '/shows#stay-in-loop' : '/shows'} prefetch={false}>
            {result.ok ? 'Get show updates ↗' : 'Open the show calendar ↗'}
          </Link>
        </div>
      )}
    </section>
  )
}
