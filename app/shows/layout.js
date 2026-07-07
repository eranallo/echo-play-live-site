const SITE_URL = 'https://echoplay.live'

export const metadata = {
  title: 'Shows & Events',
  description: 'Announced Echo Play Live shows across the DFW Metroplex and beyond.',
  alternates: { canonical: '/shows' },
  openGraph: {
    title: 'Shows & Events | Echo Play Live',
    description: 'Announced Echo Play Live shows across the DFW Metroplex and beyond.',
    url: `${SITE_URL}/shows`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shows & Events | Echo Play Live',
    description: 'Announced Echo Play Live shows across the DFW Metroplex and beyond.',
  },
}

export default function ShowsLayout({ children }) {
  return children
}
