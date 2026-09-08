import Link from 'next/link'
import ShowPurchaseLinks from './ShowPurchaseLinks'
import { showPath, showTime } from '@/lib/public/show-presentation.mjs'

export default function ShowRow({ show }) {
  const date = new Date(`${show.date}T12:00:00Z`)
  return (
    <article className="show-row">
      <time className="show-date" dateTime={show.date}>
        <span>
          {new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(date)}
        </span>
        <strong>{date.getUTCDate()}</strong>
        <span>
          {new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            year: 'numeric',
            timeZone: 'UTC',
          }).format(date)}
        </span>
      </time>
      <div className="show-info">
        <h2>
          <Link href={showPath(show)} prefetch={false}>
            {show.bands.map((band) => band.name).join(' + ')}
          </Link>
          {show.state === 'canceled' && <span className="show-canceled">Canceled</span>}
        </h2>
        <p>{show.venue.name}</p>
        <p className="show-note">
          {showTime(show)}
        </p>
        <Link className="show-details-link" href={showPath(show)} prefetch={false}>
          Show details ↗
        </Link>
      </div>
      {show.state === 'canceled' ? (
        <span className="muted">Canceled</span>
      ) : (show.ticket || show.reservation) ? (
        <div className="show-purchase-actions"><ShowPurchaseLinks show={show} /></div>
      ) : null}
    </article>
  )
}
