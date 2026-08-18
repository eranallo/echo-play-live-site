import MasterAvailabilityCalendar from '@/components/availability/MasterAvailabilityCalendar'
import { Card, PortalHero, PortalShell, PortalTopBar } from '@/components/portal/PortalUI'
import { getMasterAvailabilityByToken } from '@/lib/availability/masterCalendar'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'EPL Availability | Echo Play Live',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AvailabilityPage({ params }) {
  const resolvedParams = await params
  const token = resolvedParams?.token || ''
  const result = await getMasterAvailabilityByToken(token)

  if (!result.ok) {
    return (
      <PortalShell showDock={false}>
        <PortalTopBar title="EPL Availability" subtitle="Echo Play Live" backHref="/" />
        <PortalHero
          eyebrow="Availability"
          title="This dashboard is not available"
          subtitle={result.error || 'The private link may be invalid or unavailable.'}
        />
        <Card>
          <p style={{ color: 'var(--c-text-muted)', lineHeight: 1.6 }}>
            Contact Evan if you believe you received this message by mistake.
          </p>
        </Card>
      </PortalShell>
    )
  }

  return (
    <PortalShell showDock={false}>
      <PortalTopBar title="EPL Availability" subtitle="Echo Play Live" backHref="/" />
      <MasterAvailabilityCalendar data={result.data} token={token} />
    </PortalShell>
  )
}
