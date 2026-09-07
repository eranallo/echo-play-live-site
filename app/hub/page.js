import LinkHub from '@/components/LinkHub'
import { getLinkHub } from '@/lib/public/link-hubs.mjs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export default function HubPage() {
  return <LinkHub hub={getLinkHub('hub')} />
}
