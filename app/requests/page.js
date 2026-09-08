import Link from 'next/link'
import { Page, Intro } from '@/components/SiteParts'
import SongVotes from '@/components/SongVotes'
import { publicBandPresentation } from '@/lib/public/bands-presentation'
import { pageMetadata } from '@/lib/public/seo.mjs'
export const metadata=pageMetadata({title:'Song Requests',description:'Help our bands choose what to learn next. Add a song, vote for fan requests, or bring back an old favorite.',path:'/requests',noindex:true})
export default async function SongRequestsPage({searchParams}) {
  const query=await searchParams
  const band=publicBandPresentation.find(b=>b.slug===query?.band) || publicBandPresentation[0]
  return <Page className="song-requests-page">
    <Intro eyebrow="You’ve got a say" title="What should we learn?" />
    <nav className="shell vote-band-nav" aria-label="Choose a band for song requests">
      {publicBandPresentation.map(item=><Link key={item.slug} href={`/requests?band=${item.slug}`} aria-current={band.slug===item.slug?'page':undefined}>{item.shortName}</Link>)}
    </nav>
    <SongVotes key={band.slug} band={band} initialQuery={typeof query.q==='string' ? query.q.slice(0,180) : ''} />
  </Page>
}
