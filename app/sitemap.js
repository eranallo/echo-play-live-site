// Next.js auto-generates /sitemap.xml from this file.
// Update the priority list when new public routes are added.

import { bandsList } from '@/lib/bands'
import { getMusicians } from '@/lib/musicians'

const SITE_URL = 'https://echoplay.live'

export default async function sitemap() {
  const lastModified = new Date()

  const staticRoutes = [
    { url: SITE_URL,                    priority: 1.0,  changeFrequency: 'weekly' },
    { url: `${SITE_URL}/shows`,         priority: 0.9,  changeFrequency: 'daily' },
    { url: `${SITE_URL}/musicians`,     priority: 0.8,  changeFrequency: 'weekly' },
    { url: `${SITE_URL}/podcast`,       priority: 0.7,  changeFrequency: 'weekly' },
    { url: `${SITE_URL}/press`,         priority: 0.7,  changeFrequency: 'monthly' },
    { url: `${SITE_URL}/contact`,       priority: 0.8,  changeFrequency: 'monthly' },
    { url: `${SITE_URL}/about`,         priority: 0.6,  changeFrequency: 'monthly' },
  ]

  const bandRoutes = bandsList.map(band => ({
    url: `${SITE_URL}/bands/${band.slug}`,
    priority: 0.85,
    changeFrequency: 'weekly',
  }))

  let musicianRoutes = []
  try {
    const musicians = await getMusicians()
    musicianRoutes = musicians.map(m => ({
      url: `${SITE_URL}/musicians/${m.slug}`,
      priority: 0.6,
      changeFrequency: 'monthly',
    }))
  } catch (err) {
    // If Airtable is unreachable at build time, ship the sitemap without
    // per-musician URLs rather than failing the build.
    console.warn('[sitemap] musicians fetch failed:', err?.message)
  }

  return [...staticRoutes, ...bandRoutes, ...musicianRoutes].map(route => ({
    ...route,
    lastModified,
  }))
}
