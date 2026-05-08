// Server-component layout. Provides per-route metadata since the page itself
// is a 'use client' component and can't export metadata directly.

export const metadata = {
  title: 'About',
  description: 'Echo Play Live was founded in 2023 by Evan Ranallo as a band management company for tribute and cover bands across the DFW Metroplex. Quality, hustle, and love for the show.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Echo Play Live',
    description: 'DFW tribute and cover band management. Founded 2023 by Evan Ranallo. Quality, hustle, and love for the show.',
    url: 'https://echoplay.live/about',
  },
}

export default function AboutLayout({ children }) {
  return children
}
