'use client'
import { useState } from 'react'
import Link from 'next/link'
import Nav from './Nav'
import Footer from './Footer'
const zone = 'America/Chicago'
const dateParts = (value) => {
  const date = new Date(`${value}T12:00:00Z`)
  return {
    day: date.getUTCDate(),
    month: new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: zone }).format(date),
    detail: new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      timeZone: zone,
    }).format(date),
  }
}
export default function ShowsClient({
  publicBands = [],
  shows = [],
  state = 'ready',
  initialFilter = 'all',
}) {
  const [filter, setFilter] = useState(initialFilter)
  const filtered = shows.filter((s) => filter === 'all' || s.bands.some((b) => b.slug === filter))
  const unavailable = state === 'unavailable'
  return (
    <>
      <Nav />
      <main id="main-content" tabIndex={-1} className="public-page">
        <section className="shell page-intro">
          <p className="eyebrow">Upcoming shows</p>
          <h1>
            Your next
            <br />
            great night.
          </h1>
          <div className="intro-copy">
            <p>Find the band. Pick the date. Be part of it.</p>
          </div>
        </section>
        <section className="shell section-bottom">
          <div className="filter-bar" aria-label="Filter shows by band">
            {[{ slug: 'all', name: 'All bands' }, ...publicBands].map((b) => (
              <button
                type="button"
                key={b.slug}
                className="filter-chip"
                aria-pressed={filter === b.slug}
                onClick={() => setFilter(b.slug)}
              >
                {b.name}
              </button>
            ))}
          </div>
          <p className="shows-count" role="status">
            {unavailable
              ? 'Show listings are temporarily unavailable'
              : `${filtered.length} upcoming ${filtered.length === 1 ? 'show' : 'shows'} · Times shown in Central Time`}
          </p>
          {!unavailable &&
            filtered.map((show) => {
              const date = dateParts(show.date)
              return (
                <article className="show-row" key={show.id}>
                  <time className="show-date" dateTime={show.date}>
                    <span>{date.month}</span>
                    <strong>{date.day}</strong>
                    <span>{date.detail}</span>
                  </time>
                  <div className="show-info">
                    <h2>
                      {show.bands.map((b, i) => (
                        <span key={b.slug || b.name}>
                          {i > 0 ? ' + ' : ''}
                          {b.slug ? <Link href={`/bands/${b.slug}`}>{b.name}</Link> : b.name}
                        </span>
                      ))}
                      {show.state === 'canceled' && <span className="show-canceled">Canceled</span>}
                    </h2>
                    <p>{show.venue.name}</p>
                    <p className="show-note">
                      {show.startTime
                        ? new Intl.DateTimeFormat('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            timeZone: zone,
                          }).format(new Date(show.startTime))
                        : 'Time to be announced'}
                      {show.ticket?.priceLabel ? ` · ${show.ticket.priceLabel}` : ''}
                    </p>
                  </div>
                  {show.state === 'canceled' ? (
                    <span className="muted">Canceled</span>
                  ) : show.ticket ? (
                    <a
                      className="button"
                      href={show.ticket.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {show.ticket.label || 'Get tickets'} ↗
                    </a>
                  ) : (
                    <span className="muted">{show.ticketNote || 'Ticket details soon'}</span>
                  )}
                </article>
              )
            })}
          {(unavailable || filtered.length === 0) && (
            <div className="empty-state">
              <h2>
                {unavailable ? 'The calendar is taking a breather.' : 'More nights are on the way.'}
              </h2>
              <p>
                {unavailable
                  ? 'We couldn’t load our show listings right now. Check the bands’ official show pages below, or try again shortly.'
                  : 'There are no announced dates here just yet. Follow your favorite band for the next announcement.'}
              </p>
              {unavailable ? (
                <a className="button" href="/shows">
                  Try again ↻
                </a>
              ) : filter !== 'all' ? (
                <button className="button" onClick={() => setFilter('all')}>
                  See all bands
                </button>
              ) : (
                <Link className="button" href="/bands">
                  Explore the bands →
                </Link>
              )}
            </div>
          )}
          <div className="follow-bands">
            <h2>Keep your favorites close.</h2>
            <p>Follow the bands on Bandsintown for their show updates.</p>
            <div className="inline-links">
              {publicBands.map((b) => (
                <a key={b.slug} href={b.bandsintown} target="_blank" rel="noopener noreferrer">
                  {b.name} ↗
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
