import { Card, EmptyState, ErrorCard, MetricGrid, PersonHeader, PortalShell, PortalTopBar, SectionLabel, ShowCard } from '@/components/portal/PortalUI'
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
        { label: 'Unavailable', value: portal.blackouts.length, sub: 'on record', icon: '🚫' },
      ]} />

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
        {portal.blackouts.length > 0 ? (
          <div style={{ display: 'grid', gap: 12 }}>
            {portal.blackouts.slice(0, 6).map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, borderBottom: '1px solid var(--c-border)', paddingBottom: 12 }}>
                <div style={{ fontWeight: 800 }}>{item.dateLabel}</div>
                <div style={{ color: 'var(--c-text-dim)', fontSize: 13, textAlign: 'right' }}>{item.reason || 'No reason listed'}</div>
              </div>
            ))}
          </div>
        ) : <span style={{ color: 'var(--c-text-muted)' }}>No unavailable dates on record.</span>}
      </Card>
    </PortalShell>
  )
}
