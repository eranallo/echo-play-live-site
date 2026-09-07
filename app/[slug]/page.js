import { notFound } from 'next/navigation'
import LinkHub from '@/components/LinkHub'
import { getLinkHub } from '@/lib/public/link-hubs.mjs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export default async function BandLandingPage({ params }) {
  const { slug } = await params
  const hub = getLinkHub(slug)
  if (!hub || hub.slug === 'hub') notFound()
  return <LinkHub hub={hub} />
}
