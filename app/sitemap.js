// Next.js auto-generates /sitemap.xml from this file.
// Update the priority list when new public routes are added.

import { bandsList } from '@/lib/bands'

const SITE_URL = 'https://echoplay.live'

export default function sitemap() {
  const lastModified = new Date()

  const staticRoutes = [
    { url: SITE_URL,             priority: 1.0,  changeFrequency: 'weekly' },
    { url: `${SITE_URL}/shows`,  priority: 0.9,  changeFrequency: 'daily' },
    { url: `${SITE_URL}/contact`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/about`,  priority: 0.6,  changeFrequency: 'monthly' },
  ]

  const bandRoutes = bandsList.map(band => ({
    url: `${SITE_URL}/bands/${band.slug}`,
    priority: 0.85,
    changeFrequency: 'weekly',
  }))

  return [...staticRoutes, ...bandRoutes].map(route => ({
    ...route,
    lastModified,
  }))
}
