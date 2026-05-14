// Phase 34 — Per-band QR landing metadata.
//
// noindex: these pages duplicate /bands/[slug] content. They exist for QR
// scans, not search discovery. Google should index the canonical /bands/[slug]
// page instead.

import { getBand, bandsList } from '@/lib/bands'

const SITE_URL = 'https://echoplay.live'

export async function generateStaticParams() {
  return bandsList.map(b => ({ slug: b.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const band = getBand(slug)
  if (!band) return { title: 'Not found' }

  return {
    title: band.name,
    description: band.tagline || band.description?.slice(0, 160) || `${band.name} on Echo Play Live`,
    robots: { index: false, follow: true },
    alternates: { canonical: `/bands/${slug}` },
    openGraph: {
      title: `${band.name} | Echo Play Live`,
      description: band.tagline || `${band.name} on Echo Play Live`,
      url: `${SITE_URL}/${slug}`,
      images: band.heroPhoto ? [{ url: band.heroPhoto, width: 1200, height: 630, alt: band.name }] : undefined,
    },
  }
}

export default function BandLandingLayout({ children }) {
  return children
}
