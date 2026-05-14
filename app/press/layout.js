// Phase 39 — Press kit + FAQ structured data.
//
// Server-component layout. Provides per-route metadata since the page itself
// is a 'use client' component and can't export metadata directly.

import { faqPage, breadcrumbList, JsonLd } from '@/lib/jsonld'

const SITE_URL = 'https://echoplay.live'

export const metadata = {
  title: 'Press & EPK',
  description: 'Echo Play Live press kit — band one-pagers, logo downloads, photos, and booking contacts for all four bands: So Long Goodnight, The Dick Beldings, Jambi, and Elite.',
  alternates: { canonical: '/press' },
  openGraph: {
    title: 'Echo Play Live · Press & EPK',
    description: 'Download band one-pager PDFs, logo files, and booking contacts for Echo Play Live\'s tribute and cover bands.',
    url: `${SITE_URL}/press`,
  },
}

// FAQ content — drafted in EPL voice. Edit freely.
const FAQ = [
  {
    q: 'What is in the EPK?',
    a: 'A one-page PDF per band with bio, photos, stats, and a band-specific booking email. Each band also has logos in three colorways available for download on this page.',
  },
  {
    q: 'Can I get higher-resolution band photos for print?',
    a: 'Yes. Email the booking contact for the band you are covering and we will send press-quality photos. Most bands have a 5 to 10 image press pack ready to go.',
  },
  {
    q: 'Are logos available in different formats?',
    a: 'Yes. Each band logo is available as SVG (vector) and PNG (1024px). Three colorways: full color, white, and black. All downloadable directly from this page.',
  },
  {
    q: 'How do I credit Echo Play Live or one of the bands?',
    a: 'For press use: "Echo Play Live" or the specific band name. Photographer credit is in the file name when applicable. Otherwise no formal credit line is required.',
  },
  {
    q: 'Who do I contact for an interview or feature?',
    a: 'Use the booking contact for the band you want to feature. For management-level inquiries, the EPL Hub at echoplay.live/hub will route you appropriately once it ships.',
  },
]

const faqLd = faqPage(FAQ)
const breadcrumbLd = breadcrumbList([
  { name: 'Home', url: '/' },
  { name: 'Press & EPK', url: '/press' },
])

export default function PressLayout({ children }) {
  return (
    <>
      <JsonLd data={[faqLd, breadcrumbLd]} />
      {children}
    </>
  )
}
