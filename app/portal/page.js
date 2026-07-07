import { Card, EmptyState, ErrorCard, InlineActions, PersonRow, PortalHero, PortalShell, SectionLabel } from '@/components/portal/PortalUI'
import { getPortalDirectory } from '@/lib/portal/airtable'

export const dynamic = 'force-dynamic'

export default async function PortalPage() {
  const directory = await getPortalDirectory()

  if (!directory.ok) {
    return <ErrorCard message={directory.error} />
  }

  return (
    <PortalShell>
      <PortalHero
        eyebrow="Echo Play Live"
        title="Crew Portal"
        subtitle="Show-day info, call times, venue details, assignments, notes, and setlists — built for quick phone use when everyone is moving fast."
      >
        <InlineActions actions={[
          { href: '#members', label: 'Band Members' },
          { href: '#crew', label: 'Crew' },
        ]} />
      </PortalHero>

      <Card accent>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div className="portal-metric-value">{directory.members.length}</div>
            <div className="portal-metric-label">Members</div>
            <div className="portal-metric-sub">active records</div>
          </div>
          <div>
            <div className="portal-metric-value">{directory.crew.length}</div>
            <div className="portal-metric-label">Crew</div>
            <div className="portal-metric-sub">active records</div>
          </div>
        </div>
      </Card>

      <section id="members">
        <SectionLabel>Band Members</SectionLabel>
        <div className="portal-stagger">
          {directory.members.length > 0 ? directory.members.map(member => (
            <PersonRow key={member.id} person={member} href={`/portal/member/${member.id}`} />
          )) : (
            <EmptyState title="No members yet" body="Active member records will appear here once Airtable has them." />
          )}
        </div>
      </section>

      <section id="crew">
        <SectionLabel>Crew</SectionLabel>
        <div className="portal-stagger">
          {directory.crew.length > 0 ? directory.crew.map(crew => (
            <PersonRow key={crew.id} person={crew} href={`/portal/crew/${crew.id}`} />
          )) : (
            <EmptyState title="No crew yet" body="Active crew records will appear here once Airtable has them." />
          )}
        </div>
      </section>
    </PortalShell>
  )
}
