// Phase 34 — EPL Hub QR landing metadata. noindex to avoid competing with homepage.

const SITE_URL = 'https://echoplay.live'

export const metadata = {
  title: 'Echo Play Live',
  description: 'Tribute and cover band management in DFW. Book a band for your event.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Echo Play Live',
    description: 'Tribute and cover band management in DFW.',
    url: `${SITE_URL}/hub`,
  },
}

export default function HubLayout({ children }) {
  return children
}
