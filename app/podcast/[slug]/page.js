import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Page, Intro } from '@/components/SiteParts'
import PodcastPlayer from '@/components/PodcastPlayer'
import { podcast, getEpisodes, formatEpisodeDate, buzzsproutEpisodeUrl } from '@/lib/podcast'
import { pageMetadata } from '@/lib/public/seo.mjs'
export const revalidate = 3600
export async function generateMetadata({ params }) {
  const { slug } = await params
  const episode = (await getEpisodes()).find(ep => ep.slug === slug)
  return episode ? pageMetadata({ title: `${episode.title} · Echo Play Podcast`, description: episode.description.slice(0, 155), path: `/podcast/${slug}`, type: 'article' }) : { robots: { index: false } }
}
export default async function EpisodePage({ params }) {
  const { slug } = await params
  const episodes = await getEpisodes()
  const episode = episodes.find(ep => ep.slug === slug)
  if (!episode) notFound()
  return <Page>
    <Intro eyebrow={`Echo Play Podcast${episode.number ? ` · Episode ${episode.number}` : ''}`} title={episode.title}>
      <p>{formatEpisodeDate(episode.date)}{episode.duration ? ` · ${episode.duration}` : ''}</p>
    </Intro>
    <section className="shell section-bottom episode-body">
      <PodcastPlayer id={episode.buzzsproutId} title={episode.title} />
      <h2 className="section-title">In this episode</h2>
      <div className="episode-notes">{episode.description.split(/\n\s*\n/).filter(Boolean).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>
      <div className="button-row"><a className="text-link" href={buzzsproutEpisodeUrl(episode.buzzsproutId, slug)} target="_blank" rel="noopener noreferrer">Open in Buzzsprout ↗</a><a className="text-link" href={podcast.subscribe.spotify} target="_blank" rel="noopener noreferrer">Follow on Spotify ↗</a></div>
    </section>
    <section className="shell section-bottom"><Link className="text-link" href="/podcast">← All episodes</Link></section>
  </Page>
}
