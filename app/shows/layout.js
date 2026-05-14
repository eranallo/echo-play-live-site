// Phase 39 — Event JSON-LD for /shows. Server-renders upcoming-show structured
// data so Google can place EPL shows in its events carousel for searches like
// "Fort Worth live music this weekend" or "tribute bands Dallas."
//
// Falls back gracefully when no upcoming shows are available (no JSON-LD
// emitted) so a quiet stretch on the calendar never produces empty schema.

import { getUpcomingShowsForJsonLd, JsonLd } from '@/lib/jsonld'

export const metadata = {
  title: 'Shows & Events',
  description: 'Upcoming shows for all Echo Play Live bands across the DFW Metroplex. So Long Goodnight, The Dick Beldings, Jambi, and Elite live dates from Bandsintown.',
  alternates: { canonical: '/shows' },
  openGraph: {
    title: 'Shows & Events | Echo Play Live',
    description: 'Upcoming shows for all Echo Play Live bands across the DFW Metroplex.',
    url: 'https://echoplay.live/shows',
  },
}

export default async function ShowsLayout({ children }) {
  const events = await getUpcomingShowsForJsonLd()
  return (
    <>
      {events.length > 0 && <JsonLd data={events} />}
      {children}
    </>
  )
}
