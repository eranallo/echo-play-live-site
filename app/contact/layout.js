// Phase 39 — Booking + FAQ structured data.

import { faqPage, breadcrumbList, JsonLd } from '@/lib/jsonld'
import { FAQ_CONTACT } from '@/lib/faqs'

const SITE_URL = 'https://echoplay.live'

export const metadata = {
  title: 'Book a Band',
  description: 'Book a tribute or cover band for your venue, festival, or private event. Echo Play Live manages So Long Goodnight, The Dick Beldings, Jambi, and Elite across the DFW Metroplex and beyond.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Book a Band | Echo Play Live',
    description: 'Book a tribute or cover band for your venue, festival, or private event in DFW.',
    url: `${SITE_URL}/contact`,
  },
}

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
