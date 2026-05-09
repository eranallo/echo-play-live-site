// Static metadata for the /musicians roster index page.

const SITE_URL = 'https://echoplay.live'

export const metadata = {
  title: 'Roster',
  description: 'The musicians of Echo Play Live. Bandsmen, vocalists, drummers, and players across So Long Goodnight, The Dick Beldings, Jambi, and Elite.',
  alternates: { canonical: '/musicians' },
  keywords: ['Echo Play Live roster', 'DFW musicians', 'Fort Worth band members', 'tribute band lineup'],
  openGraph: {
    type: 'website',
    title: 'Roster | Echo Play Live',
    description: 'The musicians behind Echo Play Live\'s bands.',
    url: `${SITE_URL}/musicians`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roster | Echo Play Live',
    description: 'The musicians behind Echo Play Live\'s bands.',
  },
}

export default function MusiciansLayout({ children }) {
  return children
}
