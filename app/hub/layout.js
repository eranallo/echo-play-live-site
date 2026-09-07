// Phase 34 — EPL Hub QR landing metadata. noindex to avoid competing with homepage.

const SITE_URL = 'https://echoplay.live'

export const metadata = {
  title: 'Official links',
  description:
    'Find a show, meet our bands or get in touch about booking. All our official links in one place.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Echo Play Live · Official links',
    description: 'Find a show, meet our bands or get in touch about booking.',
    url: `${SITE_URL}/hub`,
  },
}

export default function HubLayout({ children }) {
  return children
}
