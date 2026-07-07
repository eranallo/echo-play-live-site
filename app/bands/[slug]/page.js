import { notFound } from 'next/navigation'
import BandPageClient from '@/components/band/BandPageClient'
import { allBandsList, getBand } from '@/lib/bands'

const SITE_URL = 'https://echoplay.live'

export function generateStaticParams() {
  return allBandsList.map(band => ({ slug: band.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const band = getBand(slug)

  if (!band) {
    return {
      title: 'Band Not Found',
      robots: { index: false, follow: false },
    }
  }

  const image = band.heroPhoto?.startsWith('http')
    ? band.heroPhoto
    : band.heroPhoto
      ? `${SITE_URL}${band.heroPhoto}`
      : `${SITE_URL}/opengraph-image.png`

  return {
    title: band.name,
    description: band.description || band.tagline,
    alternates: { canonical: `/bands/${band.slug}` },
    robots: band.hidden ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      title: `${band.name} | Echo Play Live`,
      description: band.description || band.tagline,
      url: `/bands/${band.slug}`,
      images: [{ url: image, alt: band.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${band.name} | Echo Play Live`,
      description: band.description || band.tagline,
      images: [image],
    },
  }
}

export default async function BandPage({ params }) {
  const { slug } = await params
  const band = getBand(slug)

  if (!band) notFound()

  return <BandPageClient band={band} />
}
