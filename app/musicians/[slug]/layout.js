import { pageMetadata } from '@/lib/public/seo.mjs'
// Per-musician metadata + static-param generation.
//
// Phase 10A foundation. OG images per musician land in Phase 10D.

import { getMusician, getMusicianSlugs } from '@/lib/musicians'

const SITE_URL = 'https://echoplay.live'

export async function generateStaticParams() {
  return await getMusicianSlugs()
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const m = await getMusician(slug)
  if (!m) return { title: 'Musician not found', robots: { index: false } }

  const url = `${SITE_URL}/musicians/${m.slug}`
  const bandsLine = m.bands.map(b => b.name).join(', ')
  const instrLine = m.instruments.join(' / ')
  const parts = [instrLine, bandsLine].filter(Boolean).join(' · ')
  const description = m.bioShort
    || (parts ? `${m.name} — ${parts}. Echo Play Live roster.` : `${m.name} — Echo Play Live roster.`)

  return pageMetadata({ title: m.name, description: description.length > 170 ? description.slice(0, 167).trimEnd() + '…' : description, path: `/musicians/${m.slug}`, image: `/musicians/${m.slug}/opengraph-image`, imageAlt: `${m.name} · Echo Play Live`, type: 'profile' })
}

export default function MusicianLayout({ children }) {
  return children
}
