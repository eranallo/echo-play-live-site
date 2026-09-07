import { pageMetadata } from '@/lib/public/seo.mjs'
// Phase 34 — EPL Hub QR landing metadata. noindex to avoid competing with homepage.

const SITE_URL = 'https://echoplay.live'

export const metadata = pageMetadata({ title: 'Echo Play Live · Official Links', description: 'Find a show, meet our bands, get updates or ask about booking. All our official links in one place.', path: '/hub', canonical: '/', noindex: true })

export default function HubLayout({ children }) {
  return children
}
