// Phase 39 — Booking + FAQ structured data.

import { faqPage, breadcrumbList, JsonLd } from '@/lib/jsonld'

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

// FAQ content — drafted in EPL voice. Edit any answer freely; Google reads
// from this file at build time and updates the rich snippet on the next
// deployment. For the FAQ rich snippet to actually show, this same content
// should also be visible on the page itself (Phase 39d-content follow-up).
const FAQ = [
  {
    q: 'How do I book one of your bands?',
    a: 'Fill out the form on this page, pick the band you want, and we will respond within 24 hours with availability and a quote. Most bookings are confirmed within a few days.',
  },
  {
    q: 'What is included in a typical booking?',
    a: 'A full band performance, all stage gear we bring, sound check coordination with the venue, and direct communication with the band lead. Travel beyond the DFW metroplex is quoted separately.',
  },
  {
    q: 'What deal types do you accept?',
    a: 'We work with guarantees, door deals, hybrid splits, and flat fees for private events. We are open to whatever structure makes the show work for both sides.',
  },
  {
    q: 'How far in advance should I book?',
    a: 'For weekend dates at established venues we recommend 30 days minimum. Festivals and busy seasonal dates often book 60 to 90 days out. Last-minute requests are welcome if we have a window.',
  },
  {
    q: 'Do you play outside DFW?',
    a: 'Yes. Most of our work is within the metroplex but we travel for the right event. Travel costs are quoted separately and depend on distance, gear, and overnight requirements.',
  },
]

const faqLd = faqPage(FAQ)
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
