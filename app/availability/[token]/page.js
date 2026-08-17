import AvailabilityForm from '@/components/availability/AvailabilityForm'
import { Card, PortalHero, PortalShell, PortalTopBar } from '@/components/portal/PortalUI'
import { getAvailabilityByToken } from '@/lib/availability/airtable'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Monthly Availability | Echo Play Live',
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
        <PortalTopBar title="Monthly Availability" subtitle="Echo Play Live" backHref="/" />
        <PortalHero
          eyebrow="Availability"
          title="This link is not available"
          subtitle={result.error || 'The link may be invalid, expired, or closed.'}
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
      <PortalTopBar title="Monthly Availability" subtitle="Echo Play Live" backHref="/" />
      <AvailabilityForm data={result.data} token={token} />
    </PortalShell>
  )
}
