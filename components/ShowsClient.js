'use client'
import { useState } from 'react'
import Link from 'next/link'
import Nav from './Nav'
import Footer from './Footer'
import ShowRow from './ShowRow'
import FanSignup from './FanSignup'
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
          {!unavailable && filtered.map((show) => <ShowRow key={show.id} show={show} />)}
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
        </section>
        <FanSignup bandSlug={filter === 'all' ? '' : filter} key={filter} />
      </main>
      <Footer />
    </>
  )
}
