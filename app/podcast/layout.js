// Phase 15: Metadata + PodcastSeries JSON-LD for the podcast page.

import { podcast } from '@/lib/podcast'

const SITE_URL = 'https://echoplay.live'

export const metadata = {
  title: 'Podcast',
  description: podcast.description,
  alternates: { canonical: '/podcast' },
  keywords: [
    'Echo Play Podcast',
    'DFW music podcast',
    'cover band podcast',
    'tribute band podcast',
    'Fort Worth music',
    'Evan Ranallo',
    'Aaron Allen',
    'The Dick Beldings',
  ],
  openGraph: {
    type: 'website',
    title: `${podcast.title} | Echo Play Live`,
    description: podcast.description,
    url: `${SITE_URL}/podcast`,
    images: [{ url: podcast.artworkUrl, alt: `${podcast.title} cover art` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${podcast.title} | Echo Play Live`,
    description: podcast.description,
  },
}

// Episode count omitted from JSON-LD intentionally: episodes are now fetched
// from the live RSS feed in the page, so the count is dynamic. Google fills
// this in itself from the feed when needed.
const podcastLd = {
  '@context': 'https://schema.org',
  '@type': 'PodcastSeries',
  name: podcast.title,
  description: podcast.description,
  url: `${SITE_URL}/podcast`,
  image: podcast.artworkUrl,
  webFeed: podcast.subscribe.rss,
  author: podcast.hosts.map(h => ({ '@type': 'Person', name: h.name })),
  sameAs: [
    podcast.subscribe.spotify,
    podcast.subscribe.applePodcasts,
    podcast.subscribe.amazonMusic,
    podcast.subscribe.buzzsprout,
  ],
}

export default function PodcastLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(podcastLd) }}
      />
      {children}
    </>
  )
}
