import { Card, ErrorCard, PersonRow, PortalHero, PortalShell, SectionLabel } from '@/components/portal/PortalUI'
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
        title="Musician Portal"
        subtitle="A mobile-first place for band members and crew to see show details, call times, venue info, assignments, and upcoming schedules."
      />

      <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
        <Card accent>
          <div style={{ fontSize: 13, color: '#d4a017', fontWeight: 800, marginBottom: 4 }}>Portal Preview</div>
          <div style={{ color: '#f4f4f6', fontSize: 14, lineHeight: 1.45 }}>
            This is the new portal preview inside the main Echo Play Live website.
          </div>
        </Card>
      </div>

      <SectionLabel>Band Members</SectionLabel>
      <div>
        {directory.members.length > 0 ? directory.members.map(member => (
          <PersonRow key={member.id} person={member} href={`/portal/member/${member.id}`} />
        )) : (
          <Card>No active members found.</Card>
        )}
      </div>

      <SectionLabel>Crew</SectionLabel>
      <div>
        {directory.crew.length > 0 ? directory.crew.map(crew => (
          <PersonRow key={crew.id} person={crew} href={`/portal/crew/${crew.id}`} />
        )) : (
          <Card>No active crew records found.</Card>
        )}
      </div>
    </PortalShell>
  )
}
