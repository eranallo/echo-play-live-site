// Next.js auto-generates /sitemap.xml from this file.
// Update the priority list when new public routes are added.

import { bandsList } from '@/lib/bands'
import { getMusicians } from '@/lib/musicians'
import { getPublicShows } from '@/lib/public/shows'
import { showPath } from '@/lib/public/show-presentation.mjs'
import { getPublishedRecaps } from '@/lib/public/published-recaps'
import { getEpisodes } from '@/lib/podcast'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = 'https://echoplay.live'

export default async function sitemap() {
  const [recapResult, episodes] = await Promise.all([getPublishedRecaps(), getEpisodes()])
  const staticRoutes = [
    { url: SITE_URL, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/bands`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/privacy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${SITE_URL}/shows`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${SITE_URL}/musicians`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/podcast`, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/press`, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/contact`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/booking/venues-festivals`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/booking/private-corporate`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/about`, priority: 0.6, changeFrequency: 'monthly' },
  ]

  const bandRoutes = bandsList.map((band) => ({
    url: `${SITE_URL}/bands/${band.slug}`,
    priority: 0.85,
    changeFrequency: 'weekly',
  }))

  let musicianRoutes = []
  try {
    const musicians = await getMusicians()
    musicianRoutes = musicians.map((m) => ({
      url: `${SITE_URL}/musicians/${m.slug}`,
      priority: 0.6,
      changeFrequency: 'monthly',
    }))
  } catch (err) {
    // If Airtable is unreachable at build time, ship the sitemap without
    // per-musician URLs rather than failing the build.
    console.warn('[sitemap] musicians fetch failed:', err?.message)
  }

  const events = await getPublicShows()
  const eventRoutes = events.ok
    ? events.shows.map((show) => ({
        url: `${SITE_URL}${showPath(show)}`,
        priority: 0.8,
        changeFrequency: 'daily',
      }))
    : []
  return [
    ...staticRoutes,
    ...bandRoutes,
    ...bandsList.map((b) => ({
      url: `${SITE_URL}/press/${b.slug}`,
      priority: 0.65,
      changeFrequency: 'monthly',
    })),
    ...musicianRoutes,
    ...eventRoutes,
    ...recapResult.recaps.map(recap => ({ url: `${SITE_URL}/recaps/${recap.slug}`, priority: 0.6, changeFrequency: 'monthly' })),
    ...episodes.filter(ep => ep.slug).map(ep => ({ url: `${SITE_URL}/podcast/${ep.slug}`, priority: 0.5, changeFrequency: 'monthly' })),
  ].map((route) => ({
    ...route,
  }))
}
