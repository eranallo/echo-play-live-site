import { unstable_cache } from 'next/cache'
import {
  getAdminOpsFoundation,
  getAdminShowDetail,
  getAdminShowsOverview,
} from '@/lib/admin/airtable'

const ADMIN_READ_REVALIDATE_SECONDS = Number(process.env.ADMIN_READ_REVALIDATE_SECONDS || 30)

export const getCachedAdminShowsOverview = unstable_cache(
  async () => getAdminShowsOverview(),
  ['admin-shows-overview-v1'],
  { revalidate: ADMIN_READ_REVALIDATE_SECONDS, tags: ['admin-shows'] }
)

export const getCachedAdminOpsFoundation = unstable_cache(
  async () => getAdminOpsFoundation(),
  ['admin-ops-foundation-v1'],
  { revalidate: ADMIN_READ_REVALIDATE_SECONDS, tags: ['admin-ops'] }
)

export const getCachedAdminShowDetail = unstable_cache(
  async showId => getAdminShowDetail(showId),
  ['admin-show-detail-v1'],
  { revalidate: ADMIN_READ_REVALIDATE_SECONDS, tags: ['admin-show-detail'] }
)
