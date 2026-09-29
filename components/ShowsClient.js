'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Page, Intro } from './SiteParts'
import { PortalBox } from './PortalSidebar'
import ShowRow from './ShowRow'
import FanSignup from './FanSignup'

export default function ShowsClient({ publicBands = [], shows = [], state = 'ready', initialFilter = 'all' }) {
  const [filter, setFilter] = useState(initialFilter)
  const filtered = shows.filter(show => filter === 'all' || show.bands.some(band => band.slug === filter))
  const unavailable = state === 'unavailable'
  return <Page section="shows" sidebar={
    <aside className="portal-sidebar portal-filter-sidebar" aria-label="Show filters">
      <PortalBox title="Choose a band">
        <div className="filter-bar" aria-label="Filter shows by band">
          {[{ slug: 'all', name: 'All bands' }, ...publicBands].map(band => <button
            type="button" key={band.slug} className="filter-chip" aria-pressed={filter === band.slug}
            onClick={() => setFilter(band.slug)}>{band.name}</button>)}
        </div>
      </PortalBox>
      <PortalBox title="Show updates"><p>New dates appear here as they’re announced.</p><a className="text-link" href="#stay-in-loop">Join the mailing list →</a></PortalBox>
    </aside>
  }>
    <Intro eyebrow="Upcoming shows" title="Come see us play."><p>Here’s where we’re playing next. We’d love to see you out.</p></Intro>
    <section className="shell section-bottom portal-calendar">
      <div className="scene-section-bar portal-module-heading"><h2>Show calendar</h2><span>Central Time</span></div>
      <p className="shows-count" role="status">{unavailable ? 'Show listings are temporarily unavailable' : `${filtered.length} upcoming ${filtered.length === 1 ? 'show' : 'shows'} · Times shown in Central Time`}</p>
      {!unavailable && filtered.map(show => <ShowRow key={show.id} show={show} />)}
      {(unavailable || filtered.length === 0) && <div className="empty-state">
        <h2>{unavailable ? 'We couldn’t load the shows.' : 'No shows announced yet.'}</h2>
        <p>{unavailable ? 'Please try again in a moment. You can also find show updates through each band’s page.' : 'We’ll add dates here as they’re announced. You can sign up below for updates.'}</p>
        {unavailable ? <a className="button" href="/shows">Try again ↻</a>
          : filter !== 'all' ? <button className="button" onClick={() => setFilter('all')}>See all bands</button>
          : <Link className="button" href="/bands">Explore the bands →</Link>}
      </div>}
    </section>
    <FanSignup bandSlug={filter === 'all' ? '' : filter} key={filter} />
  </Page>
}
