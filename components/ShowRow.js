import Link from 'next/link'
import TrackedLink from './TrackedLink'
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
          {show.ticket?.priceLabel ? ` · ${show.ticket.priceLabel}` : ''}
        </p>
        <Link className="show-details-link" href={showPath(show)} prefetch={false}>
          Show details ↗
        </Link>
      </div>
      {show.state === 'canceled' ? (
        <span className="muted">Canceled</span>
      ) : show.ticket ? (
        <TrackedLink
          className="button"
          href={show.ticket.url}
          target="_blank"
          rel="noopener noreferrer"
          event="Ticket click"
          showId={show.id}
        >
          Get tickets ↗
        </TrackedLink>
      ) : show.ticketNote ? (
        <span className="muted">{show.ticketNote}</span>
      ) : null}
    </article>
  )
}
