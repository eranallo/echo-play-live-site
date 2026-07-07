import { getAdminShowsOverview } from '@/lib/admin/airtable'
import { formatDateOnly } from '@/lib/date'

export async function getPublicShows() {
  const result = await getAdminShowsOverview()
  if (!result?.ok) return []

  return (result.shows || []).map(show => ({
    id: show.id,
    date: show.date,
    dateLabel: formatDateOnly(show.date),
    bandName: show.band,
    bandColor: show.bandColor || '#D4A017',
    venueName: show.venue,
    startTime: show.startTime || '',
    status: show.status || '',
    ticketUrl: show.ticketUrl || '',
    ticketLabel: show.ticketPrice || 'Ticket info coming soon',
    missingFlags: show.missingFlags || [],
  }))
}
