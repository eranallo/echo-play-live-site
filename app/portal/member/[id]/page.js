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
import { getMemberPortal } from '@/lib/portal/airtable'

export const dynamic = 'force-dynamic'

export default async function MemberPortalPage({ params }) {
  const resolvedParams = await params
  const portal = await getMemberPortal(resolvedParams?.id)

  if (!portal.ok || !portal.person) {
    return <ErrorCard message={portal.error} />
  }

  const person = portal.person

  return (
    <PortalShell>
      <PortalTopBar title={person.name} subtitle={person.role || 'Band Member'} />
      <PersonHeader person={person} type="Band Member" />

      <MetricGrid items={[
        { label: 'My Shows', value: portal.shows.length, sub: 'upcoming', icon: '🎸', accent: true },
        { label: 'Review', value: portal.needsReview, sub: 'need confirmation', icon: '✓' },
        { label: 'Open Info', value: portal.needsInfo, sub: 'shows incomplete', icon: '!' },
        { label: 'Blackouts', value: portal.blackouts.length, sub: 'on record', icon: '🚫' },
      ]} />

      {portal.conflicts.length > 0 && (
        <>
          <SectionLabel>Availability Conflict</SectionLabel>
          <Card accent>
            <div className="portal-alert-title">A show overlaps a blackout date</div>
            <p className="portal-muted-copy">
              Confirm this with Evan now so there is time to adjust the lineup or clear the blackout.
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

      <SectionLabel>Next Show</SectionLabel>
      {portal.nextShow ? (
        <ShowCard
          show={portal.nextShow}
          roleLabels={portal.nextShow.roles}
          href={`/portal/shows/${portal.nextShow.id}?from=member&person=${person.id}`}
        />
      ) : (
        <EmptyState title="No next show" body="You do not have an upcoming show assigned yet." />
      )}

      <SectionLabel>Upcoming Shows</SectionLabel>
      <div className="portal-stagger" style={{ display: 'grid', gap: 12 }}>
        {portal.shows.length > 0 ? portal.shows.map(show => (
          <ShowCard
            key={show.id}
            show={show}
            roleLabels={show.roles}
            href={`/portal/shows/${show.id}?from=member&person=${person.id}`}
          />
        )) : (
          <EmptyState title="No shows found" body="Assigned shows will appear here once they are attached to your member record." />
        )}
      </div>

      <SectionLabel>Blackout Dates</SectionLabel>
      <Card>
        <BlackoutList items={portal.blackouts} />
        <AvailabilityForm personType="member" personId={person.id} />
      </Card>
    </PortalShell>
  )
}
