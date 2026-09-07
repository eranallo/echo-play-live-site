import { Page, Intro } from '@/components/SiteParts'
import { podcast, getEpisodes } from '@/lib/podcast'
export const revalidate = 3600
export default async function PodcastPage() {
  const episodes = await getEpisodes()
  return (
    <Page>
      <Intro
        eyebrow="The Echo Play Podcast"
        title={
          <>
            Let’s talk
            <br />
            about band life.
          </>
        }
      >
        <p>{podcast.longDescription}</p>
      </Intro>
      <section className="shell section-bottom">
        <div className="button-row">
          <a
            className="button"
            href={podcast.subscribe.spotify}
            target="_blank"
            rel="noopener noreferrer"
          >
            Listen on Spotify ↗
          </a>
          <a
            className="text-link"
            href={podcast.subscribe.applePodcasts}
            target="_blank"
            rel="noopener noreferrer"
          >
            Apple Podcasts ↗
          </a>
          <a
            className="text-link"
            href={podcast.subscribe.buzzsprout}
            target="_blank"
            rel="noopener noreferrer"
          >
            All episodes ↗
          </a>
        </div>
      </section>
      <section className="shell section-bottom">
        <h2 className="section-title">Listen to the episodes</h2>
        <div className="content-stack">
          {episodes.map((ep, i) => (
            <article key={ep.buzzsproutId || ep.title} className="content-panel">
              <p className="eyebrow">
                {ep.number ? `Episode ${ep.number}` : 'Echo Play Podcast'}
                {ep.duration ? ` · ${ep.duration}` : ''}
              </p>
              <h2>{ep.title}</h2>
              <p>
                {ep.description?.slice(0, 330)}
                {ep.description?.length > 330 ? '…' : ''}
              </p>
              <a
                className="text-link"
                href={ep.link || podcast.subscribe.buzzsprout}
                target="_blank"
                rel="noopener noreferrer"
              >
                Listen to the episode ↗
              </a>
            </article>
          ))}
        </div>
      </section>
    </Page>
  )
}
