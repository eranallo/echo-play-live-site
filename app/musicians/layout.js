import { pageMetadata } from '@/lib/public/seo.mjs'
// Static metadata for the /musicians roster index page.

const SITE_URL = 'https://echoplay.live'

export const metadata = pageMetadata({"title": "Meet the Musicians", "description": "Meet the musicians behind So Long Goodnight, The Dick Beldings, Jambi and Elite. Explore their backgrounds and the bands they play with.", "path": "/musicians"})

export default function MusiciansLayout({ children }) {
  return children
}
