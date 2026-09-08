import Link from 'next/link'
import { getPublishedRecaps } from '@/lib/public/published-recaps'
export default async function LatestRecap({ band, compact = false }) {
  const result = await getPublishedRecaps()
  const recap = result.recaps.find(item => !band || item.bands.includes(band))
  if (!recap) return null
  if (compact) return <Link className="hub-link" href={`/recaps/${recap.slug}`}><span><strong>Back at Granada</strong><small>Watch Elite & Jambi from July 10</small></span><span aria-hidden="true">↗</span></Link>
  return <section className="shell section-bottom"><div className="recap-feature"><p className="eyebrow">Back at Granada · July 10, 2026</p><h2>{recap.title}</h2><p>Two full songs from the night. Come watch with us.</p><Link className="text-link" href={`/recaps/${recap.slug}`}>Watch the recap ↗</Link></div></section>
}
