import ShowsClient from '@/components/ShowsClient'
import { getPublicShows } from '@/lib/public/shows'

export const revalidate = 300

export default async function ShowsPage() {
  const shows = await getPublicShows()
  return <ShowsClient shows={shows} />
}
