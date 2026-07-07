import { getAdminShowsOverview } from '@/lib/admin/airtable'

// Public read-model for the website schedule. The current admin helper already
// performs the server-side Airtable read and normalizes band/venue/date fields.
// This wrapper keeps public pages from depending on third-party widgets for the
// core show list, while exposing only safe public-facing fields.
export async function getPublicShows() {
  const result = await getAdminShowsOverview()
  if (!result?.ok) return []

  return (result.shows || []).map(show => ({
    id: show.id,
    date: show.date,
    dateLabel: show.dateLabel,
    bandName: show.band,
    bandColor: show.bandColor || '#D4A017',
    venueName: show.venue,
    startTime: show.startTime || '',
    status: show.status || '',
    ticketUrl: show.ticketUrl || '',
    ticketLabel: show.ticketInfo || 'Ticket info coming soon',
    missingFlags: show.missingFlags || [],
  }))
}
