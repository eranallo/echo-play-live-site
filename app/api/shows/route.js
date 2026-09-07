import { getPublicShows } from '@/lib/public/shows'
import { PUBLIC_SHOW_SCHEMA_VERSION } from '@/lib/public/shows-contract.mjs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

export async function GET() {
  const result = await getPublicShows()

  if (!result.ok) {
    return Response.json(
      {
        schemaVersion: PUBLIC_SHOW_SCHEMA_VERSION,
        shows: [],
        error: { code: 'SHOWS_UNAVAILABLE' },
      },
      { status: 503, headers: NO_STORE_HEADERS },
    )
  }

  return Response.json(
    { schemaVersion: PUBLIC_SHOW_SCHEMA_VERSION, shows: result.shows },
    { status: 200, headers: NO_STORE_HEADERS },
  )
}
