import { pageMetadata } from '@/lib/public/seo.mjs'
// Phase 39 — Booking + FAQ structured data.

import { faqPage, breadcrumbList, JsonLd } from '@/lib/jsonld'
import { FAQ_CONTACT } from '@/lib/faqs'

const SITE_URL = 'https://echoplay.live'

export const metadata = pageMetadata({"title": "Book a Tribute or Cover Band in DFW", "description": "Book live music for your venue, festival, corporate or private event. Tell Echo Play Live your date and plans, and we’ll help you choose a band.", "path": "/contact"})

const faqLd = faqPage(FAQ_CONTACT)
const breadcrumbLd = breadcrumbList([
  { name: 'Home', url: '/' },
  { name: 'Book a Band', url: '/contact' },
])

export default function ContactLayout({ children }) {
  return (
    <>
      <JsonLd data={[faqLd, breadcrumbLd]} />
      {children}
    </>
  )
}
