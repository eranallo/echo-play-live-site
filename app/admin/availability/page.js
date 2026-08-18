import AdminNav from '@/components/admin/AdminNav'
import AvailabilityAdminDashboard from '@/components/admin/AvailabilityAdminDashboard'
import { getAdminAvailabilityDashboard } from '@/lib/availability/masterCalendar'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Availability | Echo Play OS',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminAvailabilityPage() {
  const result = await getAdminAvailabilityDashboard()

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 'clamp(82px, 8vw, 122px) var(--gutter-fluid)',
        paddingBottom: 'clamp(88px, 8vw, 122px)',
        background: 'radial-gradient(circle at 8% 0%, rgba(212,160,23,.16), transparent 34%), linear-gradient(180deg,#101010,#060606 44%,#030303)',
        color: 'var(--c-text)',
      }}
    >
      <AdminNav contextLabel="Availability" />

      {result.ok && result.data ? (
        <AvailabilityAdminDashboard data={result.data} />
      ) : (
        <section
          style={{
            maxWidth: 880,
            margin: '0 auto',
            border: '1px solid var(--c-border)',
            background: 'rgba(255,255,255,.018)',
            padding: 'clamp(24px,5vw,44px)',
          }}
        >
          <div style={{ color: 'var(--c-epl)', fontFamily: 'var(--ff-label)', fontSize: 10, fontWeight: 900, letterSpacing: '.16em', textTransform: 'uppercase' }}>
            Availability error
          </div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(54px,9vw,104px)', fontWeight: 400, lineHeight: .84, marginTop: 10 }}>
            Couldn’t load the roster.
          </h1>
          <p style={{ color: 'var(--c-text-muted)', lineHeight: 1.65, marginTop: 18 }}>
            {result.error || 'The Echo Play Live availability dashboard is temporarily unavailable.'}
          </p>
        </section>
      )}
    </main>
  )
}
