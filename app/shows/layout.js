import { pageMetadata } from '@/lib/public/seo.mjs'
const SITE_URL = 'https://echoplay.live'

export const metadata = pageMetadata({"title": "Upcoming Live Shows in DFW", "description": "Find announced Echo Play Live shows, ticket links and venue details for So Long Goodnight, The Dick Beldings, Jambi and Elite.", "path": "/shows"})

export default function ShowsLayout({ children }) {
  return children
}
