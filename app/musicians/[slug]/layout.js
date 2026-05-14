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
  if (!m) return { title: 'Musician not found' }

  const url = `${SITE_URL}/musicians/${m.slug}`
  const bandsLine = m.bands.map(b => b.name).join(', ')
  const instrLine = m.instruments.join(' / ')
  const parts = [instrLine, bandsLine].filter(Boolean).join(' · ')
  const description = m.bioShort
    || (parts ? `${m.name} — ${parts}. Echo Play Live roster.` : `${m.name} — Echo Play Live roster.`)

  return {
    title: m.name,
    description,
    alternates: { canonical: `/musicians/${m.slug}` },
    keywords: [
      m.name,
      ...m.instruments,
      ...m.bands.map(b => b.name),
      'Echo Play Live',
      'DFW musician',
    ],
    openGraph: {
      type: 'profile',
      title: `${m.name} | Echo Play Live`,
      description,
      url,
      images: m.photo?.url
        ? [{ url: m.photo.url, alt: `${m.name} — Echo Play Live` }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${m.name} | Echo Play Live`,
      description,
    },
  }
}

export default function MusicianLayout({ children }) {
  return children
}
