import Link from 'next/link'
import { Page, Intro } from '@/components/SiteParts'
import SongVotes from '@/components/SongVotes'
import { publicBandPresentation } from '@/lib/public/bands-presentation'
import { pageMetadata } from '@/lib/public/seo.mjs'
export const metadata=pageMetadata({title:'Song Requests',description:'Vote for the songs you want to hear from Echo Play Live’s bands. See the crowd’s picks and choose your favorites.',path:'/requests',noindex:true})
export default async function SongRequestsPage({searchParams}) {
  const query=await searchParams
  const band=publicBandPresentation.find(b=>b.slug===query?.band) || publicBandPresentation[0]
  return <Page>
    <Intro eyebrow="You’ve got a say" title={<>Make a<br />request.</>}><p>Tell us what you want to hear.<br />Choose a band, pick your songs and see what everyone’s voting for.</p></Intro>
    <nav className="shell vote-band-nav" aria-label="Choose a band for song requests">
      {publicBandPresentation.map(item=><Link key={item.slug} href={`/requests?band=${item.slug}`} aria-current={band.slug===item.slug?'page':undefined}>{item.shortName}</Link>)}
    </nav>
    <SongVotes key={band.slug} band={band} />
  </Page>
}
