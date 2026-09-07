import { publicShowToEventJsonLd } from '@/lib/public/shows-contract.mjs'
import ShowsClient from '@/components/ShowsClient'
import { publicBandPresentation } from '@/lib/public/bands-presentation'
import { getPublicShows } from '@/lib/public/shows'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export default async function ShowsPage({ searchParams }) {
  const [result, query] = await Promise.all([getPublicShows(), searchParams])
  const filter = publicBandPresentation.some((b) => b.slug === query?.band) ? query.band : 'all'
  return (
    <>
      {result.ok && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              result.shows.map((show) => publicShowToEventJsonLd(show)),
            ).replace(/</g, '\\u003c'),
          }}
        />
      )}
      <ShowsClient
        publicBands={publicBandPresentation}
        state={result.ok ? 'ready' : 'unavailable'}
        shows={result.shows}
        initialFilter={filter}
      />
    </>
  )
}
