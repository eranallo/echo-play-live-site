import { Card, EmptyState, ErrorCard, InlineActions, PersonRow, PortalHero, PortalShell, SectionLabel } from '@/components/portal/PortalUI'
import { getPortalDirectory } from '@/lib/portal/airtable'

export const dynamic = 'force-dynamic'

function PortalStep({ number, title, body }) {
  return (
    <div className="portal-step">
      <div>{number}</div>
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  )
}

function RoleCard({ title, count, body, href }) {
  return (
    <a className="portal-role-card" href={href}>
      <span>{count}</span>
      <strong>{title}</strong>
      <p>{body}</p>
    </a>
  )
}

export default async function PortalPage() {
  const directory = await getPortalDirectory()

  if (!directory.ok) {
    return <ErrorCard message={directory.error} />
  }

  return (
    <PortalShell>
      <PortalHero
        eyebrow="Echo Play Live"
        title="Showday Portal"
        subtitle="Your assignments, call times, run of show, setlists, contacts, documents, availability, and important updates in one phone-first workspace."
      >
        <InlineActions actions={[
          { href: '#members', label: 'I’m Band' },
          { href: '#crew', label: 'I’m Crew' },
        ]} />
      </PortalHero>

      <div className="portal-home-pulse">
        <RoleCard title="Band Members" count={directory.members.length} body="Open your profile, then jump into your next assigned show." href="#members" />
        <RoleCard title="Crew" count={directory.crew.length} body="Find your assignments, call times, notes, and venue details." href="#crew" />
      </div>

      <Card accent>
        <div className="portal-card-heading">How to use this</div>
        <div className="portal-steps">
          <PortalStep number="1" title="Tap your name" body="Start from your member or crew profile." />
          <PortalStep number="2" title="Review next show" body="Check your role, schedule, venue, notes, contacts, setlists, and files." />
          <PortalStep number="3" title="Confirm updates" body="Acknowledge the latest details and add blackout dates from your dashboard." />
        </div>
      </Card>

      <section id="members">
        <SectionLabel>Band Members</SectionLabel>
        <div className="portal-stagger portal-directory-list">
          {directory.members.length > 0 ? directory.members.map(member => (
            <PersonRow key={member.id} person={member} href={`/portal/member/${member.id}`} />
          )) : (
            <EmptyState title="No members yet" body="Active member records will appear here once Airtable has them." />
          )}
        </div>
      </section>

      <section id="crew">
        <SectionLabel>Crew</SectionLabel>
        <div className="portal-stagger portal-directory-list">
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
