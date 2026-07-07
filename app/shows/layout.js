// Event JSON-LD for /shows. Server-renders upcoming-show structured data so Google can place EPL shows in event-rich search results.

import { getUpcomingShowsForJsonLd, JsonLd } from '@/lib/jsonld'

const SITE_URL = 'https://echoplay.live'

export const metadata = {
  title: 'Shows & Events',
  description: 'Upcoming shows for all Echo Play Live bands across the DFW Metroplex and beyond.',
  alternates: { canonical: '/shows' },
  openGraph: {
    title: 'Shows & Events | Echo Play Live',
    description: 'Upcoming shows for all Echo Play Live tribute and cover bands.',
    url: `${SITE_URL}/shows`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shows & Events | Echo Play Live',
    description: 'Upcoming shows for all Echo Play Live tribute and cover bands.',
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
