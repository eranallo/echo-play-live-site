// Phase 39 — Press kit + FAQ structured data.
//
// Server-component layout. Provides per-route metadata since the page itself
// is a 'use client' component and can't export metadata directly.

import { faqPage, breadcrumbList, JsonLd } from '@/lib/jsonld'
import { FAQ_PRESS } from '@/lib/faqs'

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

const faqLd = faqPage(FAQ_PRESS)
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
