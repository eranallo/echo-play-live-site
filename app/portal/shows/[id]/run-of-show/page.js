import Image from 'next/image'
import { Card, ErrorCard, Pill, PortalShell, PortalTopBar, SectionLabel, TimeBlock } from '@/components/portal/PortalUI'
import RunOfShowActions from '@/components/portal/RunOfShowActions'
import { getPortalRunOfShow } from '@/lib/portal/airtable'
import { segmentTypeSlug } from '@/lib/portal/runOfShow.mjs'

export const dynamic = 'force-dynamic'

function backHref(searchParams, showId) {
  const from = searchParams?.from
  const person = searchParams?.person
  if (['member', 'crew'].includes(from) && person) {
    return `/portal/shows/${showId}?from=${encodeURIComponent(from)}&person=${encodeURIComponent(person)}`
  }
  return `/portal/shows/${showId}`
}

function SegmentRow({ segment }) {
  return (
    <article className={`portal-run-segment portal-run-segment-${segmentTypeSlug(segment.type)}`}>
      <div className="portal-run-time">
        <strong>{segment.startLabel || 'TBD'}</strong>
        {segment.endLabel && <span>to {segment.endLabel}</span>}
      </div>
      <div className="portal-run-marker" aria-hidden="true">
        <span />
      </div>
      <div className="portal-run-content">
        <div className="portal-run-meta">
          <Pill>{segment.type}</Pill>
          {segment.durationLabel && <span>{segment.durationLabel}</span>}
        </div>
        <h2>{segment.name}</h2>
        {segment.details && <p>{segment.details}</p>}
        {!segment.startLabel && (
          <div className="portal-run-missing">Start time has not been entered yet.</div>
        )}
      </div>
    </article>
  )
}

export default async function RunOfShowPage({ params, searchParams }) {
  const resolvedParams = await params
  const resolvedSearch = await searchParams
  const detail = await getPortalRunOfShow(resolvedParams?.id)

  if (!detail.ok || !detail.show) {
    return <ErrorCard message={detail.error} />
  }

  const { show, segments } = detail
  const bands = show.bandNames.join(' • ') || 'Band TBD'
  const pdfHref = `/api/portal/shows/${show.id}/run-of-show.pdf`

  return (
    <PortalShell>
      <div className="portal-run-page">
        <PortalTopBar
          title="Run of Show"
          subtitle={show.dateLabel}
          backHref={backHref(resolvedSearch, show.id)}
        />

        <header className="portal-run-header">
          <div className="portal-eyebrow">Echo Play Live • Run of Show</div>
          <h1>{show.venueName}</h1>
          <p>{bands}</p>
          <div className="portal-run-date">{show.dateLabel}</div>
        </header>

        <Card accent>
          <div className="portal-time-grid portal-time-grid-run-summary">
            <TimeBlock label="Trailer Load-In" value={show.trailerLoadIn} />
            <TimeBlock label="Venue Load-In" value={show.loadIn} />
            <TimeBlock label="Soundcheck" value={show.soundCheck} />
            <TimeBlock label="Show Start" value={show.start} />
            <TimeBlock label="Show End" value={show.end} />
          </div>
        </Card>

        <RunOfShowActions pdfHref={pdfHref} />

        <SectionLabel>Timeline</SectionLabel>

        {segments.length ? (
          <div className="portal-run-timeline">
            {segments.map(segment => (
              <SegmentRow key={segment.id} segment={segment} />
            ))}
          </div>
        ) : (
          <Card>
            <div className="portal-run-empty">
              <Pill accent>Schedule pending</Pill>
              <h2>Run of show is being built</h2>
              <p>
                The show summary above is live. Detailed segments will appear here automatically
                as they are added to Airtable.
              </p>
            </div>
          </Card>
        )}

        <footer className="portal-run-footer">
          <Image src="/logo.png" alt="" width={34} height={34} />
          <div>
            <strong>Echo Play Live</strong>
            <span>Live schedule from Airtable</span>
          </div>
        </footer>
      </div>
    </PortalShell>
  )
}
