import HomeExperience from '@/components/HomeExperience'
import { getPublicShows } from '@/lib/public/shows'

export const revalidate = 300

export default async function HomePage() {
  const shows = await getPublicShows()
  return <HomeExperience shows={shows} />
}
