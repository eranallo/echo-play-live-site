import { cache } from 'react'
import { getPublicShows } from './shows.js'
import { SHOW_ID_PATTERN } from './show-presentation.mjs'

// React cache deduplicates metadata/page reads within a request, not across visitors.
export const getPublicShow = cache(async (id) => {
  if (!SHOW_ID_PATTERN.test(id)) return { ok: true, show: null }
  const result = await getPublicShows()
  return {
    ok: result.ok,
    show: result.ok ? result.shows.find((show) => show.id === id) || null : null,
  }
})
