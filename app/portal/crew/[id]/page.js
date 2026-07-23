import AvailabilityForm from '@/components/portal/AvailabilityForm'
import {
  BlackoutList,
  Card,
  EmptyState,
  ErrorCard,
  MetricGrid,
  PersonHeader,
  Pill,
  PortalShell,
  PortalTopBar,
  SectionLabel,
  ShowCard,
} from '@/components/portal/PortalUI'
import { getCrewPortal } from '@/lib/portal/airtable'

export const dynamic = 'force-dynamic'

export default async function CrewPortalPage({ params }) {
  const resolvedParams = await params
  const portal = await getCrewPortal(resolvedParams?.id)

  if (!portal.ok || !portal.person) {
    return <ErrorCard message={portal.error} />
  }

  const person = portal.person

  return (
    <PortalShell>
      <PortalTopBar title={person.name} subtitle={person.role || 'Crew'} />
      <PersonHeader person={person} type="Crew" />

      <MetricGrid items={[
        { label: 'Assignments', value: portal.shows.length, sub: 'upcoming', icon: '🎛', accent: true },
        { label: 'Review', value: portal.needsReview, sub: 'need confirmation', icon: '✓' },
        { label: 'Open Info', value: portal.needsInfo, sub: 'shows incomplete', icon: '!' },
        { label: 'Unavailable', value: portal.blackouts.length, sub: 'on record', icon: '🚫' },
      ]} />

      {portal.conflicts.length > 0 && (
        <>
          <SectionLabel>Availability Conflict</SectionLabel>
          <Card accent>
            <div className="portal-alert-title">An assignment overlaps a blackout date</div>
            <p className="portal-muted-copy">
              Confirm this with Evan now so the crew plan can be corrected before show day.
            </p>
            <div className="portal-conflict-list">
              {portal.conflicts.map(({ show, blackout }) => (
                <div key={`${show.id}-${blackout.id}`}>
                  <strong>{show.dateLabel} • {show.venueName}</strong>
                  <Pill tone="warning">{blackout.reason || 'Unavailable'}</Pill>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      <SectionLabel>Next Assignment</SectionLabel>
      {portal.nextShow ? (
        <ShowCard show={portal.nextShow} roleLabels={portal.nextShow.roles} href={`/portal/shows/${portal.nextShow.id}?from=crew&person=${person.id}`} />
      ) : (
        <EmptyState title="No next assignment" body="You do not have an upcoming crew assignment yet." />
      )}

      <SectionLabel>Upcoming Assignments</SectionLabel>
      <div className="portal-stagger" style={{ display: 'grid', gap: 12 }}>
        {portal.shows.length > 0 ? portal.shows.map(show => (
          <ShowCard key={show.id} show={show} roleLabels={show.roles} href={`/portal/shows/${show.id}?from=crew&person=${person.id}`} />
        )) : (
          <EmptyState title="No assignments found" body="Crew assignments will appear here once they are attached to your crew record." />
        )}
      </div>

      <SectionLabel>Unavailable Dates</SectionLabel>
      <Card>
        <BlackoutList items={portal.blackouts} />
        <AvailabilityForm personType="crew" personId={person.id} />
      </Card>
    </PortalShell>
  )
}
