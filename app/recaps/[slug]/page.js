import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Page, Intro } from '@/components/SiteParts'
import PerformanceVideo from '@/components/PerformanceVideo'
import BandUpcomingShows from '@/components/BandUpcomingShows'
import { getPerformance } from '@/lib/public/performances.mjs'
import { getPublishedRecaps } from '@/lib/public/published-recaps'
import { pageMetadata } from '@/lib/public/seo.mjs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export async function generateMetadata({ params }) {
  const { slug } = await params
  const result = await getPublishedRecaps()
  const recap = result.recaps.find(item => item.slug === slug)
  return recap ? pageMetadata({ title: 'Elite & Jambi at Granada · July 10, 2026', description: recap.description, path: `/recaps/${slug}`, image: '/social/elite.png', imageAlt: 'Elite', type: 'article' }) : { robots: { index: false } }
}
export default async function RecapPage({ params }) {
  const { slug } = await params
  const result = await getPublishedRecaps()
  if (!result.ok) throw new Error('Show recap temporarily unavailable')
  const recap = result.recaps.find(item => item.slug === slug)
  if (!recap) notFound()
  return <Page>
    <Intro eyebrow={`${recap.venue} · ${recap.city} · July 10, 2026`} title={recap.title}><p>{recap.intro}</p></Intro>
    {recap.bands.map(band => <PerformanceVideo key={band} performance={getPerformance(band)} slug={band} sectionId={`watch-${band}`} />)}
    <section className="shell section-bottom recap-upload"><h2 className="section-title">Were you there?</h2><p>We’d love to see your photos and videos. Pick the July 10 show when you upload. Sharing your files keeps them private; letting us repost them is your choice.</p><Link className="button" href="/upload">Share your photos & videos ↑</Link></section>
    {recap.bands.map(band => <BandUpcomingShows key={band} slug={band} name={getPerformance(band).band} sectionId={`shows-${band}`} />)}
  </Page>
}
