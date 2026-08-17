import AvailabilityForm from '@/components/availability/AvailabilityForm'
import { Card, PortalHero, PortalShell, PortalTopBar } from '@/components/portal/PortalUI'
import { getAvailabilityByToken } from '@/lib/availability/airtable'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Practice Availability | Echo Play Live',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AvailabilityPage({ params }) {
  const resolvedParams = await params
  const token = resolvedParams?.token || ''
  const result = await getAvailabilityByToken(token)

  if (!result.ok) {
    return (
      <PortalShell showDock={false}>
        <PortalTopBar title="Practice Availability" subtitle="Echo Play Live" backHref="/" />
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
      <PortalTopBar title="Practice Availability" subtitle="Echo Play Live" backHref="/" />
      <AvailabilityForm data={result.data} token={token} />
    </PortalShell>
  )
}
