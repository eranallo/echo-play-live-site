import MasterCalendar from '@/components/portal/MasterCalendar'
import { ErrorCard, PortalShell, PortalTopBar } from '@/components/portal/PortalUI'
import { centralDateKey } from '@/lib/portal/showNavigation.mjs'
import { calendarMonthKey } from '@/lib/portal/calendar.mjs'
import { getPortalCalendar } from '@/lib/portal/airtable'

export const dynamic = 'force-dynamic'

export default async function PortalCalendarPage({ searchParams }) {
  const resolvedSearch = await searchParams
  const calendar = await getPortalCalendar()

  if (!calendar.ok) {
    return <ErrorCard message={calendar.error} />
  }

  const todayKey = centralDateKey()
  const initialMonth = calendarMonthKey(resolvedSearch?.month || todayKey)

  return (
    <PortalShell active="calendar" wide>
      <PortalTopBar title="Master Calendar" subtitle="All Echo Play Live shows" />
      <header className="portal-calendar-header">
        <div className="portal-eyebrow">Every band. Every venue.</div>
        <h1 data-echo="All Shows">All Shows</h1>
        <p>
          The complete Echo Play Live schedule, including future years, tentative dates,
          show times, and direct access to show-day details.
        </p>
      </header>
      <MasterCalendar
        shows={calendar.shows}
        counts={calendar.counts}
        initialMonth={initialMonth}
        todayKey={todayKey}
      />
    </PortalShell>
  )
}
