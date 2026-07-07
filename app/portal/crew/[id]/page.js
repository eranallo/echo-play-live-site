import { Card, ErrorCard, MetricGrid, Pill, PortalShell, PortalTopBar, SectionLabel, ShowCard } from '@/components/portal/PortalUI'
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

      <section style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        {person.photo ? (
          <img src={person.photo} alt="" style={{ width: 58, height: 58, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'rgba(212,160,23,0.1)', color: '#d4a017', display: 'grid', placeItems: 'center', fontWeight: 900 }}>
            {person.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h1 style={{ fontSize: 26, lineHeight: 1, margin: 0 }}>{person.name}</h1>
          {person.role && <div style={{ marginTop: 8 }}><Pill accent>{person.role}</Pill></div>}
        </div>
      </section>

      <MetricGrid items={[
        { label: 'Assignments', value: portal.shows.length, sub: 'upcoming', icon: '🎛', accent: true },
        { label: 'Unavailable', value: portal.blackouts.length, sub: 'on record', icon: '🚫' },
      ]} />

      <SectionLabel>Next Assignment</SectionLabel>
      {portal.nextShow ? (
        <ShowCard show={portal.nextShow} roleLabels={portal.nextShow.roles} href={`/portal/shows/${portal.nextShow.id}?from=crew&person=${person.id}`} />
      ) : (
        <Card>No upcoming assignments yet.</Card>
      )}

      <SectionLabel>Upcoming Assignments</SectionLabel>
      <div style={{ display: 'grid', gap: 12 }}>
        {portal.shows.length > 0 ? portal.shows.map(show => (
          <ShowCard key={show.id} show={show} roleLabels={show.roles} href={`/portal/shows/${show.id}?from=crew&person=${person.id}`} />
        )) : (
          <Card>No upcoming assignments found.</Card>
        )}
      </div>

      <SectionLabel>Unavailable Dates</SectionLabel>
      <Card>
        {portal.blackouts.length > 0 ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {portal.blackouts.slice(0, 6).map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, borderBottom: '1px solid #232333', paddingBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{item.dateLabel}</div>
                <div style={{ color: '#7b7f91', fontSize: 12 }}>{item.reason || 'No reason listed'}</div>
              </div>
            ))}
          </div>
        ) : 'No unavailable dates on record.'}
      </Card>
    </PortalShell>
  )
}
