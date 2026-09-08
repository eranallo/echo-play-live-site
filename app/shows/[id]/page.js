import { pageMetadata } from '@/lib/public/seo.mjs'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Page } from '@/components/SiteParts'
import ShareShow from '@/components/ShareShow'
import TrackedLink from '@/components/TrackedLink'
import FanSignup from '@/components/FanSignup'
import { getPublicShow } from '@/lib/public/show-detail'
import { showPath, showTitle, showDate, showTime } from '@/lib/public/show-presentation.mjs'
import { publicShowToEventJsonLd } from '@/lib/public/shows-contract.mjs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params }) {
  const { id } = await params
  const { show } = await getPublicShow(id)
  if (!show) return { title: 'Show unavailable', robots: { index: false, follow: false } }
  const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${show.date}T12:00:00Z`))
  return pageMetadata({ title: `${show.state === 'canceled' ? 'Canceled: ' : ''}${showTitle(show)} · ${date}`, description: `${show.state === 'canceled' ? 'This show has been canceled. ' : ''}${showDate(show)} · ${showTime(show)}. See the lineup and venue details.`, path: showPath(show), image: `/social/${show.bands[0].slug}.png`, imageAlt: show.bands.map(band => band.name).join(' + ') })
}

export default async function EventPage({ params }) {
  const { id } = await params
  const result = await getPublicShow(id)
  if (!result.ok) throw new Error('Show details are temporarily unavailable')
  if (!result.show) notFound()
  const show = result.show
  const canceled = show.state === 'canceled'
  return (
    <Page>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(publicShowToEventJsonLd(show)).replace(/</g, '\\u003c'),
        }}
      />
      <section className="shell event-intro">
        <Link className="text-link" href="/shows" prefetch={false}>
          ← All shows
        </Link>
        <p className="eyebrow">{canceled ? 'Canceled show' : 'Upcoming show'}</p>
        <h1>{show.bands.map((band) => band.name).join(' + ')}</h1>
        <p className="event-venue">{show.venue.name}</p>
        <div className="event-facts">
          <div>
            <span>Date</span>
            <strong>{showDate(show)}</strong>
          </div>
          <div>
            <span>Start time</span>
            <strong>{showTime(show)}</strong>
          </div>
          {show.doorsTime && <div><span>Doors</span><strong>{showTime({ ...show, startTime: show.doorsTime })}</strong></div>}
          {!canceled && (show.ticket || show.ticketNote) && <div>
            <span>{show.ticket ? 'Tickets' : 'Admission'}</span>
            <strong>{show.ticket?.priceLabel || show.ticketNote || 'See ticket page'}</strong>
          </div>}
        </div>
        {canceled ? (
          <div className="quiet-state">
            <h2>This show has been canceled.</h2>
            <p>For ticket or refund questions, contact the ticket provider or venue.</p>
          </div>
        ) : (
          <div className="button-row event-actions">
            {show.ticket ? (
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
              <p className="muted">{show.ticketNote}</p>
            ) : null}
            <TrackedLink
              className="button button-outline"
              href={`${showPath(show)}/calendar`}
              event="Calendar download"
              showId={show.id}
              download
            >
              {show.startTime ? 'Add to calendar ↓' : 'Save the date ↓'}
            </TrackedLink>
          </div>
        )}
        <ShareShow title={showTitle(show)} path={showPath(show)} showId={show.id} />
      </section>
      <section className="shell section-bottom event-more">
        <div className="content-panel">
          <p className="eyebrow">The lineup</p>
          <h2>Meet the bands.</h2>
          <div className="inline-links">
            {show.bands.map((band) => (
              <Link key={band.slug} href={`/bands/${band.slug}`}>
                {band.name} ↗
              </Link>
            ))}
          </div>
        </div>
        <div className="content-panel">
          <p className="eyebrow">Before you go</p>
          <h2>Plan your night.</h2>
          {show.venue.address && <p>{show.venue.address}</p>}
          {show.venue.ageRestriction && <p>Venue age policy: {show.venue.ageRestriction}</p>}
          <p>
            Check with the venue for the latest entry requirements, parking, and accessibility
            information.
          </p>
          <a
            className="text-link"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([show.venue.name, show.venue.address].filter(Boolean).join(', '))}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Find {show.venue.name} on Maps ↗
          </a>
        </div>
      </section>
      <FanSignup bandSlug={show.bands.length === 1 ? show.bands[0].slug : ''} />
    </Page>
  )
}
