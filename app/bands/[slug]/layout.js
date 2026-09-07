import { pageMetadata, bandSearchCopy } from '@/lib/public/seo.mjs'
// Dynamic per-band metadata + BreadcrumbList JSON-LD.

import { getBand, bandsList, allBandsList } from '@/lib/bands'
import { breadcrumbList, JsonLd } from '@/lib/jsonld'

const SITE_URL = 'https://echoplay.live'

export async function generateStaticParams() {
  return allBandsList.map(band => ({ slug: band.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const band = getBand(slug)
  if (!band) return { title: 'Band not found', robots: { index: false } }
  const copy = bandSearchCopy[slug] || { title: band.name, description: band.description }
  return pageMetadata({ ...copy, path: `/bands/${slug}`, image: band.hidden ? '/opengraph-image.png' : `/social/${slug}.png`, imageAlt: band.name, noindex: Boolean(band.hidden) })
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
