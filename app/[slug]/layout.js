// Phase 34 — Per-band QR landing metadata.
//
// noindex: these pages duplicate /bands/[slug] content. They exist for QR
// scans, not search discovery. Google should index the canonical /bands/[slug]
// page instead.

import { getBand, bandsList } from '@/lib/bands'
import { getLinkHub } from '@/lib/public/link-hubs.mjs'

const SITE_URL = 'https://echoplay.live'

export async function generateStaticParams() {
  return bandsList.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const band = getBand(slug)
  const hub = getLinkHub(slug)
  if (!band || !hub) return { title: 'Not found' }

  return {
    title: `${band.name} · Official links`,
    description: hub.intro,
    robots: { index: false, follow: true },
    alternates: { canonical: `/bands/${slug}` },
    openGraph: {
      title: `${band.name} · Official links`,
      description: hub.intro,
      url: `${SITE_URL}/${slug}`,
      images: band.heroPhoto
        ? [{ url: band.heroPhoto, width: 1200, height: 630, alt: band.name }]
        : undefined,
    },
  }
}

export default function BandLandingLayout({ children }) {
  return children
}
