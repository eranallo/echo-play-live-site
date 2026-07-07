import { Card, EmptyState, ErrorCard, MetricGrid, PersonHeader, PortalShell, PortalTopBar, SectionLabel, ShowCard } from '@/components/portal/PortalUI'
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
        { label: 'Blackouts', value: portal.blackouts.length, sub: 'on record', icon: '🚫' },
      ]} />

      <SectionLabel>Next Show</SectionLabel>
      {portal.nextShow ? (
        <ShowCard show={portal.nextShow} href={`/portal/shows/${portal.nextShow.id}?from=member&person=${person.id}`} />
      ) : (
        <EmptyState title="No next show" body="You do not have an upcoming show assigned yet." />
      )}

      <SectionLabel>Upcoming Shows</SectionLabel>
      <div className="portal-stagger" style={{ display: 'grid', gap: 12 }}>
        {portal.shows.length > 0 ? portal.shows.map(show => (
          <ShowCard key={show.id} show={show} href={`/portal/shows/${show.id}?from=member&person=${person.id}`} />
        )) : (
          <EmptyState title="No shows found" body="Assigned shows will appear here once they are attached to your member record." />
        )}
      </div>

      <SectionLabel>Blackout Dates</SectionLabel>
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
        ) : <span style={{ color: 'var(--c-text-muted)' }}>No blackout dates on record.</span>}
      </Card>
    </PortalShell>
  )
}
