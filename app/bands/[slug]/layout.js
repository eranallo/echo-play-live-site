// Dynamic per-band metadata + BreadcrumbList JSON-LD.

import { getBand, bandsList } from '@/lib/bands'
import { breadcrumbList, JsonLd } from '@/lib/jsonld'

const SITE_URL = 'https://echoplay.live'

export async function generateStaticParams() {
  return bandsList.map(band => ({ slug: band.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const band = getBand(slug)
  if (!band) return {}

  const url = `${SITE_URL}/bands/${band.slug}`
  const title = band.name
  const description = band.description.length > 200
    ? band.description.slice(0, 197) + '...'
    : band.description

  return {
    title,
    description,
    alternates: { canonical: `/bands/${slug}` },
    keywords: [
      band.name,
      band.shortName,
      ...band.genre,
      'DFW tribute band',
      'Fort Worth live music',
      'book ' + band.name,
    ],
    openGraph: {
      type: 'profile',
      title: `${band.name} | Echo Play Live`,
      description,
      url,
      images: band.heroPhoto ? [{ url: band.heroPhoto, width: 1200, height: 630, alt: `${band.name} live` }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${band.name} | Echo Play Live`,
      description,
    },
  }
}

export default async function BandLayout({ children, params }) {
  const { slug } = await params
  const band = getBand(slug)
  const breadcrumb = band
    ? breadcrumbList([
        { name: 'Home', url: '/' },
        { name: band.name, url: `/bands/${band.slug}` },
      ])
    : null

  return (
    <>
      {breadcrumb && <JsonLd data={breadcrumb} />}
      {children}
    </>
  )
}
